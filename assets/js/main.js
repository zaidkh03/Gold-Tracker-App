// TODO::::::::::::::::::::::::::::::preloader:::::::::::::::::::::::::::::::::::::::::::::::::
window.addEventListener("load", () => {
    const PRELOADER = document.getElementById("preloader");

    setInterval(() => {
        PRELOADER.classList.add("preloader-hidden");
    }, 1000)
})

// TODO:::::::::::::::::::::::::::::::Active page:::::::::::::::::::::::::::::::::::::::::::::::

const LINKS = document.querySelectorAll(".page");
const CURR_PAGE = window.location.pathname.split("/").pop();

LINKS.forEach(e => {
    const LINKS_PAGE = e.getAttribute("href").split("/").pop();


    if (LINKS_PAGE === CURR_PAGE) e.classList.add("active");
    else e.classList.remove("active");
})

// TODO:::::::::::::::::::::::::::dark/light:::::::::::::::::::::::::::::::::::::::::::::::::

const THEME_TOGGLE = document.getElementById("theme-toggle");
const BODY = document.documentElement;

const CURR_THEME = localStorage.getItem("theme");

THEME_TOGGLE.addEventListener("click", (e) => {
    e.preventDefault();

    let newTheme = BODY.getAttribute("data-theme") === "dark" ? "light" : "dark";

    BODY.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
})

// TODO:::::::::::::::::::::::::: assets card data handle ::::::::::::::::::::::::::::::::::::

document.addEventListener('DOMContentLoaded', () => {
    const ASSETS_FORM = document.getElementById('addAssetForm');
    const ASSETS_CARDS = document.getElementById('rowCard');
    const IMG_INPUT = document.getElementById('asset-img');
    const IMG_PREVIEW = document.getElementById('img-preview');

    if (!ASSETS_FORM || !ASSETS_CARDS) return;

    const LOAD_ASSETS = () => {
        const ASSETS = JSON.parse(localStorage.getItem('myAssets')) || [];
        ASSETS.forEach(asset => DISPLAY_CARD(asset));
    };

    let currentBase64 = "";

    IMG_INPUT.addEventListener('change', () => {
        const FILE = IMG_INPUT.files[0];
        if (FILE) {
            const RENDER = new FileReader();
            RENDER.onload = (e) => {
                currentBase64 = e.target.result;
                IMG_PREVIEW.src = currentBase64;
                IMG_PREVIEW.style.display = 'block';
            };
            RENDER.readAsDataURL(FILE);
        }
    });

    ASSETS_FORM.addEventListener('submit', (e) => {
        e.preventDefault();

        const NEW_ASSET = {
            id: Date.now(),
            name: document.getElementById('assetName').value,
            type: document.getElementById('assetType').value,
            karat: document.getElementById('assetKarat').value,
            date: document.getElementById('purchaseDate').value,
            price: document.getElementById('purchasePrice').value,
            gram: document.getElementById('gram').value,
            image: currentBase64,
        };

        const ASSETS = JSON.parse(localStorage.getItem('myAssets')) || [];
        ASSETS.push(NEW_ASSET);
        localStorage.setItem('myAssets', JSON.stringify(ASSETS));

        DISPLAY_CARD(NEW_ASSET);
        ASSETS_FORM.reset();
        currentBase64 = "";
        IMG_PREVIEW.src = "";
        IMG_PREVIEW.style.display = 'none';

        const MODAL_EL = document.getElementById('addAssetModal');
        const MODAL = bootstrap.Modal.getOrCreateInstance(MODAL_EL);
        MODAL.hide();
    });

    LOAD_ASSETS();
});

const GET_CURRENT_PRICES = (goldPricePerOz) => {
    const gram24 = goldPricePerOz / 31.1035;

    return {
        "Ounce": goldPricePerOz, // ✅ مهم
        "24K": gram24,
        "22K": gram24 * (22 / 24),
        "21K": gram24 * (21 / 24),
        "18K": gram24 * (18 / 24),
        "EnglishLira": gram24 * 0.9167 * 8,
        "RashadiLira": gram24 * 0.9167 * 7.2,
    };
};

