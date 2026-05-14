function getPageText() {
  return document.body?.innerText?.slice(0, 3000) || "";
}

if (!window.__jobshieldContentListenerAttached) {
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "GET_TEXT") {
      sendResponse({ text: getPageText() });
    }
  });

  window.__jobshieldContentListenerAttached = true;
}
