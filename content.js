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
    console.log("content");
    let context = new AudioContext();
    let context_channels = context.destination.channelCount;
    const gain = context.createGain();
    const pan = context.createStereoPanner();
    pan.connect(gain);
    gain.connect(context.destination);

    // TODO - Deal with shadow roots
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach((node) => {
                const name = node.nodeName.toLowerCase();
                if (!(name === "video" || name === "audio")) return;
                console.log(node);
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

    console.log(document.querySelectorAll("video", "audio"));

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("fadsfdas");
        switch (message.command) {
            case "setData":
                data = message.data;
                setData();
                break;
        }
    });
})();