const GET_ASSET_PRICE_KEY = (type, karat) => {
    if (type === "EnglishLira") return "EnglishLira";
    if (type === "RashadiLira") return "RashadiLira";
    if (type === "Bar") return "Ounce"; // ✅ الحل
    return karat;
};

const BUILD_PNL = (currentVal, purchasePrice) => {
    const diff = currentVal - parseFloat(purchasePrice);
    const diffPercent = (diff / parseFloat(purchasePrice)) * 100;

    if (diff >= 0) {
        return {
            html: `+$${diff.toFixed(2)} (${diffPercent.toFixed(2)}%)`,
            cls: "profit-bg",
        };
    } else {
        return {
            html: `-$${Math.abs(diff).toFixed(2)} (${Math.abs(diffPercent).toFixed(2)}%)`,
            cls: "loss-bg",
        };
    }
};

const DISPLAY_CARD = (asset) => {
    const ASSETS_CARDS = document.getElementById('rowCard');
    if (!ASSETS_CARDS) return;

    const currentPrice = window.currentGoldPrice;
    let pnlHTML = "Calculating...";
    let pnlClass = "";

    if (currentPrice) {
        const prices = GET_CURRENT_PRICES(currentPrice);

        const key = GET_ASSET_PRICE_KEY(asset.type, asset.karat);
        const unitPrice = prices[key] ?? prices["24K"];

        let currentVal;

        if (asset.type === "Bar" || asset.type === "EnglishLira" || asset.type === "RashadiLira") {
            currentVal = unitPrice;
        } else {
            currentVal = unitPrice * (asset.gram || 1);
        }

        const pnl = BUILD_PNL(currentVal, asset.price);
        pnlHTML = pnl.html;
        pnlClass = pnl.cls;
    }

    const CARD = `
<div class="col-12 col-md-6 col-lg-4 mb-4" id="asset-${asset.id}">
    <div class="asset-card text-center rounded-4 pb-3 position-relative h-100"
         data-type="${asset.type}"
         data-karat="${asset.karat}"
         data-purchase-price="${asset.price}"
         data-gram="${asset.gram}">
         
        <button onclick="deleteAsset(${asset.id})"
            class="btn btn-sm btn-outline-danger position-absolute end-0 top-0 m-2 border-0">
            ✕
        </button>

        <div class="img-placeholder mx-auto mb-3 d-flex align-items-center justify-content-center">
            <img src="${asset.image}" class="img-fluid fit-object-cover" alt="Asset">
        </div>

        <p class="custom-text-white fw-semibold mb-0 fs-5">${asset.name}</p>
        <p class="text-gold small">${asset.type} | ${asset.karat} Fine Gold</p>

        <div class="pnl-box d-flex justify-content-around align-items-center px-2 py-3 w-75 m-auto rounded-3 mb-2">
            <div class="pnl-item text-gold small">
                <span class="d-block mb-2">Bought At</span>
                <strong class="custom-text-white">${asset.date}</strong>
            </div>
            <div class="pnl-item text-gold small">
                <span class="d-block mb-2">Bought Price</span>
                <strong class="custom-text-white">$${parseFloat(asset.price).toLocaleString()}</strong>
            </div>
        </div>

        <div class="pnl-indicator ${pnlClass} w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center"
             id="pnl-${asset.id}">
            ${pnlHTML}
        </div>
    </div>
</div>`;

    ASSETS_CARDS.insertAdjacentHTML('beforeend', CARD);
};
const UPDATE_PNL = () => {
    const currentPrice = window.currentGoldPrice;
    if (!currentPrice) return;

    const prices = GET_CURRENT_PRICES(currentPrice);

    document.querySelectorAll('.asset-card').forEach(card => {
        const wrapper = card.closest('[id^="asset-"]');
        if (!wrapper) return;

        const id = wrapper.id.replace('asset-', '');
        const pPrice = parseFloat(card.dataset.purchasePrice);
        const karat = card.dataset.karat;
        const type = card.dataset.type;
        const pnlIndicator = document.getElementById(`pnl-${id}`);

        const key = GET_ASSET_PRICE_KEY(type, karat);
        const unitPrice = prices[key] ?? prices["24K"];

        let currentVal;

        if (type === "Bar" || type === "EnglishLira" || type === "RashadiLira") {
            currentVal = unitPrice;
        } else {
            const gram = parseFloat(card.dataset.gram) || 1;
            currentVal = unitPrice * gram;
        }

        const pnl = BUILD_PNL(currentVal, pPrice);

        pnlIndicator.className =
            `pnl-indicator ${pnl.cls} w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center`;
        pnlIndicator.innerHTML = pnl.html;
    });
};

