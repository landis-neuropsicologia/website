// Analytics Management System
class AnalyticsManager {
	constructor() {
		this.isInitialized = false;
		this.config = {
			googleAnalyticsId: 'G-3E8TX8Q33N', // Replace with actual GA4 ID
			gtmId: 'GTM-WQSQCD6F', // Replace with actual GTM ID
			respectDNT: true,
			anonymizeIP: true,
		};

		this.queue = []; // Queue events before initialization
	}

	initialize() {
		// Check if user has consented to cookies
		if (!window.cookieManager || !window.cookieManager.hasConsented()) {
			return;
		}

		// Check Do Not Track preference
		if (this.config.respectDNT && navigator.doNotTrack === '1') {
			console.log('Analytics disabled due to Do Not Track preference');
			return;
		}

		this.initializeGoogleAnalytics();
		this.initializeGTM();

		this.isInitialized = true;
		console.log('Analytics initialized');

		this.setupEventListeners();
		this.processQueuedEvents();
	}

	initializeGoogleAnalytics() {
		if (!this.config.googleAnalyticsId) {
			console.warn('Google Analytics ID not configured');
			return;
		}

		// Load Google Analytics 4
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
		document.head.appendChild(script);

		// Initialize gtag
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () {
			dataLayer.push(arguments);
		};

		gtag('js', new Date());
		gtag('config', this.config.googleAnalyticsId, {
			anonymize_ip: this.config.anonymizeIP,
			respect_dnt: this.config.respectDNT,
			allow_google_signals: false, // Disable advertising features
			allow_ad_personalization_signals: false,
		});
	}

	initializeGTM() {
		if (!this.config.gtmId) {
			console.warn('Google Tag Manager ID not configured');
			return;
		}

		// Load Google Tag Manager
		(function (w, d, s, l, i) {
			w[l] = w[l] || [];
			w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
			var f = d.getElementsByTagName(s)[0],
				j = d.createElement(s),
				dl = l != 'dataLayer' ? '&l=' + l : '';
			j.async = true;
			j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
			f.parentNode.insertBefore(j, f);
		})(window, document, 'script', 'dataLayer', this.config.gtmId);
	}

	setupEventListeners() {
		// Track page load time
		window.addEventListener('load', () => {
			const navigationStart = performance.timing.navigationStart;
			const loadComplete = performance.timing.loadEventEnd;
			const loadTime = loadComplete - navigationStart;

			this.trackEvent('page_load_time', 'performance', 'load_time', loadTime);
		});

		// Track scroll depth
		this.setupScrollTracking();

		// Track time on page
		this.setupTimeTracking();

		// Track CTA clicks
		this.setupCTATracking();

		// Track WhatsApp clicks
		this.setupWhatsAppTracking();

		// Track form interactions (if any)
		this.setupFormTracking();
	}

