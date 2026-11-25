// ===== НАСТРОЙКИ РУЛЕТКИ =====
const TOTAL_ITEMS = 40;
const ITEM_WIDTH = 120;
const WINNER_INDEX = 30;
const SPIN_TIME = 5000;

// ===== СПИСОК ВОЗМОЖНЫХ ПРИЗОВ =====
const ITEMS = [
    { name: "gift_red",   image: "red_presrnt.jpg",   chance: 30 },
    { name: "gift_green", image: "green_present.png", chance: 10 },
    { name: "gift_white", image: "white_present.png", chance: 50 },
];

// ===== ЭЛЕМЕНТЫ СТРАНИЦЫ =====
const rouletteWindow = document.getElementById("Peso");
const rlb = document.getElementById("roulette_bar");
const spinBtn = document.getElementById("Spin_Button");
const cancelBtn = document.getElementById("Cancel_Button");
const dialog = document.getElementById("drop_dialog");
const resultEl = document.getElementById("result");
const closeResultBtn = document.getElementById("Close_Result");
const spinAgainBtn = document.getElementById("Spin_Again");

// ===== ФЛАГИ =====
let spinning = false;
let spinEndHandler = null;

// ===== ВЫБОР ПРИЗА =====
function pickWinner() {
    let total = 0;
    for (const item of ITEMS) total += item.chance;
    let r = Math.random() * total;
    for (const item of ITEMS) {
        if (r < item.chance) return item;
        r -= item.chance;
    }
    return ITEMS[ITEMS.length - 1];
}

// ===== СОЗДАНИЕ ЛЕНТЫ =====
function buildLine(winner) {
    rlb.innerHTML = "";
    for (let i = 0; i < TOTAL_ITEMS; i++) {
        const item = (i === WINNER_INDEX) ? winner : pickWinner();
        const card = document.createElement("div");
        card.className = "roulette_item";
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        card.appendChild(img);
        rlb.appendChild(card);
    }
}

// ===== ПРОКРУТКА =====
function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;

    const winner = pickWinner();
    buildLine(winner);

    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0px)";
    void rlb.offsetWidth;

    const cardCenter = WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2;
    const windowWidth = rouletteWindow.clientWidth;
    const targetOffset = windowWidth / 2 - cardCenter;
    const jitter = (Math.random() - 0.5) * ITEM_WIDTH * 0.6;

    rlb.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    rlb.style.transform = `translateX(${targetOffset + jitter}px)`;

    spinEndHandler = (event) => {
        if (event.propertyName !== "transform") return;
        rlb.removeEventListener("transitionend", spinEndHandler);
        spinEndHandler = null;
        finish(winner);
    };
    rlb.addEventListener("transitionend", spinEndHandler);
}

// ===== ПОКАЗ РЕЗУЛЬТАТА =====
function finish(winner) {
    spinning = false;
    spinBtn.disabled = false;

    resultEl.innerHTML = "";
    const img = document.createElement("img");
    img.src = winner.image;
    img.alt = winner.name;
    const title = document.createElement("p");
    title.textContent = `Выпало: ${winner.name}`;
    resultEl.append(img, title);
    dialog.showModal();
}

// ===== СБРОС =====
function reset() {
    if (spinEndHandler !== null) {
        rlb.removeEventListener("transitionend", spinEndHandler);
        spinEndHandler = null;
    }
    spinning = false;
    spinBtn.disabled = false;
    dialog.close();
    resultEl.innerHTML = "";
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0px)";
}

// ===== СОБЫТИЯ =====
spinBtn.addEventListener("click", spin);
cancelBtn.addEventListener("click", reset);
closeResultBtn.addEventListener("click", () => {
    dialog.close();
    resultEl.innerHTML = "";
});
spinAgainBtn.addEventListener("click", () => {
    dialog.close();
    resultEl.innerHTML = "";
    spin();
});