// !delete cards
window.deleteAsset = (id) => {
    if (confirm('Are you sure you want to delete this asset?')) {
        let assets = JSON.parse(localStorage.getItem('myAssets')) || [];
        assets = assets.filter(asset => asset.id !== id);
        localStorage.setItem('myAssets', JSON.stringify(assets));

        const element = document.getElementById(`asset-${id}`);
        if (element) element.remove();
    }
};

// TODO:::::::::::::::::::::::::: aside data-live handle ::::::::::::::::::::::::::::::::::::

const FETCH_AND_SAVE = async () => {
    try {
        const REQUEST = await fetch("https://api.gold-api.com/price/XAU");
        const RESPONSE = await REQUEST.json();

        SAVE(RESPONSE.price);
        window.currentGoldPrice = RESPONSE.price;
        DISPLAY();
        UPDATE_PNL();

    } catch (err) {
        console.error("Fetch error: " + err.message);
    }
};

const SAVE = (newPrice) => {
    const currentPrice = localStorage.getItem("gold_price");
    if (currentPrice) localStorage.setItem("gold_prev_price", currentPrice);
    localStorage.setItem("gold_price", newPrice);
    localStorage.setItem("gold_time", Date.now());
};

const _GET = () => {
    const price = localStorage.getItem("gold_price");
    if (!price) return null;
    return {
        price: parseFloat(price),
        prevPrice: localStorage.getItem("gold_prev_price") !== null
            ? parseFloat(localStorage.getItem("gold_prev_price"))
            : parseFloat(price),
        time: parseInt(localStorage.getItem("gold_time")) || 0,
    };
};

const DISPLAY = () => {
    const ASIDE = document.getElementById("aside");
    if (!ASIDE) return;

    const cached = _GET();
    if (!cached) return;

    const curr = cached.price;
    const prev = cached.prevPrice;

    const prices = GET_CURRENT_PRICES(curr);
    const prevPrices = GET_CURRENT_PRICES(prev);

    const items = [
        { name: "Ounce / oz", price: curr, prevPrice: prev },
        { name: "English Lira", price: prices["EnglishLira"], prevPrice: prevPrices["EnglishLira"] },
        { name: "Rashadi Lira", price: prices["RashadiLira"], prevPrice: prevPrices["RashadiLira"] },
        { name: "24K / gram", price: prices["24K"], prevPrice: prevPrices["24K"] },
        { name: "21K / gram", price: prices["21K"], prevPrice: prevPrices["21K"] },
        { name: "18K / gram", price: prices["18K"], prevPrice: prevPrices["18K"] },
    ];

    ASIDE.innerHTML = items.map(item => {
        const diff = GET_DIFF(item.price, item.prevPrice);
        return `
            <div class="border-bottom border-secondary d-flex justify-content-between align-items-center py-3 px-2">
                <span class="fw-bold ms-3">${item.name}</span>
                <div class="text-end me-3">
                    <div class="price">${item.price.toFixed(2)}$</div>
                    <small class="${diff.color}">${diff.arrow} ${diff.DIFF}%</small>
                </div>
            </div>`;
    }).join("");
};

