function toggleAuth() {
            document.getElementById('authBox').classList.toggle('flipped');
        }

document.querySelector('.register-side form').addEventListener('submit', function(e) {
    const pass = this.querySelectorAll('input[type="password"]')[0];
    const confirmPass = this.querySelectorAll('input[type="password"]')[1];
    let isValid = true;

    if (pass.value.length < 8) {
        pass.classList.add('is-invalid');
        isValid = false;
    } else {
        pass.classList.remove('is-invalid');
        pass.classList.add('is-valid');
    }

    if (pass.value !== confirmPass.value || confirmPass.value === "") {
        confirmPass.classList.add('is-invalid');
        isValid = false;
    } else {
        confirmPass.classList.remove('is-invalid');
        confirmPass.classList.add('is-valid');
    }

    if (!isValid) {
        e.preventDefault(); 
        alert("Please check your password fields!");
    } else {
        alert("Registration Successful! Welcome to LUSTER.");
    }
});        
