# Mecenate test task

Сделан экран ленты постов на Expo + React Native + TypeScript.

Что есть:
- список постов (автор, обложка, текст, лайки, комментарии)
- пагинация по курсору
- pull to refresh
- обработка платного поста (`tier: paid`)
- экран ошибки с кнопкой повтора

Как запустить:

1) Установить зависимости
```bash
npm install
```

2) Создать `.env` из шаблона
```bash
cp .env.example .env
```

3) Запустить проект
```bash
npx expo start
```

Запуск на устройстве:
- через Expo Go (скан QR)
- или эмулятор (`i` для iOS, `a` для Android)

Переменные окружения:
```env
EXPO_PUBLIC_API_BASE_URL=https://k8s.mectest.ru/test-app
EXPO_PUBLIC_API_TOKEN=550e8400-e29b-41d4-a716-446655440000
```
