const passwordInput = document.getElementById('passwordInput');
const togglePassword = document.getElementById('togglePassword');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const feedbackArea = document.getElementById('feedbackArea');
const aesOutput = document.getElementById('aesOutput');
const shaOutput = document.getElementById('shaOutput');

// Encryption Key for Demo (In real app, this would be secure)
const LOCAL_ENCRYPTION_KEY = "demo-secret-key";

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

passwordInput.addEventListener('input', async (e) => {
    const val = e.target.value;
    
    if (val === '') {
        resetUI();
        return;
    }

    // 1. Check Strength (zxcvbn)
    const result = zxcvbn(val);
    updateStrengthMeter(result);

    // 2. AES Encryption (Client-side)
    const encrypted = CryptoJS.AES.encrypt(val, LOCAL_ENCRYPTION_KEY).toString();
    aesOutput.textContent = encrypted;

    // 3. SHA-256 Hashing (Server-side)
    try {
        const response = await fetch('/api/hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: val })
        });
        const data = await response.json();
        shaOutput.textContent = data.hash || 'Error';
    } catch (err) {
        shaOutput.textContent = 'Server Error (Is backend running?)';
    }
});

function updateStrengthMeter(result) {
    const score = result.score; // 0-4
    const width = ((score + 1) / 5) * 100;
    
    let color = '#ef4444'; // Red (0-1)
    let text = 'Weak';
    
    if (score === 2) {
        color = '#eab308'; // Yellow
        text = 'Fair';
    } else if (score === 3) {
        color = '#38bdf8'; // Blue
        text = 'Good';
    } else if (score === 4) {
        color = '#22c55e'; // Green
        text = 'Strong';
    }

    strengthBar.style.width = `${width}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = `${text} (Crack time: ${result.crack_times_display.offline_slow_hashing_1e4_per_second})`;
    
    if (result.feedback.warning || result.feedback.suggestions.length) {
        feedbackArea.innerHTML = `<p style="color: #eab308">⚠️ ${result.feedback.warning}</p>
                                  <p>${result.feedback.suggestions.join('<br>')}</p>`;
    } else {
        feedbackArea.innerHTML = '';
    }
}

function resetUI() {
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Enter a password';
    feedbackArea.innerHTML = '';
    aesOutput.textContent = 'Waiting...';
    shaOutput.textContent = 'Waiting...';
}
