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
	this.init(options);

	// state vars
	// this.current = 0;

	// touch vars
	this.delta = 0;
	this.dragging = 0;
	this.startClientX = 0;
	this.pixelOffset = 0;
	this.touchPixelRatio = 1;
	this.dragThreshold = 80;

	// browser capabilities
	// this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
	this.transitions = (function(){
		var end = (function(){
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
		}());
		return end && {end: end};
	})();

};

Carousel.prototype = {

	current: 0,
	slides: [],
	sliding: false,
	width: 0,
	defaults: {
		activeClass: 'active',
		beforeClass: 'before',
		afterClass: 'after',
		slideWrap: 'ul',			// for binding touch events
		slides: 'li',
		infinite: true
	},

	/**
	 * Initialize the carousel and set some defaults
	 * @param  {object} options List of key: value options
	 * @return {void}
	 */
	init: function(options){

		// TODO handle options attr better;
		// optsAttr = $(this.el).attr('data-options') || '{}';
		// eval('var data='+optsAttr);

		// this.options = this._extend( {}, this.defaults, data );
		this.options = this._extend( {}, this.defaults );

		this.slideWrap = this.el.querySelectorAll(this.options.slideWrap)[0];
		this.slides = this.el.querySelectorAll(this.options.slides);

		if (!this.slideWrap) { return; }
		if (!this.slides.length) { return; }
		if (this.slides.length < 3) { this.options.infinite = false; }					// need at least 3 slides for this to work

		this.before = this.slides.length - 1;
		this.after = 1;

		this.slides[ this.before ] .classList.add( this.options.beforeClass );
		this.slides[ this.current ].classList.add( this.options.activeClass );
		this.slides[ this.after ]  .classList.add( this.options.afterClass );

		this.slideWrap.addEventListener('touchstart',	this.dragStart.bind(this));			// ecma5 bind
		this.slideWrap.addEventListener('touchmove',	this.drag.bind(this));					// ecma5 bind
		this.slideWrap.addEventListener('touchend',		this.dragEnd.bind(this));				// ecma5 bind
		// this.el.addEventListener('mousedown',		this.dragStart.bind(this));
		// this.el.addEventListener('mousemove',		this.drag.bind(this));
		// this.el.addEventListener('mouseup',			this.dragEnd.bind(this));

		this.width = this.slideWrap.offsetWidth;
		window.addEventListener('resize', function(){
			this.width = this.slideWrap.offsetWidth;
		}.bind(this));


		return this;
	},

	/**
	 * Go to the next slide
	 * @return {void}
	 */
	next: function(){
		this.go(this.current + 1);
		return false;
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

		if (to == this.current || this.sliding) { return; }

		console.log('Going to %d from %d', to+1, this.current+1);

		// edge case where dragging is mixed with API
		this.slides[ this.before] .style.webkitTransform = '';
		this.slides[ this.current].style.webkitTransform = '';
		this.slides[ this.after ] .style.webkitTransform = '';

		// remove classes
		this.slides[this.before] .classList.remove( this.options.beforeClass );
		this.slides[this.current].classList.remove( this.options.activeClass );
		this.slides[this.after]  .classList.remove( this.options.afterClass );


		/* * /
    // if going more than one slide, move 'x' slides by calling go() recursively
		var diff = this.current - to;
		while ( Math.abs(diff) > 1) {

			console.log('diff', diff);
			/*
			var direction;
			direction = Math.abs(this.current - to) / (this.current - to);			// determine direction:  1: backward, -1: forward
			/* * /

			diff--;

			// setTimeout(function(){
				this.go(  (to > this.current ? this.current + diff : this.current - diff)  );
			// }.bind(this), 1000);
		}
		/* */

		var diff = (to - this.current);
		if ( Math.abs(diff) > 1 ) {

			// replace / position the "after" slide with the "to"
			var temp = this._loop(to);

			if (diff > 0) {
				this.slides[temp].classList.add(this.options.afterClass)
			} else {
				this.slides[temp].classList.add(this.options.beforeClass)
			}

		}




		// setup prev / next indices
		this.before  = this._loop(to - 1);
		this.current = this._loop(to);
		this.after   = this._loop(to + 1);


		this.move();
	},

	/**
	 * Move the relevant slides in the carousel
	 * @return {void}
	 */
	move: function() {

		var c = this;

			// $to[0].offsetHeight;				// force a repaint to position this element. *Important*


		c.sliding = true;
		this.slides[this.current].addEventListener(this.transitions.end, function end(){
			c.sliding = false;
			this.removeEventListener(c.transitions.end, end);
		});


		this.slides[this.current].classList.add( this.options.activeClass );

		// if not infinite: don't add class to before / after if we're at the beginning
		if      (!this.options.infinite && this.current === 0) {
			this.slides[this.after].classList.add( this.options.afterClass );
		}
		else if (!this.options.infinite && this.current <= this.slides.length - 1) {
			this.slides[this.before].classList.add( this.options.beforeClass );
		}
		else {
			this.slides[this.before].classList.add( this.options.beforeClass );
			this.slides[this.after].classList.add( this.options.afterClass );
		}
	},

	/**
	 * Start dragging (via touch)
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	dragStart: function(e) {

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
			if ((this.current === 0 && e.clientX > this.startClientX) || (this.current === this.slides.length - 1 && e.clientX < this.startClientX)) {
				this.touchPixelRatio = 3;	// "elastic" effect where slide will drag 1/3 of the distance swiped
			} else {
				this.touchPixelRatio = 1;
			}

			this.slides[ this.current ].classList.add( 'dragging' );
			this.slides[ this.before ] .classList.add( 'dragging' );
			this.slides[ this.after ]  .classList.add( 'dragging' );

		}
	},

	/**
	 * Update slides positions according to user's touch
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	drag: function(e) {

		e.preventDefault();

		if (e.touches) {
			e = e.touches[0];
		}

		this.delta = e.clientX - this.startClientX;

		if (this.dragging && this.delta !== 0) {

			this.pixelOffset = this.delta / this.touchPixelRatio;

			// this._translate( this.before, (this.pixelOffset - this.width) );

			this.slides[ this.before ] .style.webkitTransform = 'translate(' + (this.pixelOffset - this.width) + 'px, 0)';
			this.slides[ this.current ].style.webkitTransform = 'translate(' + this.pixelOffset + 'px, 0)';
			this.slides[ this.after ]  .style.webkitTransform = 'translate(' + (this.pixelOffset + this.width) + 'px, 0)';

		}
	},

	/**
	 * Drag end, calculate slides' new positions
	 * @param  {event} e Touch event
	 * @return {void}
	 */
	dragEnd: function(e) {
			this.dragging = 0;

			this.slides[ this.current ].classList.remove( 'dragging' );
			this.slides[ this.before ] .classList.remove( 'dragging' );
			this.slides[ this.after ]  .classList.remove( 'dragging' );

			// this.slides[ this.before ] .style.webkitTransform = 'translate(0, 0)';
			// this.slides[ this.current ].style.webkitTransform = 'translate(0, 0)';
			// this.slides[ this.after ]  .style.webkitTransform = 'translate(0, 0)';

			// this.slides[ this.before] .style.webkitTransform = '';
			// this.slides[ this.current].style.webkitTransform = '';
			// this.slides[ this.after ] .style.webkitTransform = '';

			if ( Math.abs(this.pixelOffset) > this.dragThreshold ) {
				var to = this.pixelOffset < 0 ? this.current + 1 : this.current - 1;
				this.go(to);
			}

			this.slides[ this.before ] .style.webkitTransform = 'translate(-' + this.width +'px , 0)';
			this.slides[ this.current ].style.webkitTransform = 'translate(0, 0)';
			this.slides[ this.after ]  .style.webkitTransform = 'translate(' + this.width +'px, 0)';
	},

	/**
	 * [ description]
	 * @return {[type]} [description]
	 */
	destroy: function(){
		// TODO
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




