// Main Application JavaScript
class LandingPageApp {
	constructor() {
		this.isLoaded = false;
		this.init();
	}

	init() {
		// Wait for DOM to be ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
		} else {
			this.onDOMReady();
		}

		// Setup page load handlers
		window.addEventListener('load', () => this.onPageLoad());
		window.addEventListener('beforeunload', () => this.onPageUnload());
	}

	onDOMReady() {
		console.log('Landing page app initialized');

		// Initialize smooth scrolling
		this.initSmoothScrolling();

		// Initialize accessibility features
		this.initAccessibility();

		// Initialize performance monitoring
		this.initPerformanceMonitoring();

		// Initialize error handling
		this.initErrorHandling();

		// Initialize service worker (if available)
		this.initServiceWorker();
	}

	onPageLoad() {
		this.isLoaded = true;

		// Track page load performance
		this.trackPerformance();

		// Initialize lazy loading for future images
		this.initLazyLoading();

		// Setup intersection observers
		this.initIntersectionObservers();
	}

	onPageUnload() {
		// Clean up resources
		this.cleanup();
	}

	initSmoothScrolling() {
		// Smooth scroll for anchor links
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener('click', (e) => {
				e.preventDefault();

				const href = anchor.getAttribute('href');

				// Check if href is valid (not just '#' or empty)
				if (!href || href === '#' || href.length <= 1) {
					console.warn('Invalid anchor href:', href);
					return;
				}

				try {
					const target = document.querySelector(href);
					if (target) {
						target.scrollIntoView({
							behavior: 'smooth',
							block: 'start',
						});
					} else {
						console.warn('Target element not found for selector:', href);
					}
				} catch (error) {
					console.error('Invalid selector for smooth scrolling:', href, error);
				}
			});
		});
	}

	initAccessibility() {
		// Handle keyboard navigation
		document.addEventListener('keydown', (e) => {
			// Close cookie banner on Escape
			if (e.key === 'Escape') {
				const cookieBanner = document.getElementById('cookieBanner');
				if (cookieBanner && cookieBanner.classList.contains('show')) {
					if (window.cookieManager) {
						window.cookieManager.declineCookies();
					}
				}
			}
		});

		// Improve focus visibility
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Tab') {
				document.body.classList.add('keyboard-navigation');
			}
		});

		document.addEventListener('mousedown', () => {
			document.body.classList.remove('keyboard-navigation');
		});

		// Skip link functionality
		const skipLink = document.querySelector('.skip-link');
		if (skipLink) {
			skipLink.addEventListener('click', (e) => {
				e.preventDefault();

				const href = skipLink.getAttribute('href');

				// Validate href before using querySelector
				if (!href || href === '#' || href.length <= 1) {
					console.warn('Invalid skip link href:', href);
					return;
				}

				try {
					const target = document.querySelector(href);
					if (target) {
						target.focus();
						target.scrollIntoView();
					} else {
						console.warn('Skip link target not found:', href);
					}
				} catch (error) {
					console.error('Invalid selector for skip link:', href, error);
				}
			});
		}
	}

	initPerformanceMonitoring() {
		// Monitor Core Web Vitals
		if ('web-vital' in window) {
			// This would work with the web-vitals library
			// You can add it via CDN if needed
		}

		// Monitor resource loading
		this.monitorResourceLoading();

		// Monitor memory usage (if available)
		if ('memory' in performance) {
			setTimeout(() => {
				try {
					const memInfo = performance.memory;
					if (window.trackEvent) {
						window.trackEvent(
							'memory_usage',
							'performance',
							'heap_used',
							Math.round(memInfo.usedJSHeapSize / 1024 / 1024)
						);
					}
				} catch (error) {
					console.warn('Memory monitoring not available:', error);
				}
			}, 5000);
		}
	}

	monitorResourceLoading() {
		// Monitor image loading
		document.querySelectorAll('img').forEach((img) => {
			img.addEventListener('load', () => {
				if (window.trackEvent) {
					window.trackEvent('image_load', 'performance', img.src, 1);
				}
			});

			img.addEventListener('error', () => {
				console.warn('Failed to load image:', img.src);
				if (window.trackEvent) {
					window.trackEvent('image_error', 'error', img.src, 1);
				}
			});
		});
	}

	initErrorHandling() {
		// Global error handler
		window.addEventListener('error', (e) => {
			console.error('JavaScript error:', e.error);

			if (window.trackEvent) {
				window.trackEvent('javascript_error', 'error', e.message, 1);
			}
		});

		// Promise rejection handler
		window.addEventListener('unhandledrejection', (e) => {
			console.error('Unhandled promise rejection:', e.reason);

			if (window.trackEvent) {
				window.trackEvent('promise_rejection', 'error', e.reason.toString(), 1);
			}
		});
	}

	initServiceWorker() {
		if ('serviceWorker' in navigator) {
			window.addEventListener('load', () => {
				navigator.serviceWorker
					.register('/sw.js')
					.then((registration) => {
						console.log('ServiceWorker registration successful');
						if (window.trackEvent) {
							window.trackEvent('sw_registered', 'pwa', 'success', 1);
						}
					})
					.catch((err) => {
						console.log('ServiceWorker registration failed:', err);
						if (window.trackEvent) {
							window.trackEvent('sw_registration_failed', 'pwa', 'error', 1);
						}
					});
			});
		}
	}

	initLazyLoading() {
		// Intersection Observer for lazy loading (future images)
		if ('IntersectionObserver' in window) {
			try {
				const lazyImageObserver = new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const img = entry.target;
							if (img.dataset.src) {
								img.src = img.dataset.src;
								img.classList.remove('lazy');
								lazyImageObserver.unobserve(img);
							}
						}
					});
				});

				document.querySelectorAll('img[data-src]').forEach((img) => {
					lazyImageObserver.observe(img);
				});
			} catch (error) {
				console.warn('Lazy loading observer failed to initialize:', error);
			}
		}
	}

	initIntersectionObservers() {
		// Observe main sections for analytics
		if ('IntersectionObserver' in window) {
			try {
				const sectionObserver = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								const sectionName = entry.target.id || entry.target.className || 'unnamed-section';
								if (window.trackEvent) {
									window.trackEvent('section_view', 'engagement', sectionName, 1);
								}
							}
						});
					},
					{
						threshold: 0.5, // Trigger when 50% of section is visible
					}
				);

				// Observe main sections
				const sections = document.querySelectorAll('header, main, section, .content-card');
				sections.forEach((section) => {
					sectionObserver.observe(section);
				});
			} catch (error) {
				console.warn('Section observer failed to initialize:', error);
			}
		}
	}

	trackPerformance() {
		try {
			// Track page load time
			const navigation = performance.getEntriesByType('navigation')[0];
			if (navigation) {
				const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
				const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

				if (window.trackEvent) {
					window.trackEvent('page_load_time', 'performance', 'total', Math.round(loadTime));
					window.trackEvent('dom_content_loaded', 'performance', 'time', Math.round(domContentLoaded));
				}
			}

			// Track largest contentful paint (if available)
			if ('PerformanceObserver' in window) {
				try {
					const observer = new PerformanceObserver((list) => {
						const entries = list.getEntries();
						const lastEntry = entries[entries.length - 1];

						if (window.trackEvent && lastEntry) {
							window.trackEvent('lcp', 'performance', 'time', Math.round(lastEntry.startTime));
						}
					});

					observer.observe({ entryTypes: ['largest-contentful-paint'] });
				} catch (e) {
					console.warn('LCP tracking not supported:', e);
				}
			}
		} catch (error) {
			console.warn('Performance tracking failed:', error);
		}
	}

	// Enhanced querySelector with validation
	safeQuerySelector(selector) {
		if (!selector || selector === '#' || selector.trim() === '') {
			console.warn('Invalid selector provided:', selector);
			return null;
		}

		try {
			return document.querySelector(selector);
		} catch (error) {
			console.error('Invalid selector:', selector, error);
			return null;
		}
	}

	// Enhanced querySelectorAll with validation
	safeQuerySelectorAll(selector) {
		if (!selector || selector === '#' || selector.trim() === '') {
			console.warn('Invalid selector provided:', selector);
			return [];
		}

		try {
			return document.querySelectorAll(selector);
		} catch (error) {
			console.error('Invalid selector:', selector, error);
			return [];
		}
	}

	// Utility methods
	debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	throttle(func, limit) {
		let inThrottle;
		return function () {
			const args = arguments;
			const context = this;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => (inThrottle = false), limit);
			}
		};
	}

	// Device detection
	isMobile() {
		return window.innerWidth <= 768;
	}

	isTablet() {
		return window.innerWidth > 768 && window.innerWidth <= 1024;
	}

	isDesktop() {
		return window.innerWidth > 1024;
	}

	// Browser detection
	getBrowserInfo() {
		const ua = navigator.userAgent;
		let browser = 'Unknown';

		if (ua.includes('Chrome')) browser = 'Chrome';
		else if (ua.includes('Firefox')) browser = 'Firefox';
		else if (ua.includes('Safari')) browser = 'Safari';
		else if (ua.includes('Edge')) browser = 'Edge';

		return {
			name: browser,
			userAgent: ua,
			language: navigator.language,
			platform: navigator.platform,
		};
	}

	// Validator for selectors
	isValidSelector(selector) {
		if (!selector || typeof selector !== 'string') {
			return false;
		}

		// Basic validation - selector should not be just '#' or empty
		if (selector.trim() === '' || selector === '#') {
			return false;
		}

		// Try to use the selector
		try {
			document.querySelector(selector);
			return true;
		} catch (error) {
			return false;
		}
	}

	cleanup() {
		// Cleanup resources before page unload
		try {
			if (window.particleSystem && typeof window.particleSystem.destroy === 'function') {
				window.particleSystem.destroy();
			}

			if (window.parallaxController && typeof window.parallaxController.destroy === 'function') {
				window.parallaxController.destroy();
			}
		} catch (error) {
			console.warn('Cleanup error:', error);
		}
	}
}

