/*
 * carousel ten billion
 * https://github.com/apathetic/flexicarousel-3
 *
 * Copyright (c) 2013 Wes Hatch
 * Licensed under the MIT license.
 *
 */


/*
	TODO:
	---------------
	* loses drag if you go beyond container

 */


var Carousel = function(container, options){

	this.handle = container;

	// default options
	// --------------------
	this.defaults = {
		activeClass: 'active',
		slideWrap: 'ul',			// for binding touch events
		slides: 'li',				// the slide
		infinite: true,				// infinite scrolling or not
		display: 1,					// if infinite, the # of slides to "view ahead" ie. position offscreen
		disableDragging: false
	};

	// state vars
	// --------------------
	this.current = 0;
	this.slides = [];
	this.sliding = false;

	// touch vars
	// --------------------
	this.dragging = false;
	this.dragThreshold = 50;
	this.deltaX = 0;

	// browser capabilities
	// --------------------
	this.isTouch = 'ontouchend' in document;

	// feature detection
	// --------------------
	// this.transform = (function(){
	// 	var transforms = ['transform','webkitTransform','MozTransform','OTransform'],
	// 		i = transforms.length,
	// 		el = document.createElement('fake');

	// 	for (i; --i;) {
	// 		// note: we don't test "ms" prefix, (as that gives us IE9 which doesn't support transforms3d anyway. IE10 test will work with "transform")
	// 		if ( el.style[ transforms[i] ] !== undefined) { return transforms[i]; }
	// 	}
	// 	return false;
	// })();

	var style = document.body.style;
	var tests = {
		 'transform':'transitionend',
		 'OTransform': 'oTransitionEnd',
		 'MozTransform': 'transitionend',
		 'webkitTransform': 'webkitTransitionEnd'
	};
	// note: we don't test "ms" prefix, (as that gives us IE9 which doesn't support transforms3d anyway. IE10 test will work with "transform")
	for (var x in tests) {
		if ( style[x] !== undefined) {
			this.transform = x;
			this.transition = tests[x];
			break;
		}
	}

	// engage engines
	// --------------------
	this.init(options);

};

