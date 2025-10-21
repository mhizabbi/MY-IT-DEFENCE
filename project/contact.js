// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const contactModal = document.getElementById('contactModal');
    const contactModalClose = document.getElementById('contactModalClose');
    const contactModalOk = document.getElementById('contactModalOk');

    // Contact form handler
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const subject = formData.get('subject');
            const message = formData.get('message').trim();
            
            let isValid = true;

            // Clear previous errors
            ['contactName', 'contactEmail', 'contactSubject', 'contactMessage'].forEach(field => {
                window.DevLearnUtils.clearError(field);
            });

            // Validate name
            if (!name || name.length < 2) {
                window.DevLearnUtils.showError('contactName', 'Please enter a valid name (at least 2 characters)');
                isValid = false;
            }

            // Validate email
            if (!email || !window.DevLearnUtils.isValidEmail(email)) {
                window.DevLearnUtils.showError('contactEmail', 'Please enter a valid email address');
                isValid = false;
            }

            // Validate subject
            if (!subject) {
                window.DevLearnUtils.showError('contactSubject', 'Please select a subject');
                isValid = false;
            }

            // Validate message
            if (!message || message.length < 10) {
                window.DevLearnUtils.showError('contactMessage', 'Please enter a message (at least 10 characters)');
                isValid = false;
            }

            if (isValid) {
                // Store contact form data
                const contactData = {
                    id: Date.now().toString(),
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    timestamp: new Date().toISOString(),
                    status: 'new'
                };

                // Get existing contact submissions
                const existingContacts = JSON.parse(localStorage.getItem('devlearn_contacts') || '[]');
                existingContacts.unshift(contactData);

                // Keep only last 100 submissions
                if (existingContacts.length > 100) {
                    existingContacts.splice(100);
                }

                // Save to localStorage
                localStorage.setItem('devlearn_contacts', JSON.stringify(existingContacts));

                // Show success modal
                window.DevLearnUtils.showModal('contactModal');

                // Reset form with animation
                this.reset();
                
                // Add success animation to form
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.3s ease';
                
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 300);
            }
        });

        // Real-time validation
        const formFields = {
            'contactName': validateName,
            'contactEmail': validateEmail,
            'contactSubject': validateSubject,
            'contactMessage': validateMessage
        };

        Object.keys(formFields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', function() {
                    formFields[fieldId](this.value, fieldId);
                });

                field.addEventListener('input', function() {
                    window.DevLearnUtils.clearError(fieldId);
                });
            }
        });
    }

    // Modal close handlers
    if (contactModalClose) {
        contactModalClose.addEventListener('click', function() {
            window.DevLearnUtils.hideModal('contactModal');
        });
    }

    if (contactModalOk) {
        contactModalOk.addEventListener('click', function() {
            window.DevLearnUtils.hideModal('contactModal');
        });
    }

    // Close modal when clicking outside
    if (contactModal) {
        contactModal.addEventListener('click', function(e) {
            if (e.target === this) {
                window.DevLearnUtils.hideModal('contactModal');
            }
        });
    }

    // Add character counter to message field
    const messageField = document.getElementById('contactMessage');
    if (messageField) {
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        charCounter.style.fontSize = '0.75rem';
        charCounter.style.color = 'var(--gray-500)';
        charCounter.style.marginTop = '0.25rem';
        charCounter.style.textAlign = 'right';
        
        messageField.parentNode.appendChild(charCounter);

        messageField.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/500 characters`;
            
            if (length > 500) {
                charCounter.style.color = 'var(--error-500)';
                this.value = this.value.substring(0, 500);
            } else {
                charCounter.style.color = 'var(--gray-500)';
            }
        });
    }

    // Enhanced contact methods with animations
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.contact-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        method.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.contact-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });

    // Add copy to clipboard functionality for email and phone
    const contactInfo = document.querySelectorAll('.contact-method p');
    contactInfo.forEach(info => {
        const text = info.textContent.trim();
        if (text.includes('@') || text.includes('+')) {
            info.style.cursor = 'pointer';
            info.title = 'Click to copy';
            
            info.addEventListener('click', function() {
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    this.style.color = 'var(--success-500)';
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.color = '';
                    }, 2000);
                }).catch(() => {
                    console.log('Could not copy text');
                });
            });
        }
    });

    // Validation functions
    function validateName(value, fieldId) {
        if (!value || value.length < 2) {
            window.DevLearnUtils.showError(fieldId, 'Please enter a valid name (at least 2 characters)');
            return false;
        }
        window.DevLearnUtils.clearError(fieldId);
        return true;
    }

    function validateEmail(value, fieldId) {
        if (!value || !window.DevLearnUtils.isValidEmail(value)) {
            window.DevLearnUtils.showError(fieldId, 'Please enter a valid email address');
            return false;
        }
        window.DevLearnUtils.clearError(fieldId);
        return true;
    }

    function validateSubject(value, fieldId) {
        if (!value) {
            window.DevLearnUtils.showError(fieldId, 'Please select a subject');
            return false;
        }
        window.DevLearnUtils.clearError(fieldId);
        return true;
    }

    function validateMessage(value, fieldId) {
        if (!value || value.length < 10) {
            window.DevLearnUtils.showError(fieldId, 'Please enter a message (at least 10 characters)');
            return false;
        }
        window.DevLearnUtils.clearError(fieldId);
        return true;
    }

    // Auto-save draft functionality
    let draftTimeout;
    const formElements = contactForm.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
        element.addEventListener('input', function() {
            clearTimeout(draftTimeout);
            draftTimeout = setTimeout(saveDraft, 1000);
        });
    });

    function saveDraft() {
        if (!contactForm) return;
        
        const formData = new FormData(contactForm);
        const draft = {
            name: formData.get('name') || '',
            email: formData.get('email') || '',
            subject: formData.get('subject') || '',
            message: formData.get('message') || '',
            timestamp: new Date().toISOString()
        };

        // Only save if there's meaningful content
        if (draft.name || draft.email || draft.message) {
            localStorage.setItem('devlearn_contact_draft', JSON.stringify(draft));
        }
    }

    function loadDraft() {
        const draft = JSON.parse(localStorage.getItem('devlearn_contact_draft') || 'null');
        
        if (draft && contactForm) {
            const now = new Date();
            const draftTime = new Date(draft.timestamp);
            const diffHours = (now - draftTime) / (1000 * 60 * 60);
            
            // Only load draft if it's less than 24 hours old
            if (diffHours < 24) {
                document.getElementById('contactName').value = draft.name;
                document.getElementById('contactEmail').value = draft.email;
                document.getElementById('contactSubject').value = draft.subject;
                document.getElementById('contactMessage').value = draft.message;
                
                // Update character counter if message exists
                if (draft.message && messageField) {
                    messageField.dispatchEvent(new Event('input'));
                }
            } else {
                // Clear old draft
                localStorage.removeItem('devlearn_contact_draft');
            }
        }
    }

    // Load draft on page load
    loadDraft();

    // Clear draft after successful submission
    contactForm.addEventListener('submit', function() {
        if (this.checkValidity()) {
            setTimeout(() => {
                localStorage.removeItem('devlearn_contact_draft');
            }, 1000);
        }
    });
});