// Initialize the main application with error handling
try {
	window.landingPageApp = new LandingPageApp();
} catch (error) {
	console.error('Failed to initialize landing page app:', error);
}

// Export utility functions globally
window.utils = {
	debounce: window.landingPageApp ? window.landingPageApp.debounce : null,
	throttle: window.landingPageApp ? window.landingPageApp.throttle : null,
	isMobile: () => (window.landingPageApp ? window.landingPageApp.isMobile() : window.innerWidth <= 768),
	isTablet: () =>
		window.landingPageApp ? window.landingPageApp.isTablet() : window.innerWidth > 768 && window.innerWidth <= 1024,
	isDesktop: () => (window.landingPageApp ? window.landingPageApp.isDesktop() : window.innerWidth > 1024),
	getBrowserInfo: () => (window.landingPageApp ? window.landingPageApp.getBrowserInfo() : { name: 'Unknown' }),
	safeQuerySelector: (selector) => (window.landingPageApp ? window.landingPageApp.safeQuerySelector(selector) : null),
	safeQuerySelectorAll: (selector) =>
		window.landingPageApp ? window.landingPageApp.safeQuerySelectorAll(selector) : [],
	isValidSelector: (selector) => (window.landingPageApp ? window.landingPageApp.isValidSelector(selector) : false),
};

