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

    // TODO - Deal with shadow roots
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach((newnode) => {
                function look(node) {
                    const name = node.nodeName.toLowerCase();
                    Object.defineProperty(node, "aaaaaaaaaaaa", {
                        value: 1,
                        writable: false,
                    });
                    console.log(node);
                    if (name === "shreddit-app") {
                    }

                    //console.log(node, "noshadow");
                    if (name === "video" || name === "audio") {
                        console.log("observer", node);
                        context.createMediaElementSource(node).connect(pan);
                        return;
                    } else {
                        const proxy = new Proxy(node, {
                            set(obj, prop, value) {
                                if (prop === "shadowRoot") {
                                    // shadowRoot updated
                                    console.log("updated shadow root", value);
                                }
                                return Reflect.set(...arguments);
                            },
                        });
                    }
                }
                look(newnode);
            });
        }
    });

    document.querySelectorAll("video", "audio").forEach((node) => {
        context.createMediaElementSource(node).connect(pan);
    });
    observer.observe(document, {
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
