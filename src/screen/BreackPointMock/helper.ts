export async function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open('json_db', 1);
  
      request.onerror = event => {
        reject(event.target.error);
      };
  
      request.onsuccess = event => {
        resolve(event.target.result);
      };
  
      request.onupgradeneeded = event => {
        const db = event.target.result;
        db.createObjectStore('json_data', { keyPath: 'id', autoIncrement: true });
      };
    });
  }
  
  export async function loadJsonDataFromIndexedDB() {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['json_data'], 'readonly');
      const store = transaction.objectStore('json_data');
      const data = await store.getAll();
      return data;
    } catch (error) {
      console.error('Error loading data from IndexedDB:', error);
      return [];
    }
  }
  
  export async function saveJsonDataToIndexedDB(jsonDataList) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['json_data'], 'readwrite');
      const store = transaction.objectStore('json_data');
      
      // Clear the existing data
      await store.clear();
  
      // Add or update each JSON data entry
      for (const jsonData of jsonDataList) {
        await store.put(jsonData);
      }
    } catch (error) {
      console.error('Error saving data to IndexedDB:', error);
    }
  }
  