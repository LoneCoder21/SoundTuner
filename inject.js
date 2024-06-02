let data = {
    gain: 1.0,
    pan: 0.0,
    mono: false,
};

const default_controls = {
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

var trackednodes = new WeakSet();
var untrackednodes = new Set();

function attachNodeToQueue(node) {
    if (untrackednodes.has(node)) {
        return;
    }
    untrackednodes.add(node);
}

function attachNodeToContext(node) {
    if (!isPotentialCrossOrigin(node)) {
        if (trackednodes.has(node)) {
            return;
        }
        const source = context.createMediaElementSource(node);
        source.connect(pan);
        trackednodes.add(node);
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
                attachNodeToQueue(node);
                return;
            }
            node.querySelectorAll("video", "audio").forEach((e) => {
                attachNodeToQueue(e);
            });
        });
    }
});

const defaultcontrols_str = JSON.stringify(default_controls);
let newcontrols_str = JSON.stringify(data);

document.querySelectorAll("video", "audio").forEach((node) => {
    attachNodeToQueue(node);
});

observer.observe(document, {
    childList: true,
    subtree: true,
});

function setData() {
    newcontrols_str = JSON.stringify(data);

    if (defaultcontrols_str === newcontrols_str) {
        return;
    } // don't attach controls to nodes if it's default

    for (const node of untrackednodes) {
        attachNodeToContext(node);
    }
    untrackednodes = new Set();

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
