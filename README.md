# MAMBUSAO MDRRMO Patient Care Record (PCR) System

A full-stack management system for Patient Care Records, built with React, Vite, and Express.

## Local Setup and Running

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### Windows
1.  **Setup:** Double-click `setup.bat`. This will install all necessary dependencies.
2.  **Run:** Double-click `run.bat`. This will start the server at `http://localhost:3000`.

### Linux / macOS
1.  **Setup:** Open your terminal and run:
    ```bash
    chmod +x setup.sh run.sh
    ./setup.sh
    ```
2.  **Run:** In your terminal, run:
    ```bash
    ./run.sh
    ```

## Features
- **Dashboard:** Overview of emergency statistics and recent records with interactive charts.
- **Records Management:** 
    - **Optimized Loading:** Memoized components for faster list rendering.
    - **Scrollable View:** Infinite-style scrollable list with sticky headers for better navigation.
    - **Search & Filter:** Advanced filtering by status, emergency type, and date.
- **PCR Form:** Comprehensive data entry for patient care with real-time validation.
- **Enhanced Export:** 
    - **Excel Export:** Multi-sheet export by year, specific year export, or single sheet.
    - **Professional Styling:** Centered and bold headers in Excel files for better readability.
    - **JSON Export:** Full data backup in JSON format.
- **Local Persistence:** Data is persisted in browser's local storage for offline capability.
- **Security:** Admin password protection for sensitive operations.

## Project Structure
- `src/`: Frontend React application.
- `server.ts`: Express server with Vite integration.
- `package.json`: Project dependencies and scripts.
- `setup.*` / `run.*`: Automation scripts for local execution.
