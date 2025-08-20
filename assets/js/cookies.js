// Cookie Management System
class CookieManager {
	constructor() {
		this.banner = document.getElementById('cookieBanner');
		this.consentKey = 'cookieConsent';
		this.consentDateKey = 'cookieConsentDate';
		this.consentDuration = 6; // months

		this.init();
	}

	init() {
		if (!this.banner) return;

		// Check existing consent
		this.checkExistingConsent();

		// Bind events
		this.bindEvents();
	}

	bindEvents() {
		// Accept button
		const acceptBtn = this.banner.querySelector('.cookie-accept');
		if (acceptBtn) {
			acceptBtn.addEventListener('click', () => this.acceptCookies());
		}

		// Decline button
		const declineBtn = this.banner.querySelector('.cookie-decline');
		if (declineBtn) {
			declineBtn.addEventListener('click', () => this.declineCookies());
		}

		// Close banner on Escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.banner.classList.contains('show')) {
				this.declineCookies();
			}
		});
	}

	checkExistingConsent() {
		try {
			const consent = localStorage.getItem(this.consentKey);
			const consentDate = localStorage.getItem(this.consentDateKey);

			// Check if consent has expired
			if (consentDate) {
				const consentDateTime = new Date(consentDate);
				const now = new Date();
				const expiryDate = new Date(consentDateTime);
				expiryDate.setMonth(expiryDate.getMonth() + this.consentDuration);

				if (now > expiryDate) {
					// Consent expired, remove it
					this.clearConsent();
					this.showBanner();
					return;
				}
			}

			if (consent === 'accepted') {
				// Initialize analytics
				if (window.analyticsManager) {
					window.analyticsManager.initialize();
				}
			} else if (!consent) {
				// No consent found, show banner
				this.showBanner();
			}
			// If consent is 'declined', do nothing (banner stays hidden)
		} catch (error) {
			console.warn('Error checking cookie consent:', error);
			this.showBanner(); // Fallback to showing banner
		}
	}

	showBanner() {
		if (!this.banner) return;

		setTimeout(() => {
			this.banner.classList.add('show');
			// Focus management for accessibility
			this.banner.setAttribute('aria-hidden', 'false');
		}, 2000);
	}

	hideBanner() {
		if (!this.banner) return;

		this.banner.classList.remove('show');
		this.banner.setAttribute('aria-hidden', 'true');
	}

	acceptCookies() {
		try {
			localStorage.setItem(this.consentKey, 'accepted');
			localStorage.setItem(this.consentDateKey, new Date().toISOString());

			this.hideBanner();

			// Initialize analytics
			if (window.analyticsManager) {
				window.analyticsManager.initialize();
			}

			// Track consent event
			this.trackEvent('cookie_consent', 'engagement', 'accepted');
		} catch (error) {
			console.warn('Error saving cookie consent:', error);
		}
	}

	declineCookies() {
		try {
			localStorage.setItem(this.consentKey, 'declined');
			localStorage.setItem(this.consentDateKey, new Date().toISOString());

			this.hideBanner();

			// Track consent event (if basic analytics is allowed)
			this.trackEvent('cookie_consent', 'engagement', 'declined');
		} catch (error) {
			console.warn('Error saving cookie consent:', error);
		}
	}

	clearConsent() {
		try {
			localStorage.removeItem(this.consentKey);
			localStorage.removeItem(this.consentDateKey);
		} catch (error) {
			console.warn('Error clearing cookie consent:', error);
		}
	}

	getConsent() {
		try {
			return localStorage.getItem(this.consentKey);
		} catch (error) {
			console.warn('Error getting cookie consent:', error);
			return null;
		}
	}

	hasConsented() {
		return this.getConsent() === 'accepted';
	}

	trackEvent(action, category, label, value) {
		// Only track if user has consented or for essential events
		if (this.hasConsented() || action === 'cookie_consent') {
			if (window.analyticsManager && typeof window.analyticsManager.trackEvent === 'function') {
				window.analyticsManager.trackEvent(action, category, label, value);
			}
		}
	}

	// Public method to revoke consent (for privacy policy page)
	revokeConsent() {
		this.clearConsent();

		// Disable analytics
		if (window.analyticsManager) {
			window.analyticsManager.disable();
		}

		// Show banner again
		this.showBanner();
	}

	// Method to update consent (for settings page)
	updateConsent(consentType) {
		if (consentType === 'accepted') {
			this.acceptCookies();
		} else {
			this.declineCookies();
		}
	}
}

// Global functions for backward compatibility
window.acceptCookies = function () {
	if (window.cookieManager) {
		window.cookieManager.acceptCookies();
	}
};

window.declineCookies = function () {
	if (window.cookieManager) {
		window.cookieManager.declineCookies();
	}
};

// Initialize cookie manager
document.addEventListener('DOMContentLoaded', function () {
	window.cookieManager = new CookieManager();
});

// GDPR/LGPD Compliance Helper
class ComplianceHelper {
	static getCookieInfo() {
		return {
			essential: [
				{
					name: 'cookieConsent',
					purpose: 'Armazena a preferência do usuário sobre cookies',
					duration: '6 meses',
					type: 'localStorage',
				},
				{
					name: 'cookieConsentDate',
					purpose: 'Armazena a data do consentimento',
					duration: '6 meses',
					type: 'localStorage',
				},
			],
			analytics: [
				{
					name: '_ga',
					purpose: 'Identifica usuários únicos',
					duration: '2 anos',
					type: 'cookie',
				},
				{
					name: '_ga_*',
					purpose: 'Persiste estado da sessão',
					duration: '2 anos',
					type: 'cookie',
				},
			],
			marketing: [
				// Add marketing cookies here if needed
			],
		};
	}

	static generateCookiePolicy() {
		const cookieInfo = this.getCookieInfo();
		let policy = 'Política de Cookies\n\n';

		Object.keys(cookieInfo).forEach((category) => {
			if (cookieInfo[category].length > 0) {
				policy += `${category.toUpperCase()}:\n`;
				cookieInfo[category].forEach((cookie) => {
					policy += `- ${cookie.name}: ${cookie.purpose} (${cookie.duration})\n`;
				});
				policy += '\n';
			}
		});

		return policy;
	}
}
