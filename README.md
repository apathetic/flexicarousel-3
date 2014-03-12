# Flexicarousel

A carousel that'll dynamically adapt its width: it will grow or shrink alongside a site that’s resizing via css media queries. Uses CSS3 transforms for its transitions

##Introduction

Carousels have been very common UI component in the web.

Generally speaking, they have evolved such that their is a separation of state and style (ie. Bootstrap, jCarousel, etc). The state of a
carousel is maintained by its Javascript and may be updated by interacting with an exposing API. The "look and feel" should be managed
by its CSS.

##Problem

This works fine on desktop, where styles are added or removed by the Javascript and the position of the carousel's slides update accordingly.
This also allows for a variety of interesting transitions and effects, using CSS3 transforms and transitions. However, this paradigm suffers
on mobile, where touch interactions and continuos control over a slide's position (ie. via dragging) are desired. Touch-enabled carousels are
becoming increasingly common (ie. Scooch, Swipe, etc.), and they work by positioning a slide via a 3d offset. The downside of this approach
is that the CSS-based system for controlling the carousel's behaviour is overriden by Javascript's need to then control everything. The result
is a larger file size as Javascript (clumisily) trys to emulate the look and feel of CSS using a large array of instantiation arguments and
custom animation functions.

This architecture work well for mobile, but is less than optimal on desktop; contrariwise, using CSS to position a slide undermines a native
touch-UI paradigm as it circumvents dragging.

##Solution

Flexicarousel. It enables a touch-based interface (ie. sliding slides via dragging) while also respecting the separation of state and behaviour.
You can swipe to drag a slide yet still use CSS to control how the slide transitions will behave. You can also choose to change slides by
using the exposed API. The result is smaller codebase that achieves the best of both approaches


## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/apathetic/flexicarousel/master/dist/flexicarousel.min.js
[max]: https://raw.github.com/apathetic/flexicarousel/master/dist/flexicarousel.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="flexicarousel.min.js"></script>
<script>
	jQuery(function($) {
		$('.carousel').carousel({
			// options
		});
	});

	// or, without jquery if you prefer:
	var container = document.querySelector('.carousel');
	var carousel = new Carousel(container);

</script>
```

## Documentation

	next: advances the carousel by one slide

	prev: returns to the previous slide

	go: function(arg) advances slide to the index represented by the argument

	destroy: destroys the carousel and frees up its memory


## Known Issues

## Examples

Please see the _test / demo_ directory

## Release History
### 0.0.1
