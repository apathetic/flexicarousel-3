/*
 * flexicarousel 2
 * https://github.com/apathetic/flexicarousel-2
 *
 * Copyright (c) 2013 Wes Hatch
 * Licensed under the MIT license.
 *
 */

/*jslint eqeq: true, browser: true, debug: true, evil: false, devel: true*/



// NOTES:
// * still a proof of concept
// * uses ecma5 js (ie. bind, forEach)
// * uses non-IE8 friendly class manipulation (ie. classList)
// * currently exposes every function, I will probably want to introduce the idea of public and private... or let them by overridden
// * want to add a few functions that return the number of slides, or ...?
// * will probably address these items once original idea is flushed out



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
		slideWrap: 'ul',			// for binding touch events
		slides: 'li',
		infinite: true
	}

	// touch vars
	// --------------------
	this.delta = 0;
	this.dragging = 0;
	this.startClientX = 0;
	this.pixelOffset = 0;
	this.touchPixelRatio = 1;
	this.dragThreshold = 80;

	// browser capabilities
	// --------------------
	this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
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
	this.transform = (function(){
		var transforms = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
			i = transforms.length,
			el = document.createElement('fake');

		for (i; --i;) {
			if ( el.style[ transforms[i] ] !== undefined) { return transforms[i]; }
    }
    return false;
	})();

	this.init(options);

};

