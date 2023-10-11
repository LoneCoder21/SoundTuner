const gainrange = document.querySelector("#gaindisplay");
const panrange = document.querySelector("#pandisplay");

document.querySelector("#gain").addEventListener("input", (e) => {
    gainrange.textContent = parseFloat(e.target.value).toFixed(2);
});

document.querySelector("#pan").addEventListener("input", (e) => {
    panrange.textContent = parseFloat(e.target.value).toFixed(2);
});
