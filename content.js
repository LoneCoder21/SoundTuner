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
    let context_channels = context.destination.channelCount;
    const gain = context.createGain();
    const pan = context.createStereoPanner();
    pan.connect(gain);
    gain.connect(context.destination);

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach((node) => {
                const name = node.nodeName.toLowerCase();
                if (!(name === "video" || name === "audio")) return;
                const source = context.createMediaElementSource(node);
                source.connect(pan);
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
        pan.pan.value = data.pan;
        context.destination.channelCount = data.mono ? 1 : context_channels;
    }

    async function loadData() {
        const response = await browser.runtime.sendMessage({
            type: "getInitialData",
        });
        data = { ...response };
        setData();
    }
    loadData();

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.command) {
            case "setData":
                data = message.data;
                setData();
                break;
        }
    });
})();
