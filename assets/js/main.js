// TODO::::::::::::::::::::::::::::: handle localstorge::::::::::::::::::::::::::::::::::::::::::::::::
// !!!!!!!!!!!!fetch data!!!!!!!!!!!!!!!!
let priceData = [];
// localStorage.clear();

const GOLD_PRICE_DATA = async () => {
    try {
        const REQUEST = await fetch(`https://api.gold-api.com/price/XAU`);
        const RESPONSE = await REQUEST.json();
        return RESPONSE;
    } catch (error) {
        alert(error);
    }
}

// !!!!!!!!!!!!!!!!!!!!! store in localstorge!!!!!!!!!!!!!!!!!!!!!!
const STORGE = async () => {
    const PRICE = await GOLD_PRICE_DATA();

    const DATA = {
        price: PRICE,
        time: Date.now()
    };

    localStorage.setItem("price", JSON.stringify(DATA));
    priceData = PRICE.price;

    
console.log(priceData);
console.log(DATA);
}

// !!!!!!!!!!!!!!!!!!!!!check localstorge!!!!!!!!!!!!!!!!
const CHECK = async () => {
    let data = JSON.parse(localStorage.getItem("price"));

    if (data && (Date.now() - data.time < 6 * 60 * 1000)) {
        priceData = data.price;
    } else {
        await STORGE();
    }
}

// !!!!!!!!!!!!!!!! auto fetch (6 min)!!!!!!!!!!!
const START_FETCH = () => {
    CHECK();
    setInterval(() => {
        CHECK();
    }, 6 * 60 * 1000);
}

START_FETCH();





