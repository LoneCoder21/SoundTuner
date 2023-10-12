document.addEventListener("DOMContentLoaded", () => {
    const gainrange = document.querySelector("#gaindisplay");
    const panrange = document.querySelector("#pandisplay");

    document.querySelector("#gain").addEventListener("input", (e) => {
        gainrange.textContent = parseFloat(e.target.value).toFixed(2);
    });

    document.querySelector("#pan").addEventListener("input", (e) => {
        panrange.textContent = parseFloat(e.target.value).toFixed(2);
    });

    document.querySelector("#gain").addEventListener("change", (e) => {
        sendMessageAllTabs();
    });

    document.querySelector("#pan").addEventListener("change", (e) => {
        sendMessageAllTabs();
    });

    function sendMessageAllTabs() {
        console.log("sending...");
        browser.tabs
            .query({})
            .then((tabs) => {
                for (const tab in tabs) {
                    const id = tabs[tab].id;
                    console.log(id);

                    browser.tabs
                        .sendMessage(id, {
                            greeting: "Hi from background script",
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
