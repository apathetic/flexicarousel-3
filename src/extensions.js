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