// Parallax Effect System - Fixed Background Version
class ParallaxController {
	constructor() {
		this.background = document.querySelector('.parallax-background');
		this.isActive = false; // Disabled for fixed background

		this.init();
	}

	init() {
		// For fixed background, we don't need parallax effects
		// Just ensure the background is properly positioned
		if (this.background) {
			this.setFixedBackground();
		}
	}

	setFixedBackground() {
		if (!this.background) return;

		// Ensure background stays fixed
		this.background.style.position = 'fixed';
		this.background.style.backgroundAttachment = 'fixed';
		this.background.style.transform = 'none';
		this.background.style.willChange = 'auto';
	}

	// Disabled methods for fixed background
	updateParallax() {
		// No parallax movement for fixed background
		return;
	}

	destroy() {
		// Nothing to clean up for fixed background
		return;
	}

	pause() {
		// No active effects to pause
		return;
	}

	resume() {
		// No active effects to resume
		return;
	}
}

// Intersection Observer for performance optimization
class ParallaxObserver {
	constructor(parallaxController) {
		this.parallaxController = parallaxController;
		this.observer = null;
		this.init();
	}

	init() {
		if (!('IntersectionObserver' in window)) {
			return; // Fallback for older browsers
		}

		this.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.parallaxController.resume();
					} else {
						this.parallaxController.pause();
					}
				});
			},
			{
				rootMargin: '50px', // Start observing 50px before element enters viewport
			}
		);

		// Observe the parallax background
		const background = document.querySelector('.parallax-background');
		if (background) {
			this.observer.observe(background);
		}
	}

	destroy() {
		if (this.observer) {
			this.observer.disconnect();
		}
	}
}

// Initialize parallax system
document.addEventListener('DOMContentLoaded', function () {
	// Only initialize if parallax background exists
	if (document.querySelector('.parallax-background')) {
		window.parallaxController = new ParallaxController();
		window.parallaxObserver = new ParallaxObserver(window.parallaxController);
	}
});

// Handle page visibility change for performance
document.addEventListener('visibilitychange', function () {
	if (window.parallaxController) {
		if (document.hidden) {
			window.parallaxController.pause();
		} else {
			window.parallaxController.resume();
		}
	}
});

// Clean up on page unload
window.addEventListener('beforeunload', function () {
	if (window.parallaxController) {
		window.parallaxController.destroy();
	}
	if (window.parallaxObserver) {
		window.parallaxObserver.destroy();
	}
});
