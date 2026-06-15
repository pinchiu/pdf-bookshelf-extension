// Background service worker for Visual Bookshelf

chrome.runtime.onInstalled.addListener(() => {
  console.log("Visual Bookshelf Extension Installed");
});

// Open the main bookshelf page when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      sendResponse({ token, error: chrome.runtime.lastError });
    });
    return true; 
  }
});
