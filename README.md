# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Webster Frontend

## Функціональність імпорту зображень

### Додавання зображень через File -> Open

Тепер у Webster Editor можна додавати зображення як керовані елементи на полотні:

#### Як використовувати:
1. Натисніть на кнопку "File" у лівому тулбарі
2. Виберіть "Open" з випадаючого меню
3. Оберіть зображення (підтримуються PNG, JPG, JPEG)
4. Зображення з'явиться в центрі полотна

#### Функціональність зображень:
- **Переміщення**: Перетягуйте зображення мишею
- **Масштабування**: Використовуйте ручки трансформації для зміни розміру
- **Збереження пропорцій**: Автоматично зберігаються оригінальні пропорції
- **Поворот**: Використовуйте ручку обертання для повороту на 360°
- **Snapping**: Зображення притягуються до інших елементів та меж полотна
- **Видалення**: Натисніть Delete/Backspace для видалення вибраного зображення

#### Технічні деталі:
- Зображення автоматично масштабуються до 80% розміру полотна якщо вони більші
- Підтримуються всі формати зображень: PNG, JPG, JPEG
- Зображення зберігаються в історії операцій (undo/redo)
- Експорт проекту включає всі додані зображення

## Development

```bash
npm run dev
```
