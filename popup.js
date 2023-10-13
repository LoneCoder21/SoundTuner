document.addEventListener("DOMContentLoaded", () => {
    const gainrange = document.querySelector("#gaindisplay");
    const panrange = document.querySelector("#pandisplay");
    const gainslider = document.querySelector("#gain");
    const panslider = document.querySelector("#pan");

    let data = {
        gain: 1.0,
        pan: 0.0,
        mono: false,
    };
    document.querySelector("#gain").addEventListener("change", (e) => {
        let value = parseFloat(e.target.value);
        gainrange.textContent = value.toFixed(2);
        data.gain = value;
        //        sendData();
        browser.permissions
            .request({ origins: ["<all_urls>"] })
            .then((r) => {
                console.log("granted");
            })
            .catch((e) => {
                console.log(e);
            });
    });

    document.querySelector("#pan").addEventListener("change", (e) => {
        let value = parseFloat(e.target.value);
        panrange.textContent = value.toFixed(2);
        data.pan = value;
        //sendData();
    });
    console.log("spawning...");
    function spawnScript() {
        browser.tabs
            .query({ currentWindow: true, active: true })
            .then((tabs) => {
                for (const tab in tabs) {
                    const id = tabs[tab].id;

                    browser.scripting
                        .executeScript({
                            target: {
                                tabId: id,
                                allFrames: true,
                            },
                            files: ["content.js"],
                        })
                        .then((response) => {
                            console.log(response);
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    spawnScript();

    function getData() {
        browser.tabs
            .query({ currentWindow: true, active: true })
            .then((tabs) => {
                for (const tab in tabs) {
                    const id = tabs[tab].id;

                    browser.tabs
                        .sendMessage(id, { command: "getData" })
                        .then((response) => {
                            data = response;
                            gainrange.textContent = data.gain;
                            panrange.textContent = data.pan;
                            gainslider.value = data.gain;
                            panslider.value = data.pan;
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    //getData();

    function sendData() {
        browser.tabs
            .query({ currentWindow: true, active: true })
            .then((tabs) => {
                for (const tab in tabs) {
                    const id = tabs[tab].id;

                    browser.tabs
                        .sendMessage(id, {
                            command: "setData",
                            data,
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
});
