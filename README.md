# Rn Networks - React Native Flipper Plugin

## Overview
Rn Networks is a Flipper plugin for React Native, providing features for network mocking, interception, and full-duplex connection mocking.

## Features
- **API Mocking:** Easily mock API requests in your React Native application.
- **Request Interception:** Intercept and modify requests between the client and server.
- **Full-Duplex Connection Mocking:** Support for mocking sockets and real-time data.

## Installation
1. Install the client library:
   ```bash
     npm install react-native-flipper-network-mocker react-native-flipper --save-dev

Install the Rn Networks plugin from the Flipper marketplace (search for 'rn-network-mock').

## Usage
Import dynamically based on development mode in the React Native index file.
```javascript
if (__DEV__) {
  require('react-native-flipper-network-mocker');
}
```
Import onEventCallback for events based connections
```javascript
if (__DEV__) {
  const { onEventCallback } = require('react-native-flipper-network-mocker');

  onEventCallback((val:any) => {
    // Handle the mocked response
    console.log(val);
  });
}
```

## Notable features
- Environment Support
- Record Sessions
- Export/Import for Complete Environments
- Multiple Response Variations for Each Request


Contributing
Contributions are welcome! Fork the project and submit pull requests.

License
This project is licensed under the MIT License.
