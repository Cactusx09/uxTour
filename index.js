//
// uxTour.js v0.2.3
//
// https://github.com/lyngbach/uxTour
//
// Copyright 2016, Rune Lyngbach Jensen
// Email: lyngbachjensen@gmail.com
//
// licensed under MIT

class uxTour {
	constructor(options) {
		this.options = options || {};
		this.options.padding = this.options.padding || 16;
		this.options.opacity = this.options.opacity || 0.7;
		this.options.color = this.hex2rgb(this.options.color || '#000000');
		this.options.buttonText = this.options.buttonText || 'GOT IT';
		this.options.frame = this.options.frame || 'circle';
		this.options.offset = this.options.offset || 100;

		this.resizeTimeout;
		this.rgba = 'rgba(' + this.options.color.r + ', ' + this.options.color.g + ', ' + this.options.color.b + ', 0)';

		this.onBrowserResize = function () {
			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(this.adjust.bind(this), 150);
		};

		window.onresize = this.onBrowserResize.bind(this);
	}

	start(tour) {
		if (tour === undefined) {
			console.error('uxTour missing tour argument in start method');
			return false;
		}

		if (tour.steps === undefined) {
			console.error('uxTour missing steps array property on tour object');
			return false;
		}

		this.tour = tour;

		if (document.getElementById('uxOverlay') === null) {
			this.overlay = document.createElement('div');
			this.highlight = document.createElement('div');
			this.tooltip = document.createElement('div');
			this.paragraph = document.createElement('p');
			this.gotIt = document.createElement('button');

			this.overlay.id = 'uxOverlay';
			this.overlay.style.cssText = 'position: fixed; z-index: 99999990; top: 0; left: 0; width: 100%; height: 100%;';

			this.highlight.id = 'uxHighlight';
			this.highlight.style.cssText = 'position: absolute; z-index: 99999999; border-radius: ' + (this.options.frame === 'circle' ? '50' : '0') + '%; box-shadow: 0 0 0 999px ' + this.rgba + '; top: 0; left: 0; ' + this.getPrefix().css + 'transition: 0.3s ease;';
			this.highlight.style.padding = this.options.padding + 'px';

			this.tooltip.id = 'uxTooltip';
			this.tooltip.style.cssText = 'position: absolute; z-index: 999999991; width: 300px; max-width: 100%; padding: 8px; #FFF; opacity: 0; font-size: 16px; left: 50%; ' + this.getPrefix().css + 'transform: translateX(-50%); ' + this.getPrefix().css + 'transition: 0.3s ease;';

			this.id = 'uxParagraph';
			this.paragraph.style.cssText = 'color: #FFF;';

			this.gotIt.id = 'uxGotIt';
			this.gotIt.style.cssText = 'border: none; background: none; color: #FFF; padding: 0; outline: none; font-size: 16px; cursor: pointer;';
			this.gotIt.innerHTML = this.options.buttonText;

			this.tooltip.appendChild(this.paragraph);
			this.tooltip.appendChild(this.gotIt);
		}

		this.prepare();
	}

	prepare() {
		this.currentStep = 0;

		if (document.getElementById('uxOverlay') === null) {
			document.body.appendChild(this.overlay);

			this.overlay.addEventListener('click', this.close.bind(this), false);
		}

		if (document.getElementById('uxHighlight') === null) {
			document.body.appendChild(this.highlight);

			this.highlight.addEventListener('click', this.close.bind(this), false);
		}

		if (document.getElementById('uxTooltip') === null) {
			document.body.appendChild(this.tooltip);

			this.gotIt.addEventListener('click', this.showStep.bind(this), false);
		}

		setTimeout(this.fadeIn.bind(this), 10);

		this.showStep();
	}

	showStep() {
		const step = this.tour.steps[this.currentStep];
		const browser = this.getPrefix();
		const prefix = (browser.dom === 'Moz' ? browser.js : browser.lowercase);
		const documentBody = (browser.lowercase === 'webkit' ? document.body : document.documentElement);
		let padding;
		let element;
		let rect;
		let marginTop;
		let marginLeft;

		if (step === undefined) {
			this.close();
		} else {
			padding = (step.padding ? step.padding : this.options.padding);
			element = document.getElementById(step.element);

			step.position = step.position || 'absolute';

			if (element === null) {
				this.currentStep = (this.currentStep += 1);
				this.showStep();

				return false;
			}

			rect = element.getBoundingClientRect();

			if (rect.top === 0 && rect.right === 0 && rect.bottom === 0 && rect.left === 0) {
				this.currentStep = (this.currentStep += 1);
				this.showStep();

				return false;
			}

			marginTop = rect.height / 2;
			marginLeft = rect.width / 2;

			if (rect.width > rect.height) {
				this.highlight.style.width = rect.width + 'px';
				this.highlight.style.height = (this.options.frame === 'circle' ? rect.width : rect.height) + 'px';

				if (step.position === 'fixed') {
					this.highlight.style.top = (rect.top - padding + (marginTop + padding)) + 'px';
				} else {
					this.highlight.style.top = (rect.top + window.pageYOffset + marginTop) + 'px';
				}

				this.highlight.style.left = (rect.left + window.pageXOffset - padding) + 'px';
				this.highlight.style[prefix + 'Transform'] = 'translate3d(0, -50%, 0)';
			} else {
				this.highlight.style.width = (this.options.frame === 'circle' ? rect.height : rect.width) + 'px';
				this.highlight.style.height = rect.height + 'px';

				if (step.position === 'fixed') {
					this.highlight.style.top = (rect.top - padding) + 'px';
				} else {
					this.highlight.style.top = (rect.top + window.pageYOffset - padding) + 'px';
				}

				this.highlight.style.left = (rect.left + window.pageXOffset + marginLeft) + 'px';
				this.highlight.style[prefix + 'Transform'] = 'translate3d(-50%, 0, 0)';
			}

			step.offset = step.offset || this.options.offset;

			this.paragraph.innerHTML = step.text;
			this.setText(step);
			this.setStyle(this.highlight, step);

			this.scroll(documentBody, (rect.top + window.pageYOffset - step.offset), 800);

			this.currentStep = (this.currentStep += 1);
		}
	}

