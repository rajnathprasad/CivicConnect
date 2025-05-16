function validateSignupForm() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorElement = document.getElementById('signupError');
  
    if (password !== confirmPassword) {
      errorElement.textContent = "Passwords do not match.";
      return false;
    }
  
    errorElement.textContent = "";
    return true;
  }
  