const GET_DIFF = (current, previous) => {
    if (!previous || previous === 0) return { DIFF: "0.00", color: "text-secondary", arrow: "▬" };
    const DIFF = ((current - previous) / previous) * 100;
    return {
        DIFF: Math.abs(DIFF).toFixed(2),
        color: DIFF > 0 ? "text-success" : DIFF < 0 ? "text-danger" : "text-secondary",
        arrow: DIFF > 0 ? "▲" : DIFF < 0 ? "▼" : "▬",
    };
};

const START = () => {
    const cached = _GET();
    if (cached) {
        window.currentGoldPrice = cached.price;
        DISPLAY();
        UPDATE_PNL();
    }

    const checkAndFetch = () => {
        const c = _GET();
        const isStale = !c || (Date.now() - c.time > 6 * 60 * 1000);
        if (isStale && document.visibilityState === 'visible') {
            FETCH_AND_SAVE();
        }
    };

    checkAndFetch();
    setInterval(checkAndFetch, 60000);
};

START();


// TODO:::::::::::::::::::::::::: Search & Filter ::::::::::::::::::::::::::::::::::::

const FILTER_ASSETS = () => {
    const SEARCH_VAL = document.getElementById('search-input')?.value.toLowerCase().trim() || "";
    const TYPE_SELECT_VAL = document.getElementById('types')?.value || "";
    const KARAT_VAL = document.getElementById('karat')?.value || "";

    const ALL_CARDS = document.querySelectorAll('#rowCard > [id^="asset-"]');
    let visibleCount = 0;

    ALL_CARDS.forEach(wrapper => {
        const CARD = wrapper.querySelector('.asset-card');
        if (!CARD) return;

        const name = wrapper.querySelector('.fw-semibold')?.textContent.toLowerCase() || "";
        const type = CARD.dataset.type || "";
        const karat = CARD.dataset.karat || "";

        const matchSearch = !SEARCH_VAL || name.includes(SEARCH_VAL);
        const matchType = !TYPE_SELECT_VAL || TYPE_SELECT_VAL === "All Types" || type === TYPE_SELECT_VAL;
        const matchKarat = !KARAT_VAL || KARAT_VAL === "All Karats" || karat === KARAT_VAL;

        if (matchSearch && matchType && matchKarat) {
            wrapper.style.display = "";
            visibleCount++;
        } else {
            wrapper.style.display = "none";
        }
    });


    let emptyMsg = document.getElementById('no-results');
    if (visibleCount === 0) {
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.id = 'no-results';
            emptyMsg.className = 'text-center text-secondary w-100 py-5';
            emptyMsg.innerHTML = `<i class="fa-solid fa-box-open fs-1 mb-3 d-block"></i> No assets match your search.`;
            document.getElementById('rowCard').appendChild(emptyMsg);
        }
        emptyMsg.style.display = "";
    } else if (emptyMsg) {
        emptyMsg.style.display = "none";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const SEARCH_INPUT = document.getElementById('search-input');
    const TYPE_SELECT = document.getElementById('types');
    const KARAT_SELECT = document.getElementById('karat');

    if (SEARCH_INPUT) SEARCH_INPUT.addEventListener('input', FILTER_ASSETS);
    if (TYPE_SELECT) TYPE_SELECT.addEventListener('change', FILTER_ASSETS);
    if (KARAT_SELECT) KARAT_SELECT.addEventListener('change', FILTER_ASSETS);
});












