import { db } from './db.js';
import { generateThumbnail } from './pdf-utils.js';
import { loadProgressFromDrive, saveProgressToDrive, getAuthToken, signOut } from './sync.js';

const bookshelfGrid = document.getElementById('bookshelf-grid');
const addLocalBtn = document.getElementById('add-local-folder');
const addSingleBookBtn = document.getElementById('add-single-book');
const reloadFolderBtn = document.getElementById('reload-folder-btn');
const emptyState = document.getElementById('empty-state');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// Settings UI Elements
const toggleSettingsBtn = document.getElementById('toggle-settings');
const settingsPanel = document.getElementById('settings-panel');
const authStatus = document.getElementById('auth-status');
const btnSignIn = document.getElementById('btn-signin');
const btnSignOut = document.getElementById('btn-signout');
const syncUploadBtn = document.getElementById('sync-upload');
const syncDownloadBtn = document.getElementById('sync-download');
const syncFetchPdfsBtn = document.getElementById('sync-fetch-pdfs');
const btnClearDb = document.getElementById('btn-clear-db');
const lastSyncedText = document.getElementById('last-synced-text');
const modeAutoBtn = document.getElementById('mode-auto');
const modeManualBtn = document.getElementById('mode-manual');

// Breadcrumbs
const breadcrumbs = document.getElementById('breadcrumbs');
const breadcrumbHome = document.getElementById('breadcrumb-home');
const breadcrumbCurrent = document.getElementById('breadcrumb-current');

let globalProgress = {};
let isAuthenticated = false;

// Initialize App
async function init() {
  await loadBooks();
  updateLastSyncedText();
  
  // Restore sync mode
  const { syncMode } = await chrome.storage.local.get({ syncMode: 'auto' });
  setSyncMode(syncMode);

  // Try to authenticate silently
  try {
    const token = await getAuthToken(false);
    if (token) {
      setAuthState(true);
      if (syncMode === 'auto') {
        await handleDownloadProgress(false); // silent download
      }
    }
  } catch (e) {
    setAuthState(false);
  }
}

async function updateLastSyncedText() {
  const { lastSyncTime } = await chrome.storage.local.get('lastSyncTime');
  const lastSync = lastSyncTime;
  if (lastSync) {
    const date = new Date(parseInt(lastSync, 10));
    lastSyncedText.textContent = `Last Synced: ${date.toLocaleString()}`;
  } else {
    lastSyncedText.textContent = 'Last Synced: Never';
  }
}

function setAuthState(isAuth) {
  isAuthenticated = isAuth;
  if (isAuth) {
    authStatus.textContent = 'Authenticated';
    authStatus.className = 'status-badge ok';
    btnSignIn.classList.add('hidden');
    btnSignOut.classList.remove('hidden');
  } else {
    authStatus.textContent = 'Not Authenticated';
    authStatus.className = 'status-badge error';
    btnSignIn.classList.remove('hidden');
    btnSignOut.classList.add('hidden');
  }
}

async function setSyncMode(mode) {
  await chrome.storage.local.set({ syncMode: mode });
  if (mode === 'auto') {
    modeAutoBtn.classList.add('active');
    modeManualBtn.classList.remove('active');
  } else {
    modeAutoBtn.classList.remove('active');
    modeManualBtn.classList.add('active');
  }
}

// UI Event Listeners
toggleSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
});

modeAutoBtn.addEventListener('click', () => setSyncMode('auto'));
modeManualBtn.addEventListener('click', () => setSyncMode('manual'));

btnSignIn.addEventListener('click', async () => {
  try {
    showLoading('Authenticating...');
    const token = await getAuthToken(true);
    if (token) setAuthState(true);
    hideLoading();
  } catch (e) {
    hideLoading();
    console.error("Auth error:", e);
    alert('Authentication failed: ' + e.message);
  }
});

btnSignOut.addEventListener('click', async () => {
  showLoading('Signing out...');
  await signOut();
  setAuthState(false);
  hideLoading();
});

syncUploadBtn.addEventListener('click', async () => {
  if (!isAuthenticated) return alert('Please Sign In first.');
  showLoading('Uploading progress to Google Drive...');
  try {
    const books = await db.books.toArray();
    const progressData = {};
    books.forEach(b => {
      if (b.lastReadPage) {
        progressData[b.id] = { lastReadPage: b.lastReadPage, totalPages: b.totalPages, timestamp: Date.now() };
      }
    });
    await saveProgressToDrive(progressData, true);
    updateLastSyncedText();
  } catch (e) {
    console.error(e);
    alert('Failed to upload.');
  }
  hideLoading();
});

