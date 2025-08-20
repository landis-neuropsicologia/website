// Modal Management System for Privacy Policy and Terms of Use
class ModalManager {
	constructor() {
		this.privacyModal = null;
		this.termsModal = null;
		this.activeModal = null;
		this.isOpen = false;
		this.focusedElementBeforeModal = null;
		this.focusableElements = [];

		this.init();
	}

	init() {
		this.privacyModal = document.getElementById('privacyModal');
		this.termsModal = document.getElementById('termsModal');

		if (this.privacyModal) {
			this.setupModal(this.privacyModal, 'privacy');
		}

		if (this.termsModal) {
			this.setupModal(this.termsModal, 'terms');
		}

		this.bindGlobalEvents();
	}

	setupModal(modal, type) {
		// Close button
		const closeButtons = modal.querySelectorAll('.modal-close');
		closeButtons.forEach((button) => {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				this.close();
			});
		});

		// Overlay click to close
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.close();
			}
		});

		// Setup focus management for this modal
		this.setupFocusManagement(modal);
	}

	bindGlobalEvents() {
		// Escape key to close
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen) {
				this.close();
			}
		});
	}

	setupFocusManagement(modal) {
		// Get all focusable elements within modal
		const focusableSelectors = [
			'button',
			'[href]',
			'input',
			'select',
			'textarea',
			'[tabindex]:not([tabindex="-1"])',
		].join(',');

		// Trap focus within modal
		modal.addEventListener('keydown', (e) => {
			if (e.key === 'Tab' && this.isOpen && this.activeModal === modal) {
				this.trapFocus(e, modal);
			}
		});
	}

	trapFocus(e, modal) {
		const focusableElements = [
			...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
		].filter((el) => !el.disabled && !el.hidden);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (e.shiftKey) {
			// Shift + Tab
			if (document.activeElement === firstElement) {
				e.preventDefault();
				lastElement.focus();
			}
		} else {
			// Tab
			if (document.activeElement === lastElement) {
				e.preventDefault();
				firstElement.focus();
			}
		}
	}

	open(modalType) {
		if (this.isOpen) {
			this.close(); // Close any open modal first
		}

		let modal;
		if (modalType === 'privacy') {
			modal = this.privacyModal;
		} else if (modalType === 'terms') {
			modal = this.termsModal;
		}

		if (!modal) return;

		// Store currently focused element
		this.focusedElementBeforeModal = document.activeElement;

		// Show modal
		modal.classList.add('show');
		modal.setAttribute('aria-hidden', 'false');
		this.isOpen = true;
		this.activeModal = modal;

		// Prevent body scroll
		document.body.style.overflow = 'hidden';

		// Focus first focusable element
		setTimeout(() => {
			const focusableElements = [
				...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
			].filter((el) => !el.disabled && !el.hidden);

			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			} else {
				modal.querySelector('.modal-container').focus();
			}
		}, 100);

		// Track analytics if available
		this.trackEvent(`${modalType}_modal`, 'interaction', 'opened');
	}

	close() {
		if (!this.isOpen || !this.activeModal) return;

		const modal = this.activeModal;

		// Add closing animation class
		modal.classList.add('closing');

		// Wait for animation to complete
		setTimeout(() => {
			modal.classList.remove('show', 'closing');
			modal.setAttribute('aria-hidden', 'true');
			this.isOpen = false;
			this.activeModal = null;

			// Restore body scroll
			document.body.style.overflow = '';

			// Restore focus to previously focused element
			if (this.focusedElementBeforeModal) {
				this.focusedElementBeforeModal.focus();
			}
		}, 300);

		// Track analytics if available
		const modalType = modal.id === 'privacyModal' ? 'privacy' : 'terms';
		this.trackEvent(`${modalType}_modal`, 'interaction', 'closed');
	}

	trackEvent(action, category, label) {
		// Track with existing analytics system if available
		if (window.analyticsManager && typeof window.analyticsManager.trackEvent === 'function') {
			window.analyticsManager.trackEvent(action, category, label, 1);
		}
	}
}

// Cookie Settings Functions (integrated with existing cookie manager)
function showCookieSettings() {
	if (window.cookieManager) {
		window.cookieManager.showBanner();
	} else {
		alert('Sistema de cookies não disponível. Tente recarregar a página.');
	}

	// Track event
	if (window.modalManager) {
		window.modalManager.trackEvent('cookie_settings', 'privacy', 'show_settings');
	}
}

function revokeCookieConsent() {
	if (window.cookieManager) {
		window.cookieManager.revokeConsent();

		// Show confirmation notification
		showNotification('✅ Consentimento revogado com sucesso. Os cookies não essenciais foram removidos.', 'success');
	} else {
		alert('Sistema de cookies não disponível. Tente recarregar a página.');
	}

	// Track event
	if (window.modalManager) {
		window.modalManager.trackEvent('cookie_consent', 'privacy', 'revoked');
	}
}

