/*! Flexicarousel 2 - v0.3.0 - 2014-03-31
* https://github.com/apathetic/flexicarousel-2
* Copyright (c) 2014 Wes Hatch; Licensed MIT */

/*
 * flexicarousel 2
 * https://github.com/apathetic/flexicarousel-2
 *
 * Copyright (c) 2013 Wes Hatch
 * Licensed under the MIT license.
 *
 */

/*jslint eqeq:true, browser:true, debug:true, evil:false, devel:true, smarttabs:true, immed:false */



// NOTES:
// * still a proof of concept
// * uses ecma5 js (ie. bind, forEach)
// * FIXED: uses non-IE8 friendly class manipulation (ie. classList)
// * mobile tranforms are currently webkit-only
// * FIXED: if mobile and not infinite, can see wrapping slides
// * may want to add a few helper functions, ie. return the number of slides...?
// * will address these items once original idea is flushed out



var Carousel = function(container, options){

	this.el = container;

	// state vars
	// --------------------
	this.current = 0;
	this.slides = [];
	this.sliding = false;
	this.width = 0;
	this.defaults = {
		activeClass: 'active',
		beforeClass: 'before',
		afterClass: 'after',
		slideWrap: '.wrap',			// for binding touch events
		slides: 'li',
		infinite: true
	};

	// touch vars
	// --------------------
	this.delta = 0;
	this.dragging = 0;
	this.startClientX = 0;
	this.pixelOffset = 0;
	this.touchPixelRatio = 1;
	this.dragThreshold = 100;

	// browser capabilities
	// --------------------
	// this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
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

		this.slideWrap = this.el.querySelector(this.options.slideWrap);
		this.slides = this.slideWrap.children;

		if (!this.slideWrap || !this.slides.length) { return; }								// maybe throw an error, here
		if (this.slides.length < 3) { this.options.infinite = false; }						// need at least 3 slides for this to work

		this._setIndices(0);

		this._addClass( this.before, this.options.beforeClass);
		this._addClass( this.current, this.options.activeClass );
		this._addClass( this.after, this.options.afterClass );

		if ( this.options.noTouch === undefined ) {			// [TODO] this condition
			this.slideWrap.addEventListener('touchstart',	this._dragStart.bind(this));		// ecma5 bind
			this.slideWrap.addEventListener('touchmove',	this._drag.bind(this));				// ecma5 bind
			this.slideWrap.addEventListener('touchend',		this._dragEnd.bind(this));			// ecma5 bind
		}
		// this.el.addEventListener('mousedown',		this.dragStart.bind(this));
		// this.el.addEventListener('mousemove',		this.drag.bind(this));
		// this.el.addEventListener('mouseup',			this.dragEnd.bind(this));

		// only need width for touch, so resize listener is not necessary
		this.width = this.slideWrap.offsetWidth;
		// window.addEventListener('resize', function(){
		//  this.width = this.slideWrap.offsetWidth;
		// }.bind(this));


		return this;
	},

	/**
	 * Go to the next slide
	 * @return {void}
	 */
	next: function() {
		if (this.after !== null && !this.sliding) {
			this.slides[ this.current ].classList.add( this.options.beforeClass );
			this._move(this.current + 1);
		}
	},

	/**
	 * Go to the previous slide
	 * @return {void}
	 */
	prev: function() {
		if (this.before !== null && !this.sliding) {
			this.slides[ this.current ].classList.add( this.options.afterClass );
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

		// check bounds
		to = Math.max( Math.min(this.slides.length-1, to), 0);

		// dont do nuthin if we dont need to
		if (to == this.current || this.sliding) { return; }

		// determine direction:  1: backward, -1: forward. Do this before we % it
		direction = Math.abs(this.current - to) / (this.current - to);

		// prime the slides: position the ones we're going to and moving from
		if (direction > 0) {
			// this.slides[ to ].classList.add( this.options.beforeClass, 'no-trans' );
			this._addClass( to, this.options.beforeClass );
			this._removeClass( to, this.options.afterClass );							// edge case, going from last to first
			this._addClass( this.current, this.options.afterClass );					// this slide will not move just yet, so long as "active" is also present
		} else {
			this._addClass( to, this.options.afterClass );
			this._addClass( this.current, this.options.beforeClass );
		}

		// [TODO] experiment with better ways to achieve this
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
		this._removeClass( this.current, this.options.activeClass );					// make this first and ,..
		this._addClass( to, this.options.activeClass );									// make this after in the rare cases when we move to the same slide (ie. dragging a bit and snapping back)

		this._removeClass( to, this.options.beforeClass );
		this._removeClass( to, this.options.afterClass );

		// end the transition. NOTE: if this isn't firing, check your CSS
		if (this.transitionEnd) {
			c = this;
			this.slides[ to ].addEventListener(c.transitionEnd, function end(){
				this.removeEventListener(c.transitionEnd, end);
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


		this._removeClass( this.before, this.options.afterClass );	// remove stragglers
		this._removeClass( this.after, this.options.beforeClass );	//


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

		if (this.dragging === 0) {
			this.dragging = 1;
			this.pixelOffset = 0;
			this.startClientX = e.clientX;
			this.touchPixelRatio = 1;
		}
	},

	/**
	 * Update slides positions according to user's touch
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_drag: function(e) {

		e.preventDefault();

		if (e.touches) {
			e = e.touches[0];
		}

		// at the beginning going more beginninger, or at the end going more ender-er
		// if (!this.infinite && ((this.current === 0 && e.clientX > this.startClientX) || (this.current === this.slides.length - 1 && e.clientX < this.startClientX))) {
		//  this.touchPixelRatio = 3;	// "elastic" effect where slide will drag 1/3 of the distance swiped
		// } else {
			 this.touchPixelRatio = 1;
		// }

		this.delta = e.clientX - this.startClientX;

		if (this.dragging && this.delta !== 0) {

			this.pixelOffset = this.delta / this.touchPixelRatio;

			this._translate( this.before, (this.pixelOffset - this.width) );
			this._translate( this.current, this.pixelOffset);
			this._translate( this.after,  (this.pixelOffset + this.width) );
		}
	},

	/**
	 * Drag end, calculate slides' new positions
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_dragEnd: function(e) {
		var i;

		if (this.dragging === 0) {
			return false;
		}

		this.dragging = 0;

		if (this.pixelOffset < 0) {
			if ( Math.abs(this.pixelOffset) < this.dragThreshold || this.after === null ) {
				this._move(this.current);
			}
			else {
				this.next();
			}
		}
		else if (this.pixelOffset > 0) {
			if ( this.pixelOffset < this.dragThreshold || this.before === null ) {
				this._move(this.current);
			}
			else {
				this.prev();
			}
		}


		for (i = this.slides.length; i--;) {
			this.slides[i].style.webkitTransform = '';
		}
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
	 * Helper function. Ripped from underscore and modified
	 * @param  {object} obj A list of objects to extend
	 * @return {object}     The extended object
	 */
	_extend: function(obj) {
		Array.prototype.slice.call(arguments, 1).forEach(function (source) {
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	}

};



/*global Carousel*/


/**
 * Make a plugin out of the Carousel
 */
if ( window.jQuery || window.Zepto ) {
	(function($) {
		$.fn.carousel = function(method) {
			var args = arguments;

			return this.each(function() {

				if( $(this).data('carousel') ){

					// check if method exists
					if (method in Carousel.prototype) {
						return Carousel.prototype[ method ].apply( $(this).data('carousel'), Array.prototype.slice.call( args, 1 ));
					}

					// if no method found and already init'd
					$.error( 'Method "' +  method + '" does not exist on ye olde carousel' );
					return $(this);				// return this for chaining
				}

				// otherwise, engage thrusters
				if ( typeof method === 'object' || ! method ) {
					var carousel = new Carousel( $(this)[0], args[0] );
					return $(this).data('carousel', carousel);			// let's store the newly instantiated object in the $'s data
				}

			});

		};
	})( window.jQuery || window.Zepto );
}
