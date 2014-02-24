# Flexicarousel

A carousel that'll dynamically adapt its width: it will grow or shrink alongside a site that’s resizing via css media queries. Uses CSS3 transforms for its transitions

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
_(Coming soon)_

## Known Issues

## Examples
_(Coming soon)_

## Release History
### 0.0.1