// // TODO:::::::::::::::::::::::::: assets card data handle ::::::::::::::::::::::::::::::::::::
// document.addEventListener('DOMContentLoaded', () => {
//     const ASSETS_FORM = document.getElementById('addAssetForm');
//     const ASSETS_CARDS = document.getElementById('rowCard');
//     const IMG_INPUT = document.getElementById('asset-img');
//     const IMG_PREVIEW = document.getElementById('img-preview');


//     const LOAD_ASSETS = () => {
//         const ASSETS = JSON.parse(localStorage.getItem('myAssets')) || [];
//         ASSETS.forEach(asset => DISPLAY_CARD(asset));
//     };

//     let currentBase64 = "";
//     IMG_INPUT.addEventListener('change', () => {
//         const FILE = IMG_INPUT.files[0]; if (FILE) {
//             const RENDER = new FileReader();
//             RENDER.onload = (e) => {
//                 currentBase64 = e.target.result;
//                 IMG_PREVIEW.src = currentBase64;
//                 IMG_PREVIEW.style.display = 'block';
//             };
//             RENDER.readAsDataURL(FILE);
//         }
//     });

//     ASSETS_FORM.addEventListener('submit', (e) => {
//         e.preventDefault();

//         const NEW_ASSETS = {
//             id: Date.now(),
//             name: document.getElementById('assetName').value,
//             type: document.getElementById('assetType').value,
//             karat: document.getElementById('assetKarat').value,
//             date: document.getElementById('purchaseDate').value,
//             price: document.getElementById('purchasePrice').value,
//             image: currentBase64,
//         };

//         const ASSETS = JSON.parse(localStorage.getItem('myAssets')) || [];
//         ASSETS.push(NEW_ASSETS);
//         localStorage.setItem('myAssets', JSON.stringify(ASSETS));

//         DISPLAY_CARD(NEW_ASSETS);
//         ASSETS_FORM.reset();
//         IMG_PREVIEW.src = "";

//         const MODAL_EL = document.getElementById('addAssetModal');
//         const MODAL = bootstrap.Modal.getInstance(MODAL_EL);
//         MODAL.hide();
//     });

//     const DISPLAY_CARD = (asset) => {
//         const currentPrice = window.currentGoldPrice;
//         let pnlHTML = "Calculating...";
//         let pnlClass = "";

//         if (currentPrice) {
//             const prices = {
//                 "24K": currentPrice / 31.1035,
//                 "21K": (currentPrice / 31.1035) * (21 / 24),
//                 "18K": (currentPrice / 31.1035) * (18 / 24),
//             };
//             const currentVal = prices[asset.karat] || prices["24K"];
//             const diff = currentVal - parseFloat(asset.price);
//             const diffPercent = (diff / parseFloat(asset.price)) * 100;

//             if (diff >= 0) {
//                 pnlClass = "profit-bg";
//                 pnlHTML = `+$${diff.toFixed(2)} (${diffPercent.toFixed(2)}%)`;
//             } else {
//                 pnlClass = "loss-bg";
//                 pnlHTML = `-$${Math.abs(diff).toFixed(2)} (${diffPercent.toFixed(2)}%)`;
//             }
//         }

