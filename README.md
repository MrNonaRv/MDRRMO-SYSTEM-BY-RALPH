# MAMBUSAO MDRRMO Patient Care Record (PCR) System

A robust, professional management system for Patient Care Records (PCR), designed for the Mambusao MDRRMO. Built with **React**, **Vite**, and **Firebase** for real-time synchronization and offline reliability.

## 🚀 Key Features

- **🌐 Real-Time Cloud Sync**: Powered by Firebase Firestore. Sync data across multiple computers/devices instantly.
- **📶 Offline-First Architecture**: Work anywhere, even without internet. Data is saved locally and syncs automatically when a connection is restored.
- **🔢 Automatic PCR Numbering**: Smart sequential numbering (e.g., `2026-0001`) that resets every year.
- **📊 Advanced Dashboard**: Interactive charts (Recharts) and statistics for emergency types and response activities.
- **🚑 Team & Driver Management**: Easily add, remove, and manage your responders and drivers directly from the settings.
- **📄 Professional Export**: 
    - **Excel**: High-quality spreadsheets with professional styling and auto-tabbing.
    - **PDF**: Generate formal Patient Care Records for printing.
    - **JSON**: Complete data backups for system migration.
- **🔒 Security**: Admin-protected settings and data management.
- **🔄 Update Checker**: Built-in logic to check for system updates directly from GitHub.

## 🛠️ Local Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Firebase Project** (for cloud features)

### Quick Start (Windows)
1.  **Setup**: Double-click `setup.bat`. This installs all dependencies.
2.  **Run**: Double-click `run.bat`. The app will launch in a dedicated "Desktop Mode" window.

### Linux / macOS
1.  **Setup**: `npm install`
2.  **Run**: `npm run dev`

## ☁️ Firebase Configuration
To enable the Online Sync feature:
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** in "Test Mode".
3. Copy your Web App configuration into `src/lib/firebase.ts`.

## 📁 Project Structure
- `src/`: React frontend application.
  - `components/`: UI components (Dashboard, Form, Map, etc.).
  - `context/`: State management and Firebase sync logic.
  - `lib/`: Utility functions for export, import, and Firebase.
- `server.ts`: Local Express server that serves the app in desktop mode.
- `package.json`: Project dependencies and metadata.

---
*Developed for Mambusao MDRRMO.*
