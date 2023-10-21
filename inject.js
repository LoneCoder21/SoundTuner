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

function isPotentialCrossOrigin(node) {
    try {
        const url = new URL(node.currentSrc);
        return url.origin !== document.location.origin;
    } catch (e) {
        return false;
    }
}

function attachNodeToContext(node) {
    if (!isPotentialCrossOrigin(node)) {
        const source = context.createMediaElementSource(node);
        source.connect(pan);
    }
}

const observer = new MutationObserver((records) => {
    for (const record of records) {
        record.addedNodes.forEach((node) => {
            if (
                node.nodeType !== Node.ELEMENT_NODE &&
                node.nodeType !== Node.DOCUMENT_NODE &&
                node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
            )
                return;

            const name = node.nodeName.toLowerCase();
            if (name === "video" || name === "audio") {
                attachNodeToContext(node);
                return;
            }
            node.querySelectorAll("video", "audio").forEach((e) => {
                attachNodeToContext(e);
            });
        });
    }
});

document.querySelectorAll("video", "audio").forEach((node) => {
    attachNodeToContext(node);
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

var attachShadow = HTMLElement.prototype.attachShadow;
HTMLElement.prototype.attachShadow = function (option) {
    var sh = attachShadow.call(this, { mode: "open" });

    observer.observe(this.shadowRoot, {
        childList: true,
        subtree: true,
    });

    return sh;
};

window.addEventListener("message", (message) => {
    switch (message.data.command) {
        case "setData":
            data = message.data.data;
            setData();
            break;
    }
});
