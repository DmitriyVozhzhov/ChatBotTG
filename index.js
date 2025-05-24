require('dotenv').config();
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: '/join', description: 'Додатися до списку підарасів' },
  { command: '/person', description: 'Отримати підараса дня' },
  { command: '/all', description: 'Показати усіх підарасів' },
  { command: '/whoami', description: 'Дізнатись який я підарас' }
]);

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const PARTICIPANTS_RANGE = (chatId) => `'${chatId}'!A2:A`;
const STATUS_RANGE = (chatId) => `'${chatId}'!D2:D4`;

async function getSheetsClient() {
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// Отримати статус: остання людина, час, кількість учасників
async function getStatus(chatId) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: STATUS_RANGE(chatId),
  });
  const values = res.data.values || [];
  return {
    person: values[0]?.[0] || '',
    timestamp: values[1]?.[0] || '',
    participantCount: parseInt(values[2]?.[0] || '0', 10),
  };
}

// Оновити статус
async function updateStatus(chatId, person, timestamp, participantCount) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: STATUS_RANGE(chatId),
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [person],
        [timestamp],
        [participantCount.toString()],
      ],
    },
  });
}

// Додати людину
async function addPerson(chatId, name) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: PARTICIPANTS_RANGE(chatId),
  });

  const rows = res.data.values || [];
  const isAlreadyInList = rows.some(row => row[0].trim().toLowerCase() === name.trim().toLowerCase());

  if (isAlreadyInList) {
    return { success: false, message: `👀 Підарас ${name} вже є у списку.` };
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${chatId}'!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[name]],
    },
  });

  const updatedCount = rows.length + 1;
  await updateStatus(chatId, '', '', updatedCount);

  return { success: true, message: `✅ ${name} додано до списку підарасів!` };
}

// Отримати підараса дня
async function getPersonOfTheMoment(chatId) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: PARTICIPANTS_RANGE(chatId),
  });

  const participants = res.data.values || [];
  if (participants.length === 0) {
    return { message: '🚫 У таблиці немає жодної людини!', person: null };
  }

  const status = await getStatus(chatId);
  const currentCount = participants.length;

  const today = new Date().toISOString().slice(0, 10);
  const lastPickDay = (status.timestamp || '').slice(0, 10);
  const isNewDay = today !== lastPickDay;
  const isCountChanged = currentCount !== status.participantCount;

  if (!isNewDay && !isCountChanged && status.person) {
    return {
      message: `👀 Підарас дня вже обраний раніше: *${status.person}*! Додайте нового підараса або дочекайтесь нового дня`,
      person: status.person,
    };
  }

  const randomIndex = Math.floor(Math.random() * participants.length);
  const chosenOne = participants[randomIndex][0];
  const now = new Date().toISOString();

  await updateStatus(chatId, chosenOne, now, currentCount);

  return {
    message: `🎉 Підарас дня: *${chosenOne}*!`,
    person: chosenOne,
  };
}

// Отримати анекдот через Gemini 1.5 flash
async function getJokeWithName(name) {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
  const prompt = `Ти відомий популярний стендап комік, напиши найкращий та найсмішніший жарт про ${name}. Анекдот повинен бути абсурдним з чорним гумором і можна матюки. Також він не повинен бути сильно довгим`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Отримати список усіх учасників чату
async function getAllParticipants(chatId) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: PARTICIPANTS_RANGE(chatId),
  });
  const participants = res.data.values || [];
  if (participants.length === 0) return '🚫 У таблиці немає жодної людини!';
  return participants.map((p, i) => `${i + 1}. ${p[0]}`).join('\n');
}

const photoPaths = [
  path.join(__dirname, 'images/1.jpg'),
  path.join(__dirname, 'images/2.jpg'),
  path.join(__dirname, 'images/3.jpg'),
  path.join(__dirname, 'images/4.jpg'),
  path.join(__dirname, 'images/5.jpg'),
  path.join(__dirname, 'images/6.jpg'),
];

// Команда /person
bot.onText(/\/(person|людина)/i, async (msg) => {
  const chatId = msg.chat.id.toString();
  const result = await getPersonOfTheMoment(chatId);

  const randomPhoto = photoPaths[Math.floor(Math.random() * photoPaths.length)];

  await bot.sendPhoto(chatId, fs.createReadStream(randomPhoto), {
    caption: result.message,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '😂 Анекдот про нього', callback_data: 'anegdot' },
      ]],
    },
  });
});

// Команда /join
bot.onText(/\/join/i, async (msg) => {
  const chatId = msg.chat.id.toString();
  const username = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  const result = await addPerson(chatId, username);
  await bot.sendMessage(chatId, result.message);
});

// Команда /all
bot.onText(/\/all/i, async (msg) => {
  const chatId = msg.chat.id.toString();
  const allUsersList = await getAllParticipants(chatId);
  await bot.sendMessage(chatId, `📋 Список усіх підарасів:\n\n${allUsersList}`);
});

// Команда /whoami
bot.onText(/\/whoami/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  await bot.sendMessage(chatId, `🧐 ${username}, ти — любопитний підарас 😏`);
});

// Обробка кнопок
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id.toString();
  const data = query.data;

  if (data === 'anegdot') {
    const status = await getStatus(chatId);
    const name = status.person;

    if (!name) {
      await bot.sendMessage(chatId, '😕 Ще не обрано підараса дня.');
      return;
    }

    try {
      const joke = await getJokeWithName(name);
      await bot.sendMessage(chatId, `😂 Анекдот про підараса *${name}*:\n\n${joke}`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error(err);
      await bot.sendMessage(chatId, '😬 Виникла помилка при отриманні анекдота.');
    }
  }
});
