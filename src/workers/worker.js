/* eslint-disable no-restricted-globals */

self.onmessage = function (e) {
  const { csvText } = e.data;

  // Worker processes the text but doesn't parse it (parsing happens in the main thread)
  self.postMessage(csvText);  // Sends back the raw CSV data
};

/* eslint-enable no-restricted-globals */
