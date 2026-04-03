// ???????????flip card??????????????/
const FLIP_CARD = () => {
    const card = document.getElementById('card');
    card.classList.toggle('flipped');

    if (card.classList.contains('flipped')) {
        card.style.minHeight = "48rem";
    } else {
        card.style.minHeight = "37.5rem";
    }
};
// TODO:::::::::::::::::::::::::::::::::::: Regster:::::::::::::::::::::::::::::::::::::::::
document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    // ????????values?????????????
    const FULL_NAME = document.getElementById("fullName").value.trim();
    const REG_EMAIL = document.getElementById("regEmail").value.trim();
    const REG_PASS = document.getElementById("regPass").value.trim();
    const CONFIRM_PASS = document.getElementById("confirmPass").value.trim();

    // ???????error????????????
    const FULL_NAME_ERROR = document.getElementById("fullName-error");
    const REG_EMAIL_ERROR = document.getElementById("regEmail-error");
    const REG_PASS_ERROR = document.getElementById("regPass-error");
    const CONFIRM_PASS_ERROR = document.getElementById("confirmPass-error");

    // ??????????reset error???????
    FULL_NAME_ERROR.textContent = "";
    REG_EMAIL_ERROR.textContent = "";
    REG_PASS_ERROR.textContent = "";
    CONFIRM_PASS_ERROR.textContent = "";

    // ?????????????validation?????????????????????
    let flag = true;
    // !!!!!!!!!!!!!name!!!!!!!!!!!!!!
    const VALIDATION_NAME = (name, msg) => {
        let nameError = [];
        if (!name) {
            msg.textContent = "Required field";
            flag = false;
            return "";
        }

        if (!/^[A-Za-z\s]+$/.test(name)) {
            nameError.push("Only letters allowed");
            flag = false;
        }

        if (name.length < 4) {
            nameError.push("Must be at least 4 character");
            flag = false;
        }

        if (nameError.length > 0) {
            msg.innerHTML = nameError.join("<br>");
            flag = false;
        }
        return name;
    }

    // !!!!!!!!!!!!!!!email!!!!!!!!!!!!!!!!!!
    const VALIDATION_EMAIL = (email, msg) => {
        const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            msg.textContent = "Required field";
            flag = false;
        } else if (!EMAIL_PATTERN.test(email)) {
            msg.textContent = "Email not valid";
            flag = false;
        }
        return email;
    }

    // !!!!!!!!!!!!!!!!!!Pass!!!!!!!!!!!!!!!
    const VALIDATION_PASS = (pass, msg) => {
        let passError = [];
        if (!pass) {
            msg.textContent = "Required field";
            flag = false;
            return "";
        }

        if (pass.length < 8 || pass.length > 16)
            passError.push("Password must be 8-16 characters");

        if (!/[A-Z]/.test(pass)) passError.push("One uppercase letter");

        if (!/\d/.test(pass)) passError.push("One number");

        if (passError.length > 0) {
            msg.innerHTML = passError.join("<br>");
            flag = false;
        }
        return pass;
    }

    // !!!!!!!!!!!!!!!1confirm pass!!!!!!!!!!!!!!!!!
    const VALIDATION_CONFIRM_PASS = (Cpass, msg, pass) => {
        if (!Cpass) {
            msg.textContent = "Required field";
            flag = false;
        } else if (Cpass !== pass) {
            msg.textContent = "Passwords do not match";
            flag = false;
        }
        return Cpass;
    }
    // !!!!!!!!!!!!!!call Validation!!!!!!!!!!!!!!!1
    VALIDATION_NAME(FULL_NAME, FULL_NAME_ERROR);
    VALIDATION_EMAIL(REG_EMAIL, REG_EMAIL_ERROR);
    VALIDATION_PASS(REG_PASS, REG_PASS_ERROR);
    VALIDATION_CONFIRM_PASS(CONFIRM_PASS, CONFIRM_PASS_ERROR, REG_PASS);


    // ?????????????????? store Data????????????/
    if (!flag) return;
    else {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const EXISTS = users.some(user => user.email === REG_EMAIL);
        if (EXISTS) {
            REG_EMAIL_ERROR.textContent = "Email already exists";
            return;
        }

        const NEW_USER = {
            name: FULL_NAME,
            email: REG_EMAIL,
            password: REG_PASS
        };

        users.push(NEW_USER);
        localStorage.setItem("users", JSON.stringify(users));
        alert("Registered successfully");
        e.target.reset();
    }
})


// TODO:::::::::::::: Login ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById("logForm").addEventListener("submit", (e) => {
    e.preventDefault();

    // ???????? value?????????????
    const LOG_EMAIL = document.getElementById("logEmail").value.trim();
    const LOG_PASS = document.getElementById("logPass").value.trim();

    // ?????????error????????????
    const LOG_EMAIL_ERROR = document.getElementById("logEmail-error");
    const LOG_PASS_ERROR = document.getElementById("logPass-error");

    // ??????????????reset error??????????/
    LOG_EMAIL_ERROR.textContent = "";
    LOG_PASS_ERROR.textContent = "";


    let isActive = true;

    // !!!!!!!!!!!!!!!email!!!!!!!!!!!!!!!!!!
    const CHECK_EMAIL = (email, msg) => {
        const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            msg.textContent = "Required field";
            isActive = false;
            return;
        }

        if (!EMAIL_PATTERN.test(email)) {
            msg.textContent = "Email not valid";
            isActive = false;
        }

        return email;
    };

    // !!!!!!!!!!!!!!!!!!Pass!!!!!!!!!!!!!!!
    const CHECK_PASS = (pass, msg) => {
        if (!pass) {
            msg.textContent = "Required field";
            isActive = false;
            return;
        }

        return pass;
    };

    // !!!!!!!!!!!!!!call Validation!!!!!!!!!!!!!!!
    CHECK_EMAIL(LOG_EMAIL, LOG_EMAIL_ERROR);
    CHECK_PASS(LOG_PASS, LOG_PASS_ERROR);

    if (!isActive) return;

    // ?????????????? auth??????????????????
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const FOUND_USER = users.find(user => user.email === LOG_EMAIL);

    if (!FOUND_USER) {
        LOG_EMAIL_ERROR.textContent = "Email not found";
        return;
    }

    if (FOUND_USER.password !== LOG_PASS) {
        LOG_PASS_ERROR.textContent = "Incorrect password";
        return;
    }

    sessionStorage.setItem("currentUser", JSON.stringify(FOUND_USER));

    alert(`Welcome back, ${FOUND_USER.name}!`);

    e.target.reset();
    window.location.href = "assets.html";
});