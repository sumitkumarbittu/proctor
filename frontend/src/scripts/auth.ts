import { setAuthToken } from './utils';

const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
const errorMessage = document.getElementById('error-message');
const loginButton = document.getElementById('login-btn') as HTMLButtonElement | null;
const loginText = document.getElementById('login-text');
const loginSpinner = document.getElementById('login-spinner');

function setLoading(isLoading: boolean) {
    if (loginButton) loginButton.disabled = isLoading;
    if (loginText) loginText.textContent = isLoading ? 'Signing in...' : 'Sign in';
    loginSpinner?.classList.toggle('hidden', !isLoading);
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        if (errorMessage) errorMessage.textContent = '';
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Invalid credentials.' }));
                throw new Error(error.detail || 'Invalid credentials.');
            }

            const data = await response.json();
            setAuthToken(data.access_token);

            loginSpinner?.classList.add('hidden');
            loginButton?.classList.remove('btn-primary');
            loginButton?.classList.add('btn-success');
            if (loginText) loginText.textContent = 'Signed in';
            window.setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 300);
        } catch (error: any) {
            setLoading(false);
            if (errorMessage) {
                errorMessage.textContent = error.message || 'Unable to sign in right now.';
            }
        }
    });
}
