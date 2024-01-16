// popup.js
// Runs in the context of popup.html.

// Run the main script when the button is clicked.
function executeQueuing() {
    // Query the active tab and run the main script on it.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        var activeTab = tabs[0];
        if (!activeTab.url.includes("youtube.com/feed/subscriptions")) {
            alert("Please navigate to https://www.youtube.com/feed/subscriptions");
            return;
        }
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id }, 
            files : [ "main.js" ],
        });
    });
}

// call executeQueuing when the button is clicked
document.getElementById('startbtn').addEventListener('click', executeQueuing);

// when main.js has generated a playlist URL, open it in a new tab
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'openNewTab') {
      chrome.tabs.create({ url: message.url });
    }
});