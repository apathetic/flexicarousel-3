/*
 * flexicarousel 2
 * https://github.com/apathetic/flexicarousel-2
 *
 * Copyright (c) 2013 Wes Hatch
 * Licensed under the MIT license.
 *
 */

/*jslint eqeq:true, browser:true, debug:true, evil:false, devel:true, smarttabs:true, immed:false */


var Carousel = function(container, options){

	this.el = container;

	// default options
	// --------------------
	this.defaults = {
		activeClass: 'active',
		beforeClass: 'before',
		afterClass: 'after',
		slideWrap: '.wrap',			// for binding touch events
		slides: 'li',
		infinite: true
	};

	// state vars
	// --------------------
	this.current = 0;
	this.slides = [];
	this.sliding = false;

	// touch vars
	// --------------------
	this.dragging = false;
	this.dragThreshold = 40;	// 100
	this.width = 0;

	// browser capabilities
	// --------------------
	this.isTouch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
	this.transitionEnd = (function(){
		var t,
			el = document.createElement('fake'),
			transitions = {
				'transition': 'transitionend',
				'OTransition': 'oTransitionEnd otransitionend',
				'MozTransition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			};
		for(t in transitions){
			if( el.style[t] !== undefined ){ return transitions[t]; }
		}
		return false;
	})();
	//this.transform = (function(){
	//	var transforms = 'transform WebkitTransform MozTransform OTransform'.split(' '),
	//		i = transforms.length,
	//		el = document.createElement('fake');

	//	for (i; --i;) {
	//		if ( el.style[ transforms[i] ] !== undefined) { return transforms[i]; }
	//	}
	//	return false;
	//})();

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

		this.options = this._extend( this.defaults, options );

		if ( !(this.slideWrap = this.el.querySelector(this.options.slideWrap)) ) { return; }	// note: assignment
		if ( !(this.slides = this.slideWrap.children) ) { return; }								// note: assignment

		if (this.slides.length < 3) { this.options.infinite = false; }							// need at least 3 slides for this to work

		this._setIndices(0);

		this._addClass( this.before, this.options.beforeClass);
		this._addClass( this.current, this.options.activeClass );
		this._addClass( this.after, this.options.afterClass );

		// mobile-only setup
		if ( this.options.noTouch === undefined && this.isTouch ) {								// [TODO] this condition
			this.slideWrap.addEventListener('touchstart',	this._dragStart.bind(this));
			this.slideWrap.addEventListener('touchmove',	this._drag.bind(this));
			this.slideWrap.addEventListener('touchend',		this._dragEnd.bind(this));

			// for touch (ie. resize listener is not necessary)
			this.width = this.slideWrap.offsetWidth;
			this._orientationChange = function() { this.width = this.slideWrap.offsetWidth; }
			window.addEventListener('orientationchange', this._orientationChange.bind(this));
		}

		return this;
	},

	/**
	 * Go to the next slide
	 * @return {void}
	 */
	next: function() {
		if (this.after !== null && !this.sliding) {
			this._addClass( this.current, this.options.beforeClass );
			this._move(this.current + 1);
		}
	},

	/**
	 * Go to the previous slide
	 * @return {void}
	 */
	prev: function() {
		if (this.before !== null && !this.sliding) {
			this._addClass( this.current, this.options.afterClass );
			this._move(this.current - 1);
		}
	},

	/**
	 * Go to a particular slide. Prime the "to" slide by positioning it, and then calling _move()
	 * @param  {int} to Slide to display
	 * @return {void}
	 */
	go: function(to) {

		var direction;

		to = Math.max( Math.min(this.slides.length-1, to), 0);							// check bounds
		if (to == this.current || this.sliding) { return; }								// dont do nuthin if we dont need to

		direction = Math.abs(this.current - to) / (this.current - to);					// determine direction:  1: backward, -1: forward. Do this before we % it

		// prime the slides: position the ones we're going to and moving from
		if (direction > 0) {
			this._addClass( to, this.options.beforeClass );
			this._removeClass( to, this.options.afterClass );							// edge case, going from last to first
			this._addClass( this.current, this.options.afterClass );					// this slide will not move just yet, so long as "active" is also present
		} else {
			this._addClass( to, this.options.afterClass );
			this._addClass( this.current, this.options.beforeClass );
		}

		// force a repaint to actually position "to" slide. *Important*
		this.slides[ to ].offsetHeight;	// jshint ignore:line

		this._move(to);
	},

	// ------------------------------------- "private" starts here ------------------------------------- //

	/**
	 * Start the carousel animation
	 * @return {[type]} [description]
	 */
	_move: function(to) {

		var c;

		to = this._loop(to);

		if (this.options.beforeSlide) { this.options.beforeSlide(to, this.current); }	// note: doesn't check if is a function

		// start the transition
		this._addClass( to, 'animate' );
		this._addClass( this.current, 'animate' );
		this._removeClass( this.current, this.options.activeClass );
		this._addClass( to, this.options.activeClass );

		this._removeClass( to, this.options.beforeClass );
		this._removeClass( to, this.options.afterClass );

		// end the transition. NOTE: if this isn't firing, check your CSS
		if (this.transitionEnd) {
			c = this;

			this.slides[ to ].addEventListener(c.transitionEnd, function end(){
				this.removeEventListener(c.transitionEnd, end);							// don't keep any unnec. event listeners around
				c._moveEnd(to);
			});

			this.sliding = true;
		} else {
			this._moveEnd(to);
		}
	},

	/**
	 * [ description]
	 * @return {[type]} [description]
	 */
	_moveEnd: function(to) {
		this._removeClass( to, 'animate' );
		this._removeClass( this.current, 'animate' );

		// update indices
		this._setIndices(to);

		// position the new before and after slides
		this._addClass( this.before, this.options.beforeClass );
		this._addClass( this.after, this.options.afterClass );

		// remove stragglers. edge cases
		this._removeClass( this.before, this.options.afterClass );
		this._removeClass( this.after, this.options.beforeClass );

		if (this.options.afterSlide) { this.options.afterSlide(this.current); }

		this.sliding = false;
	},

	/**
	 * Start dragging (via touch)
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_dragStart: function(e) {

		if (this.sliding) {
			return false;
		}

		if (e.touches) {
			e = e.touches[0];
		}

		this.dragThresholdMet = false;
		this.dragging = true;
		this.cancel = false;
		this.startClientX = e.clientX;
		this.startClientY = e.clientY;
	},

	/**
	 * Update slides positions according to user's touch
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_drag: function(e) {
		var abs = Math.abs;		// helper var

		if (!this.dragging || this.cancel) {
			return;
		}

		this.deltaX = e.touches[0].clientX - this.startClientX;
		this.deltaY = e.touches[0].clientY - this.startClientY;




		// determine if we should do slide, or cancel and let the event pass through to the page
		if (this.dragThresholdMet || abs(this.deltaX) > abs(this.deltaY) && (abs(this.deltaX) > this.dragThreshold)) {
			this.dragThresholdMet = true;
			e.preventDefault();
		} else if ((abs(this.deltaY) > abs(this.deltaX)) && (abs(this.deltaY) > this.dragThreshold)) {
			this.cancel = true;
			return;
		}
		// old way:
		// if (this.delta > this.dragThreshold) {
		// 	e.preventDefault();
		// }





		// at the beginning going more beginninger, or at the end going more ender-er
		// if (this.before === null && e.clientX > this.startClientX) || (this.after === null && e.clientX < this.startClientX)) {
		//  this.touchPixelRatio = 3;	// "elastic" effect where slide will drag 1/3 of the distance swiped
		// } else {
			 this.touchPixelRatio = 1;
		// }

		this.pixelOffset = this.deltaX / this.touchPixelRatio;
		this._translate( this.before, (this.pixelOffset - this.width) );
		this._translate( this.current, this.pixelOffset);
		this._translate( this.after,  (this.pixelOffset + this.width) );

	},

	/**
	 * Drag end, calculate slides' new positions
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_dragEnd: function(e) {
		var i, to;

		if (!this.dragging) {
			return;
		}

		this.dragging = false;

		if (this.deltaX < 0) {
			if ( Math.abs(this.deltaX) < this.dragThreshold || this.after === null ) {
				// set the "to" to be the after slide so that it snaps-back as well
				to = this.current;
				this.current = this.after;
				this._move(to);
			}
			else {
				this.next();
			}
		}
		else if (this.deltaX > 0) {
			if ( this.deltaX < this.dragThreshold || this.before === null ) {
				to = this.current;
				this.current = this.before;
				this._move(to);
			}
			else {
				this.prev();
			}
		}



		// for (i = this.slides.length; i--;) {
		// 	this.slides[i].style.webkitTransform = '';
		// }
		var c = this;
		setTimeout(function(){
			for (i = c.slides.length; i--;) {
				c.slides[i].style.webkitTransform = '';
			}
		}, 1);
	},

	/**
	 * Destroy carousel
	 * @return {void}
	 */
	_destroy: function() {
		console.log('destroy', this);
		// reset slides
		this._moveEnd(0);

		// remove listeners
		this.slideWrap.removeEventListener('touchstart', this._dragStart);
		this.slideWrap.removeEventListener('touchmove', this._drag);
		this.slideWrap.removeEventListener('touchend', this._dragEnd);
		window.removeEventListener('orientationchange', this._orientationChange);

		// cleanup ...??
		this.el = null;
		this.defaults = null;
		this.options = null;
		this.slides = null;
		this.slideWrap = null;
	},

	// ------------------------------------- "helper" functions ------------------------------------- //

	/**
	 * [ description]
	 * @param  {[type]} to [description]
	 * @return {[type]}    [description]
	 */
	_setIndices: function(to) {
		this.current = to;
		this.before = (!this.options.infinite && this.current === 0) ? null : this._loop(to - 1);
		this.after  = (!this.options.infinite && this.current == this.slides.length-1) ? null : this._loop(to + 1);
	},

	/**
	 * Helper function. Calculate modulo of a slides position
	 * @param  {int} val Slide's position
	 * @return {int} the index modulo the # of slides
	 */
	_loop: function(val) {
		return (this.slides.length + (val % this.slides.length)) % this.slides.length;
	},

	/**
	 * Helper function to add a class to an element
	 * @param  {int} i    Index of the slide to add a class to
	 * @param  {string} name Class name
	 * @return {void}
	 */
	_addClass: function(i, name) {
		var el;
		if (i === null) { return; }
		el = this.slides[i];
		if (el.classList) { el.classList.add(name); }
		else {el.className += ' ' + name; }
	},

	/**
	 * Helper function to remove a class from an element
	 * @param  {int} i    Index of the slide to remove class from
	 * @param  {string} name Class name
	 * @return {void}
	 */
	_removeClass: function(i, name) {
		var el;
		if (i === null) { return; }
		el = this.slides[i];
		if (el.classList) { el.classList.remove(name); }
		else { el.className = el.className.replace(new RegExp('(^|\\b)' + name.split(' ').join('|') + '(\\b|$)', 'gi'), ' '); }
	},

	/**
	 * Helper function to translate slide in browser
	 * @param  {[type]} el     [description]
	 * @param  {[type]} offset [description]
	 * @return {[type]}        [description]
	 */
	_translate: function(i, offset) {
		if (i === null) { return; }
		this.slides[ i ] .style.webkitTransform = 'translate(' + offset + 'px, 0)';
	},

	/**
	 * Helper function. Simple way to merge objects
	 * @param  {object} obj A list of objects to extend
	 * @return {object}     The extended object
	 */
	_extend: function(obj) {
		// Array.prototype.slice.call(arguments, 1).forEach(function (source) {		// > IE8
		// 	if (source) {
		// 		for (var prop in source) {
		// 			obj[prop] = source[prop];
		// 		}
		// 	}
		// });
		// return obj;

		var args = Array.prototype.slice.call(arguments, 1);						// >= IE8
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


