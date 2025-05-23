# Telegram Bot — Підарас дня

Цей бот дозволяє:

- 📌 Зберігання учасників окремо для кожного чату (окрема вкладка в Google Sheet).
- 🔁 Щоденне обрання нового "підараса дня" або при зміні кількості учасників.
- 🤣 Генерація анекдотів про обраного учасника.
- 🖼️ Надсилання рандомного мемного зображення.
- 📋 Перегляд списку всіх учасників.

---

## 📁 Структура проєкту

```
├── images/             # Зображення та інші медіафайли, що використовуються в проекті
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...             # (та інші файли .jpg)
├── index.js            # Основна логіка Telegram-бота
├── .env                # Секрети API (НЕ додавати до Git)
├── .gitignore          # Ігнорує node_modules та .env
├── credentials.json    # Сервісний ключ Google (НЕ додавати до Git)
├── package.json        # Залежності та скрипти запуску
└── README.md           # Опис проєкту
```
## ✅ Prerequisites

Перед запуском бота, необхідно:

### 1. 🔑 Отримати Telegram Bot Token
- Відкрий Telegram.
- Напиши до **[BotFather](https://t.me/BotFather)**.
- Використай команду `/newbot` та дотримуйся інструкцій.
- Після створення ти отримаєш **`TELEGRAM_BOT_TOKEN`**.

### 2. 🧠 Отримати API ключ для Google Gemini (Generative AI)
- Перейди до [Google AI Studio](https://makersuite.google.com/app/apikey).
- Увійди у свій Google-акаунт.
- Згенеруй API ключ.
- Скопіюй та збережи його як **`GEMINI_API_KEY`** у `.env`.

### 3. 📄 Згенерувати `credentials.json` для Google Sheets API
- Відкрий [Google Cloud Console](https://console.cloud.google.com/).
- Створи новий проєкт (або обери наявний).
- Активуй **Google Sheets API**.
- Перейди в *APIs & Services > Credentials*.
- Натисни **Create credentials** → **Service account**.
- Створи акаунт, додай роль (наприклад, “Editor”).
- Перейдіть до вкладки "Keys" → Add key → JSON.
- Збережи файл як `credentials.json` у корінь проєкту.

⚠️ Не забудь надати сервісному акаунту доступ до Google таблиці!

---
## 🚀 Швидкий старт

### 1. Клонування репозиторію

```bash
git clone [https://github.com/your-username/pidaras-bot.git](https://github.com/your-username/pidaras-bot.git)
cd pidaras-bot
``` 
### 2. Встановлення залежностей
```bash
npm install
``` 
### 3. Створення .env файлу
Створіть файл .env у корені проекту та додайте свої змінні:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_SHEET_ID=your_google_sheet_id
```
### 4. Додайте credentials.json
Файл сервісного облікового запису з Google Cloud Console (для доступу до Google Sheets). Згенеруйте його і покладіть у корінь проєкту.

### 5. Запуск бота
```bash
node index.js
``` 
