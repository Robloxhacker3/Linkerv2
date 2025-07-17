// Configuration
const API_BASE_URL = 'https://your-api-url.com'; // Replace with your API URL
const REDIRECT_LINKS = {
    linkvertise: 'https://linkvertise.com/your-link', // Replace with your Linkvertise link
    lootlabs: 'https://lootlabs.gg/your-link' // Replace with your Lootlabs link
};

let currentSession = null;
let currentService = null;

// DOM Elements
const container = document.querySelector('.container');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Utility functions
function showLoading(message = 'Loading...') {
    loadingDiv.querySelector('p').textContent = message;
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showError(message) {
    errorDiv.querySelector('p').textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.innerHTML = `<p>${message}</p>`;
    container.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// API functions
async function createSession(service) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/create-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ service })
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        return await response.json();
    } catch (error) {
        throw new Error('Network error: ' + error.message);
    }
}

async function verifyCompletion(sessionToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify-completion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionToken })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Verification failed');
        }

        return await response.json();
    } catch (error) {
        throw new Error('Network error: ' + error.message);
    }
}

// Service selection
function selectService(service) {
    currentService = service;
    hideError();
    showLoading('Initializing session...');
    
    createSession(service)
        .then(session => {
            currentSession = session;
            hideLoading();
            showServicePage(service);
        })
        .catch(error => {
            hideLoading();
            showError(error.message);
        });
}

// Show service page
function showServicePage(service) {
    const serviceName = service.charAt(0).toUpperCase() + service.slice(1);
    
    container.innerHTML = `
        <h1>🔑 ${serviceName}</h1>
        <p>Complete the ${serviceName} task to get your key</p>
        
        <div class="timer" id="timer">Please wait...</div>
        
        <button class="scary-btn" id="scaryBtn" onclick="redirectToService()" disabled>
            ⚠️ CLICK HERE TO CONTINUE ⚠️
        </button>
        
        <button class="back-btn" onclick="goBack()">← Back</button>
        
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
            <p>Verifying completion...</p>
        </div>
        
        <div id="error" class="error hidden">
            <p></p>
        </div>
    `;

    // Start timer
    startTimer();
}

// Timer function
function startTimer() {
    const timerDiv = document.getElementById('timer');
    const scaryBtn = document.getElementById('scaryBtn');
    let timeLeft = 5; // 5 seconds countdown
    
    const countdown = setInterval(() => {
        if (timeLeft > 0) {
            timerDiv.textContent = `Wait ${timeLeft} seconds...`;
            timeLeft--;
        } else {
            clearInterval(countdown);
            timerDiv.textContent = 'Ready!';
            scaryBtn.disabled = false;
            scaryBtn.style.opacity = '1';
        }
    }, 1000);
}

// Redirect to service
function redirectToService() {
    const link = REDIRECT_LINKS[currentService];
    if (link) {
        // Open in new tab
        window.open(link, '_blank');
        
        // Show verification UI
        showVerificationUI();
    } else {
        showError('Service link not configured');
    }
}

// Show verification UI
function showVerificationUI() {
    container.innerHTML = `
        <h1>🔑 Complete the Task</h1>
        <p>Complete the ${currentService} task in the new tab, then click verify below</p>
        
        <div class="timer" id="verifyTimer">Minimum wait time: 10 seconds</div>
        
        <button class="scary-btn" id="verifyBtn" onclick="verifyTask()" disabled>
            ✅ VERIFY COMPLETION
        </button>
        
        <button class="back-btn" onclick="goBack()">← Start Over</button>
        
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
            <p>Verifying completion...</p>
        </div>
        
        <div id="error" class="error hidden">
            <p></p>
        </div>
    `;

    // Start verification timer
    startVerificationTimer();
}

// Verification timer
function startVerificationTimer() {
    const timerDiv = document.getElementById('verifyTimer');
    const verifyBtn = document.getElementById('verifyBtn');
    let timeLeft = 10; // 10 seconds minimum wait
    
    const countdown = setInterval(() => {
        if (timeLeft > 0) {
            timerDiv.textContent = `Minimum wait time: ${timeLeft} seconds`;
            timeLeft--;
        } else {
            clearInterval(countdown);
            timerDiv.textContent = 'You can now verify!';
            verifyBtn.disabled = false;
            verifyBtn.style.opacity = '1';
        }
    }, 1000);
}

// Verify task completion
function verifyTask() {
    hideError();
    showLoading('Verifying completion...');
    
    verifyCompletion(currentSession.sessionToken)
        .then(result => {
            hideLoading();
            showKeyResult(result.key);
        })
        .catch(error => {
            hideLoading();
            showError(error.message);
        });
}

// Show key result
function showKeyResult(key) {
    container.innerHTML = `
        <h1>🎉 Success!</h1>
        <p>Your key has been generated:</p>
        
        <div class="key-display" id="keyDisplay">${key}</div>
        
        <button class="copy-btn" onclick="copyKey()">📋 Copy Key</button>
        
        <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
            Use this key in your script. Key expires in 24 hours.
        </p>
        
        <button class="back-btn" onclick="goBack()">← Generate Another Key</button>
    `;

    showSuccess('Key generated successfully!');
}

// Copy key to clipboard
function copyKey() {
    const keyDisplay = document.getElementById('keyDisplay');
    const key = keyDisplay.textContent;
    
    navigator.clipboard.writeText(key).then(() => {
        showSuccess('Key copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = key;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Key copied to clipboard!');
    });
}

// Go back to main page
function goBack() {
    location.reload();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    hideLoading();
    hideError();
});
