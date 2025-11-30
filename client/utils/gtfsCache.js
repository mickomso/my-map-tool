// IndexedDB cache for GTFS data with checksum validation

const DB_NAME = 'gtfs-cache';
const DB_VERSION = 2;
const STORES = {
  stops: 'stops',
  shapes: 'shapes',
  meta: 'meta',
};

let db = null;

// Initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Delete old stores if they exist (schema change)
      if (database.objectStoreNames.contains(STORES.stops)) {
        database.deleteObjectStore(STORES.stops);
      }
      if (database.objectStoreNames.contains(STORES.shapes)) {
        database.deleteObjectStore(STORES.shapes);
      }
      if (database.objectStoreNames.contains(STORES.meta)) {
        database.deleteObjectStore(STORES.meta);
      }

      // Create object stores - use stop_id and shape_id as keys
      database.createObjectStore(STORES.stops, { keyPath: 'stop_id' });
      database.createObjectStore(STORES.shapes, { keyPath: 'shape_id' });
      database.createObjectStore(STORES.meta, { keyPath: 'key' });
    };
  });
}

// Get checksum from meta store
async function getStoredChecksum(type) {
  const database = await openDB();
  return new Promise((resolve) => {
    const transaction = database.transaction([STORES.meta], 'readonly');
    const store = transaction.objectStore(STORES.meta);
    const request = store.get(`${type}_checksum`);

    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => resolve(null);
  });
}

// Store checksum in meta store
async function storeChecksum(type, checksum) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.meta], 'readwrite');
    const store = transaction.objectStore(STORES.meta);
    const request = store.put({ key: `${type}_checksum`, value: checksum });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get all data from a store
async function getAllFromStore(storeName) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Store data in bulk
async function storeData(storeName, data) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear existing data first
    store.clear();

    // Add new data - remove MongoDB _id field which can't be cloned
    data.forEach((item) => {
      const cleanItem = { ...item };
      delete cleanItem._id;
      store.put(cleanItem);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Clear all cached data
async function clearCache() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [STORES.stops, STORES.shapes, STORES.meta],
      'readwrite'
    );

    transaction.objectStore(STORES.stops).clear();
    transaction.objectStore(STORES.shapes).clear();
    transaction.objectStore(STORES.meta).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Get stops with cache validation
export async function getCachedStops(fetchFromServer) {
  try {
    const storedChecksum = await getStoredChecksum('stops');
    const serverChecksum = await fetchFromServer('gtfs.getStopsChecksum');

    if (storedChecksum && storedChecksum === serverChecksum) {
      const cachedData = await getAllFromStore(STORES.stops);
      if (cachedData.length > 0) {
        console.log('Using cached stops data');
        return cachedData;
      }
    }

    // Fetch fresh data from server
    console.log('Fetching stops from server...');
    const freshData = await fetchFromServer('gtfs.getStops');

    if (freshData && freshData.length > 0) {
      await storeData(STORES.stops, freshData);
      await storeChecksum('stops', serverChecksum);
    }

    return freshData || [];
  } catch (error) {
    console.error('Error getting cached stops:', error);
    // Fallback to server
    return (await fetchFromServer('gtfs.getStops')) || [];
  }
}

// Get shapes with cache validation (pre-processed paths)
export async function getCachedShapes(fetchFromServer) {
  try {
    const storedChecksum = await getStoredChecksum('shapes');
    const serverChecksum = await fetchFromServer('gtfs.getShapesChecksum');

    if (storedChecksum && storedChecksum === serverChecksum) {
      const cachedData = await getAllFromStore(STORES.shapes);
      if (cachedData.length > 0) {
        console.log('Using cached shapes data');
        return cachedData;
      }
    }

    // Fetch fresh data from server
    console.log('Fetching shapes from server...');
    const freshData = await fetchFromServer('gtfs.getProcessedShapes');

    if (freshData && freshData.length > 0) {
      await storeData(STORES.shapes, freshData);
      await storeChecksum('shapes', serverChecksum);
    }

    return freshData || [];
  } catch (error) {
    console.error('Error getting cached shapes:', error);
    // Fallback to server
    return (await fetchFromServer('gtfs.getProcessedShapes')) || [];
  }
}

// Clear GTFS cache (call after import)
export { clearCache };
