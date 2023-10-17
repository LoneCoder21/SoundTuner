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
                function look(node, inShadowRoot) {
                    const name = node.nodeName.toLowerCase();

                    if (node.shadowRoot) {
                        //console.log(node, "shadow");
                        observer.observe(node, {
                            childList: true,
                            subtree: true,
                        });

                        for (const child of node.children) {
                            //console.log(child);
                            look(child, true);
                        }
                    } else {
                        //console.log(node, "noshadow");
                        if (name === "video" || name === "audio") {
                            //console.log(node);
                            context.createMediaElementSource(node).connect(pan);
                            return;
                        } else {
                            if (inShadowRoot) {
                                for (const child of node.children) {
                                    look(child, true);
                                }
                            }
                        }
                    }
                }
                look(newnode, false);
            });
        }
    });

    //console.log(document);
    //console.log(document.body);

    let target = document;
    //target = document.children[0].children[1];
    //console.log(target);

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
