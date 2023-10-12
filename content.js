(async () => {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    let data = {
        gain: 1.0,
        pan: 0.0,
        mono: false,
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.command) {
            case "getData":
                sendResponse(data);
                break;
            case "setData":
                data = message.data;
                break;
        }
    });
})();