//         const CARD = `
//     <div class="col-12 col-md-6 col-lg-4 mb-4" id="asset-${asset.id}">
//         <div class="asset-card text-center rounded-4 pb-3 position-relative" data-type="${asset.type}" data-karat="${asset.karat}" data-purchase-price="${asset.price}">
//             <button onclick="deleteAsset(${asset.id})" class="btn btn-sm btn-outline-danger position-absolute end-0 top-0 m-2 border-0" style="z-index: 10;">
//                 <i class="bi bi-trash"></i> ✕
//             </button>
//             <div class="img-placeholder mx-auto mb-3 d-flex align-items-center justify-content-center">
//                 <img src="${asset.image}" class="img-fluid fit-object-cover" alt="Asset">
//             </div>
//             <p class="custom-text-white fw-semibold mb-0 fs-5">${asset.name}</p>
//             <p class="text-gold small">${asset.type} | ${asset.karat} Fine Gold</p>
//             <div class="pnl-box d-flex justify-content-around align-items-center px-2 py-3 w-75 m-auto rounded-3 mb-2">
//                 <div class="pnl-item text-gold small">
//                     <span class="d-block mb-2">Bought At</span>
//                     <strong class="custom-text-white">${asset.date}</strong>
//                 </div>
//                 <div class="pnl-item text-gold small">
//                     <span class="d-block mb-2">Price</span>
//                     <strong class="custom-text-white">$${parseFloat(asset.price).toLocaleString()}</strong>
//                 </div>
//             </div>
//             <div class="pnl-indicator ${pnlClass} w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center" id="pnl-${asset.id}">
//                 ${pnlHTML}
//             </div>
//         </div>
//     </div>
// `;
//         ASSETS_CARDS.insertAdjacentHTML('beforeend', CARD);
//         if (window.currentGoldPrice) UPDATE_PNL();
//     };
//     LOAD_ASSETS();

// });

// // !calculate loss/profit!!!!!!!!!!!!!!!

// const UPDATE_PNL = () => {
//     const currentPrice = window.currentGoldPrice;
//     if (!currentPrice) return;

//     const prices = {
//         "24K": currentPrice / 31.1035,
//         "22K": (currentPrice / 31.1035) * (22 / 24),
//         "21K": (currentPrice / 31.1035) * (21 / 24),
//         "18K": (currentPrice / 31.1035) * (18 / 24)
//     };

//     document.querySelectorAll('.asset-card').forEach(card => {
//         const id = card.closest('[id^="asset-"]')?.id.replace('asset-', '');
//         const pPrice = parseFloat(card.dataset.purchasePrice);
//         const karat = card.dataset.karat;
//         const pnlIndicator = document.getElementById(`pnl-${id}`);

//         if (pnlIndicator) {
//             const currentVal = prices[karat] || prices["24K"];
//             const diff = currentVal - pPrice;
//             const diffPercent = (diff / pPrice) * 100;

//             if (diff >= 0) {
//                 pnlIndicator.className = "pnl-indicator profit-bg w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center";
//                 pnlIndicator.innerHTML = `+$${diff.toFixed(2)} (${diffPercent.toFixed(2)}%)`;
//             } else {
//                 pnlIndicator.className = "pnl-indicator loss-bg w-75 m-auto p-2 rounded d-flex align-items-center justify-content-center";
//                 pnlIndicator.innerHTML = `-$${Math.abs(diff).toFixed(2)} (${diffPercent.toFixed(2)}%)`;
//             }
//         }
//     });
// };
// // !delete card!!!!!!!!!!!!!!!!
// window.deleteAsset = (id) => {
//     if (confirm('Are you sure you want to delete this asset?')) {
//         let assets = JSON.parse(localStorage.getItem('myAssets')) || [];

//         assets = assets.filter(asset => asset.id !== id);

//         localStorage.setItem('myAssets', JSON.stringify(assets));

//         const element = document.getElementById(`asset-${id}`);
//         if (element) {
//             element.remove();
//         }
//     }
// };

// // TODO:::::::::::::::::::::::::: aside data-live handle ::::::::::::::::::::::::::::::::::::
// // localStorage.clear();

// // ????????????????????fetch????????????????????????

// const FETCH_AND_SAVE = async () => {
//     try {
//         const REQUEST = await fetch("https://api.gold-api.com/price/XAU");
//         const RESPONSE = await REQUEST.json();

//         SAVE(RESPONSE.price);
//         window.currentGoldPrice = RESPONSE.price;
//         DISPLAY();
//         UPDATE_PNL();

//     } catch (err) {
//         alert("Fetch error: " + err.message);
//     }
// };

// // ????????????????????save in local????????????????????????