Carousel.prototype = {

	/**
	 * Initialize the carousel and set some defaults
	 * @param  {object} options List of key: value options
	 * @return {void}
	 */
	init: function(options){

		this.options = this._extend( {}, this.defaults );

		this.slideWrap = this.el.querySelector(this.options.slideWrap);
		this.slides = this.el.querySelectorAll(this.options.slides);

		if (!this.slideWrap || !this.slides.length) { return; }									// maybe throw an error, here
		if (this.slides.length < 3) { this.options.infinite = false; }					// need at least 3 slides for this to work

		this.before = this.slides.length - 1;
		this.after = 1;

		this.slides[ this.before ] .classList.add( this.options.beforeClass );
		this.slides[ this.current ].classList.add( this.options.activeClass );
		this.slides[ this.after ]  .classList.add( this.options.afterClass );

		this.slideWrap.addEventListener('touchstart',	this._dragStart.bind(this));		// ecma5 bind
		this.slideWrap.addEventListener('touchmove',	this._drag.bind(this));					// ecma5 bind
		this.slideWrap.addEventListener('touchend',		this._dragEnd.bind(this));			// ecma5 bind
		// this.el.addEventListener('mousedown',		this.dragStart.bind(this));
		// this.el.addEventListener('mousemove',		this.drag.bind(this));
		// this.el.addEventListener('mouseup',			this.dragEnd.bind(this));

		// only need width for touch, so resize listener is not necessary
		this.width = this.slideWrap.offsetWidth;
		// window.addEventListener('resize', function(){
		// 	this.width = this.slideWrap.offsetWidth;
		// }.bind(this));

		return this;
	},

	/**
	 * Go to the next slide
	 * @return {void}
	 */
	next: function(){
		this.go(this.current + 1);
	},

	/**
	 * Go to the previous slide
	 * @return {void}
	 */
	prev: function(){
		this.go(this.current - 1);
	},

	/**
	 * Go to a particular slide
	 * @param  {int} to Slide to display
	 * @return {void}
	 */
	go: function( to ){

		var direction,
				c = this;

    // determine direction:  1: backward, -1: forward. Do this before we % it
    direction = Math.abs(this.current - to) / (this.current - to);

    // check bounds
    if (this.options.infinite) {
			to = this._loop(to);
		} else {
			to = Math.max( Math.min(this.slides.length-1, to), 0);
		}
		if (to == this.current || this.sliding) { return; }



		// var diff = to - this.current;
		// if (Math.abs(diff) > 1) {
	    // position the slide we're going to, and prime the slide we're moving from
	    if (direction > 0) {
	    	this.slides[ to ].classList.add( this.options.beforeClass, 'no-trans' );			// place it beside the currently active slide. "no-trans" ensures this happens instantly
	    	this.slides[ this.current ].classList.add( this.options.afterClass );					// this slide will not move as long as "active" is also present
	    } else {
	    	this.slides[ to ].classList.add( this.options.afterClass, 'no-trans' );
	    	this.slides[ this.current ].classList.add( this.options.beforeClass );
			}
			this.slides[ to ].offsetHeight;				// force a repaint to actually position this element. *Important*
		// }




		if (this.transitionEnd) {
			this.slides[ to ].addEventListener(c.transitionEnd, function end(){
				this.removeEventListener(c.transitionEnd, end);
				c._slideEnd();
			});
			this._slideStart(to, this.current);
		} else {
			this._slideEnd();
		}

	},

	_slideStart: function(to, from) {
		this.sliding = true;

		this.slides[ to ].classList.remove( 'no-trans' );
		this.slides[ to ].classList.add( this.options.activeClass );
		this.slides[ from ].classList.remove( this.options.activeClass );
		this.slides[ to ]  .classList.remove( this.options.beforeClass, this.options.afterClass );

		this.current = to;
	},

	_slideEnd: function() {

		this.sliding = false;

		// if (this.touch) {
			// setup prev / next indices
			this.before  = this._loop(this.current - 1);
			this.after   = this._loop(this.current + 1);

			this.slides[this.before].classList.remove( this.options.afterClass );
			this.slides[this.after] .classList.remove( this.options.beforeClass );

			this.slides[this.before].classList.add( this.options.beforeClass );
			this.slides[this.after] .classList.add( this.options.afterClass );
		// }

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

			// at the beginning going more beginninger, or at the end going more ender-er
			// if ((this.current === 0 && e.clientX > this.startClientX) || (this.current === this.slides.length - 1 && e.clientX < this.startClientX)) {
			// 	this.touchPixelRatio = 3;	// "elastic" effect where slide will drag 1/3 of the distance swiped
			// } else {
				this.touchPixelRatio = 1;
			// }

			this.slides[ this.current ].classList.add( 'no-trans' );
			this.slides[ this.before ] .classList.add( 'no-trans' );
			this.slides[ this.after ]  .classList.add( 'no-trans' );

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

		this.delta = e.clientX - this.startClientX;

		if (this.dragging && this.delta !== 0) {

			this.pixelOffset = this.delta / this.touchPixelRatio;

			this._translate( this.before, (this.pixelOffset - this.width) );
			this._translate( this.current, this.pixelOffset);
			this._translate( this.after,  (this.pixelOffset + this.width) );

			// this.slides[ this.before ] .style.webkitTransform = 'translate(' + (this.pixelOffset - this.width) + 'px, 0)';
			// this.slides[ this.current ].style.webkitTransform = 'translate(' + this.pixelOffset + 'px, 0)';
			// this.slides[ this.after ]  .style.webkitTransform = 'translate(' + (this.pixelOffset + this.width) + 'px, 0)';

		}
	},

	/**
	 * Drag end, calculate slides' new positions
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	_dragEnd: function(e) {
			this.dragging = 0;

			this.slides[ this.current ].classList.remove( 'no-trans' );
			this.slides[ this.before ] .classList.remove( 'no-trans' );
			this.slides[ this.after ]  .classList.remove( 'no-trans' );

			this.slides[ this.current].style.webkitTransform = '';

			if ( Math.abs(this.pixelOffset) > this.dragThreshold ) {
				var to = this.pixelOffset < 0 ? this.current + 1 : this.current - 1;
				this.go(to);
			}

			this.slides[ this.before] .style.webkitTransform = '';
			this.slides[ this.after ] .style.webkitTransform = '';
	},

	/**
	 * Helper function. Calculate modulo of a slides position
	 * @param  {int} val Slide's position
	 * @return {void}
	 */
	_loop: function(val) {
		return (this.slides.length + (val % this.slides.length)) % this.slides.length;
	},

	/**
	 * Helper function to translate slide in browser
	 * @param  {[type]} el     [description]
	 * @param  {[type]} offset [description]
	 * @return {[type]}        [description]
	 */
	_translate: function(i, offset) {
			this.slides[ i ] .style.webkitTransform = 'translate(' + offset + 'px, 0)';
	},

	/**
	 * Helper function. Ripped from underscore
	 * @param  {object} obj A list of objects to extend
	 * @return {object}     The extended object
	 */
  _extend: function(obj) {
		// each(slice.call(arguments, 1), function(source) {
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
					var carousel = new Carousel( $(this)[0], args );
					return $(this).data('carousel', carousel);			// let's store the newly instantiated object in the $'s data
				}

			});

		};
	})( window.jQuery || window.Zepto );
}




