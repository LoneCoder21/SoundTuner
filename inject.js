const default_controls = {
    gain: 1.0,
    pan: 0.0,
    mono: false,
};

let controls_changed = false;
let data = {
    ...default_controls,
};
let captcha_active = false;

let context = new AudioContext();
let context_channels = context.destination.channelCount;
const gain = context.createGain();
const pan = context.createStereoPanner();
pan.connect(gain);
gain.connect(context.destination);

function checkIfObjectsAreEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function isPotentialCrossOrigin(node) {
    try {
        const url = new URL(node.currentSrc);
        return url.origin !== document.location.origin;
    } catch (e) {
        return false;
    }
}

var trackednodes = new Set();

function attachControlsToNode(node) {
    const source = context.createMediaElementSource(node);
    source.connect(pan);
}

function attachNodeToContext(node) {
    if (trackednodes.has(node) || isPotentialCrossOrigin(node)) {
        return;
    }

    trackednodes.add(node);

    if (controls_changed) {
        attachControlsToNode(node);
    }
}

function detectCloudFlareCaptcha(node) {
    return (
        node.tagName &&
        node.tagName.toLowerCase() === "script" &&
        node.src &&
        node.src.includes("challenges.cloudflare.com")
    );
}

var originalAttachShadow = HTMLElement.prototype.attachShadow;

function switchShadowToOriginal() {
    HTMLElement.prototype.attachShadow = originalAttachShadow;
} // go back to original shadow root if cloudflare captchas are detected.

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

            if (detectCloudFlareCaptcha(node)) {
                switchShadowToOriginal();
            }

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

document.querySelectorAll("script").forEach((node) => {
    if (detectCloudFlareCaptcha(node)) {
        switchShadowToOriginal();
    }
});

document.querySelectorAll("video", "audio").forEach((node) => {
    attachNodeToContext(node);
});

observer.observe(document, {
    childList: true,
    subtree: true,
});

function setData(newdata) {
    data = newdata;

    gain.gain.value = data.gain;
    pan.pan.value = data.pan;
    context.destination.channelCount = data.mono ? 1 : context_channels;

    if (!controls_changed && !checkIfObjectsAreEqual(default_controls, data)) {
        controls_changed = true;
        for (const node of trackednodes) {
            attachControlsToNode(node);
        }
    }
}

HTMLElement.prototype.attachShadow = function (option) {
    var sh = originalAttachShadow.call(this, { mode: "open" });

    observer.observe(this.shadowRoot, {
        childList: true,
        subtree: true,
    });

    return sh;
};

window.addEventListener("message", (message) => {
    switch (message.data.command) {
        case "setData":
            setData(message.data.data);
            break;
    }
});
