export function generateUniqueKey() {
    const timestamp = Date.now().toString(36); // Convert timestamp to base 36 string
    const randomString = Math.random().toString(36).substr(2, 5); // Generate a random string
  
    return timestamp + randomString;
  }
  