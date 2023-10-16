let session = {};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "setSession") {
        const { tabid, data } = request;
        session[tabid] = data;
    } else if (request.type === "getSession") {
        const { tabid } = request;
        const data = session[tabid];
        sendResponse(data);
    }
});
