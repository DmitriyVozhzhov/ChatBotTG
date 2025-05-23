# Telegram Bot — Підарас дня

Цей бот дозволяє:

* Додавати учасників до списку
* Обирати "підараса дня" (нового кожного дня або при зміні списку)
* Генерувати анекдот про обраного учасника за допомогою Gemini API
* Виводити список усіх учасників
* Працювати окремо для кожного Telegram-чату/Telegram-групи

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
