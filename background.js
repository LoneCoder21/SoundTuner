let session = {};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //message from popup script
    if (request.type === "setSession") {
        const { tabid, data } = request;
        session[tabid] = data;
    } else if (request.type === "getSession") {
        const { tabid } = request;
        const data = session[tabid];
        sendResponse(data);
    }

    //message from a content script
    if (sender.envType === "content_child") {
        if (request.type === "getInitialData") {
            const data = session[sender.tab.id];
            sendResponse(data);
        }
    }
});