syncDownloadBtn.addEventListener('click', async () => {
  if (!isAuthenticated) return alert('Please Sign In first.');
  await handleDownloadProgress(true);
});

async function handleDownloadProgress(interactive = false) {
  try {
    if (interactive) showLoading('Downloading progress from Google Drive...');
    const driveProgress = await loadProgressFromDrive(interactive);
    if (Object.keys(driveProgress).length > 0) {
      globalProgress = driveProgress;
      await syncDriveProgressToLocal();
      await loadBooks();
      updateLastSyncedText();
    }
  } catch (e) {
    console.error("Download failed:", e);
    if (interactive) alert('Failed to download progress.');
  } finally {
    if (interactive) hideLoading();
  }
}

syncFetchPdfsBtn.addEventListener('click', async () => {
  if (!isAuthenticated) return alert('Please Sign In first.');
  try {
    showLoading('Fetching PDFs from Drive...');
    const token = await getAuthToken(true);
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType="application/pdf" and trashed=false&fields=files(id,name,thumbnailLink)',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const data = await response.json();
    for (const file of data.files) {
      const existing = await db.books.get(file.id);
      if (!existing) {
        await db.books.put({
          id: file.id,
          name: file.name,
          source: 'drive',
          thumbnail: file.thumbnailLink,
          order: Date.now(),
          isPinned: false
        });
      }
    }
    await loadBooks();
  } catch (error) {
    console.error('Drive sync error:', error);
    alert('Failed to fetch PDFs from Drive.');
  } finally {
    hideLoading();
  }
});

btnClearDb.addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear your entire local library? (This will not delete files from your hard drive or Google Drive, but will clear your local progress and cached data)')) {
    showLoading('Clearing library...');
    await db.books.clear();
    await db.folders.clear();
    window.location.href = 'index.html';
  }
});

// Navigation Handlers
breadcrumbHome.addEventListener('click', () => {
  window.location.href = 'index.html';
});

function openFolder(folderId, folderName) {
  window.location.href = `index.html?folderId=${encodeURIComponent(folderId)}`;
}

const urlParams = new URLSearchParams(window.location.search);
const currentFolderId = urlParams.get('folderId');

let currentItems = []; // For drag and drop ordering

async function loadBooks() {
  bookshelfGrid.innerHTML = '';
  let itemsToRender = [];

  if (!currentFolderId) {
    // Root View: Show Folders and Drive Books
    breadcrumbs.classList.add('hidden');
    reloadFolderBtn.classList.add('hidden');
    
    const folders = await db.folders.toArray();
    const books = await db.books.toArray();
    
    // Add all folders
    itemsToRender.push(...folders.map(f => ({...f, isFolder: true})));
    
    // Add books that don't have a folderId (e.g. Drive books or single added books)
    const rootBooks = books.filter(b => !b.folderId);
    itemsToRender.push(...rootBooks);
    
  } else {
    // Folder View: Show Books inside this folder
    breadcrumbs.classList.remove('hidden');
    reloadFolderBtn.classList.remove('hidden');
    
    const folder = await db.folders.get(currentFolderId);
    if (folder) breadcrumbCurrent.textContent = folder.name;
    
    const books = await db.books.where({ folderId: currentFolderId }).toArray();
    itemsToRender = books;
  }

  itemsToRender.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    return (b.lastOpened || 0) - (a.lastOpened || 0);
  });

  currentItems = itemsToRender;

  if (itemsToRender.length === 0) {
    bookshelfGrid.appendChild(emptyState);
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  itemsToRender.forEach(item => {
    if (item.isFolder) {
      const card = createFolderCard(item);
      bookshelfGrid.appendChild(card);
    } else {
      const card = createBookCard(item);
      bookshelfGrid.appendChild(card);
    }
  });

  setupDragAndDrop();
}

