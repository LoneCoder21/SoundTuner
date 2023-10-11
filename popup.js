const gainrange = document.querySelector("#gaindisplay");

document.querySelector("#gain").addEventListener("input", (e) => {
    gainrange.textContent = parseFloat(e.target.value).toFixed(2);
});
