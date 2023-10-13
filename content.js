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

    let context = new AudioContext();
    const gain = context.createGain();
    gain.connect(context.destination);

    let elements = [];

    console.log("content ready");
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach((node) => {
                const name = node.nodeName.toLowerCase();
                if (!(name === "video" || name === "audio")) return;
                console.log(node);
                const source = context.createMediaElementSource(node);
                source.connect(gain);
            });
        }
    });
    var container = document.documentElement || document.body;

    observer.observe(container, {
        childList: true,
        subtree: true,
    });

    function setData() {
        gain.gain.value = data.gain;
    }

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.command) {
            case "getData":
                sendResponse(data);
                break;
            case "setData":
                data = message.data;
                setData();
                break;
        }
    });
})();
