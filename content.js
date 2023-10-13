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

    function setData() {
        const elements = document.querySelectorAll("video", "audio");
        console.log(elements);

        let context = new AudioContext();
        const gain = new GainNode(context, {
            value: data.gain,
        });

        for (const element in elements) {
            const source = context.createMediaElementSource(element);
            source.connect(gain);
            gain.connect(context.destination);
        }
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