// Add keyboard navigation styles
const keyboardStyles = `
.keyboard-navigation *:focus {
    outline: 2px solid #4A90E2 !important;
    outline-offset: 2px !important;
}

.keyboard-navigation .modal-close:focus,
.keyboard-navigation .btn:focus,
.keyboard-navigation .cookie-btn:focus {
    outline: 2px solid #504670 !important;
    outline-offset: 2px !important;
}

.keyboard-navigation .privacy-link:focus,
.keyboard-navigation a:focus {
    outline: 2px solid #504670 !important;
    outline-offset: 2px !important;
    border-radius: 2px;
}
`;

try {
	const styleSheet = document.createElement('style');
	styleSheet.textContent = keyboardStyles;
	document.head.appendChild(styleSheet);
} catch (error) {
	console.warn('Failed to add keyboard navigation styles:', error);
}

// Global error handler for unhandled errors
window.addEventListener('error', (e) => {
	console.error('Global JavaScript error:', {
		message: e.message,
		filename: e.filename,
		lineno: e.lineno,
		colno: e.colno,
		error: e.error,
	});
});

// Add debugging helpers
window.debugLandingPage = function () {
	console.log('Landing Page Debug Info:', {
		app: !!window.landingPageApp,
		isLoaded: window.landingPageApp ? window.landingPageApp.isLoaded : false,
		cookieManager: !!window.cookieManager,
		analyticsManager: !!window.analyticsManager,
		modalManager: !!window.modalManager,
		utils: !!window.utils,
	});
};