Carousel.prototype = {

	/**
	 * Initialize the carousel and set some defaults
	 * @param  {object} options List of key: value options
	 * @return {void}
	 */
	init: function(options){

		// set up options
		this.options = this._extend( this.defaults, options );

		// find carousel elements
		if ( !(this.slideWrap	= this.handle.querySelector(this.options.slideWrap)) ) { return; }		// note: assignment
		if ( !(this.slides		= this.slideWrap.querySelectorAll(this.options.slides)) ) { return; }	// note: assignment

		this.numSlides = this.slides.length;
		this.width = this.slideWrap.offsetWidth;											// for first drag

		// check if we have sufficient slides to make a carousel
		if ( this.numSlides < this.options.display ) { this.sliding = true; return; }		// this.sliding deactivates carousel. I will better-ify this one day. Maybe "this.active" ?
		if ( this.options.infinite ) { this._cloneEndSlides(this.options.display); }

		// add active class
		this._addClass( this.slides[0], this.options.activeClass );

		// set up Events
		if ( ! this.options.disableDragging) {
			// mobile-only setup
			if ( this.isTouch ) {
				this.slideWrap.addEventListener('touchstart', this._dragStart.bind(this));
				this.slideWrap.addEventListener('touchmove', this._drag.bind(this));
				this.slideWrap.addEventListener('touchend', this._dragEnd.bind(this));
				this.slideWrap.addEventListener('touchcancel', this._dragEnd.bind(this));
			}
			this.slideWrap.addEventListener('mousedown', this._dragStart.bind(this));
			this.slideWrap.addEventListener('mousemove', this._drag.bind(this));
			this.slideWrap.addEventListener('mouseup', this._dragEnd.bind(this));
			this.slideWrap.addEventListener('mouseleave', this._dragEnd.bind(this));
		}

		window.addEventListener('resize', this._updateView.bind(this));
		window.addEventListener('orientationchange', this._updateView.bind(this));

		return this;
	},

	/**
	 * Go to the next slide
	 * @return {void}
	 */
	next: function() {
		// if (!this.sliding && (this.options.infinite || this.current !== this.numSlides-1)) {
		// 	this.go(this.current + 1);
		// }
		if (this.options.infinite || this.current !== this.numSlides-1) {
			this.go(this.current + 1);
		} else {
			this.go(this.numSlides-1);
		}
	},

	/**
	 * Go to the previous slide
	 * @return {void}
	 */
	prev: function() {
		if (this.options.infinite || this.current !== 0) {
			this.go(this.current - 1);
		} else {
			this.go(0);
		}
	},

	/**
	 * Go to a particular slide. Prime the "to" slide by positioning it, and then calling _move()
	 * @param  {int} to Slide to display
	 * @return {void}
	 */
	go: function(to) {

		if ( this.sliding ) { return; }

		if ( to < 0 || to >= this.numSlides ) {									// position the carousel if infinite and at end of bounds
			var temp = (to < 0) ? this.numSlides : -1;
			// this._slide( -(temp * this.width)+'px' );							// skip to beg / end for infinite
			this._slide( -(temp * this.width - this.deltaX)+'px' );
			/* jshint ignore:start */
			this.slideWrap.offsetHeight;										// force a repaint to actually position "to" slide. *Important*
			/* jshint ignore:end */
		}

		to = this._loop(to);
		this._slide( -(to * this.width)+'px', true );							// true is to animate it

		this._removeClass( this.slides[this.current], this.options.activeClass );
		this._addClass( this.slides[to], this.options.activeClass );

		if (this.options.onSlide) { this.options.onSlide(to, this.current); }	// note: doesn't check if is a function

		this.current = to;
		this.deltaX = 0;
	},


	// ------------------------------------- "mobile" starts here ------------------------------------- //


	/**
	 * Start dragging (via touch)
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_dragStart: function(e) {

		var touches;

		if (this.sliding) {
			return false;
		}

		e = e.originalEvent || e;
		touches = e.touches !== undefined ? e.touches : false;

		this.dragThresholdMet = false;
		this.dragging = true;
		this.cancel = false;
		this.startClientX = touches ? touches[0].pageX : e.clientX;
		this.startClientY = touches ? touches[0].pageY : e.clientY;
		this.deltaX = 0;	// reset for the case when user does 0,0 touch
		this.deltaY = 0;	// reset for the case when user does 0,0 touch

		// this._addClass(this.slideWrap, 'no-animation');

		if (e.type === 'mousedown') {
			// do something if dragging?
		}

		// allow dragging to occur on images, links
		if (e.target.tagName === "IMG" || e.target.tagName === "A") { e.target.draggable = false; }
	},

	/**
	 * Update slides positions according to user's touch
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_drag: function(e) {

		var abs = Math.abs,		// helper fn
			touches;

		if (!this.dragging || this.cancel) {
			return;
		}

		e = e.originalEvent || e;
		touches = e.touches !== undefined ? e.touches : false;
		this.deltaX = (touches ? touches[0].pageX : e.clientX) - this.startClientX;
		this.deltaY = (touches ? touches[0].pageY : e.clientY) - this.startClientY;

		// or... cancel if e.clientX / Y is beyond the slideWrap's dimentions

		// determine if we should do slide, or cancel and let the event pass through to the page
		if (this.dragThresholdMet || (abs(this.deltaX) > abs(this.deltaY) && abs(this.deltaX) > 10)) {		// 10 from empirical testing

			e.preventDefault();

			this.dragThresholdMet = true;
			// this._slide( this.slideWrap, this.deltaX);
			this._slide( (this.deltaX + (this.width * -this.current))+'px' );

		} else if ((abs(this.deltaY) > abs(this.deltaX) && abs(this.deltaY) > 10)) {
			this.cancel = true;
		}
	},

	/**
	 * Drag end, calculate slides' new positions
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_dragEnd: function() {

		if (!this.dragging || this.cancel) {
			return;
		}

		this.dragging = false;
		// this._removeClass(this.slideWrap, 'no-animation');

		if ( Math.abs(this.deltaX) < this.dragThreshold ) {
			this.go(this.current);
		}
		else if ( this.deltaX > 0 ) {
			// if (this.deltaX > some_width) this.prev();	// momentum based check to swipe multiple slides?
			this.prev();
		}
		else if ( this.deltaX < 0 ) {
			this.next();
		}
	},


	// ------------------------------------- carousel engine ------------------------------------- //


	/**
	 * Helper function to translate slide in browser
	 * @param  {[type]} el     [description]
	 * @param  {[type]} offset [description]
	 * @return {[type]}        [description]
	 */
	_slide: function(offset, animate) {

		// the alternatives are to manually transition, or to have a "no-transition" class and invert the logic
		if ( animate ) {
			this.sliding = true;
			this._addClass( this.slideWrap, 'animate' );
			this.slideWrap.addEventListener(this.transition, (function(e) {
				this.sliding = false;
				this.slideWrap.removeEventListener(this.transition);
				this._removeClass( this.slideWrap, 'animate' );
			}).bind(this));

			// ...
			// Or, if your css is busted, force removal with a setTimeout:
			// setTimeout(function(){ ... }
		}

		if (this.transform) {
			this.slideWrap.style[this.transform] = 'translate3d(' + offset + ', 0, 0)';
		}
		else {
			this.slideWrap.style.left = offset;
		}
	},


	// ------------------------------------- "helper" functions ------------------------------------- //


	/**
	 * Helper function. Calculate modulo of a slides position
	 * @param  {int} val Slide's position
	 * @return {int} the index modulo the # of slides
	 */
	_loop: function(val) {
		return (this.numSlides + (val % this.numSlides)) % this.numSlides;
	},

	/**
	 * Recalculate container width
	 * @return {[type]} [description]
	 */
	_updateView: function() {
		this.width = this.slideWrap.offsetWidth;

		// this.go(this.current);			// throttle this?
		var self = this;
		clearTimeout(self.timer);
		this.timer = setTimeout(function() { self.go(self.current); }, 300);
	},

	/**
	 * Duplicate the first and last N slides so that infinite scrolling can work
	 * Would ordinarily only need 1 slide duplicated, except for this particular project
	 * where we want to see the outlying slides as well
	 * @return {[type]} [description]
	 */
	_cloneEndSlides: function() {
		var offscreen,
			showing,
			duplicate,
			i;

		showing = this.options.display;			// the number of slides that "hang" off the ends. Normally only need 1 to accommodate transitions
		offscreen = this.options.offscreen + 2 || 2;

		// beginning
		for (i = this.numSlides; i > (this.numSlides - offscreen); i--) {
			duplicate = this.slides[i-1].cloneNode(true);								// cloneNode --> true is deep cloning
			duplicate.removeAttribute('id');
			this._addClass( duplicate, 'clone');
			this.slideWrap.insertBefore(duplicate, this.slideWrap.firstChild);		// add duplicate to beg'n of slides
		}

		// end
		for (i = 0; i < (showing+offscreen-1); i++) {
			duplicate = this.slides[i].cloneNode(true);
			duplicate.removeAttribute('id');
			this._addClass( duplicate, 'clone');
			this.slideWrap.appendChild(duplicate);
		}

		this.slideWrap.style.marginLeft = (-offscreen)+'00%';										// TODO this'll break when IE8 (which uses "left" for sliding)
	},

	/**
	 * Helper function to add a class to an element
	 * @param  {int} i    Index of the slide to add a class to
	 * @param  {string} name Class name
	 * @return {void}
	 */
	_addClass: function(el, name) {
		if (el.classList) { el.classList.add(name); }
		else {el.className += ' ' + name; }
	},

	/**
	 * Helper function to remove a class from an element
	 * @param  {int} i    Index of the slide to remove class from
	 * @param  {string} name Class name
	 * @return {void}
	 */
	_removeClass: function(el, name) {
		if (el.classList) { el.classList.remove(name); }
		else { el.className = el.className.replace(new RegExp('(^|\\b)' + name.split(' ').join('|') + '(\\b|$)', 'gi'), ' '); }
	},

	/**
	 * Helper function. Simple way to merge objects
	 * @param  {object} obj A list of objects to extend
	 * @return {object}     The extended object
	 */
	_extend: function(obj) {
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < args.length; i++) {
			var source = args[i];
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		}
		return obj;
	}

};