// const SAVE = (newPrice) => {
//     const currentPrice = localStorage.getItem("gold_price");
//     if (currentPrice) localStorage.setItem("gold_prev_price", currentPrice);

//     localStorage.setItem("gold_price", newPrice);
//     localStorage.setItem("gold_time", Date.now());
// };

// const _GET = () => {
//     const price = localStorage.getItem("gold_price");
//     if (!price) return null;
//     return {
//         price: parseFloat(price),
//         prevPrice: localStorage.getItem("gold_prev_price") !== null
//             ? parseFloat(localStorage.getItem("gold_prev_price"))
//             : parseFloat(price),
//         time: parseInt(localStorage.getItem("gold_time")) || 0,
//     };
// };

// // ?????????????/display??????????????

// const DISPLAY = () => {
//     const cached = _GET();
//     if (!cached) return;

//     const curr = cached.price;
//     const prev = cached.prevPrice;

//     const ASIDE = document.getElementById("aside");

//     //????calculation curr price/gram ??????????

//     const GRAM24 = curr / 31.1035;
//     const GRAM21 = GRAM24 * 0.875;
//     const GRAM18 = GRAM24 * 0.75;
//     const LIRA_ENGLISH = GRAM24 * 0.9167 * 8;
//     const LIRA_RASHADI = GRAM24 * 0.9167 * 7.2;

//     //????calculation prev price/gram ??????????

//     const PREV_GRAM24 = prev / 31.1035;
//     const PREV_GRAM21 = PREV_GRAM24 * 0.875;
//     const PREV_GRAM18 = PREV_GRAM24 * 0.75;
//     const PREV_LIRA_ENGLISH = PREV_GRAM24 * 0.9167 * 8;
//     const PREV_LIRA_RASHADI = PREV_GRAM24 * 0.9167 * 7.2;

//     const items = [
//         { name: "Ounce / oz", price: curr, prevPrice: prev },
//         { name: "English Lira", price: LIRA_ENGLISH, prevPrice: PREV_LIRA_ENGLISH },
//         { name: "Rashadi Lira", price: LIRA_RASHADI, prevPrice: PREV_LIRA_RASHADI },
//         { name: "24K", price: GRAM24, prevPrice: PREV_GRAM24 },
//         { name: "21K", price: GRAM21, prevPrice: PREV_GRAM21 },
//         { name: "18K", price: GRAM18, prevPrice: PREV_GRAM18 },
//     ];

//     ASIDE.innerHTML = items.map(item => {
//         const diff = GET_DIFF(item.price, item.prevPrice);
//         return `

//             <div class="border-bottom border-secondary d-flex justify-content-between align-items-center py-3 px-2">
//                 <span class="fw-bold ms-3">${item.name}</span>
//                 <div class="text-end me-3">
//                     <div class="price">${item.price.toFixed(2)}$</div>
//                     <small class="${diff.color}">${diff.arrow} ${diff.DIFF}%</small>
//                 </div>
//             </div>
//         `;
//     }).join("");
// };

// // ??????????????????????diff???????????????????????????

// const GET_DIFF = (current, previous) => {
//     const DIFF = ((current - previous) / previous) * 100;
//     return {
//         DIFF: Math.abs(DIFF).toFixed(2),
//         color: DIFF > 0 ? "text-success" : DIFF < 0 ? "text-danger" : "text-secondary",
//         arrow: DIFF > 0 ? "▲" : DIFF < 0 ? "▼" : "▬",
//     };
// };

// // ???????????????????satrat?????????????????

// const START = () => {

//     DISPLAY();
//     const checkAndFetch = () => {
//         const cached = _GET();
//         const isStale = !cached || (Date.now() - cached.time > 6 * 60 * 1000);

//         if (isStale && document.visibilityState === 'visible') {
//             FETCH_AND_SAVE();
//         }
//     };

//     checkAndFetch();
//     setInterval(checkAndFetch, 60000);
// }

// START();