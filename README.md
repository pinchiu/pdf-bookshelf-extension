# PDF Bookshelf Extension

A Chrome extension that turns your local PDF collection into a beautiful, organized bookshelf right in your browser. Read, manage, and sync your PDFs entirely offline.

## Features

- **Local Folder Scanning:** Quickly scan a local directory to find and import all your PDFs using the native File System Access API (`showDirectoryPicker`).
- **Dynamic Thumbnails:** Automatically generates PDF cover thumbnails using `pdf.js` and `URL.createObjectURL` for fast, memory-efficient rendering.
- **Offline Storage:** Uses IndexedDB (`Dexie.js`) for robust, offline-first data storage of your bookshelf and metadata.
- **Persistent State:** Sync modes and settings are securely stored in `chrome.storage.local` to persist across browser sessions.
- **Integrated PDF Reader:** Built-in PDF viewer for a seamless reading experience without leaving your browser.

## Technologies Used

- Vanilla JavaScript & HTML/CSS
- [pdf.js](https://mozilla.github.io/pdf.js/) for PDF parsing and rendering
- [Dexie.js](https://dexie.org/) for IndexedDB management
- Chrome Extension Manifest V3 APIs

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the directory containing the extension files.
5. The PDF Bookshelf icon should now appear in your browser's toolbar!

## Usage

1. Click the extension icon to open your Bookshelf.
2. Click **Scan Folder** to select a local directory on your machine containing PDF files.
3. The extension will quickly process the PDFs, generate cover thumbnails, and populate your bookshelf.
4. Click any book to open the integrated reader and start reading.

## Architecture & Performance Notes

The extension utilizes a two-pass approach for scanning folders: it quickly indexes file metadata into the database first, and handles PDF cover generation asynchronously in the background. This ensures the main UI thread remains responsive even when scanning directories with hundreds of large PDFs.
