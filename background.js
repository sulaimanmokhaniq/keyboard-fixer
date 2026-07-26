chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fix-layout",
    title: "Fix Arabic/English Layout",
    contexts: ["selection", "editable"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fix-layout") {
    chrome.tabs.sendMessage(tab.id, { action: "fix_text" });
  }
});