function createActionIcons(item) {
  const pinIcon = document.createElement('div');
  pinIcon.className = `action-icon pin-icon ${item.isPinned ? 'pinned' : ''}`;
  pinIcon.title = item.isPinned ? 'Unpin' : 'Pin to top';
  pinIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>`;
  pinIcon.onclick = async (e) => {
    e.stopPropagation();
    item.isPinned = !item.isPinned;
    if (item.isFolder) await db.folders.update(item.id, { isPinned: item.isPinned });
    else await db.books.update(item.id, { isPinned: item.isPinned });
    loadBooks();
  };

  const deleteIcon = document.createElement('div');
  deleteIcon.className = 'action-icon delete-icon';
  deleteIcon.title = 'Remove from Bookshelf';
  deleteIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
  deleteIcon.onclick = async (e) => {
    e.stopPropagation();
    if (confirm(`Remove "${item.name}" from Bookshelf?`)) {
      if (item.isFolder) {
        await db.folders.delete(item.id);
        await db.books.where({ folderId: item.id }).delete();
      } else {
        await db.books.delete(item.id);
      }
      loadBooks();
    }
  };

  return { pinIcon, deleteIcon };
}

function attachDragEvents(card, item) {
  card.draggable = true;
  card.dataset.id = item.id;
  card.dataset.isFolder = item.isFolder ? 'true' : 'false';

  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => card.classList.add('dragging'), 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });
}

function createFolderCard(folder) {
  const card = document.createElement('div');
  card.className = 'book-card folder-card';
  card.onclick = () => openFolder(folder.id, folder.name);

  const { pinIcon, deleteIcon } = createActionIcons(folder);

  const icon = document.createElement('div');
  icon.className = 'folder-icon';
  icon.textContent = '📁';

  const overlay = document.createElement('div');
  overlay.className = 'book-overlay';

  const title = document.createElement('div');
  title.className = 'book-title';
  title.textContent = folder.name;

  const badge = document.createElement('div');
  badge.className = 'book-badge';
  badge.textContent = 'Local Folder';

  overlay.appendChild(title);
  card.appendChild(pinIcon);
  card.appendChild(deleteIcon);
  card.appendChild(icon);
  card.appendChild(overlay);
  card.appendChild(badge);

  attachDragEvents(card, folder);
  return card;
}

function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.onclick = () => openReader(book.id, book.source);

  const { pinIcon, deleteIcon } = createActionIcons(book);

  const thumb = document.createElement('img');
  thumb.className = 'book-thumbnail';
  thumb.src = book.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxZTI5M2IiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBERjwvdGV4dD48L3N2Zz4=';

  const overlay = document.createElement('div');
  overlay.className = 'book-overlay';

  const title = document.createElement('div');
  title.className = 'book-title';
  title.textContent = book.name.replace('.pdf', '');
  title.title = book.name;

  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  
  let percent = 0;
  let pageText = 'New';
  if (book.lastReadPage && book.totalPages) {
    percent = (book.lastReadPage / book.totalPages) * 100;
    pageText = `Page ${book.lastReadPage} of ${book.totalPages}`;
  }
  progressBar.style.width = `${percent}%`;

  const progressInfo = document.createElement('div');
  progressInfo.className = 'progress-text';
  progressInfo.textContent = pageText;

  const badge = document.createElement('div');
  badge.className = 'book-badge';
  badge.textContent = book.source === 'drive' ? 'Drive' : 'Local';

  progressContainer.appendChild(progressBar);
  overlay.appendChild(title);
  overlay.appendChild(progressContainer);
  overlay.appendChild(progressInfo);

  card.appendChild(pinIcon);
  card.appendChild(deleteIcon);
  card.appendChild(thumb);
  card.appendChild(overlay);
  card.appendChild(badge);

  attachDragEvents(card, book);
  return card;
}

// Drag and Drop Logic
function setupDragAndDrop() {
  bookshelfGrid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    
    const afterElement = getDragAfterElement(bookshelfGrid, e.clientY, e.clientX);
    if (afterElement == null) {
      bookshelfGrid.appendChild(dragging);
    } else {
      bookshelfGrid.insertBefore(dragging, afterElement);
    }
  });

  bookshelfGrid.addEventListener('drop', async (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    dragging.classList.remove('dragging');

    // Update orders in DB
    const cards = [...bookshelfGrid.querySelectorAll('.book-card')];
    // To ensure pinning doesn't mess up orders, we just assign order sequentially 
    // to ALL items currently visible in this view based on their new DOM index.
    // They are already grouped visually by pinned vs unpinned because we don't allow 
    // dragging unpinned above pinned easily without breaking the logical flow, 
    // but the sort logic in loadBooks handles pinned first anyway.
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const id = card.dataset.id;
      const isFolder = card.dataset.isFolder === 'true';
      const newOrder = i * 1000; // Multiply by 1000 to give space between items
      
      if (isFolder) {
        await db.folders.update(id, { order: newOrder });
      } else {
        await db.books.update(id, { order: newOrder });
      }
    }
    
    // We don't need to loadBooks() here since the DOM is already updated,
    // but we can to ensure everything is perfect.
    loadBooks();
  });
}

function getDragAfterElement(container, y, x) {
  const draggableElements = [...container.querySelectorAll('.book-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    // Simplified distance calculation for a grid
    const isSameRow = y >= box.top && y <= box.bottom;
    const offset = x - (box.left + box.width / 2);
    
    if (isSameRow && offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}


function showLoading(text) {
  loadingText.textContent = text;
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

// Add Local Folder
addLocalBtn.addEventListener('click', async () => {
  try {
    const dirHandle = await window.showDirectoryPicker({
      id: 'bookshelf_folder',
      mode: 'read'
    });
    
    showLoading(`Scanning folder: ${dirHandle.name}...`);
    
    const folderId = `local_folder_${Date.now()}`;
    await db.folders.put({
      id: folderId,
      name: dirHandle.name,
      source: 'local',
      handle: dirHandle,
      order: Date.now(),
      isPinned: false
    });
    
    await scanFolderAndAddBooks(dirHandle, folderId);
    
    hideLoading();
    await loadBooks();
  } catch (error) {
    hideLoading();
    if (error.name !== 'AbortError') {
      alert('Error accessing folder: ' + error.message);
    }
  }
});

// Add Single Book
addSingleBookBtn.addEventListener('click', async () => {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'PDF Documents',
        accept: { 'application/pdf': ['.pdf'] }
      }],
      excludeAcceptAllOption: true,
      multiple: false
    });
    
    showLoading(`Adding book: ${fileHandle.name}...`);
    
    const file = await fileHandle.getFile();
    const existingId = `local_single_${Date.now()}`;
    
    showLoading(`Generating cover for ${fileHandle.name}...`);
    const thumbnail = await generateThumbnail(file);
    await db.books.put({
      id: existingId,
      name: fileHandle.name,
      path: fileHandle.name,
      source: 'local',
      thumbnail: thumbnail,
      fileHandle: fileHandle,
      folderId: currentFolderId, // If inside a folder, add it there. Otherwise root.
      order: Date.now(),
      isPinned: false
    });
    
    hideLoading();
    await loadBooks();
  } catch (error) {
    hideLoading();
    if (error.name !== 'AbortError') {
      alert('Error adding book: ' + error.message);
    }
  }
});

// Reload Folder
if (reloadFolderBtn) {
  reloadFolderBtn.addEventListener('click', async () => {
    if (!currentFolderId) return;
    
    try {
      showLoading(`Checking permissions...`);
      const folder = await db.folders.get(currentFolderId);
      if (!folder || !folder.handle) {
        alert('Cannot reload: Original folder access is lost. Please add the folder again.');
        hideLoading();
        return;
      }
      
      const dirHandle = folder.handle;
      
      // Check permission and ask if necessary
      if ((await dirHandle.queryPermission({mode: 'read'})) !== 'granted') {
        if ((await dirHandle.requestPermission({mode: 'read'})) !== 'granted') {
          alert('Permission denied. Cannot reload folder.');
          hideLoading();
          return;
        }
      }
      
      showLoading(`Scanning folder for new PDFs...`);
      await scanFolderAndAddBooks(dirHandle, currentFolderId);
      
      hideLoading();
      await loadBooks();
    } catch (error) {
      hideLoading();
      alert('Error reloading folder: ' + error.message);
    }
  });
}

// Helper to scan a directory handle and add books
async function scanFolderAndAddBooks(dirHandle, folderId) {
  const newEntries = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.pdf')) {
      const existingId = `local_${folderId}_${entry.name}`;
      const existing = await db.books.get(existingId);
      if (!existing) {
        newEntries.push(entry);
      }
    }
  }

  // Quick insert without covers
  for (const entry of newEntries) {
    const existingId = `local_${folderId}_${entry.name}`;
    await db.books.put({
      id: existingId,
      name: entry.name,
      path: entry.name,
      source: 'local',
      thumbnail: null,
      fileHandle: entry,
      folderId: folderId,
      order: Date.now(),
      isPinned: false
    });
  }

  // Async generate covers
  if (newEntries.length > 0) {
    (async () => {
      for (const entry of newEntries) {
        try {
          const file = await entry.getFile();
          const thumbnail = await generateThumbnail(file);
          if (thumbnail) {
            const existingId = `local_${folderId}_${entry.name}`;
            await db.books.update(existingId, { thumbnail });
          }
        } catch (e) {
          console.warn("Cover gen failed:", e);
        }
      }
      loadBooks(); // refresh UI when done
    })();
  }
}

async function syncDriveProgressToLocal() {
  for (const [id, data] of Object.entries(globalProgress)) {
    const book = await db.books.get(id);
    if (book && book.lastReadPage !== data.lastReadPage) {
      await db.books.update(id, { 
        lastReadPage: data.lastReadPage,
        totalPages: data.totalPages
      });
    }
  }
}

function openReader(id, source) {
  window.location.href = `reader.html?id=${encodeURIComponent(id)}&source=${source}`;
}

init();