// Notification system for user feedback
function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.innerHTML = `
        <div class="notification-content">
            ${message}
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;

	// Add notification styles if not already present
	if (!document.querySelector('#notification-styles')) {
		const styles = document.createElement('style');
		styles.id = 'notification-styles';
		styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                max-width: 400px;
                min-width: 300px;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                font-size: 0.9rem;
                line-height: 1.4;
                animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                backdrop-filter: blur(10px);
            }
            
            .notification-success {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
            }
            
            .notification-info {
                background: linear-gradient(135deg, #3498db, #5dade2);
                color: white;
            }
            
            .notification-warning {
                background: linear-gradient(135deg, #f39c12, #f1c40f);
                color: white;
            }
            
            .notification-error {
                background: linear-gradient(135deg, #e74c3c, #ec7063);
                color: white;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: currentColor;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                opacity: 0.8;
                transition: opacity 0.3s ease;
                flex-shrink: 0;
            }
            
            .notification-close:hover {
                opacity: 1;
                background: rgba(255,255,255,0.2);
            }
            
            .link-button {
                background: none;
                border: none;
                color: #504670;
                text-decoration: underline;
                cursor: pointer;
                font-size: inherit;
                font-family: inherit;
                padding: 0;
                margin: 0;
            }
            
            .link-button:hover {
                color: #3d3556;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 480px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    min-width: auto;
                }
            }
        `;
		document.head.appendChild(styles);
	}

	document.body.appendChild(notification);

	// Auto remove after 5 seconds
	setTimeout(() => {
		if (notification.parentElement) {
			notification.style.animation = 'slideInRight 0.4s reverse';
			setTimeout(() => {
				notification.remove();
			}, 400);
		}
	}, 5000);
}

// Global functions for opening and closing modals
function openPrivacyModal(event) {
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}

	if (!window.modalManager.isOpen) {		
		window.modalManager.open('privacy');
	} else {
		console.error('Modal manager not initialized');
	}
}

function closePrivacyModal() {
	if (window.modalManager) {
		window.modalManager.close();
	}
}

function openTermsModal(event) {
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}
}

function closeTermsModal() {
	if (window.modalManager) {
		window.modalManager.close();
	}
}

// Initialize modal manager when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
	// Initialize modal manager
	window.modalManager = new ModalManager();

	// Setup privacy links
	const privacyLinks = document.querySelectorAll('.privacy-link[onclick*="openPrivacyModal"]');
	privacyLinks.forEach((link) => {
		link.addEventListener('click', openPrivacyModal);
	});

	// Setup terms links
	const termsLinks = document.querySelectorAll('.privacy-link[onclick*="openTermsModal"]');
	termsLinks.forEach((link) => {
		link.addEventListener('click', openTermsModal);
	});

	// Setup any other links that might exist
	const allPrivacyLinks = document.querySelectorAll('a[href*="politica-privacidade"], a[href="#privacy"]');
	allPrivacyLinks.forEach((link) => {
		link.addEventListener('click', function (e) {
			if (
				this.getAttribute('href') === '#privacy' ||
				this.getAttribute('href') === '/politica-privacidade' ||
				this.getAttribute('href') === '#'
			) {
				openPrivacyModal(e);
			}
		});
	});

	const allTermsLinks = document.querySelectorAll('a[href*="termos-uso"], a[href="#terms"]');
	allTermsLinks.forEach((link) => {
		link.addEventListener('click', function (e) {
			if (
				this.getAttribute('href') === '#terms' ||
				this.getAttribute('href') === '/termos-uso' ||
				this.getAttribute('href') === '#'
			) {
				openTermsModal(e);
			}
		});
	});

	console.log('Modal Manager initialized successfully');
});

// Handle browser back button when modal is open
window.addEventListener('popstate', function (event) {
	if (window.modalManager && window.modalManager.isOpen) {
		window.modalManager.close();
	}
});

// Prevent body scroll when modal is open
document.addEventListener('keydown', function (e) {
	if (window.modalManager && window.modalManager.isOpen) {
		// Prevent arrow keys from scrolling the background
		if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
			// Only prevent if the focused element is not scrollable content
			const focusedElement = document.activeElement;
			const modalContent = document.querySelector('.modal-content');

			if (!modalContent || !modalContent.contains(focusedElement)) {
				e.preventDefault();
			}
		}
	}
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		ModalManager,
		openPrivacyModal,
		closePrivacyModal,
		openTermsModal,
		closeTermsModal,
		showCookieSettings,
		revokeCookieConsent,
		showNotification,
	};
}
