import Dexie from 'dexie';

export const db = new Dexie('VisualBookshelfDB');

db.version(3).stores({
  books: 'id, name, path, source, lastReadPage, totalPages, thumbnail, lastOpened, folderId, order, isPinned',
  folders: 'id, name, source, order, isPinned'
});

// source: 'local' | 'drive'
// id: string (local path or drive file id)
// thumbnail: base64 string