	setStyle(element, step) {
		if (step.position) {
			element.style.position = step.position;
		} else {
			element.style.position = 'absolute';
		}
	}

	inViewport(element) {
		const rect = element.getBoundingClientRect();

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
			rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
		);
	}

	close() {
		this.currentStep = 0;
		this.highlight.style.opacity = 0;
		this.tooltip.style.opacity = 0;

		setTimeout(this.fadeOut.bind(this), 300);
	}

	fadeIn() {
		this.boxShadow = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/) ? '1900' : '9999'; // check for safari browser
		this.boxShadow = navigator.userAgent.indexOf('iPad') > -1 ? '893' : this.boxShadow; // check for iPad
		this.tooltip.style.opacity = 1;

		this.highlight.style.boxShadow = '0 0 0 ' + this.boxShadow + 'px rgba(' + this.options.color.r + ', ' + this.options.color.g + ', ' + this.options.color.b + ', ' + this.options.opacity + ')';
	}

	fadeOut() {
		this.overlay.parentNode.removeChild(this.overlay);
		this.highlight.parentNode.removeChild(this.highlight);
		this.tooltip.parentNode.removeChild(this.tooltip);
	}

	setText(step) {
		const elementRect = document.getElementById(step.element).getBoundingClientRect();
		const tooltipRect = this.tooltip.getBoundingClientRect();
		const direction = step.direction || 'bottom';
		const marginTop = (elementRect.width > elementRect.height ? elementRect.width : elementRect.height);

		this.setStyle(this.tooltip, step);

		if (direction === 'top') {
			if (step.position === 'fixed') {
				this.tooltip.style.top = (elementRect.top - marginTop - tooltipRect.height - 50) + 'px';
			} else {
				this.tooltip.style.top = (elementRect.top + window.pageYOffset - (marginTop / 2) - tooltipRect.height - 50) + 'px';
			}
		} else if (direction === 'bottom') {
			if (step.position === 'fixed') {
				this.tooltip.style.top = (elementRect.top + elementRect.height + 50) + 'px';
			} else {
				this.tooltip.style.top = (elementRect.top + window.pageYOffset + marginTop + 50) + 'px';
			}
		} else {
			if (step.position === 'fixed') {
				this.tooltip.style.top = (elementRect.top + elementRect.height + 50) + 'px';
			} else {
				this.tooltip.style.top = (elementRect.top + window.pageYOffset + marginTop + 50) + 'px';
			}
		}
	}

	scroll(element, to, duration) {
		const start = element.scrollTop;
		const change = to - start;
		const increment = 20;
		let position;

		const animateScroll = (elapsedTime) => {
			elapsedTime += increment;
			position = this.easeInOut(elapsedTime, start, change, duration);
			element.scrollTop = position;

			if (elapsedTime < duration) {
				setTimeout(() => {
					animateScroll(elapsedTime);
				}, increment);
			}
		};

		animateScroll(0);
	}

	easeInOut(currentTime, start, change, duration) {
		currentTime /= duration / 2;

		if (currentTime < 1) {
			return change / 2 * currentTime * currentTime + start;
		}

		currentTime -= 1;

		return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
	}

	hex2rgb(color) {
		let r, g, b;

		if (color.charAt(0) == '#') {
			color = color.substr(1);
		}

		r = color.charAt(0) + '' + color.charAt(1);
		g = color.charAt(2) + '' + color.charAt(3);
		b = color.charAt(4) + '' + color.charAt(5);

		r = parseInt(r, 16);
		g = parseInt(g, 16);
		b = parseInt(b, 16);

		return {
			r: r,
			g: g,
			b: b
		};
	}

	adjust() {
		if (document.getElementById('uxOverlay') !== null && this.currentStep !== undefined) {
			this.currentStep = (this.currentStep - 1);
			this.showStep();
		}
	}

	getPrefix() {
		const styles = window.getComputedStyle(document.documentElement, '');

		let pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
		let dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];

		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: pre[0].toUpperCase() + pre.substr(1)
		};
	}
};

module.exports = uxTour;
