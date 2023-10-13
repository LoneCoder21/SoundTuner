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

    console.log("content ready");

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.command) {
            case "getData":
                sendResponse(data);
                console.log(document.querySelectorAll("video"));
                break;
            case "setData":
                data = message.data;
                setData();
                break;
        }
    });
})();
