// Lootlabs specific handling
// This file should be loaded when user selects Lootlabs

const LootlabsHandler = {
    init() {
        this.setupUI();
        this.setupEventListeners();
    },

    setupUI() {
        document.body.innerHTML = `
            <div class="container">
                <h1>🎮 Lootlabs</h1>
                <p>Complete the Lootlabs task to continue</p>
                
                <div class="service-info">
                    <h3>Instructions:</h3>
                    <ol>
                        <li>Click the scary button below</li>
                        <li>Complete the Lootlabs task</li>
                        <li>Return here to verify</li>
                    </ol>
                </div>
                
                <div class="timer" id="timer">Please wait 5 seconds...</div>
                
                <button class="scary-btn" id="scaryBtn" onclick="LootlabsHandler.redirectToLink()" disabled>
                    ⚠️ CONTINUE TO LOOTLABS ⚠️
                </button>
                
                <div id="verification" class="hidden">
                    <p>Did you complete the Lootlabs task?</p>
                    <button class="scary-btn" onclick="LootlabsHandler.verify()">
                        ✅ YES, I COMPLETED IT
                    </button>
                </div>
                
                <button class="back-btn" onclick="history.back()">← Back</button>
                
                <div id="loading" class="loading hidden">
                    <div class="spinner"></div>
                    <p>Processing...</p>
                </div>
                
                <div id="error" class="error hidden">
                    <p></p>
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        this.startTimer();
    },

    startTimer() {
        const timerDiv = document.getElementById('timer');
        const scaryBtn = document.getElementById('scaryBtn');
        let timeLeft = 5;
        
        const countdown = setInterval(() => {
            if (timeLeft > 0) {
                timerDiv.textContent = `Please wait ${timeLeft} seconds...`;
                timeLeft--;
            } else {
                clearInterval(countdown);
                timerDiv.textContent = 'Ready to continue!';
                scaryBtn.disabled = false;
                scaryBtn.style.opacity = '1';
            }
        }, 1000);
    },

    redirectToLink() {
        // Replace with your actual Lootlabs link
        const lootlabsUrl = 'https://lootlabs.gg/your-link-here';
        
        // Open in new tab
        window.open(lootlabsUrl, '_blank');
        
        // Show verification section
        document.getElementById('verification').classList.remove('hidden');
        
        // Start verification timer
        this.startVerificationTimer();
    },

    startVerificationTimer() {
        // Add minimum wait time before verification
        const verifyBtn = document.querySelector('#verification button');
        verifyBtn.disabled = true;
        verifyBtn.style.opacity = '0.5';
        
        setTimeout(() => {
            verifyBtn.disabled = false;
            verifyBtn.style.opacity = '1';
        }, 10000); // 10 seconds minimum
    },

    verify() {
        // This would integrate with your main key system
        const loading = document.getElementById('loading');
        loading.classList.remove('hidden');
        
        // Simulate verification process
        setTimeout(() => {
            loading.classList.add('hidden');
            
            // Redirect back to main site with success
            window.location.href = '/success.html?service=lootlabs';
        }, 2000);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    LootlabsHandler.init();
});
