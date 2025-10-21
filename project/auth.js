// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const googleSignup = document.getElementById('googleSignup');
    const googleLogin = document.getElementById('googleLogin');

    // Sign Up Form Handler
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const fullName = formData.get('fullName').trim();
            const email = formData.get('email').trim();
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            let isValid = true;

            // Clear previous errors
            ['fullName', 'email', 'password', 'confirmPassword'].forEach(field => {
                window.DevLearnUtils.clearError(field);
            });

            // Validate full name
            if (!fullName || fullName.length < 2) {
                window.DevLearnUtils.showError('fullName', 'Please enter a valid full name (at least 2 characters)');
                isValid = false;
            }

            // Validate email
            if (!email || !window.DevLearnUtils.isValidEmail(email)) {
                window.DevLearnUtils.showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                // Check if email already exists
                const existingUsers = JSON.parse(localStorage.getItem('devlearn_users') || '[]');
                if (existingUsers.find(user => user.email === email)) {
                    window.DevLearnUtils.showError('email', 'An account with this email already exists');
                    isValid = false;
                }
            }

            // Validate password
            if (!password || !window.DevLearnUtils.isValidPassword(password)) {
                window.DevLearnUtils.showError('password', 'Password must be at least 6 characters long');
                isValid = false;
            }

            // Validate confirm password
            if (password !== confirmPassword) {
                window.DevLearnUtils.showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            }

            if (isValid) {
                // Store user data
                const users = JSON.parse(localStorage.getItem('devlearn_users') || '[]');
                const newUser = {
                    id: Date.now().toString(),
                    fullName: fullName,
                    email: email,
                    password: password,
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                localStorage.setItem('devlearn_users', JSON.stringify(users));

                // Show success modal
                window.DevLearnUtils.showModal('successModal');

                // Reset form
                this.reset();
            }
        });

        // Real-time validation
        ['fullName', 'email', 'password', 'confirmPassword'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', function() {
                    validateField(fieldId, this.value);
                });

                field.addEventListener('input', function() {
                    window.DevLearnUtils.clearError(fieldId);
                });
            }
        });
    }

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email').trim();
            const password = formData.get('password');
            
            let isValid = true;

            // Clear previous errors
            ['loginEmail', 'loginPassword'].forEach(field => {
                window.DevLearnUtils.clearError(field);
            });

            // Validate email
            if (!email || !window.DevLearnUtils.isValidEmail(email)) {
                window.DevLearnUtils.showError('loginEmail', 'Please enter a valid email address');
                isValid = false;
            }

            // Validate password
            if (!password) {
                window.DevLearnUtils.showError('loginPassword', 'Please enter your password');
                isValid = false;
            }

            if (isValid) {
                // Check credentials
                const users = JSON.parse(localStorage.getItem('devlearn_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    // Store session
                    sessionStorage.setItem('devlearn_current_user', JSON.stringify({
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        loginTime: new Date().toISOString()
                    }));

                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    window.DevLearnUtils.showError('loginEmail', 'Invalid email or password');
                    window.DevLearnUtils.showError('loginPassword', 'Invalid email or password');
                }
            }
        });

        // Real-time validation for login
        ['loginEmail', 'loginPassword'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', function() {
                    window.DevLearnUtils.clearError(fieldId);
                });
            }
        });
    }

    // Google Auth Simulation
    if (googleSignup) {
        googleSignup.addEventListener('click', function() {
            // Simulate Google OAuth
            setTimeout(() => {
                const mockGoogleUser = {
                    id: 'google_' + Date.now().toString(),
                    fullName: 'Google User',
                    email: 'user@gmail.com',
                    password: 'google_auth_' + Date.now(),
                    createdAt: new Date().toISOString(),
                    authProvider: 'google'
                };

                // Store user
                const users = JSON.parse(localStorage.getItem('devlearn_users') || '[]');
                users.push(mockGoogleUser);
                localStorage.setItem('devlearn_users', JSON.stringify(users));

                // Store session
                sessionStorage.setItem('devlearn_current_user', JSON.stringify({
                    id: mockGoogleUser.id,
                    fullName: mockGoogleUser.fullName,
                    email: mockGoogleUser.email,
                    loginTime: new Date().toISOString()
                }));

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }, 1500);

            // Show loading state
            this.innerHTML = '<span class="google-icon">⏳</span> Connecting...';
            this.disabled = true;
        });
    }

    if (googleLogin) {
        googleLogin.addEventListener('click', function() {
            // Simulate Google OAuth
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('devlearn_users') || '[]');
                const googleUser = users.find(u => u.authProvider === 'google');

                if (googleUser) {
                    // Store session
                    sessionStorage.setItem('devlearn_current_user', JSON.stringify({
                        id: googleUser.id,
                        fullName: googleUser.fullName,
                        email: googleUser.email,
                        loginTime: new Date().toISOString()
                    }));

                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    alert('No Google account found. Please sign up first.');
                }
            }, 1500);

            // Show loading state
            this.innerHTML = '<span class="google-icon">⏳</span> Connecting...';
            this.disabled = true;
        });
    }

    // Modal close handlers
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            window.DevLearnUtils.hideModal('successModal');
        });
    }

    // Close modal when clicking outside
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                window.DevLearnUtils.hideModal('successModal');
            }
        });
    }

    // Individual field validation
    function validateField(fieldId, value) {
        switch(fieldId) {
            case 'fullName':
                if (!value || value.length < 2) {
                    window.DevLearnUtils.showError(fieldId, 'Please enter a valid full name (at least 2 characters)');
                    return false;
                }
                break;
            
            case 'email':
                if (!value || !window.DevLearnUtils.isValidEmail(value)) {
                    window.DevLearnUtils.showError(fieldId, 'Please enter a valid email address');
                    return false;
                }
                break;
            
            case 'password':
                if (!value || !window.DevLearnUtils.isValidPassword(value)) {
                    window.DevLearnUtils.showError(fieldId, 'Password must be at least 6 characters long');
                    return false;
                }
                break;
            
            case 'confirmPassword':
                const password = document.getElementById('password').value;
                if (value !== password) {
                    window.DevLearnUtils.showError(fieldId, 'Passwords do not match');
                    return false;
                }
                break;
        }
        
        window.DevLearnUtils.clearError(fieldId);
        return true;
    }

    // Check if user is already logged in and redirect
    const currentUser = JSON.parse(sessionStorage.getItem('devlearn_current_user') || 'null');
    if (currentUser && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
        window.location.href = 'dashboard.html';
    }
});