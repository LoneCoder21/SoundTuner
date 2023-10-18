document.addEventListener("DOMContentLoaded", () => {
    const gainrange = document.querySelector("#gaindisplay");
    const panrange = document.querySelector("#pandisplay");
    const gainslider = document.querySelector("#gain");
    const panslider = document.querySelector("#pan");
    const monocheckbox = document.querySelector("#mono");

    let data = {
        gain: 1.0,
        pan: 0.0,
        mono: false,
    };

    document.querySelector("#gain").addEventListener("change", (e) => {
        let value = parseFloat(e.target.value);
        gainrange.textContent = value.toFixed(2);
        data.gain = value;
        sendData();
    });

    document.querySelector("#pan").addEventListener("change", (e) => {
        let value = parseFloat(e.target.value);
        panrange.textContent = value.toFixed(2);
        data.pan = value;
        sendData();
    });

    document.querySelector("#mono").addEventListener("change", (e) => {
        let value = e.target.checked;
        data.mono = value;
        sendData();
    });

    document.querySelector("#default_button").addEventListener("click", () => {
        applySettings({ gain: 1.0, pan: 0.0, mono: false });
    });

    document.querySelector("#domain_button").addEventListener("click", () => {
        saveDomainCache();
        browser.notifications.create({
            type: "basic",
            iconUrl: browser.runtime.getURL("icon.png"),
            title: "SoundTuner",
            message: "Saved for current domain",
        });
    });

    document.querySelector("#page_button").addEventListener("click", () => {
        savePageCache();
        browser.notifications.create({
            type: "basic",
            iconUrl: browser.runtime.getURL("icon.png"),
            title: "SoundTuner",
            message: "Saved for current page",
        });
    });

    document.querySelector("#reset_button").addEventListener("click", () => {
        clearDomainCache();
        browser.notifications.create({
            type: "basic",
            iconUrl: browser.runtime.getURL("icon.png"),
            title: "SoundTuner",
            message: "Cleared all cache",
        });
    });

    async function saveDomainCache() {
        const url = await getUrl();
        const domain = url[0];
        const fullurl = url[1];
        const all_store = await browser.storage.local.get(domain);
        const store = all_store[domain];
        const l = await browser.storage.local.set({
            [domain]: { ...store, hostname: { ...data } },
        });
    }

    async function savePageCache() {
        const url = await getUrl();
        const domain = url[0];
        const fullurl = url[1];
        const all_store = await browser.storage.local.get(domain);
        const store = all_store[domain];

        const l = await browser.storage.local.set({
            [domain]: { ...store, [fullurl]: { ...data } },
        });
    }

    async function clearDomainCache() {
        const url = await getUrl();
        const domain = url[0];
        const fullurl = url[1];
        const l = await browser.storage.local.remove(domain);
    }

    async function loadSettings() {
        const cache = await getCache();

        const tab = await getCurrentTab();
        const tabid = tab.id;

        const response = await browser.runtime.sendMessage({
            type: "getSession",
            tabid,
        });

        let settings = cache ? cache : { gain: 1.0, pan: 0.0, mono: false };
        settings = response ? response : settings;
        applySettings(settings);
    }
    loadSettings();

    async function getCurrentTab() {
        const tabs = await browser.tabs.query({
            currentWindow: true,
            active: true,
        });
        return tabs[0];
    }

    async function getUrl() {
        const tab = await getCurrentTab();
        const url = tab.url;
        const noprotocol = url.replace(/(^\w+:|^)\/\//, ""); // strip protocol
        const nohash = noprotocol.split("#")[0]; // strip hashes
        const domain = new URL(url).hostname;

        return [domain, nohash];
    }

    async function getCache() {
        const url = await getUrl();
        const domain = url[0];
        const fullurl = url[1];
        const store = await browser.storage.local.get(domain);
        const domaindata = store[domain]?.["hostname"];
        const fulldata = store[domain]?.[fullurl];
        const cache = fulldata ? fulldata : domaindata;
        return cache;
    }

    function applySettings(settings) {
        data = { ...settings };
        gainrange.textContent = data.gain.toFixed(2);
        panrange.textContent = data.pan.toFixed(2);
        gainslider.value = data.gain.toFixed(2);
        panslider.value = data.pan.toFixed(2);
        monocheckbox.checked = data.mono;
        sendData();
    }

    async function sendData() {
        const tabs = await browser.tabs.query({
            currentWindow: true,
            active: true,
        });

        for (const tab in tabs) {
            const id = tabs[tab].id;

            browser.tabs.sendMessage(id, {
                command: "setData",
                data,
            });
        }

        const tabid = tabs[0].id;

        const response = await browser.runtime.sendMessage({
            type: "setSession",
            tabid,
            data,
        });
    }
});
