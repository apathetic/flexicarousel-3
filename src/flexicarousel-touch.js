/*
 * flexicarousel
 * https://github.com/apathetic/flexicarousel
 *
 * Copyright (c) 2013 Wes Hatch
 * Licensed under the MIT license.
 */

/*jslint debug: true, evil: false, devel: true*/

(function($) {

/*
http://mobile.smashingmagazine.com/2012/06/21/play-with-hardware-accelerated-css/
*/

	var deltaSlide,
		dragging = 0,
		startClientX = 0,
		startPixelOffset = 0,
		pixelOffset = 0;

		methods = {

			dragStart: function(e) {
				if (e.originalEvent.touches) {				// separate clicks from touches...?
					e = e.originalEvent.touches[0];
				}
				if (dragging === 0) {
					dragging = 1;
					startClientX = e.clientX;
				}
			},

			drag: function(e) {

				e.preventDefault();

				if (e.originalEvent.touches) {
					e = e.originalEvent.touches[0];
				}

				deltaSlide = e.clientX - startClientX;

				if (dragging && deltaSlide !== 0) {
					startPixelOffset = pixelOffset;

					console.log(deltaSlide, this.current);


					var touchPixelRatio = 1;
					// at the beginning going beginninger, or at the end going more ender
					if ((current === 0 && e.clientX > startClientX) || (current === slideCount - 1 && e.clientX < startClientX)) {
						touchPixelRatio = 3;	// "elastic" effect where slide will drag 1/3 of the distance swiped
					}

					pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;

					$('#slides').css('transform', 'translate3d(' + pixelOffset + 'px,0,0)').removeClass();
					console.log($.fn.carousel.prototype.current);

				}
			},

			dragEnd: function(e) {
					dragging = 0;
					current = pixelOffset < startPixelOffset ? current + 1 : current - 1;
					// ...
			}

		};

	$.extend( $.fn.carousel.prototype, methods );

	$.fn.carousel.prototype.register(function(){

		console.log(this, $.fn.carousel.prototype);

		$(this).on({
			'mousedown touchstart':	methods.dragStart,
			'mousemove touchmove':	methods.drag,
			'mouseup touchend':			methods.dragEnd
		});

	});

}(jQuery));


