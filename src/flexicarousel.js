/*
 * flexicarousel
 * https://github.com/apathetic/flexicarousel
 *
 * Copyright (c) 2013 Wes Hatch
 * Licensed under the MIT license.
 *
 */

/*jslint debug: true, evil: false, devel: true*/



// browser capabilities
var transitions = (function(){

	var transitionEnd = (function(){
		var t,
			el = document.createElement('fake'),
			transitions = {
			'transition': 'transitionend',
			'OTransition': 'oTransitionEnd otransitionend',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		};

		for(t in transitions){
			if( el.style[t] !== undefined ){
				return transitions[t];
			}
		}
	}());

	var transforms = (function(){}());

	return transitionEnd && {end: transitionEnd}
})();

var touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

// touch vars
var deltaSlide,
	dragging = 0,
	startClientX = 0,
	pixelOffset = 0,
	touchPixelRatio = 1,
	dragThreshold = 80;

// carousel object
var Carousel = function(container, options){
	this.el = container;
	this.init(options);
}

Carousel.prototype = {

	current: 0,
	slides: [],
	sliding: false,
	defaults: {
		activeClass: 'active',
		beforeClass: 'before',
		afterClass: 'after',
		slides: 'ul li',
		infinite: true,
		autoRotate: false,
	},

	init: function(options){

		var trans;
				optsAttr = $(this.el).attr('data-options');

		eval('var data='+optsAttr);
		this.options = $.extend( {}, this.defaults, data );

		this.slides = this.el.querySelectorAll(this.options.slides);
		if (!this.slides.length) { return; }

		this.before = this.slides.length - 1;
		this.after = 1;

		this.slides[this.current].classList.add( this.options.activeClass );
		this.slides[this.after].classList.add( this.options.afterClass );
		if (this.options.infinite) {
			this.slides[ this.before ].classList.add( this.options.beforeClass );
		}

		this.el.addEventListener('touchstart',	this.dragStart.bind(this));		// ecma5 bind
		this.el.addEventListener('touchmove',		this.drag.bind(this));					// ecma5 bind
		this.el.addEventListener('touchend',		this.dragEnd.bind(this));				// ecma5 bind
		this.el.addEventListener('mousedown',		this.dragStart.bind(this));
		this.el.addEventListener('mousemove',		this.drag.bind(this));
		this.el.addEventListener('mouseup',			this.dragEnd.bind(this));

		return $(this);
	},

	/*
	autoRotate: function( rotate ) {
		if (rotate) {
			var self = this;
			this.timer = setInterval(function(){
				$(self).carousel('next');
			}, 5000);
		} else {
			clearTimeout(this.timer);
		}
	},

	pause: function (e) {
		if (!e) this.paused = true
		if (this.$element.find('.next, .prev').length && transitions) {
			this.$element.trigger(transitions.end)
			this.cycle(true)
		}
		clearInterval(this.interval)
		this.interval = null
		return this
	},
	*/

	next: function(){
		this.go(this.current + 1);
	},

	prev: function(){
		this.go(this.current - 1);
	},

	go: function( to ){

		var direction;

		// check if we need to update the carousel
    if (to == this.current || this.sliding) { return; }

    // determine direction:  1: backward, -1: forward
    direction = Math.abs(this.current - to) / (this.current - to);

    // move all the slides between index and to in the right direction
    // var diff = Math.abs(current - to) - 1;
    // while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

    // remove classes
		this.slides[this.current].classList.remove( this.options.activeClass );
		this.slides[this.before] .classList.remove( this.options.beforeClass );
		this.slides[this.after]  .classList.remove( this.options.afterClass );

    // setup prev / next slides
		this.current = this.loop(to);
		this.before = this.loop(to - 1);
		this.after = this.loop(to + 1);

		this.move();
	},

	move: function() {

		// this.sliding = true;

		this.slides[this.current].classList.add( this.options.activeClass );

		// need at least 3 slides for this to work
		// don't add class to slides[before] / slides[after] if we're at the beginning / end, thus keeping it hidden
		if (this.current == 0 && !this.options.infinite) {
			this.slides[this.after].classList.add( this.options.afterClass );
		}
		else if (this.current <= this.slides.length - 1 && !this.options.infinite) {
			this.slides[this.before].classList.add( this.options.beforeClass );
		}
		else {
			this.slides[this.before].classList.add( this.options.beforeClass );
			this.slides[this.after].classList.add( this.options.afterClass );
		}
	},

	loop: function(val) {
		return (this.slides.length + (val % this.slides.length)) % this.slides.length;
	},

	dragStart: function(e) {

		if (e.touches) {
			e = e.touches[0];
		}
		if (dragging === 0) {
			dragging = 1;
			pixelOffset = 0;
			startClientX = e.clientX;
			// visible = [active, before, after];

			// at the beginning going more beginninger, or at the end going more ender-er
			if ((this.current === 0 && e.clientX > startClientX) || (this.current === this.slides.length - 1 && e.clientX < startClientX)) {
				touchPixelRatio = 3;	// "elastic" effect where slide will drag 1/3 of the distance swiped
			} else {
				touchPixelRatio = 1;
			}

			this.slides[ this.current ].classList.add( 'dragging' );
			this.slides[ this.before ] .classList.add( 'dragging' );
			this.slides[ this.after ]  .classList.add( 'dragging' );

		}
	},

	drag: function(e) {

		e.preventDefault();

		if (e.touches) {
			e = e.touches[0];
		}

		deltaSlide = e.clientX - startClientX;

		if (dragging && deltaSlide !== 0) {

			pixelOffset = deltaSlide / touchPixelRatio;

			this.slides[ this.current ].style.webkitTransform = 'translate(' + pixelOffset + 'px, 0)';
			this.slides[ this.before ] .style.webkitTransform = 'translate(' + pixelOffset + 'px, 0)';
			this.slides[ this.after ]  .style.webkitTransform = 'translate(' + pixelOffset + 'px, 0)';

		}
	},

	dragEnd: function(e) {
			dragging = 0;

			this.slides[ this.current ].style.webkitTransform = 'translate(0, 0)';
			this.slides[ this.before ] .style.webkitTransform = 'translate(0, 0)';
			this.slides[ this.after ]  .style.webkitTransform = 'translate(0, 0)';
			this.slides[ this.current ].classList.remove( 'dragging' );
			this.slides[ this.before ] .classList.remove( 'dragging' );
			this.slides[ this.after ]  .classList.remove( 'dragging' );

			if ( Math.abs(pixelOffset) > dragThreshold ) {

				// var to = pixelOffset < startClientX ? this.current + 1 : this.current - 1;
				var to = pixelOffset < 0 ? this.current + 1 : this.current - 1;
				// console.log(to, tob);


				this.go(to);
			// } else {
			// 	this.go(this.current); // snap back
			}
	},

	destroy: function(){
		// TODO
	}

};


if ( window.jQuery || window.Zepto ) {
	(function($) {
		$.fn.carousel = function(method) {
			var args = arguments,
					fn = this;

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

		}
	})( window.jQuery || window.Zepto )
}



/*
				console.log(this);

				if( $(this).data('carousel') ){

					// check if method exists
					if (method in Carousel.prototype) {
						return Carousel.prototype[ method ].apply( $(this).data('carousel'), Array.prototype.slice.call( args, 1 ));
					}

					// if no method found and already init'd
					$.error( 'Method "' +  method + '" does not exist on ye olde carousel' );
					return $(this);
				}

				// otherwise, engage thrusters
				if ( typeof method === 'object' || ! method ) {
					return $(this).data('carousel', new Carousel( $(this)[0], args ) );
				}

*/

