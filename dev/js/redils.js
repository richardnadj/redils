;(function($, window) {

	//Private Methods
	var priv = {
		isImageLoaded: function(img) {
			if(!img.complete) return false;
			if (typeof img.naturalWidth != 'undefined' && img.naturalWidth === 0) return false;
			return true;
		},
		testIfLoaded: function() { //id, $imgs
			var $this = this,
				imgIsLoaded = null,
				numLoaded = 0,
				$imgs = this.find('img'),
				totalImages = $imgs.length,
				halfway = false;

			(function imgLoaded() {
				numLoaded = 0;
				//Check if all images are loaded.
				$imgs.each(function() {					
					if(!priv.isImageLoaded($(this)[0])) {
						imgIsLoaded = false;
						return false;
					} else {
						imgIsLoaded = true;
						numLoaded++;
					}
				});

				//update halfway to make it smoother.
				if(!halfway && numLoaded > totalImages / 5) {
					$this.set.ratio = ($imgs[0].naturalWidth !== undefined) ? $imgs[0].naturalWidth / $imgs[0].naturalHeight : $imgs.eq(0).width() / $imgs.eq(0).height();
					priv.update.apply($this);
					halfway = true;
				}

				if(imgIsLoaded) {
					//ensure all images are loaded before determining the length use natural dimensions when possible
					$this.set.ratio = ($imgs[0].naturalWidth !== undefined) ? $imgs[0].naturalWidth / $imgs[0].naturalHeight : $imgs.eq(0).width() / $imgs.eq(0).height();
					priv.update.apply($this);
				} else {
					requestAnimFrame(imgLoaded);
				}
			})();

		},
		interaction: function() {
			var $this = this;

			$(window).trigger('redils.interaction', [$this]);
			if($this.set.auto) {
				$this.set.animationStopped = true;
				$this.data({'animationStopped':true});
				clearInterval($this.set.timer);
				$this.set.timerBar = false;
			}
		},
		enableEvents: function() {

			var $this = this,
				start = {},
				touches = {};

			$this.on({
				touchstart: function(e) {
					//Get initial values
					if($this.set.auto)clearInterval($this.set.timer);
					start.x = e.originalEvent.targetTouches[0].pageX;
					start.y = e.originalEvent.targetTouches[0].pageY;
					start.time = e.originalEvent.timeStamp;
					touches.dir = '';
					touches.move = '';
				},
				touchmove: function(e) {
					//Determine if scrolling handle accordingly
					touches.x = e.originalEvent.targetTouches[0].pageX;
					touches.y = e.originalEvent.targetTouches[0].pageY;
					scrolling = (Math.abs(Math.abs(touches.y) - Math.abs(start.y)) > Math.abs(Math.abs(touches.x) - Math.abs(start.x)));

					//Test if touch is a vertical movement.
					if (!scrolling && e.originalEvent.touches.length == 1) {
						e.preventDefault();
					}
				},
				touchend: function(e) {
					//If short then click return false;
					if((e.originalEvent.timeStamp - start.time) < 200) {
						return false;
					}

					if (touches.x > start.x + 40) {
						touches.move = 'right';
						if(touches.move !== touches.dir) {
							touches.dir = touches.move;
							priv.interaction.apply($this);
							priv.beforeAnimating.apply($this, [-1]); //-1
						}
					} else if(touches.x < start.x - 40) {
						touches.move = 'left';
						if(touches.move !== touches.dir) {
							touches.dir = touches.move;
							priv.interaction.apply($this);
							priv.beforeAnimating.apply($this, [1]);
						}
					}

				}
			});
			
			$this.siblings('.redils-controls').on('click', '.' + $this.set.arrowContClass, function() {
				var dir = ($(this).hasClass($this.set.rightArrowClass)) ? 1 : -1;
				if($this.set.debug) { console.log('Arrows clicked direction: ', dir); }
				
				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [dir]);
			});

			$this.siblings('.' + $this.set.pagClass).on('click', 'a', function() {
				var index = $(this).index();
				if($this.set.debug) { console.log('Pagination links clicked index: ', index); }
				
				priv.interaction.apply($this);
				$this.data({'position': (index + $this.set.overflow)});
				priv.beforeAnimating.apply($this, [0]);
				return false;
			});

			$(window).on('resize', function() {
				if($this.set.fullWidth !== false) {
					priv.fullWidth.apply($this);
					priv.totalWidth.apply($this);
					$this.set.totalPos = priv.totalPos.apply($this, [$this.set.position]);
				}
				if($this.set.center) {
					priv.center.apply($this, [$this.set.position]);
				}
				if($this.set.autoResize) priv.update.apply($this); 
			});

		},
		update: function() {
			var $this = this;

			if($this.set.autoResize) {
				$this.parent().height($this.parent().width() / $this.set.ratio);
			}

			if($this.set.slide) {
				//If Dyn get new array of widths.
				priv.totalWidth.apply($this);

				if($this.set.center) {
					//Reset center
					priv.center.apply($this, [$this.set.position]);
				}
				
				//Reset scrollLeft
				$this.set.totalPos = priv.totalPos.apply($this, [$this.set.position]);


				$this.scrollLeft($this.set.totalPos - $this.set.offset);

			} else {
				priv.compress.apply($this);
			}

		},
		compress: function() {
			var zIndex = 10000;

			this.css({'position': 'relative','z-index':500}).find('.' + this.set.slideClass).each(function() {
				$(this).css({'position':'absolute','left':0,'top':0,'z-index':zIndex});
				zIndex--;
			});

		},
		center: function(position) {

			if(this.set.width === 'dyn') {
				this.set.offset = (this.width() - parseInt(this.set.dynWidth[position])) / 2;
			} else {
				this.set.offset = (this.width() - parseInt(this.set.width)) / 2;
			}

		},
		fullWidth: function() {
			var winWidth = $(window).width();

			if(winWidth > this.set.fullWidth) {
				this.set.width = winWidth;
				this.find('.' + this.set.slideClass).width(this.set.width);
			}

		},
		totalPos: function(amount) {
			var pos = 0,
				obj = $.isEmptyObject(this.data()) ? this.set : this.data();

			if(this.set.width === 'dyn') {
				for (var i = 0; i < amount; i++) {
					pos += obj.dynWidth[i];
				}
			} else {
				pos = amount * parseInt(this.set.width);
			}

			return pos;
		},
		totalWidth: function() {
			var $this = this;

			$this.set.contWidth = 0;
			$this.set.dynWidth = [];

			//Work out total width
			if($this.set.width === 'dyn') {
				$this.find('.' + $this.set.slideClass).each(function(i) {
					if($this.set.autoResize) {
						$this.set.dynWidth[i] = $this.parent().width();
						$(this).width($this.set.dynWidth[i]);
					} else {
						$this.set.dynWidth[i] = ($(this)[0].naturalWidth !== undefined) ? $(this)[0].naturalWidth : $(this).width();
					}
					$this.set.contWidth += $this.set.dynWidth[i];
					if($this.set.debug && $(this).find('img')[0]) { console.log('Slide widths: ', $(this).width(), $(this).find('img')[0].naturalWidth); }
				});
			} else {
				$this.set.contWidth = $this.set.totalAmount * parseInt($this.set.width);
			}

			$this.find('.' + $this.set.slideContClass).width($this.set.contWidth);
			$this.data('dynWidth', $this.set.dynWidth);

		},
		overflow: function() {
			var $slides = this.find('.' + this.set.slideClass);
			//Add in extra slides depending on formation of slider.
			//Should repeat the last ones first and the first ones last. i.e. b|c + a|b|c + a|b
			for (var i = 0; i < this.set.overflow; i++) {
				if(this.set.overflow <= this.set.totalAmount) {
					this.find('.' + this.set.slideContClass)
						.append($slides.eq(i).clone());
					this.set.totalAmount++;

					if(this.set.slide) {
						this.find('.' + this.set.slideContClass)
							.prepend($slides.eq(-i - 1).clone());
						this.set.totalAmount++;
						this.set.position++;
					}
				}
			}

		},
		pagination: function() {
			var html = '<div class="center-pagination">',
				str = 'a',
				num = 1,
				pre = '',
				post = '';

			for (var i = 0; i < this.set.totalAmount; i++) {
				pre = this.find('.' + this.set.slideClass).eq(i).data('pagination-pre');
				post = this.find('.' + this.set.slideClass).eq(i).data('pagination-post');

				html += '<a href="#">';

				if(this.set.attach === 'pre' && pre !== undefined) html += '<span class="pre-pagination">' + pre + '</span>';
				html += '<span class="default-pagination">';

				if(this.set.pagination === 'str') {
					html += str;
					str = String.fromCharCode(str.charCodeAt(0) + 1);
				} else if(this.set.pagination === 'num') {
					html += num++;
				}

				html += '</span>';
				if(this.set.attach === 'post' && post !== undefined) html += '<span class="post-pagination">' + post + '</span>';

				html += '</a>';
			}

			html += '</div>';
			
			this.siblings('.' + this.set.pagClass).html(html);
		},
		beforeAnimating: function(dir) {
			var $this = this;

			$this.set.position = $this.data('position');

			//Adding the overflow offset will enable us to use absolute positions.
			if($this.set.position + dir > $this.set.totalAmount - 1 - $this.set.overflow) {
				if($this.set.debug) { console.log('Before Sliding -> reached end | pos: ', $this.set.position,' dir: ', dir,' total: ', $this.set.totalAmount,' overflow: ', $this.set.overflow, ' case left: ', $this.set.position + dir, ' case right: ', $this.set.totalAmount - 1 - $this.set.overflow); }
				$this.set.ends = $this.set.position + dir;
				$this.set.position = $this.set.slide ? (0 + $this.set.overflow) : 0;
				
			} else if($this.set.position + dir < 0 + $this.set.overflow) {
				if($this.set.debug) { console.log('Before Sliding -> reached start | pos: ', $this.set.position,' dir: ', dir,' overflow: ', $this.set.overflow, ' case left: ', $this.set.position + dir, ' case right: ', 0 + $this.set.overflow); }
				$this.set.ends = $this.set.position + dir;
				$this.set.position = $this.set.totalAmount - 1 - $this.set.overflow;
			} else {
				if($this.set.debug) { console.log('Before Sliding -> middle | pos: ', $this.set.position,' dir: ', dir,' overflow: ', $this.set.overflow); }
				$this.set.position += dir;
			}

			if($this.set.debug) { console.log('Current settings object before animation ', $this.set); }

			$this.set.totalPos = priv.totalPos.apply($this, [$this.set.position]);
			$this.find('.' + $this.set.slideClass).removeClass('focused');
			priv.animating.apply($this);
			priv.currentSlide.apply($this);

		},
		currentSlide: function() {
			var $this = this,
				barTimer = null;

			$this.find('.' + $this.set.slideClass).removeClass('focused').eq($this.set.position).addClass('focused');
			$this.siblings('.' + $this.set.pagClass).find('a').removeClass('selected').eq($this.set.position - $this.set.overflow).addClass('selected');

			if($this.set.timerBar && $this.set.auto !== false) {

				var width = 0,
					speed = 1000 / 60,
					$el = $this.siblings('.' + $this.set.timerBarContClass).find('.' + $this.set.timerBarFillClass),
					dist = Math.round(100 / $this.set.auto * speed * 10) / 10;

				clearInterval($this.set.timer);

				barTimer = function() {
					if(width <= 100) {
						width += dist;
						$el.width(width + '%');
					} else {
						$el.width('100%');
						priv.beforeAnimating.apply($this, [1]);
					}
				};

				$this.set.timer = setInterval(barTimer, speed);

			}
		},
		animating: function() {
			//Handle scroll animation.
			var $this = this,
				moveTo = $this.set.position,
				totalPos = $this.set.totalPos,
				callback = function() { priv.afterAnimating.apply($this); };

			if($this.set.ends !== false) {
				//Decide on end animation:
				
				//Rewind - default
				//Stop - optional
				//Infinite - if extended
				if($this.set.overflow) {
					moveTo = $this.set.ends;
					totalPos = priv.totalPos.apply($this, [moveTo]);
				}
			}

			if($this.set.width === 'dyn' && $this.set.center) {
				priv.center.apply($this, [moveTo]);
			}
			
			if($this.set.slide) {
				$this.animate({
					scrollLeft: totalPos - $this.set.offset
				}, {
					duration: $this.set.speed,
					queue: false,
					complete: callback
				});
			} else {
				$this.find('.' + $this.set.slideClass).eq(moveTo - 1).fadeOut({
					'duration': $this.set.speed,
					'queue': false,
					'complete': callback
				});
			}

		},
		afterAnimating: function() {
			var $this = this;

			//Trigger an event on after slide to connect to.
			if(this.set.overflow && this.set.ends !== false) {
				this.scrollLeft(this.set.totalPos - this.set.offset);
				this.find('.' + this.set.slideClass).show();
				this.set.ends = false;
			}

			$this.data({'position':$this.set.position});

		}
	};

	var methods = {
		init: function(options) {

			window.requestAnimFrame = (function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); }; })();

			return this.each(function() {
				
				var $this = $(this),
					objectData = $this.data();

				$this.set = $.extend({}, defaultOpts, options, objectData, privateOpts);
				$this.set.totalAmount = $this.find('.' + $this.set.slideClass).length;
				if(!$this.set.slide) { $this.set.overflow = 1; }

				//Are there enough slides to create a slider?
				if($this.set.totalAmount > 1) {
					
					//Create additional elements.
					if($this.set.pagination !== false) {
						priv.pagination.apply($this);
					}
					if($this.set.overflow > 0) {
						priv.overflow.apply($this);
					} else {
						$this.scrollLeft(0);
					}

					if($this.set.fullWidth !== false) {
						priv.fullWidth.apply($this);	
					}

					//Test if images are loaded only if there are images
					if($this.find('img').length > 0) {
						priv.testIfLoaded.apply($this);
					} else {
						priv.update.apply($this);
					}

					priv.currentSlide.apply($this);

					//Enable 
					priv.enableEvents.apply($this);
					if($this.set.auto && !$this.set.timerBar) {
						$this.set.timer = setInterval(function() { priv.beforeAnimating.apply($this, [1]); }, $this.set.auto);
					}

				} else {
					$this.addClass('disabled');
					$this.find('.' + $this.set.arrowContClass).hide();
				}

				$this.data($this.set);

			});
		},
		update: function(options) {
			
			return this.each(function() {
				var $this = $(this);

				$this.set = $.extend({}, $this.data(), options);
				if(!$this.set.slide) { $this.set.overflow = 1; }
				priv.update.apply($this);

				$this.data($this.set);
			});

		},
		pauseAnimation: function(options) {
			
			return this.each(function() {
				var $this = $(this);

				$this.set = $this.data();
				clearInterval($this.data('timer'));
			});

		},
		resumeAnimation: function(options) {
			
			return this.each(function() {
				var $this = $(this);

				$this.set = $this.data();
				if(!$this.set.animationStopped) $this.set.timer = setInterval(function() { priv.beforeAnimating.apply($this, [1]); }, $this.set.auto);
			});

		},
		skipTo: function(options) {

			return this.each(function() {
				var $this = $(this);

				$this.set = $this.data();
				var skipToSlide = options.skipToSlide || 0;
				$this.set.position = skipToSlide + $this.set.overflow;

				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [0]);
				
			});

		},
		destroy: function(options) {

			return this.each(function() {
				var $this = $(this);

				$this.set = $.extend({}, $this.data(), options, privateOpts);

			});
		}
	};

	var defaultOpts	= {
		width: 'dyn',
		overflow: 1,
		speed: 200,
		center: false,
		pagination: true,
		attach: false,
		fullWidth: false,
		timerBar: false,
		auto: 4000,
		multiSlide: false,
		autoResize: false,
		slideClass: 'slides',
		pagClass: 'pagination',
		slideContClass: 'slide-cont',
		arrowContClass: 'arrow-area',
		rightArrowClass: 'arrow-area-right',
		timerBarContClass: 'redils-timer',
		timerBarFillClass: 'redils-fill',
		slide: true,
		debug: false
	};

	var privateOpts = {
		contWidth: 0,
		dynWidth: [],
		totalAmount: 0, //in pixel distance
		position: 0, //in consecutive integers
		ends: false,
		offset: 0,
		totalPos: 0,
		timer: null,
		ratio: null,
		animationStopped: false
	};

	$.fn.redils = function(method) {

		//arguments local variable to all functions.
		if (methods[method]) {
			//If explicitly calling a method.
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			//If method is an "object" (can also be an array) or no arguments passed to the function.
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.redils');
		}

	};

})(jQuery, window);
