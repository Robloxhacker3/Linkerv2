// Key validation script for local use
// This can be used in your scripts to validate generated keys

class KeyValidator {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.validatedKeys = new Set();
    }

    async validateKey(key) {
        try {
            // Check if key was already validated in this session
            if (this.validatedKeys.has(key)) {
                return {
                    valid: false,
                    error: 'Key already used in this session'
                };
            }

            const response = await fetch(`${this.apiUrl}/api/validate-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key })
            });

            const result = await response.json();

            if (result.valid) {
                // Mark key as used locally
                this.validatedKeys.add(key);
                console.log('✅ Key validated successfully!');
                return result;
            } else {
                console.log('❌ Key validation failed:', result.error);
                return result;
            }

        } catch (error) {
            console.error('Network error during key validation:', error);
            return {
                valid: false,
                error: 'Network error: Unable to validate key'
            };
        }
    }

    // Helper method to prompt user for key
    async promptForKey() {
        return new Promise((resolve) => {
            const key = prompt('Please enter your key:');
            resolve(key);
        });
    }

    // Main validation flow
    async validateUserKey() {
        const key = await this.promptForKey();
        
        if (!key) {
            console.log('❌ No key provided');
            return false;
        }

        const result = await this.validateKey(key);
        
        if (result.valid) {
            console.log('🎉 Access granted!');
            return true;
        } else {
            console.log('🚫 Access denied:', result.error);
            return false;
        }
    }
}

// Usage example:
/*
const validator = new KeyValidator('https://your-api-url.com');

// Method 1: Validate a specific key
validator.validateKey('your-key-here').then(result => {
    if (result.valid) {
        console.log('Key is valid!');
        // Continue with your script
    } else {
        console.log('Invalid key:', result.error);
    }
});

// Method 2: Prompt user for key
validator.validateUserKey().then(isValid => {
    if (isValid) {
        console.log('User has valid key, continuing...');
        // Your main script logic here
    } else {
        console.log('User does not have valid key');
    }
});
*/

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyValidator;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.KeyValidator = KeyValidator;
}
