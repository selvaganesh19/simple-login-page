document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const messageDiv = document.getElementById('message');

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Validation
            if (!username || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const loginText = document.getElementById('loginText');
            const loginSpinner = document.getElementById('loginSpinner');
            
            if (loginText && loginSpinner) {
                loginText.style.display = 'none';
                loginSpinner.style.display = 'inline-block';
            } else {
                submitBtn.textContent = 'Logging in...';
            }
            submitBtn.disabled = true;
            
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Login response:', data); // Debug log
                showMessage(data.message, data.success ? 'success' : 'error');
                
                if (data.success && data.redirectUrl) {
                    // Wait a bit longer to show the success message
                    setTimeout(() => {
                        console.log('Redirecting to:', data.redirectUrl); // Debug log
                        window.location.href = data.redirectUrl;
                    }, 1500); // Increased from 1000 to 1500ms
                } else {
                    resetLoginButton();
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showMessage('Network error. Please try again.', 'error');
                resetLoginButton();
            });
            
            function resetLoginButton() {
                if (loginText && loginSpinner) {
                    loginText.style.display = 'inline';
                    loginSpinner.style.display = 'none';
                } else {
                    submitBtn.textContent = 'Login';
                }
                submitBtn.disabled = false;
            }
        });
    }

    // Logout button handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage('Logging out...', 'success');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    } else {
                        showMessage('Error logging out', 'error');
                    }
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    showMessage('Network error during logout', 'error');
                });
            }
        });
    }

    // Message display function
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                hideMessage();
            }, 5000);
        }
    }
    
    function hideMessage() {
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }

    // Auto-focus on username field if present
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
});

// Global utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}