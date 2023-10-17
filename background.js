let session = {};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //message from popup script
    if (request.type === "setSession") {
        const { tabid, data } = request;
        session[tabid] = data;
        return false;
    } else if (request.type === "getSession") {
        const { tabid } = request;
        const data = session[tabid];
        sendResponse(data);
        return true;
    }

    //message from a content script
    if (sender.envType === "content_child") {
        if (request.type === "getInitialData") {
            const session_data = session[sender.tab.id];
            let url = sender.tab.url;
            const domain = new URL(url).hostname;
            url = url.replace(/(^\w+:|^)\/\//, ""); // strip protocol
            url = url.split("#")[0]; // strip hashes

            const store = browser.storage.local.get(domain).then((store) => {
                const domaindata = store[domain]?.["hostname"];
                const fulldata = store[domain]?.[url];

                let cache = fulldata ? fulldata : domaindata;
                cache = cache ? cache : { gain: 1.0, pan: 0.0, mono: false };

                const data = session_data ? session_data : cache;
                sendResponse({ ...data });
            });
        }
    }
    return true;
});
