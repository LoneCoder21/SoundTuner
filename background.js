browser.webNavigation.onCompleted.addListener((details) => {
    console.log("This is my favorite website!");
    return;
    browser.scripting
        .executeScript({
            target: {
                tabId: details.tabId,
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
});

browser.browserAction.onClicked.addListener(() => {});
