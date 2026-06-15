import { db } from './db.js';

export async function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    if (!chrome.identity) {
      reject(new Error("Chrome Identity API not available"));
      return;
    }
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        console.warn("getAuthToken failed:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

export async function signOut() {
  return new Promise((resolve) => {
    if (!chrome.identity) return resolve();
    
    // First get the token without interactivity
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        return resolve();
      }
      
      // Revoke the token with Google
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => {
          // Remove from Chrome's cache
          chrome.identity.removeCachedAuthToken({ token }, () => {
            resolve();
          });
        })
        .catch(() => resolve());
    });
  });
}

export async function getOrCreateBookshelfFolder(token) {
  // 1. Search for folder "Visual Bookshelf"
  const searchRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.folder" and name="Visual Bookshelf" and trashed=false&fields=files(id)',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  
  // 2. Create if not exists
  const metadata = {
    name: 'Visual Bookshelf',
    mimeType: 'application/vnd.google-apps.folder'
  };
  
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
  
  const createData = await createRes.json();
  return createData.id;
}

export async function fetchProgressFileId(token, folderId) {
  if (!folderId) return null;
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and name="progress.json" and trashed=false&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

export async function loadProgressFromDrive(interactive = false) {
  try {
    const token = await getAuthToken(interactive);
    const folderId = await getOrCreateBookshelfFolder(token);
    const fileId = await fetchProgressFileId(token, folderId);
    if (!fileId) return {};

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    console.error('Error loading progress from Drive:', error);
    return {};
  }
}

export async function saveProgressToDrive(progressData, interactive = false) {
  try {
    const token = await getAuthToken(interactive);
    const folderId = await getOrCreateBookshelfFolder(token);
    const fileId = await fetchProgressFileId(token, folderId);

    const metadata = {
      name: 'progress.json',
      parents: [folderId]
    };

    const fileContent = JSON.stringify(progressData);
    const file = new Blob([fileContent], { type: 'application/json' });

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (fileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    if (!response.ok) {
      throw new Error('Failed to save progress to Drive');
    }
    
    // Save last sync time to chrome.storage
    await chrome.storage.local.set({ lastSyncTime: Date.now().toString() });
  } catch (error) {
    console.error('Error saving progress to Drive:', error);
    throw error;
  }
}
