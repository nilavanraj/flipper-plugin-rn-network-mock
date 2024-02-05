import {indexNameCustomEvent, indexNameLinkEvent} from '../constant'

export const openDatabase = (dbName, version) => {

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);

    request.onerror = (event) => {
      console.log('Error opening database', event)

      reject('Error opening database');
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objectStore1 = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      const objectStore2 = db.createObjectStore(indexNameLinkEvent, { keyPath: 'id', autoIncrement: true });
      const objectStore3 = db.createObjectStore(indexNameCustomEvent, { keyPath: 'id', autoIncrement: true });

      objectStore1.createIndex('id', 'id', { unique: true });
      objectStore2.createIndex('id', 'id', { unique: true });
      objectStore3.createIndex('id', 'id', { unique: true });


      
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  });
};

export const storeRequest = async (data, method, dbName, indexName) => {
  const db = await openDatabase(dbName, 1);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(indexName, 'readwrite');
    const objectStore = transaction.objectStore(indexName);
    let request = null;
    if (method === 'add') {
      request = objectStore.add(data);
    } else {
      request = objectStore.put(data);
    }

    request.onerror = (event) => {
      console.log('Failed to store data: ', event);
      reject('Error storing request' + event);
    };

    request.onsuccess = (db) => {
      console.log('Request stored successfully',db);
      resolve('Request stored successfully');
    };
  });
};
export const storeDelete = async (key, dbName, indexName) => {
  const db = await openDatabase(dbName, 1);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(indexName, 'readwrite');
    const objectStore = transaction.objectStore(indexName);
    const request =  objectStore.delete(key);
    

    request.onerror = (event) => {
      console.log('Failed to store data: ', event);
      reject('Error storing request' + event);
    };

    request.onsuccess = () => {
      console.log('Request stored successfully');
      resolve('Request stored successfully');
    };
  });
};

// ... other functions
export const getRequests = async (dbName, indexName) => {
  const db = await openDatabase(dbName, 1, indexName);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(indexName, 'readonly');
    const objectStore = transaction.objectStore(indexName);
    const request = objectStore.getAll();

    request.onerror = () => {
      reject('Error retrieving requests');
    };

    request.onsuccess = () => {
      const requests = request.result;
      resolve(requests);
    };
  });
};

export const deleteDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase(dbName);

    request.onerror = (event) => {
      reject('Error deleting database');
    };

    request.onsuccess = (event) => {
      resolve('Database deleted successfully');
    };
  });
}
  