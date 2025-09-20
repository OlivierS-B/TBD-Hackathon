document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const messageDiv = document.getElementById('message');

    // Toggle between login and sign up forms
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        messageDiv.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        messageDiv.textContent = '';
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.msg, 'success');
            } else {
                displayMessage(data.msg || 'Login failed.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            displayMessage('An error occurred. Please try again.', 'error');
        }
    });

    // Handle Sign Up
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.msg, 'success');
            } else {
                displayMessage(data.msg || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            displayMessage('An error occurred. Please try again.', 'error');
        }
    });

    // Helper function to display messages
    function displayMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }
});