// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = JSON.parse(sessionStorage.getItem('devlearn_current_user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // DOM elements
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('sectionTitle');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileForm = document.getElementById('profileForm');

    // Initialize user data
    initializeUserData();

    // Sidebar functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Navigation functionality
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Profile form handler
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const newPassword = formData.get('password').trim();
            
            let isValid = true;

            // Validate name
            if (!name || name.length < 2) {
                alert('Please enter a valid full name');
                isValid = false;
            }

            // Validate email
            if (!email || !window.DevLearnUtils.isValidEmail(email)) {
                alert('Please enter a valid email address');
                isValid = false;
            }

            if (isValid) {
                // Update user data
                const users = JSON.parse(localStorage.getItem('devlearn_users') || '[]');
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                
                if (userIndex !== -1) {
                    users[userIndex].fullName = name;
                    users[userIndex].email = email;
                    
                    if (newPassword) {
                        users[userIndex].password = newPassword;
                    }
                    
                    users[userIndex].updatedAt = new Date().toISOString();
                    
                    // Save to localStorage
                    localStorage.setItem('devlearn_users', JSON.stringify(users));
                    
                    // Update session
                    currentUser.fullName = name;
                    currentUser.email = email;
                    sessionStorage.setItem('devlearn_current_user', JSON.stringify(currentUser));
                    
                    // Update UI
                    updateUserDisplay();
                    
                    // Show success modal
                    window.DevLearnUtils.showModal('updateModal');
                }
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('devlearn_current_user');
                window.location.href = 'login.html';
            }
        });
    }

    // Modal handlers
    const updateModalClose = document.getElementById('updateModalClose');
    if (updateModalClose) {
        updateModalClose.addEventListener('click', function() {
            window.DevLearnUtils.hideModal('updateModal');
        });
    }

    // Close modal when clicking outside
    const updateModal = document.getElementById('updateModal');
    if (updateModal) {
        updateModal.addEventListener('click', function(e) {
            if (e.target === this) {
                window.DevLearnUtils.hideModal('updateModal');
            }
        });
    }

    // Auto-hide modal after 3 seconds
    document.addEventListener('modalShown', function(e) {
        if (e.detail.modalId === 'updateModal') {
            setTimeout(() => {
                window.DevLearnUtils.hideModal('updateModal');
            }, 3000);
        }
    });

    // Initialize user interface
    function initializeUserData() {
        updateUserDisplay();
        populateProfileForm();
    }

    // Update user display
    function updateUserDisplay() {
        const userWelcome = document.getElementById('userWelcome');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const displayEmail = document.getElementById('displayEmail');
        const userInitials = document.getElementById('userInitials');

        if (userWelcome) {
            userWelcome.textContent = `Welcome back, ${currentUser.fullName}!`;
        }

        if (profileName) {
            profileName.textContent = currentUser.fullName;
        }

        if (displayEmail) {
            displayEmail.value = maskEmail(currentUser.email);
        }

        if (userInitials) {
            const initials = currentUser.fullName
                .split(' ')
                .map(name => name.charAt(0).toUpperCase())
                .join('')
                .substring(0, 2);
            userInitials.textContent = initials;
        }
    }

    // Populate profile form with current user data
    function populateProfileForm() {
        const editName = document.getElementById('editName');
        const displayEmail = document.getElementById('displayEmail');

        if (editName) {
            editName.value = currentUser.fullName;
        }

        if (displayEmail) {
            displayEmail.value = maskEmail(currentUser.email);
        }
    }

    // Show specific content section
    function showSection(sectionId) {
        // Hide all sections
        contentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update title
        const titles = {
            'profile': 'Profile',
            'courses': 'Courses',
            'ebooks': 'E-Books',
            'videos': 'Videos'
        };

        if (sectionTitle) {
            sectionTitle.textContent = titles[sectionId] || 'Dashboard';
        }

        // Trigger animations for the new section
        const cards = targetSection.querySelectorAll('.course-card, .ebook-card, .video-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-in');
        });
    }

    // Add download functionality for e-books
    const ebookDownloadBtns = document.querySelectorAll('.ebook-card .btn-outline');
    ebookDownloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simulate download
            const ebookTitle = this.closest('.ebook-card').querySelector('h3').textContent;
            
            // Show loading state
            const originalText = this.textContent;
            this.textContent = 'Downloading...';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = 'Downloaded!';
                this.style.backgroundColor = 'var(--success-500)';
                this.style.color = 'white';
                this.style.borderColor = 'var(--success-500)';
                
                // Log download activity
                logUserActivity(`Downloaded e-book: ${ebookTitle}`);
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                    this.style.backgroundColor = '';
                    this.style.color = '';
                    this.style.borderColor = '';
                }, 2000);
            }, 1500);
        });
    });

    // Course interaction
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseTitle = this.querySelector('h3').textContent;
            const coursePrice = this.querySelector('.course-price').textContent;
            
            if (confirm(`Would you like to learn more about ${courseTitle}? (Price: ${coursePrice})`)) {
                logUserActivity(`Showed interest in course: ${courseTitle}`);
                alert('Course information would be displayed here. This is a demo version.');
            }
        });
    });

    // Video interaction
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        const iframe = card.querySelector('iframe');
        if (iframe) {
            iframe.addEventListener('load', function() {
                const videoTitle = card.querySelector('h3').textContent;
                logUserActivity(`Loaded video: ${videoTitle}`);
            });
        }
    });

    // Log user activity
    function logUserActivity(activity) {
        const activities = JSON.parse(localStorage.getItem(`devlearn_activities_${currentUser.id}`) || '[]');
        activities.unshift({
            activity: activity,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(50);
        }
        
        localStorage.setItem(`devlearn_activities_${currentUser.id}`, JSON.stringify(activities));
    }

    // Course upload initialization
    function initializeCourseUpload() {
        const courseUploadForm = document.getElementById('courseUploadForm');
        const resetCourseForm = document.getElementById('resetCourseForm');
        const courseProcessingStatus = document.getElementById('courseProcessingStatus');
        const coursesGrid = document.querySelector('.courses-grid');

        // Course form submission
        if (courseUploadForm) {
            courseUploadForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const courseData = {
                    title: formData.get('courseTitle').trim(),
                    description: formData.get('courseDescription').trim(),
                    level: formData.get('courseLevel'),
                    category: formData.get('courseCategory'),
                    price: formData.get('coursePrice'),
                    icon: formData.get('courseIcon').trim() || getDefaultIcon(formData.get('courseTitle'))
                };
                
                if (validateCourseForm(courseData)) {
                    processCourseCreation(courseData);
                }
            });
        }

        // Reset form button
        if (resetCourseForm) {
            resetCourseForm.addEventListener('click', function() {
                courseUploadForm.reset();
                clearAllCourseErrors();
            });
        }

        // Real-time validation
        const courseFields = ['courseTitle', 'courseDescription', 'courseLevel', 'courseCategory', 'coursePrice'];
        courseFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', function() {
                    validateCourseField(fieldId, this.value);
                });

                field.addEventListener('input', function() {
                    clearCourseError(fieldId);
                });
            }
        });

        function validateCourseForm(courseData) {
            let isValid = true;
            
            // Clear previous errors
            clearAllCourseErrors();

            // Validate title
            if (!courseData.title || courseData.title.length < 3) {
                showCourseError('courseTitle', 'Course title must be at least 3 characters long');
                isValid = false;
            }

            // Validate description
            if (!courseData.description || courseData.description.length < 20) {
                showCourseError('courseDescription', 'Description must be at least 20 characters long');
                isValid = false;
            }

            // Validate level
            if (!courseData.level) {
                showCourseError('courseLevel', 'Please select a course level');
                isValid = false;
            }

            // Validate category
            if (!courseData.category) {
                showCourseError('courseCategory', 'Please select a programming category');
                isValid = false;
            }

            // Validate price
            if (!courseData.price || courseData.price < 0) {
                showCourseError('coursePrice', 'Please enter a valid price');
                isValid = false;
            }

            return isValid;
        }

        function validateCourseField(fieldId, value) {
            switch(fieldId) {
                case 'courseTitle':
                    if (!value || value.length < 3) {
                        showCourseError(fieldId, 'Course title must be at least 3 characters long');
                        return false;
                    }
                    break;
                
                case 'courseDescription':
                    if (!value || value.length < 20) {
                        showCourseError(fieldId, 'Description must be at least 20 characters long');
                        return false;
                    }
                    break;
                
                case 'courseLevel':
                    if (!value) {
                        showCourseError(fieldId, 'Please select a course level');
                        return false;
                    }
                    break;
                
                case 'courseCategory':
                    if (!value) {
                        showCourseError(fieldId, 'Please select a programming category');
                        return false;
                    }
                    break;
                
                case 'coursePrice':
                    if (!value || value < 0) {
                        showCourseError(fieldId, 'Please enter a valid price');
                        return false;
                    }
                    break;
            }
            
            clearCourseError(fieldId);
            return true;
        }

        function processCourseCreation(courseData) {
            courseUploadForm.style.display = 'none';
            courseProcessingStatus.style.display = 'block';
            
            const progressFill = document.getElementById('courseProgressFill');
            const processingText = document.getElementById('courseProcessingText');
            
            let progress = 0;
            const steps = [
                'Setting up course structure...',
                'Generating course materials...',
                'Creating course metadata...',
                'Finalizing course setup...'
            ];
            
            const progressInterval = setInterval(() => {
                progress += 25;
                progressFill.style.width = progress + '%';
                
                const stepIndex = Math.floor(progress / 25) - 1;
                if (stepIndex >= 0 && stepIndex < steps.length) {
                    processingText.textContent = steps[stepIndex];
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        createCourseCard(courseData);
                        resetCourseUploadForm();
                    }, 1000);
                }
            }, 800);
        }

        function createCourseCard(courseData) {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.setAttribute('data-category', courseData.category);
            courseCard.setAttribute('data-name', courseData.title);
            
            courseCard.innerHTML = `
                <div class="course-header">
                    <div class="course-icon">${courseData.icon}</div>
                    <div class="course-price">₦${parseInt(courseData.price).toLocaleString()}</div>
                </div>
                <h3>${courseData.title}</h3>
                <p>${courseData.description}</p>
                <div class="course-meta">
                    <span>📊 ${courseData.level}</span>
                    <span>🏷️ ${courseData.category.split(' ')[0]}</span>
                </div>
            `;
            
            // Add to grid with animation
            coursesGrid.appendChild(courseCard);
            courseCard.style.opacity = '0';
            courseCard.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                courseCard.style.transition = 'all 0.5s ease';
                courseCard.style.opacity = '1';
                courseCard.style.transform = 'translateY(0)';
            }, 100);
            
            // Add click functionality
            courseCard.addEventListener('click', function() {
                const courseTitle = this.querySelector('h3').textContent;
                const coursePrice = this.querySelector('.course-price').textContent;
                
                if (confirm(`Would you like to learn more about ${courseTitle}? (Price: ${coursePrice})`)) {
                    logUserActivity(`Showed interest in course: ${courseTitle}`);
                    alert('Course information would be displayed here. This is a demo version.');
                }
            });
            
            // Log activity
            logUserActivity(`Created new course: ${courseData.title}`);
        }

        function getDefaultIcon(title) {
            const titleLower = title.toLowerCase();
            const iconMap = {
                'javascript': '⚡', 'js': '⚡', 'react': '⚛️', 'vue': '💚', 'angular': '🅰️',
                'python': '🐍', 'django': '🐍', 'flask': '🐍',
                'java': '☕', 'spring': '☕',
                'html': '🌐', 'css': '🎨', 'web': '🌐',
                'mobile': '📱', 'android': '🤖', 'ios': '🍎', 'swift': '🍎',
                'data': '📊', 'machine': '🤖', 'ai': '🤖', 'ml': '🤖',
                'database': '🗄️', 'sql': '🗄️',
                'game': '🎮', 'unity': '🎮',
                'c++': '🔧', 'c#': '🔷', 'rust': '🦀', 'go': '🐹'
            };
            
            for (const [keyword, icon] of Object.entries(iconMap)) {
                if (titleLower.includes(keyword)) {
                    return icon;
                }
            }
            
            return '💻'; // Default icon
        }

        function resetCourseUploadForm() {
            courseUploadForm.style.display = 'flex';
            courseProcessingStatus.style.display = 'none';
            courseUploadForm.reset();
            clearAllCourseErrors();
        }

        function showCourseError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        }

        function clearCourseError(fieldId) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }

        function clearAllCourseErrors() {
            const courseFields = ['courseTitle', 'courseDescription', 'courseLevel', 'courseCategory', 'coursePrice'];
            courseFields.forEach(fieldId => {
                clearCourseError(fieldId);
            });
        }
    }

    // Mobile responsiveness for sidebar
    function handleMobileResponsiveness() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            sidebar.classList.add('collapsed');
            
            // Add mobile toggle functionality
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('mobile-open');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            });
        }
    }

    // Initialize mobile responsiveness
    handleMobileResponsiveness();
    
    // Handle window resize
    window.addEventListener('resize', handleMobileResponsiveness);

    // Initialize with profile section
    showSection('profile');

    // Log login activity
    logUserActivity('Accessed dashboard');

    // Initialize upload forms
    initializeCourseUpload();
    initializeEbookUpload();
    initializeVideoUpload();

    // Password visibility toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                eyeIcon.textContent = '🙈';
            } else {
                targetInput.type = 'password';
                eyeIcon.textContent = '👁️';
            }
        });
    });

    // Helper function to mask email
    function maskEmail(email) {
        const [username, domain] = email.split('@');
        if (username.length <= 3) {
            return `${username.charAt(0)}***@${domain}`;
        }
        const visibleChars = Math.min(3, Math.floor(username.length / 3));
        const maskedPart = '*'.repeat(username.length - visibleChars);
        return `${username.substring(0, visibleChars)}${maskedPart}@${domain}`;
    }

    // Course sorting function
    function sortCourses(sortType) {
        const coursesGrid = document.querySelector('.courses-grid');
        const courseCards = Array.from(coursesGrid.querySelectorAll('.course-card'));
        
        let sortedCards;
        
        if (sortType === 'alphabetical') {
            sortedCards = courseCards.sort((a, b) => {
                const nameA = a.getAttribute('data-name').toLowerCase();
                const nameB = b.getAttribute('data-name').toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (sortType === 'category') {
            // Sort by category first, then by name within category
            sortedCards = courseCards.sort((a, b) => {
                const categoryA = a.getAttribute('data-category');
                const categoryB = b.getAttribute('data-category');
                const nameA = a.getAttribute('data-name').toLowerCase();
                const nameB = b.getAttribute('data-name').toLowerCase();
                
                if (categoryA === categoryB) {
                    return nameA.localeCompare(nameB);
                }
                return categoryA.localeCompare(categoryB);
            });
        }
        
        // Clear the grid and re-append sorted cards
        coursesGrid.innerHTML = '';
        sortedCards.forEach(card => {
            coursesGrid.appendChild(card);
        });
        
        // Re-apply animations
        sortedCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.add('animate-in');
        });
    }
    // E-book upload initialization
    function initializeEbookUpload() {
        const ebookUploadForm = document.getElementById('ebookUploadForm');
        const resetEbookForm = document.getElementById('resetEbookForm');
        const ebookProcessingStatus = document.getElementById('ebookProcessingStatus');
        const ebooksGrid = document.querySelector('.ebooks-grid');

        if (ebookUploadForm) {
            ebookUploadForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(this);
                const ebookData = {
                    title: formData.get('ebookTitle').trim(),
                    description: formData.get('ebookDescription').trim(),
                    category: formData.get('ebookCategory'),
                    icon: formData.get('ebookIcon').trim() || getDefaultEbookIcon(formData.get('ebookTitle')),
                    url: formData.get('ebookUrl').trim()
                };

                if (validateEbookForm(ebookData)) {
                    processEbookCreation(ebookData);
                }
            });
        }

        if (resetEbookForm) {
            resetEbookForm.addEventListener('click', function() {
                ebookUploadForm.reset();
                clearAllEbookErrors();
            });
        }

        const ebookFields = ['ebookTitle', 'ebookDescription', 'ebookCategory', 'ebookUrl'];
        ebookFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', function() {
                    validateEbookField(fieldId, this.value);
                });

                field.addEventListener('input', function() {
                    clearEbookError(fieldId);
                });
            }
        });

        function validateEbookForm(ebookData) {
            let isValid = true;
            clearAllEbookErrors();

            if (!ebookData.title || ebookData.title.length < 3) {
                showEbookError('ebookTitle', 'E-book title must be at least 3 characters long');
                isValid = false;
            }

            if (!ebookData.description || ebookData.description.length < 20) {
                showEbookError('ebookDescription', 'Description must be at least 20 characters long');
                isValid = false;
            }

            if (!ebookData.category) {
                showEbookError('ebookCategory', 'Please select a category');
                isValid = false;
            }

            if (!ebookData.url) {
                showEbookError('ebookUrl', 'Please enter an e-book URL');
                isValid = false;
            }

            return isValid;
        }

        function validateEbookField(fieldId, value) {
            switch(fieldId) {
                case 'ebookTitle':
                    if (!value || value.length < 3) {
                        showEbookError(fieldId, 'E-book title must be at least 3 characters long');
                        return false;
                    }
                    break;

                case 'ebookDescription':
                    if (!value || value.length < 20) {
                        showEbookError(fieldId, 'Description must be at least 20 characters long');
                        return false;
                    }
                    break;

                case 'ebookCategory':
                    if (!value) {
                        showEbookError(fieldId, 'Please select a category');
                        return false;
                    }
                    break;

                case 'ebookUrl':
                    if (!value) {
                        showEbookError(fieldId, 'Please enter an e-book URL');
                        return false;
                    }
                    break;
            }

            clearEbookError(fieldId);
            return true;
        }

        function processEbookCreation(ebookData) {
            ebookUploadForm.style.display = 'none';
            ebookProcessingStatus.style.display = 'block';

            const progressFill = document.getElementById('ebookProgressFill');
            const processingText = document.getElementById('ebookProcessingText');

            let progress = 0;
            const steps = [
                'Processing e-book information...',
                'Creating e-book card...',
                'Finalizing e-book setup...'
            ];

            const progressInterval = setInterval(() => {
                progress += 33.33;
                progressFill.style.width = progress + '%';

                const stepIndex = Math.floor(progress / 33.33) - 1;
                if (stepIndex >= 0 && stepIndex < steps.length) {
                    processingText.textContent = steps[stepIndex];
                }

                if (progress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        createEbookCard(ebookData);
                        resetEbookUploadForm();
                    }, 1000);
                }
            }, 800);
        }

        function createEbookCard(ebookData) {
            const ebookCard = document.createElement('div');
            ebookCard.className = 'ebook-card';

            ebookCard.innerHTML = `
                <div class="ebook-cover">${ebookData.icon}</div>
                <h3>${ebookData.title}</h3>
                <p>${ebookData.description}</p>
                <a href="${ebookData.url}" target="_blank" class="btn btn-outline">Download PDF</a>
            `;

            ebooksGrid.appendChild(ebookCard);
            ebookCard.style.opacity = '0';
            ebookCard.style.transform = 'translateY(20px)';

            setTimeout(() => {
                ebookCard.style.transition = 'all 0.5s ease';
                ebookCard.style.opacity = '1';
                ebookCard.style.transform = 'translateY(0)';
            }, 100);

            logUserActivity(`Added new e-book: ${ebookData.title}`);
        }

        function getDefaultEbookIcon(title) {
            const titleLower = title.toLowerCase();
            const iconMap = {
                'web': '🌐', 'html': '🌐', 'css': '🎨', 'javascript': '⚡', 'js': '⚡',
                'python': '🐍', 'java': '☕', 'react': '⚛️', 'node': '🟢',
                'data': '📊', 'machine': '🤖', 'ai': '🤖',
                'mobile': '📱', 'android': '🤖', 'ios': '🍎'
            };

            for (const [keyword, icon] of Object.entries(iconMap)) {
                if (titleLower.includes(keyword)) {
                    return icon;
                }
            }

            return '📖';
        }

        function resetEbookUploadForm() {
            ebookUploadForm.style.display = 'flex';
            ebookProcessingStatus.style.display = 'none';
            ebookUploadForm.reset();
            clearAllEbookErrors();
        }

        function showEbookError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        }

        function clearEbookError(fieldId) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }

        function clearAllEbookErrors() {
            const ebookFields = ['ebookTitle', 'ebookDescription', 'ebookCategory', 'ebookUrl'];
            ebookFields.forEach(fieldId => {
                clearEbookError(fieldId);
            });
        }
    }

    // Video upload initialization
    function initializeVideoUpload() {
        const videoUploadForm = document.getElementById('videoUploadForm');
        const resetVideoForm = document.getElementById('resetVideoForm');
        const videoProcessingStatus = document.getElementById('videoProcessingStatus');
        const videosGrid = document.querySelector('.videos-grid');

        if (videoUploadForm) {
            videoUploadForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(this);
                const videoData = {
                    title: formData.get('videoTitle').trim(),
                    description: formData.get('videoDescription').trim(),
                    category: formData.get('videoCategory'),
                    duration: formData.get('videoDuration'),
                    url: formData.get('videoUrl').trim()
                };

                if (validateVideoForm(videoData)) {
                    processVideoCreation(videoData);
                }
            });
        }

        if (resetVideoForm) {
            resetVideoForm.addEventListener('click', function() {
                videoUploadForm.reset();
                clearAllVideoErrors();
            });
        }

        const videoFields = ['videoTitle', 'videoDescription', 'videoCategory', 'videoDuration', 'videoUrl'];
        videoFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', function() {
                    validateVideoField(fieldId, this.value);
                });

                field.addEventListener('input', function() {
                    clearVideoError(fieldId);
                });
            }
        });

        function validateVideoForm(videoData) {
            let isValid = true;
            clearAllVideoErrors();

            if (!videoData.title || videoData.title.length < 3) {
                showVideoError('videoTitle', 'Video title must be at least 3 characters long');
                isValid = false;
            }

            if (!videoData.description || videoData.description.length < 20) {
                showVideoError('videoDescription', 'Description must be at least 20 characters long');
                isValid = false;
            }

            if (!videoData.category) {
                showVideoError('videoCategory', 'Please select a category');
                isValid = false;
            }

            if (!videoData.duration || videoData.duration < 1) {
                showVideoError('videoDuration', 'Please enter a valid duration');
                isValid = false;
            }

            if (!videoData.url) {
                showVideoError('videoUrl', 'Please enter a video URL');
                isValid = false;
            }

            return isValid;
        }

        function validateVideoField(fieldId, value) {
            switch(fieldId) {
                case 'videoTitle':
                    if (!value || value.length < 3) {
                        showVideoError(fieldId, 'Video title must be at least 3 characters long');
                        return false;
                    }
                    break;

                case 'videoDescription':
                    if (!value || value.length < 20) {
                        showVideoError(fieldId, 'Description must be at least 20 characters long');
                        return false;
                    }
                    break;

                case 'videoCategory':
                    if (!value) {
                        showVideoError(fieldId, 'Please select a category');
                        return false;
                    }
                    break;

                case 'videoDuration':
                    if (!value || value < 1) {
                        showVideoError(fieldId, 'Please enter a valid duration');
                        return false;
                    }
                    break;

                case 'videoUrl':
                    if (!value) {
                        showVideoError(fieldId, 'Please enter a video URL');
                        return false;
                    }
                    break;
            }

            clearVideoError(fieldId);
            return true;
        }

        function processVideoCreation(videoData) {
            videoUploadForm.style.display = 'none';
            videoProcessingStatus.style.display = 'block';

            const progressFill = document.getElementById('videoProgressFill');
            const processingText = document.getElementById('videoProcessingText');

            let progress = 0;
            const steps = [
                'Processing video information...',
                'Extracting video embed code...',
                'Creating video card...',
                'Finalizing video setup...'
            ];

            const progressInterval = setInterval(() => {
                progress += 25;
                progressFill.style.width = progress + '%';

                const stepIndex = Math.floor(progress / 25) - 1;
                if (stepIndex >= 0 && stepIndex < steps.length) {
                    processingText.textContent = steps[stepIndex];
                }

                if (progress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        createVideoCard(videoData);
                        resetVideoUploadForm();
                    }, 1000);
                }
            }, 800);
        }

        function createVideoCard(videoData) {
            const embedUrl = getEmbedUrl(videoData.url);
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';

            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
                </div>
                <h3>${videoData.title}</h3>
                <p>${videoData.description}</p>
            `;

            videosGrid.appendChild(videoCard);
            videoCard.style.opacity = '0';
            videoCard.style.transform = 'translateY(20px)';

            setTimeout(() => {
                videoCard.style.transition = 'all 0.5s ease';
                videoCard.style.opacity = '1';
                videoCard.style.transform = 'translateY(0)';
            }, 100);

            logUserActivity(`Added new video: ${videoData.title}`);
        }

        function getEmbedUrl(url) {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.includes('youtu.be')
                    ? url.split('youtu.be/')[1]?.split('?')[0]
                    : url.split('v=')[1]?.split('&')[0];
                return `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes('vimeo.com')) {
                const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                return `https://player.vimeo.com/video/${videoId}`;
            }
            return url;
        }

        function resetVideoUploadForm() {
            videoUploadForm.style.display = 'flex';
            videoProcessingStatus.style.display = 'none';
            videoUploadForm.reset();
            clearAllVideoErrors();
        }

        function showVideoError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        }

        function clearVideoError(fieldId) {
            const errorElement = document.getElementById(fieldId + 'Error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
            }
        }

        function clearAllVideoErrors() {
            const videoFields = ['videoTitle', 'videoDescription', 'videoCategory', 'videoDuration', 'videoUrl'];
            videoFields.forEach(fieldId => {
                clearVideoError(fieldId);
            });
        }

    }

    // Helper function to show field errors
    function showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
});