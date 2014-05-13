//
// PhantomJS <polyfill>
//
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}
//
//</polyfill>
//


describe('Flexicarousel', function() {
	var carousel,
		container;


/*	function makeFixture() {
		var fixture = document.createElement('div');
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function( ){
			if(this.readyState === 4) {
				fixture.innerHTML = this.responseText;
				document.body.appendChild(fixture);
			}
		}
		xhr.open('GET','base/test/fixture.html');
		xhr.send();
	}
*/

	function makeFixture() {
		var inner = '\
			<div id="carousel" class="carousel slide">\
				<ul class="wrap">\
					<li></li>\
					<li></li>\
					<li></li>\
					<li></li>\
				</ul>\
				<a href="#prev" class="prev"></a>\
				<a href="#next" class="next"></a>\
			</div>';


		var fixture = document.createElement('div');
		fixture.innerHTML = inner;
		document.body.appendChild(fixture);
	}


	// --------------------------------------------------
	// Set Up
	// --------------------------------------------------

	beforeEach(function() {

		makeFixture();
		container = document.querySelector('#carousel');
		carousel = new Carousel(container, {});

		// console.log(Carousel);

		// spyOn(carousel, 'init').and.callThrough();		// spy on the instance... not the protoype
		spyOn(Carousel.prototype, 'next').and.callThrough();

		// spyOn(carousel, '_move').and.callThrough();


	});



	// --------------------------------------------------
	// Tests
	// --------------------------------------------------

	describe('Constructor: ', function() {

		it('initializes', function(){
			expect(Carousel.prototype.init).toHaveBeenCalled();

		});

		it('sets container element', function(){

		});
	});

	describe('Set Up: ', function() {

		it('parses options', function(){

		});

		it('bails if less than 3 slides', function(){

		});



		it('adds classes', function(){

		});

		it('sets width if touch device', function() {});

	});


	describe('Events: ', function() {
		it('binds touch events', function() {});
		it('drags on dragMove', function() {});
		it('updates width on orientation change', function() {});
	});

	describe('API: ', function() {
		it('next', function() {});
		it('prev', function() {});
		it('go', function() {});
		it('destroy', function() {});
	});

	describe('Helpers: ', function() {
		it('_addClass', function() {});
		it('_removeClass', function() {});
		it('_extend', function() {});
	});


});
