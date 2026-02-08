import { openDB } from 'idb';

const DB_NAME = 'mattey-banana-db';
const STORE_IMAGES = 'user-images';
const STORE_CONFIG = 'config';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
      db.createObjectStore(STORE_CONFIG);
    },
  });
}

export async function saveUserImage(image: { id: string, url: string, prompt: string }) {
  const db = await initDB();
  await db.put(STORE_IMAGES, image);
}

export async function getUserImages() {
  const db = await initDB();
  return db.getAll(STORE_IMAGES);
}

export async function saveApiKey(key: string) {
  const db = await initDB();
  await db.put(STORE_CONFIG, key, 'gemini-api-key');
}

export async function getApiKey() {
  const db = await initDB();
  return db.get(STORE_CONFIG, 'gemini-api-key');
}
