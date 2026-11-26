// ===== НАСТРОЙКИ РУЛЕТКИ =====
const TOTAL_ITEMS = 40;  // Количество карточек на ленте
const ITEM_WIDTH = 120;  // Должно совпадать с .roulette_item в CSS
const WINNER_INDEX = 30; // Позиция выигрышной карточки (с нуля)
const SPIN_TIME = 4800;  // Длительность прокрутки в мс

// ===== ПРИЗЫ: КАРТИНКИ ИЗ ПРОЕКТА =====
const ITEMS = [
    { label: "Тыква",   image: "halloween-pumpkin-isolated-on-transparent-background-png-psd_888962-1488-840552587.jpg", chance: 25 },
    { label: "Кот",     image: "png-clipart-halloween-cat-element-halloween-western-festival-2305217153.png", chance: 25 },
    { label: "Паук",    image: "png-transparent-bug-decoration-halloween-scary-spider-halloween-icon-390436756.png", chance: 25 },
    { label: "Призрак", image: "png-transparent-halloween-ghost-smile-4015908116.png", chance: 25 },
];

// ===== ЭЛЕМЕНТЫ СТРАНИЦЫ =====
const caseImg = document.getElementById("Case_Js");
const rouletteSection = document.getElementById("rouletteSection");
const rouletteWindow = document.getElementById("Peso");
const rlb = document.getElementById("roulette_bar");
const cancelBtn = document.getElementById("Cancel_Button");
const dialog = document.getElementById("drop_dialog");
const resultEl = document.getElementById("result");
const closeResultBtn = document.getElementById("Close_Result");
const spinAgainBtn = document.getElementById("Spin_Again");
const hint = document.getElementById("hint");

// ===== СОСТОЯНИЕ =====
let giftFell = false;      // Тыква закончила падать
let spinning = false;      // Лента сейчас крутится
let spinEndHandler = null; // Обработчик окончания анимации

// ===== ПОДГОТОВКА КАРТИНОК =====
ITEMS.forEach((item) => {
    const img = new Image();
    img.src = item.image;
});

// ===== ПАДЕНИЕ ТЫКВЫ ПРИ ЗАГРУЗКЕ =====
function startPumpkinDrop() {
    // Если анимации отключены системой, событие animationend не наступит
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        caseImg.classList.add("shake");
        giftFell = true;
        return;
    }

    caseImg.classList.add("drop-in");
    caseImg.addEventListener("animationend", () => {
        caseImg.classList.remove("drop-in");
        caseImg.classList.add("shake");
        giftFell = true;
        hint.textContent = "Нажми на тыкву, чтобы крутить";
    }, { once: true });
}

// ===== СЛУЧАЙНЫЙ ВЫБОР ПРИЗА С УЧЁТОМ ВЕСОВ =====
function pickWinner() {
    const total = ITEMS.reduce((sum, item) => sum + item.chance, 0);
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
        img.alt = item.label;

        card.appendChild(img);
        rlb.appendChild(card);
    }
}

// ===== ПРОКРУТКА =====
function spin() {
    if (!giftFell || spinning) return;

    spinning = true;
    caseImg.classList.remove("shake");
    caseImg.classList.add("busy");
    hint.textContent = "Рулетка крутится...";
    hint.classList.add("active");

    // Показываем рулетку и сразу запускаем прокрутку
    rouletteSection.classList.add("show");
    rouletteSection.setAttribute("aria-hidden", "false");

    const winner = pickWinner();
    buildLine(winner);

    // Мгновенный сброс без анимации
    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0px)";
    void rlb.offsetWidth; // заставляем браузер применить сброс

    // Center выигрышной карточки должен оказаться под указателем
    const cardCenter = WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2;
    const windowWidth = rouletteWindow.clientWidth;
    const targetOffset = windowWidth / 2 - cardCenter;
    const jitter = (Math.random() - 0.5) * ITEM_WIDTH * 0.5;

    rlb.style.transition = `transform ${SPIN_TIME}ms cubic-bezier(0.12, 0.72, 0.08, 1)`;
    rlb.style.transform = `translateX(${targetOffset + jitter}px)`;

    spinEndHandler = (event) => {
        if (event.propertyName !== "transform") return;
        rlb.removeEventListener("transitionend", spinEndHandler);
        spinEndHandler = null;
        finish(winner);
    };
    rlb.addEventListener("transitionend", spinEndHandler);
}

// ===== ПОКАЗ ПРИЗА =====
function finish(winner) {
    spinning = false;
    caseImg.classList.remove("busy");
    caseImg.classList.add("shake");
    hint.textContent = "Нажми на тыкву ещё раз";
    hint.classList.remove("active");

    resultEl.innerHTML = "";

    const img = document.createElement("img");
    img.src = winner.image;
    img.alt = winner.label;

    const title = document.createElement("p");
    title.textContent = `Тебе выпал: ${winner.label}`;

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
    if (dialog.open) dialog.close();
    resultEl.innerHTML = "";

    rlb.style.transition = "none";
    rlb.style.transform = "translateX(0px)";

    caseImg.classList.remove("busy");
    caseImg.classList.add("shake");
    rouletteSection.classList.remove("show");
    rouletteSection.setAttribute("aria-hidden", "true");

    hint.textContent = "Нажми на тыкву, чтобы крутить";
    hint.classList.remove("active");
}

// ===== СОБЫТИЯ =====
caseImg.addEventListener("click", spin);          // Клик по тыкве = запуск рулетки
cancelBtn.addEventListener("click", reset);      // Сброс
closeResultBtn.addEventListener("click", () => {
    dialog.close();
    resultEl.innerHTML = "";
});
spinAgainBtn.addEventListener("click", () => {
    dialog.close();
    resultEl.innerHTML = "";
    spin();
});

// ===== СТАРТ =====
startPumpkinDrop();
