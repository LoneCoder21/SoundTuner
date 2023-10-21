(async () => {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    const injectedScript = document.createElement("script");
    injectedScript.src = browser.extension.getURL("inject.js");
    (document.head || document.documentElement).appendChild(injectedScript);

    async function loadData() {
        const data = await browser.runtime.sendMessage({
            type: "getInitialData",
        });
        window.postMessage({
            command: "setData",
            data: data,
        });
    }
    loadData();

    // messages from popup
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.command) {
            case "setData":
                window.postMessage({
                    command: "setData",
                    data: message.data,
                });
                break;
        }
    });
})();