	setupScrollTracking() {
		let maxScroll = 0;
		let scrollMilestones = [25, 50, 75, 90, 100];
		let trackedMilestones = [];

		window.addEventListener(
			'scroll',
			() => {
				const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);

				if (scrollPercent > maxScroll) {
					maxScroll = scrollPercent;
				}

				// Track scroll milestones
				scrollMilestones.forEach((milestone) => {
					if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
						trackedMilestones.push(milestone);
						this.trackEvent('scroll_depth', 'engagement', `${milestone}%`, milestone);
					}
				});
			},
			{ passive: true }
		);

		// Track max scroll on page unload
		window.addEventListener('beforeunload', () => {
			this.trackEvent('max_scroll', 'engagement', 'percentage', maxScroll);
		});
	}

	setupTimeTracking() {
		const startTime = Date.now();
		let timeOnPageTracked = false;

		// Track time milestones
		const timeMilestones = [30, 60, 120, 300]; // seconds
		timeMilestones.forEach((seconds) => {
			setTimeout(() => {
				this.trackEvent('time_on_page', 'engagement', `${seconds}s`, seconds);
			}, seconds * 1000);
		});

		// Track total time on page unload
		window.addEventListener('beforeunload', () => {
			if (!timeOnPageTracked) {
				const timeOnPage = Math.round((Date.now() - startTime) / 1000);
				this.trackEvent('time_on_page', 'engagement', 'total_seconds', timeOnPage);
				timeOnPageTracked = true;
			}
		});
	}

	setupCTATracking() {
		document.querySelectorAll('.btn').forEach((button) => {
			button.addEventListener('click', (e) => {
				const buttonText = e.target.textContent.trim();
				const buttonClass = e.target.className;

				this.trackEvent('cta_click', 'engagement', buttonText, 1);

				// Track specific button types
				if (buttonClass.includes('btn-primary')) {
					this.trackEvent('primary_cta_click', 'conversion', buttonText, 1);
				}
			});
		});
	}

	setupWhatsAppTracking() {
		const whatsappButton = document.querySelector('.whatsapp-float');
		if (whatsappButton) {
			whatsappButton.addEventListener('click', () => {
				this.trackEvent('whatsapp_click', 'contact', 'floating_button', 1);
				this.trackEvent('contact_attempt', 'conversion', 'whatsapp', 1);
			});
		}
	}

	setupFormTracking() {
		// Track form submissions (if any forms are added later)
		document.addEventListener('submit', (e) => {
			if (e.target.tagName === 'FORM') {
				const formId = e.target.id || 'unknown_form';
				this.trackEvent('form_submit', 'conversion', formId, 1);
			}
		});
	}

	trackEvent(action, category, label, value) {
		const eventData = {
			action,
			category,
			label,
			value,
		};

		// Track with Google Analytics
		if (typeof gtag !== 'undefined') {
			gtag('event', action, {
				event_category: category,
				event_label: label,
				value: value,
				custom_parameter: window.location.pathname,
			});
		}

		// Track with GTM dataLayer
		if (window.dataLayer) {
			window.dataLayer.push({
				event: 'custom_event',
				event_action: action,
				event_category: category,
				event_label: label,
				event_value: value,
			});
		}

		// Debug logging
		if (localStorage.getItem('debug_analytics') === 'true') {
			console.log('Analytics Event:', eventData);
		}

		// If not initialized, queue the event
		if (!this.isInitialized) {
			this.queue.push(eventData);
			return;
		}
	}

	processQueuedEvents() {
		// Process any events that were queued before initialization
		while (this.queue.length > 0) {
			const event = this.queue.shift();
			this.trackEvent(event.action, event.category, event.label, event.value);
		}
	}

	// Track page view (useful for SPA)
	trackPageView(path, title) {
		if (!this.isInitialized) return;

		if (typeof gtag !== 'undefined') {
			gtag('config', this.config.googleAnalyticsId, {
				page_path: path,
				page_title: title,
			});
		}

		if (window.dataLayer) {
			window.dataLayer.push({
				event: 'page_view',
				page_path: path,
				page_title: title,
			});
		}
	}

	// Disable analytics (for privacy compliance)
	disable() {
		this.isInitialized = false;

		// Disable Google Analytics
		if (typeof gtag !== 'undefined') {
			gtag('config', this.config.googleAnalyticsId, {
				client_storage: 'none',
				anonymize_ip: true,
			});
		}

		// Clear any existing analytics cookies
		this.clearAnalyticsCookies();
	}

	clearAnalyticsCookies() {
		// Clear Google Analytics cookies
		const cookiesToClear = ['_ga', '_ga_' + this.config.googleAnalyticsId.replace('G-', ''), '_gid', '_gat'];

		cookiesToClear.forEach((cookieName) => {
			document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
	}

	// Get analytics data (for reporting)
	getAnalyticsData() {
		return {
			isInitialized: this.isInitialized,
			config: this.config,
			queueLength: this.queue.length,
		};
	}
}

// Initialize analytics manager
document.addEventListener('DOMContentLoaded', function () {
	window.analyticsManager = new AnalyticsManager();

	// Auto-initialize if cookies are already accepted
	if (window.cookieManager && window.cookieManager.hasConsented()) {
		window.analyticsManager.initialize();
	}
});

// Global function for external tracking
window.trackEvent = function (action, category, label, value) {
	if (window.analyticsManager) {
		window.analyticsManager.trackEvent(action, category, label, value);
	}
};
