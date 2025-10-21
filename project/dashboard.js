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
        const urlUploadOption = document.getElementById('urlUploadOption');
        const fileUploadOption = document.getElementById('fileUploadOption');
        const urlUploadForm = document.getElementById('urlUploadForm');
        const fileUploadForm = document.getElementById('fileUploadForm');
        const processingStatus = document.getElementById('processingStatus');
        const fileDropZone = document.getElementById('fileDropZone');
        const fileInput = document.getElementById('fileInput');
        const ebooksGrid = document.querySelector('.ebooks-grid');

        // Upload option selection
        if (urlUploadOption) {
            urlUploadOption.addEventListener('click', function() {
                showUploadForm('url');
            });
        }

        if (fileUploadOption) {
            fileUploadOption.addEventListener('click', function() {
                showUploadForm('file');
            });
        }

        // Cancel buttons
        document.getElementById('cancelUrlUpload')?.addEventListener('click', hideUploadForms);
        document.getElementById('cancelFileUpload')?.addEventListener('click', hideUploadForms);

        // URL upload processing
        document.getElementById('processUrlUpload')?.addEventListener('click', function() {
            const url = document.getElementById('ebookUrl').value.trim();
            if (validateUrl(url)) {
                processDocument(url, 'url');
            }
        });

        // File drop zone functionality
        if (fileDropZone && fileInput) {
            fileDropZone.addEventListener('click', () => fileInput.click());
            
            fileDropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });

            fileDropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
            });

            fileDropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                handleFileUpload(files);
            });

            fileInput.addEventListener('change', function(e) {
                handleFileUpload(e.target.files);
            });
        }

        function showUploadForm(type) {
            hideUploadForms();
            urlUploadOption.classList.remove('active');
            fileUploadOption.classList.remove('active');
            
            if (type === 'url') {
                urlUploadForm.style.display = 'block';
                urlUploadOption.classList.add('active');
            } else {
                fileUploadForm.style.display = 'block';
                fileUploadOption.classList.add('active');
            }
        }

        function hideUploadForms() {
            urlUploadForm.style.display = 'none';
            fileUploadForm.style.display = 'none';
            processingStatus.style.display = 'none';
            urlUploadOption.classList.remove('active');
            fileUploadOption.classList.remove('active');
            
            // Clear forms
            document.getElementById('ebookUrl').value = '';
            fileInput.value = '';
            window.DevLearnUtils.clearError('ebookUrl');
        }

        function validateUrl(url) {
            if (!url) {
                window.DevLearnUtils.showError('ebookUrl', 'Please enter a valid URL');
                return false;
            }
            
            try {
                new URL(url);
                window.DevLearnUtils.clearError('ebookUrl');
                return true;
            } catch {
                window.DevLearnUtils.showError('ebookUrl', 'Please enter a valid URL');
                return false;
            }
        }

        function handleFileUpload(files) {
            if (files.length === 0) return;
            
            const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
            const validFiles = Array.from(files).filter(file => {
                const extension = '.' + file.name.split('.').pop().toLowerCase();
                return validTypes.includes(extension);
            });

            if (validFiles.length === 0) {
                alert('Please select valid document files (PDF, DOC, DOCX, TXT)');
                return;
            }

            validFiles.forEach(file => {
                processDocument(file, 'file');
            });
        }

        function processDocument(source, type) {
            hideUploadForms();
            processingStatus.style.display = 'block';
            
            const progressFill = document.getElementById('progressFill');
            const processingText = document.getElementById('processingText');
            
            let progress = 0;
            const steps = [
                'Analyzing document content...',
                'Generating title and description...',
                'Creating appropriate icon...',
                'Finalizing e-book entry...'
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
                        createEbookCard(source, type);
                        hideUploadForms();
                    }, 1000);
                }
            }, 800);
        }

        function createEbookCard(source, type) {
            const title = generateTitle(source, type);
            const description = generateDescription(title);
            const icon = generateIcon(title);
            
            const ebookCard = document.createElement('div');
            ebookCard.className = 'ebook-card';
            ebookCard.innerHTML = `
                <div class="ebook-cover">${icon}</div>
                <h3>${title}</h3>
                <p>${description}</p>
                <a href="#" class="btn btn-outline ebook-download-btn" data-source="${type === 'url' ? source : 'local'}" data-type="${type}">Download PDF</a>
            `;
            
            // Add to grid with animation
            ebooksGrid.appendChild(ebookCard);
            ebookCard.style.opacity = '0';
            ebookCard.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                ebookCard.style.transition = 'all 0.5s ease';
                ebookCard.style.opacity = '1';
                ebookCard.style.transform = 'translateY(0)';
            }, 100);
            
            // Add download functionality
            const downloadBtn = ebookCard.querySelector('.ebook-download-btn');
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleEbookDownload(this, source, type, title);
            });
            
            // Log activity
            logUserActivity(`Added new e-book: ${title}`);
        }

        function generateTitle(source, type) {
            const prefixes = ['Complete Guide to', 'Mastering', 'Introduction to', 'Advanced', 'Essential'];
            const suffixes = ['Handbook', 'Guide', 'Manual', 'Reference', 'Tutorial'];
            
            let baseName;
            if (type === 'url') {
                baseName = source.split('/').pop().split('.')[0] || 'Document';
            } else {
                baseName = source.name.split('.')[0];
            }
            
            // Clean up filename
            baseName = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            
            return Math.random() > 0.5 ? `${prefix} ${baseName}` : `${baseName} ${suffix}`;
        }

        function generateDescription(title) {
            const descriptions = [
                `Comprehensive resource covering all essential concepts and practical applications. Perfect for both beginners and experienced professionals.`,
                `In-depth guide with step-by-step instructions and real-world examples. Learn through hands-on practice and expert insights.`,
                `Complete reference material with detailed explanations and best practices. Enhance your skills with proven methodologies.`,
                `Essential handbook featuring practical techniques and advanced strategies. Master the fundamentals and beyond.`,
                `Detailed tutorial with comprehensive coverage of key topics. Build expertise through structured learning approach.`
            ];
            
            return descriptions[Math.floor(Math.random() * descriptions.length)];
        }

        function generateIcon(title) {
            const icons = {
                'web': '🌐', 'html': '🌐', 'css': '🎨', 'javascript': '⚡', 'js': '⚡',
                'python': '🐍', 'java': '☕', 'react': '⚛️', 'node': '🟢', 'php': '🐘',
                'database': '🗄️', 'sql': '🗄️', 'api': '🔌', 'mobile': '📱', 'android': '🤖',
                'ios': '🍎', 'swift': '🍎', 'kotlin': '🤖', 'flutter': '🎯', 'dart': '🎯',
                'machine': '🤖', 'ai': '🤖', 'data': '📊', 'analytics': '📈', 'science': '🔬',
                'security': '🔒', 'network': '🌐', 'cloud': '☁️', 'docker': '🐳', 'git': '📝',
                'design': '🎨', 'ui': '🎨', 'ux': '👤', 'algorithm': '🧮', 'structure': '🏗️'
            };
            
            const titleLower = title.toLowerCase();
            for (const [keyword, icon] of Object.entries(icons)) {
                if (titleLower.includes(keyword)) {
                    return icon;
                }
            }
            
            // Default icons
            const defaultIcons = ['📖', '📚', '📘', '📗', '📙', '📕'];
            return defaultIcons[Math.floor(Math.random() * defaultIcons.length)];
        }

        function handleEbookDownload(button, source, type, title) {
            if (!navigator.onLine) {
                button.textContent = 'Offline - Cannot Download';
                button.style.backgroundColor = 'var(--gray-400)';
                button.style.borderColor = 'var(--gray-400)';
                button.disabled = true;
                return;
            }
            
            const originalText = button.textContent;
            button.textContent = 'Downloading...';
            button.disabled = true;
            
            setTimeout(() => {
                if (type === 'url') {
                    // For URL sources, open in new tab
                    window.open(source, '_blank');
                } else {
                    // For file sources, create download link
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(source);
                    link.download = `${title}.pdf`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                }
                
                button.textContent = 'Downloaded!';
                button.style.backgroundColor = 'var(--success-500)';
                button.style.color = 'white';
                button.style.borderColor = 'var(--success-500)';
                
                logUserActivity(`Downloaded e-book: ${title}`);
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                    button.style.backgroundColor = '';
                    button.style.color = '';
                    button.style.borderColor = '';
                }, 2000);
            }, 1500);
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