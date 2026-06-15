import { db } from './db.js';
import { saveProgressToDrive, getAuthToken } from './sync.js';

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
const source = urlParams.get('source');

let pageNum = 1;
let pdfDocNumPages = 0;
let objectUrlToRevoke = null;

const titleEl = document.getElementById('book-title');
const iframe = document.getElementById('pdf-iframe');
const loadingOverlay = document.getElementById('loading-overlay');
const permissionOverlay = document.getElementById('permission-overlay');
const backBtn = document.getElementById('back-btn');

backBtn.addEventListener('click', async () => {
  backBtn.disabled = true;
  backBtn.querySelector('span').textContent = 'Saving...';
  
  await saveCurrentProgress(true); // Force sync before closing
  
  if (objectUrlToRevoke) {
    URL.revokeObjectURL(objectUrlToRevoke);
  }
  
  const book = await db.books.get(bookId);
  const folderParam = (book && book.folderId) ? `?folderId=${encodeURIComponent(book.folderId)}` : '';
  window.location.href = `index.html${folderParam}`;
});

async function init() {
  if (!bookId) {
    titleEl.textContent = 'Error: No book specified';
    return;
  }

  const book = await db.books.get(bookId);
  if (!book) {
    titleEl.textContent = 'Error: Book not found in database';
    return;
  }

  titleEl.textContent = book.name;
  if (book.lastReadPage) {
    pageNum = book.lastReadPage;
  }

  await db.books.update(bookId, { lastOpened: Date.now() });

  try {
    let pdfBlob;
    if (source === 'local') {
      if (!book.fileHandle) {
        titleEl.textContent = 'Error: Local file handle lost. Please re-add folder.';
        loadingOverlay.classList.add('hidden');
        return;
      }
      
      if ((await book.fileHandle.queryPermission({mode: 'read'})) !== 'granted') {
        const btn = document.getElementById('grant-permission-btn');
        loadingOverlay.classList.add('hidden');
        
        await new Promise((resolve, reject) => {
          permissionOverlay.classList.remove('hidden');
          btn.addEventListener('click', async () => {
            try {
              const status = await book.fileHandle.requestPermission({mode: 'read'});
              if (status === 'granted') {
                permissionOverlay.classList.add('hidden');
                loadingOverlay.classList.remove('hidden');
                resolve();
              } else {
                reject(new Error("Permission denied."));
              }
            } catch (err) {
              reject(err);
            }
          }, { once: true });
        });
      }
      
      const file = await book.fileHandle.getFile();
      pdfBlob = file; // A File is a subclass of Blob
    } else if (source === 'drive') {
      const token = await getAuthToken(true);
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${bookId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      pdfBlob = await response.blob();
    }

    objectUrlToRevoke = URL.createObjectURL(pdfBlob);
    
    // Load the official pdf.js viewer iframe
    iframe.onload = onIframeLoaded;
    iframe.src = `/pdfjs/web/viewer.html?file=${encodeURIComponent(objectUrlToRevoke)}#page=${pageNum}`;
    
    iframe.classList.remove('hidden');
    loadingOverlay.classList.add('hidden');

  } catch (error) {
    console.error('Error loading PDF:', error);
    titleEl.textContent = 'Error loading PDF: ' + error.message;
    loadingOverlay.classList.add('hidden');
  }
}

function onIframeLoaded() {
  const viewerWindow = iframe.contentWindow;
  
  // Wait for the PDFViewerApplication to be ready and loaded
  const checkInterval = setInterval(() => {
    if (viewerWindow.PDFViewerApplication && viewerWindow.PDFViewerApplication.eventBus) {
      clearInterval(checkInterval);
      
      viewerWindow.PDFViewerApplication.eventBus.on('pagechanging', function (evt) {
        pageNum = evt.pageNumber;
        pdfDocNumPages = viewerWindow.PDFViewerApplication.pagesCount || (viewerWindow.PDFViewerApplication.pdfDocument ? viewerWindow.PDFViewerApplication.pdfDocument.numPages : 0) || 0;
        saveCurrentProgress(false);
      });
      
      // Get total pages once loaded
      viewerWindow.PDFViewerApplication.eventBus.on('pagesinit', function () {
        pdfDocNumPages = viewerWindow.PDFViewerApplication.pagesCount || (viewerWindow.PDFViewerApplication.pdfDocument ? viewerWindow.PDFViewerApplication.pdfDocument.numPages : 0) || 0;
        saveCurrentProgress(false);
      });
    }
  }, 200);
}

async function saveCurrentProgress(forceSyncToDrive = false) {
  if (!bookId) return;
  
  // Always save to IndexedDB (local)
  await db.books.update(bookId, { 
    lastReadPage: pageNum,
    totalPages: pdfDocNumPages
  });
  
  const { syncMode } = await chrome.storage.local.get({ syncMode: 'auto' });
  
  // If auto-sync is enabled and we're forcing (like on close), sync to Drive
  if (forceSyncToDrive && syncMode === 'auto') {
    try {
      const books = await db.books.toArray();
      const progressData = {};
      books.forEach(b => {
        if (b.lastReadPage) {
          progressData[b.id] = { lastReadPage: b.lastReadPage, totalPages: b.totalPages, timestamp: Date.now() };
        }
      });
      // Silent save to Drive
      await saveProgressToDrive(progressData, false);
    } catch (e) {
      console.warn("Auto-sync to drive failed on close", e);
    }
  }
}

init();
