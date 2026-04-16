# BizApp - Small Business Ledger

BizApp is a modern, cross-platform mobile application built with **Ionic**, **Angular (Standalone Components)**, and **Capacitor**. It is designed for small business owners to track incomes and expenses, manage financial categories, and export data for accounting purposes.

## 🚀 Features

- **Transaction Management**: Easily log incomes and expenses with detailed descriptions and categories.
- **Financial Summary**: View real-time totals and summaries of your business transactions.
- **Categorization**: Group transactions into custom or predefined categories (e.g., Logistics, Sales, Utilities).
- **SQLite Persistence**: Robust local data storage using `@capacitor-community/sqlite`, ensuring your data stays on your device.
- **Export to Excel**: Generate and export your financial reports to `.xlsx` format for external analysis.
- **Cross-Platform**: Designed to run seamlessly on iOS, Android, and Web.

## 🛠️ Technology Stack

- **Framework**: [Ionic Framework 8+](https://ionicframework.com/)
- **Core**: [Angular 20+](https://angular.dev/)
- **Runtime**: [Capacitor 8+](https://capacitorjs.com/)
- **Database**: [Capacitor SQLite Plugin](https://github.com/capacitor-community/sqlite)
- **Utilities**: 
  - `xlsx` for Excel generation.
  - `jeep-sqlite` for web-based SQLite support.
  - `ionic-pwa-elements` for camera and other PWA features.

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd bizApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Capacitor**:
   ```bash
   npx cap sync
   ```

## ⚙️ Running the App

### Web (Development)
To run the app in your browser:
```bash
ionic serve
```

### Android/iOS
To run on native platforms:
```bash
# For Android
npx cap open android

# For iOS
npx cap open ios
```

## 🌐 Web Support Note

This app uses **Capacitor SQLite** with web support. In the browser, it uses `jeep-sqlite` (Stencil component) to emulate SQLite.
- The `<jeep-sqlite>` element is dynamically injected during the application bootstrap in `src/main.ts`.
- Data is stored in the browser's IndexedDB and synchronized using the `saveToStore` method in the `DatabaseService`.

## 📂 Project Structure

- `src/app/models`: TypeScript interfaces for the application data (e.g., `Transaction`).
- `src/app/services`: Core logic handlers:
  - `database.ts`: SQLite connection and CRUD operations.
  - `export.ts`: Excel file generation logic.
- `src/app/pages`: UI Components:
  - `home`: Transaction input and recent history.
  - `summary`: Overview of totals.
  - `report`: Detailed reporting views.
  - `tabs`: Shell navigation component.
