# Flexicarousel

A carousel that'll dynamically adapt its width: it will grow or shrink alongside a site that’s resizing via css media queries. Uses CSS3 transforms for its transitions

##Introduction

Carousels are a common UI component in the web. Ideally, this component should maintain a separation of state and style. That is to say, the 
Javascript should maintain the state of the carousel (which may be updated by interacting with an exposed API, for instance), while the CSS 
should take care of the presentation of this state (ie. the "look and feel" of the carousel). Unfortunately, this is rarely the case for many 
commonly available carousels out there. This projects seeks to remedy that.


##Problem

A carousel may work fine on desktop, where styles are added or removed by the Javascript causing the position of the carousel's slides to update 
accordingly. Different styles can allow for a variety of interesting transitions and effects using CSS3 transforms and transitions. However, 
this paradigm suffers on mobile, where touch interactions and continuous control over a slide's position (ie. via dragging) are desired. 
Touch-enabled carousels usually achieve this by positioning a slide manually via _translate()_; the result of this approach is that the "classic" 
CSS-based system of control is not compatible with this inlined manual positioning. Workarounds usually revolve around managing all effects,
transitions, etc. with the Javascript -- which always results in larger files sizes, more instantiation arguments and custom animation functions.

One architecture may work well for mobile, but is less than optimal on desktop; contrariwise, using CSS to position a slide works well on desktop
but is undermined by a native touch-UI paradigm.

##Solution

Flexicarousel. It enables a touch-based interface (ie. sliding slides via dragging) while also respecting the separation of state and behaviour.
You can swipe to drag a slide yet still use CSS to control how the slide transitions will behave. You can also choose to change slides by
using the exposed API. The carousel works on both desktop and mobile, using only CSS to control the look and feel. The result is smaller 
codebase that achieves the best of both approaches.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/apathetic/flexicarousel/master/dist/flexicarousel.min.js
[max]: https://raw.github.com/apathetic/flexicarousel/master/dist/flexicarousel.js

Include the relevant scripts in your web page, and then:

```html
<script>

	// availble options
	var options = {
		activeClass: 'active',
		beforeClass: 'before',
		afterClass: 'after',
		slideWrap: '.wrap',
		slides: 'li',
		infinite: true,
		beforeSlide,		// function to execute before sliding
		afterSlide,			// function to execute after sliding
		noTouch: false		// if you'd like to disable the touch UI for whatever reason
	};

	// as a jQuery plugin
	jQuery(function($) {
		$('.carousel').carousel({
			options
		});
	});

	// or, without jquery if you prefer:
	var container = document.querySelector('.carousel');
	var carousel = new Carousel(container, options);

</script>
```

## Documentation

	next: advances the carousel by one slide

	prev: returns to the previous slide

	go: function(to) advances slide to the index



## Known Issues

## Examples

Please see the _test / demo_ directory

## Release History
### 0.0.2
* add tabs demo
* Fixed: uses non-IE8 friendly class manipulation (ie. classList)
* Fixed: if mobile and not infinite, can see wrapping slides

### 0.0.1
* still a proof of concept
* uses ecma5 js (ie. bind, forEach)
* uses non-IE8 friendly class manipulation (ie. classList)
* uses non-IE8 friendly translate on slides
* mobile transforms are currently webkit-only
* if mobile and not infinite, can see wrapping slides
