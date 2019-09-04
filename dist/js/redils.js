;(function(factory) {
	if(typeof module === 'object' && typeof module.exports === 'object') {
		factory(require('jquery'), window);
	} else {
		factory(jQuery, window);
	}
}(function($, window) {

	//Private Methods
	var priv = {
		isImageLoaded: function(img) {
			if(!img.complete) return false;
			if (typeof img.naturalWidth != 'undefined' && img.naturalWidth === 0) return false;
			return true;
		},
		testIfLoaded: function(force) { //id, $imgs
			var $this = this;
			var imgIsLoaded = null;
			var numLoaded = 0;
			var $imgs = this.find('img');
			var totalImages = $imgs.length;
			var halfway = false;
			var forced = force || false;
			var startTimer = new Date().getTime() + 2500;
			//Losing data in following loop for some reason... Saving as local variable to be re-applied
			var position = $this.data('position');

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
					if($this.set.ratio === false) $this.set.ratio = ($imgs[0].naturalWidth !== undefined) ? $imgs[0].naturalWidth / $imgs[0].naturalHeight : $imgs.eq(0).width() / $imgs.eq(0).height();
					$this.data('position', position);
					priv.update.apply($this, [forced]);
					halfway = true;
				}

				if(imgIsLoaded || startTimer < new Date().getTime()) {
					$this.trigger('redils.imagesLoaded').addClass('redils--imagesLoaded');
					//ensure all images are loaded before determining the length use natural dimensions when possible
					if($this.set.ratio === false) $this.set.ratio = ($imgs[0].naturalWidth !== undefined) ? $imgs[0].naturalWidth / $imgs[0].naturalHeight : $imgs.eq(0).width() / $imgs.eq(0).height();
					$this.data('position', position);
					priv.update.apply($this, [forced]);
					window.setTimeout(function() {
						priv.update.apply($this, [forced]);
					}, 1);
				} else {
					requestAnimFrame(imgLoaded);
				}
			})();

		},
		interaction: function() {
			var $this = this;

			$this.trigger('redils.interaction', [$this]);
			if($this.set.auto) {
				$this.set.animationStopped = true;
				$this.data('animationStopped', true);
				clearInterval($this.set.timer);
				$this.set.timerBar = false;
			}
		},
		paginationNavigationEvents: function() {
			var $this = this;

			//Click on pagination
			$this.siblings('.' + $this.set.pagClass).on('click.redils', '.center-pagination a', function(e) {
				e.preventDefault();

				var index = $(this).index();
				if($this.set.debug) { console.log('Pagination links clicked index: ', index); }
				
				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [0, (index + $this.set.overflow)]);
			});
		},
		paginationDragEvents: function() {
			var $this = this;
			var mouseStart;
			var mousePosition;
			var $container = $this.siblings('.' + $this.set.pagClass);
			var $handle = $container.find('.pagination-inner a');
			var handleLength = $handle.width();
			var containerLength = $container.width() - handleLength;
			var handleStart;
			var containerStart;
			var contWidth;
			var handlePosition;
			var handlePositionPercentage;
			var paddingLeft;
			var paddingRight;

			var dragSliderPagination = function(e) {
				if(e.type === 'mousemove') {
					mousePosition = e.pageX;
				} else {
					mousePosition = e.originalEvent.targetTouches[0].pageX;
				}
				handlePosition = handleStart - containerStart + mousePosition - mouseStart;
				handlePositionPercentage = handlePosition / containerLength;

				if(handlePosition > containerLength) {
					$handle.css('left', containerLength);
					$this.scrollLeft(contWidth);
					handlePositionPercentage = 1;
				} else if(handlePosition < 0) {
					$handle.css('left', 0);
					$this.scrollLeft(0);
					handlePositionPercentage = 0;
				} else {
					$handle.css('left', handlePosition);
					$this.scrollLeft(contWidth * handlePositionPercentage);
				}
			};

			//Pagination slider control.
			$this.siblings('.' + $this.set.pagClass).on('click.redils', function(e) {
				e.preventDefault();
				e.stopPropagation();

				if(Math.abs(mouseStart - mousePosition) < 5) {
					//Performed a static click
					handlePosition = e.pageX - containerStart;
					handlePositionPercentage = handlePosition / containerLength;

					if(handlePosition > containerLength) {
						handlePositionPercentage = 1;
					} else if(handlePosition < 0) {
						handlePositionPercentage = 0;
					}

					position = Math.round(($this.set.totalAmount - 1) * handlePositionPercentage);

					$handle.animate({
						left: position / ($this.set.totalAmount - 1) * containerLength
					}, $this.set.speed);

					$this.set.paginationLinePosition = position;

					priv.interaction.apply($this);
					priv.beforeAnimating.apply($this, [0, (position + $this.set.overflow)]);

				}
			}).on('mousedown.redils touchstart.redils', function(event) {
				//If mouseevents
				if(event.type === 'mousedown') {
					event.preventDefault();
					mouseStart = event.pageX;
					mousePosition = event.pageX;
				} else {
					mouseStart = event.originalEvent.targetTouches[0].pageX;
					mousePosition = event.originalEvent.targetTouches[0].pageX;
				}

				$container = $(this);
				$handle = $(this).find('.pagination-inner a');
				handleLength = $handle.width();
				containerLength = $container.width() - handleLength;
				handleStart = $handle.offset().left;
				containerStart = $container.offset().left;
				paddingLeft = parseInt($this.find('.' + $this.set.slideContClass).css('paddingLeft'));
				paddingRight = parseInt($this.find('.' + $this.set.slideContClass).css('paddingRight'));
				contWidth = $this.set.contWidth + paddingLeft - $this.parent().width() + paddingRight;

				$this.set.handlePaginationDrag = true;

				if(event.type === 'mousedown') {
					$(this).on('mousemove.redils', function(e) {
						window.requestAnimFrame(function() {
							dragSliderPagination(e);
						});
					});
				}

			}).on('touchmove.redils', function(e) {
				window.requestAnimFrame(function() {
					dragSliderPagination(e);
				});
			});


			$(window).on('mouseup.redils touchend.redils', function() {
				if($this.set.handlePaginationDrag) {
					$this.siblings('.' + $this.set.pagClass).off('mousemove.redils');
					$this.set.handlePaginationDrag = false;

					if(Math.abs(mouseStart - mousePosition) > 5) {
						var position = 0;

						//Calculate where handle is dropped. Slide to closest segment.
						position = Math.round(($this.set.totalAmount - 1) * handlePositionPercentage);

						$handle.animate({
							left: position / ($this.set.totalAmount - 1) * containerLength
						}, $this.set.speed);

						$this.set.paginationLinePosition = position;

						priv.interaction.apply($this);
						priv.beforeAnimating.apply($this, [0, (position + $this.set.overflow)]);
					}
				}
			});

		},
		slideDragEvents: function() {
			var $this = this;
			var paddingLeft = 0;
			var isSliding = false;
			var dragStartTime;
			var mouseStart;
			var mousePosition;
			var startScroll;
			var sliderWidth;
			var slideWidth;
			var mouseMovement;
			var mouseMovementPercentage;
			var sliderPosition;
			var touchStartY;
			var touchPositionY;

			var dragSliderSlide = function(e) {
				if(e.type === 'mousemove') {
					mousePosition = e.pageX;
				} else {
					mousePosition = e.originalEvent.targetTouches[0].clientX;
					touchPositionY = e.originalEvent.targetTouches[0].clientY;
				}

				mouseMovement = mousePosition - mouseStart;
				mouseMovementPercentage = mouseMovement / sliderWidth;

				if(isSliding || Math.abs(mouseMovement) > Math.abs(touchStartY - touchPositionY)) {
					//Prevent scrolling while sliding.
					isSliding = true;
				}
				
				if(!$this.set.handleSlideDrag && Math.abs(mouseMovement) > 5) {
					$this.set.handleSlideDrag = true;
					if(e.type === 'mousemove') {
						//Insert div to stop all click events from children.
						$this.find('#redils-click-blocker').css('height', $this.height()).show();
					} else {
						e.preventDefault();
					}
				}

				if(mouseMovementPercentage > 1) {
					mouseMovementPercentage = 1;
				} else if(mouseMovementPercentage < -1) {
					mouseMovementPercentage = -1;
				}
				mouseMovementPercentage = mouseMovementPercentage * -1;
				if($this.set.slide) {
					if($this.set.pagination === 'line') {
						paddingLeft = parseInt($this.find('.' + $this.set.slideContClass).css('paddingLeft'));
					}
					
					if($this.set.isAnimating === false) {
						$this.scrollLeft(paddingLeft + startScroll + slideWidth * mouseMovementPercentage);
					}
				}
			};

			$this.set.handleSlideDrag = false;

			if($this.set.drag) {
				$this.find('.' + $this.set.slideContClass).css('position', 'relative').prepend('<div id="redils-click-blocker" style="position: absolute; z-index: 10000; top: 0; left: 0; width: 100%; height: 100%; display: none;"></div>');
			}

			//Drag slide
			$this.on('mousedown.redils touchstart.redils', function(event) {
				//Always run if touch, optional drag slide with mouse.
				if(event.type === 'touchstart' || ($this.set.drag && event.type === 'mousedown')) {

					if(event.type === 'mousedown') {
						mouseStart = event.pageX;
						mousePosition = event.pageX;
					} else {
						mouseStart = event.originalEvent.targetTouches[0].clientX;
						touchStartY = event.originalEvent.targetTouches[0].clientY;
						mousePosition = event.originalEvent.targetTouches[0].clientX;
						touchPositionY = event.originalEvent.targetTouches[0].clientY;
					}

					dragStartTime = new Date().getTime();

					startScroll = $this.scrollLeft();
					sliderWidth = $this.width();
					sliderPosition = $this.data('position');
					slideWidth = $this.set.dynWidth[sliderPosition];

					if(event.type === 'mousedown') {
						$this.on('mousemove.redils', function(e) {
							window.requestAnimFrame(function() {
								dragSliderSlide(e);
							});
						});
					}

				}

			}).on('dragstart.redils', function(e) {
				if($this.set.drag) {
					e.preventDefault();
					e.stopPropagation();
				}
			}).on('touchmove.redils', function(e) {
				window.requestAnimFrame(function() {
					dragSliderSlide(e);
				});
			});

			$(document).on('touchmove.redils', function(e) {
				if(isSliding) e.preventDefault();
			});

			$(window).on('mouseup.redils touchend.redils', function(e) {
				$this.off('mousemove.redils');
				isSliding = false;

				if($this.set.handleSlideDrag) {
					var toSlide = (mouseMovementPercentage > 0 ? 1 : -1);
					var dragTotalTime = new Date().getTime() - dragStartTime;
					var velocitySpeed = Math.round(dragTotalTime / Math.abs(mouseMovementPercentage));
					var animationSpeed = velocitySpeed > $this.set.speed ? $this.set.speed : velocitySpeed;
					
					$this.set.temporarySpeed = (1 - Math.abs(mouseMovementPercentage)) * animationSpeed;
					$this.set.handleSlideDrag = false;


					//If distance no longer than 30% of slide width left or right return to current slide.
					if(Math.abs(mouseMovementPercentage) > 0.1) {
						priv.interaction.apply($this);
						priv.beforeAnimating.apply($this, [toSlide]);
					} else {
						//Set to same slide as we were on. Didn't move far enough.
						priv.beforeAnimating.apply($this, [0, sliderPosition]);
					}
				}
				mouseStart = mousePosition;
			});

		},
		arrowNavigationEvents: function() {
			var $this = this;
			var position = $this.data('position');

			//Click on arrows
			$this.siblings('.redils-controls').on('click.redils', '.' + $this.set.arrowContClass, function() {
				var dir = ($(this).hasClass($this.set.rightArrowClass)) ? 1 : -1;
				if($this.set.debug) { console.log('Arrows clicked direction: ', dir); }

				if($this.data('position') === 0) $this.data('position', position);
				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [dir]);
			});
		},
		internalEvents: function() {
			var $this = this;
			if($this.set.pagination === 'line') {
				var $handle = $(this).find('.pagination-inner a');
				var $container = $this.siblings('.' + $this.set.pagClass);
			}

			//Images loaded recompiling multislider
			$this.on('redils.imagesLoaded', function() {
				var $slides = $(this).find('.' + $this.set.slideClass).not('.redils-duplicated');
				var subSlideWidths = [];

				if($this.set.slideClass === $this.set.multiSlideClass && $this.set.multiSlide) {
					$slides = $slides.find('.' + $this.set.prevSlideClass);
				}

				if($this.set.multiSlide) {
					$slides.each(function(i) {
						subSlideWidths[i] = $(this).width() + $this.set.multiSlidePadding * 2;
					});

					$this.set.subSlideWidths = subSlideWidths;

					if($this.set.debug) console.log('Individual multislide slide widths: ', $this.set.subSlideWidths);
					priv.multiSlide.apply($this);
				}
			});

			//Resizing events
			$(window).on('resize.redils', function() {
				if($this.set.fullWidth !== false) {
					priv.fullWidth.apply($this);
					priv.totalWidth.apply($this);
					$this.set.totalPos = priv.totalPos.apply($this);
				}

				if($this.set.center) {
					priv.center.apply($this);
					if($this.set.overflow === 0) {
						priv.totalWidth.apply($this);
						$this.set.totalPos = priv.totalPos.apply($this);
					}
					priv.update.apply($this);
				}

				if($this.set.pagination === 'line') {
					handleLength = $handle.width();
					containerLength = $container.width() - handleLength;
					$handle.css('left', $this.data('position') / ($this.set.totalAmount - 1) * containerLength);
				}

				if($this.set.autoResize || $this.set.multiSlide || $this.set.stacked) priv.update.apply($this);
			});
			
		},
		keyboardEvents: function() {
			var $this = this;
			var position = $this.data('position');

			$(window).on('keydown.redils', function(e) {
				if($this.set.debug) console.log('Allow keyboard on key pressed is: ', e.keyCode);
				if($this.data('position') === 0) $this.data('position', position);
				switch (e.keyCode) {
					case 39:
						//key right
						priv.interaction.apply($this);
						priv.beforeAnimating.apply($this, [1]);
						break;
					case 37:
						priv.interaction.apply($this);
						priv.beforeAnimating.apply($this, [-1]);
						break;
				}
			});
		},
		enableEvents: function() {
			var $this = this;
			var touches = {};

			priv.internalEvents.apply($this);
			priv.slideDragEvents.apply($this);
			priv.arrowNavigationEvents.apply($this);
			
			priv.paginationNavigationEvents.apply($this);
			if($this.set.pagination === 'line') {
				priv.paginationDragEvents.apply($this);
			}

			if($this.set.allowKeyboard) {
				priv.keyboardEvents.apply($this);
			}

		},
		disableEvents: function() {
			var $this = this;

			$this.siblings('.' + $this.set.pagClass).off('.redils').off('.redils', '.center-pagination a');
			$(window).off('.redils');
			$this.off('.redils');
			$(document).off('.redils');
			$this.siblings('.redils-controls').off('.redils', '.' + $this.set.arrowContClass);
			$this.off('redils.imagesLoaded');

		},
		update: function(force) {
			var $this = this,
				pageWidth = $this.set.breakPoints === false ? $this.parent().width() : window.innerWidth,
				forced = force || false;

			if($this.set.autoResize && $this.set.setHeight) {
				$this.parent().height($this.parent().width() / $this.set.ratio);
			}

			if($this.set.slide) {

				if($this.set.multiSlide && (pageWidth <= $this.set.multiBreakLess || pageWidth >= $this.set.multiBreakMore || forced)) {
					priv.multiSlide.apply($this);
				}

				//If Dyn get new array of widths.
				priv.totalWidth.apply($this);

				if($this.set.center) {
					//Reset center
					priv.center.apply($this);
				}
				
				//Reset scrollLeft
				$this.set.totalPos = priv.totalPos.apply($this);

				$this.scrollLeft($this.set.totalPos - $this.set.offset);
			} else {
				if(!$this.set.stacked) {
					//Fader update
					priv.compress.apply($this);
				} else {
					priv.stacked.apply($this);
				}

				//If Dyn get new array of widths.
				priv.totalWidth.apply($this);
			}

			if(!$this.set.isRendered) {
				$this.trigger('redils.initiated', [$this.set]);
				$this.set.isRendered = true;
			}
			$this.trigger('redils.updated', [$this.set]);

		},
		compress: function() {
			var $this = this;

			$this.css({'position': 'relative'}).find('.' + $this.set.slideClass).css({
				'position':'absolute',
				'left': 0,
				'top': 0
			});

			$this.find('.' + $this.set.slideContClass).css('width', '');
		},
		stacked: function() {
			var $this = this;
			var scrollBarWidth;

			if($('#redils-hiddenscroll-test').length === 0) {
				$('body').append('<div id="redils-hiddenscroll-test" style="width: 100vw; height: 0;"></div>');
			}

			scrollBarWidth = $(window).width() - $('#redils-hiddenscroll-test').width();

			if(this.set.hasScrollBars !== (scrollBarWidth === 0)) {
				this.set.hasScrollBars = (scrollBarWidth === 0);

				if(scrollBarWidth === 0) {
					$this.find('.' + $this.set.slideContClass).css({position: '', left: ''});
				} else {
					$this.find('.' + $this.set.slideContClass).css({position: 'relative', left: (scrollBarWidth / 2)});
				}
			}
		},
		center: function(pos) {
			var $this = this;
			var position = pos || $this.data('position');
			var startPadding = parseInt($this.find('.' + $this.set.slideContClass).css('paddingLeft'));
			var offset = 0;
			var slideWidth = ($this.set.width === 'dyn') ? $this.set.dynWidth[position] : $this.set.width;

			offset = ($this.width() - parseInt(slideWidth, 10)) / 2;
			$this.set.offset = $this.set.overflow === 0 ? startPadding - offset : offset;
		},
		fullWidth: function() {
			var winWidth = $(window).width();

			if(winWidth > this.set.fullWidth) {
				this.set.width = winWidth;
				this.find('.' + this.set.slideClass).width(this.set.width);
			}

		},
		totalPos: function(pos) {
			var $this = this;
			var position = (pos !== undefined) ? pos : $this.data('position');
			var pxPosition = 0;
			var obj = $.isEmptyObject(this.data()) ? this.set : this.data();

			if(this.set.width === 'dyn') {
				for (var i = 0; i < position; i++) {
					pxPosition += obj.dynWidth[i];
				}
			} else {
				pxPosition = position * parseInt(this.set.width, 10);
			}

			return pxPosition;
		},
		multiSlide: function() {
			var $this = this;
			var pageWidth = $this.parent().width();
			var $slides = null;
			var superSlides = [''];
			var slideHTML = '';
			var totalWidth = 0;
			var slideWidth = 0;
			var currentWidth = 0;
			var totalWidthBefore = 0;
			var j = 0;
			var slidesPerSuper = 0;
			var slidesPerSuperMax = 0;
			var breakPoint = null;
			var currentBreakPoint = 0;


			//Save original slides.
			if($this.set.subSlides === null) $this.set.subSlides = $this.find('.' + $this.set.slideClass).clone();
			$slides = $this.set.subSlides.clone();

			//Make .superSlides
			$slides.each(function(i) {

				//For automatically calculated fixed images.
				if($this.set.breakPoints === false) {
					slideWidth = ($this.set.subSlideWidths.length === 0) ? $(this).width() + $this.set.multiSlidePadding * 2 : $this.set.subSlideWidths[i];
					totalWidth += slideWidth;
					currentWidth += slideWidth;

					//This triggers when the current slide can't fit in previous container.
					//Creates then a new .superSlides.
					if(j !== Math.floor(currentWidth / pageWidth)) {

						//Save offsets to know when to recompile.
						$this.set.multiBreakLess = totalWidthBefore;
						$this.set.multiBreakMore = totalWidth;

						$this.set.dynWidth[j] = pageWidth;
						j++;
						currentWidth = j * pageWidth + slideWidth;
						superSlides[j] = '';
						slidesPerSuper = 0;
					}

					totalWidthBefore = totalWidth;
					
				} else {
					//Responsive images based on breakpoints

					//Sort breakpoints lowest to highest
					$this.set.breakPoints.sort(function(a, b) {
						return parseInt(a.breakAfter) - parseInt(b.breakAfter, 10);
					});
					
					for (var k = 0; k < $this.set.breakPoints.length; k++) {
						breakPoint = parseInt($this.set.breakPoints[k].breakAfter, 10);

						if(window.innerWidth > breakPoint) {
							currentBreakPoint = $this.set.breakPoints[k].numSlides;
							$this.set.multiBreakLess = breakPoint;
							if(k + 1 < $this.set.breakPoints.length) {
								$this.set.multiBreakMore = parseInt($this.set.breakPoints[(k + 1)].breakAfter, 10);
							} else {
								//Use a high number for last breakpoint.
								$this.set.multiBreakMore = 999999;
							}
						}
					}

					if(i !== 0 && i % currentBreakPoint === 0) {
						$this.set.dynWidth[j] = pageWidth;
						j++;
						superSlides[j] = '';
						slidesPerSuper = 0;
					}

				}

				slidesPerSuper++;
				if(slidesPerSuper > slidesPerSuperMax) slidesPerSuperMax = slidesPerSuper;

				superSlides[j] += $(this).prop('outerHTML');

			});

			if($this.set.multiBreakLess === undefined || $this.set.multiBreakMore === undefined) {
				$this.set.multiBreakLess = totalWidthBefore;
				$this.set.multiBreakMore = totalWidth;
			}
			
			//Manipulate HTML into one html string
			if(slidesPerSuperMax === 1) {
				//each slide has only one slide in it...
				slideHTML = superSlides.join('');
				if($this.set.slideClass === $this.set.multiSlideClass) {
					$this.set.slideClass = $this.set.prevSlideClass;
				}
			} else {
				//Wrap slides in a super slide.
				slideHTML = '<div class="' + $this.set.multiSlideClass + '">' + superSlides.join('</div><div class="' + $this.set.multiSlideClass + '">') + '</div>';
				
				if($this.set.slideClass !== $this.set.multiSlideClass) {
					$this.set.prevSlideClass = $this.set.slideClass;
					$this.set.slideClass = $this.set.multiSlideClass;
				}
			}

			if(superSlides.length === 1) {
				$this.parent().addClass($this.set.singleMultiSlideClass);
			} else {
				$this.parent().removeClass($this.set.singleMultiSlideClass);
			}

			//Put back slides into the container.
			$this.find('.' + $this.set.slideContClass).html(slideHTML);

			//Change slider amount.
			$this.set.totalAmount = j + 1;
			
			//Start slider at the start
			$this.data('position', 1);

			//Create pagination
			if($this.set.pagination !== false) {
				if($this.set.pagination === 'line') {
					priv.paginationLine.apply($this);
				} else {
					priv.pagination.apply($this);
				}
			}
			//Add in new slides to enable carousel.
			priv.overflow.apply($this);

			//Everytime this function is run it generates new slides. 
			//Therefore new links need to be made everytime.
			$this.trigger('redils.rendered');

		},
		totalWidth: function() {
			var $this = this;
			var rect = $this[0].getBoundingClientRect();
			var pageWidth = rect.width ? rect.width : rect.right - rect.left;
			var applyStyles = {};

			$this.set.contWidth = 0;
			$this.set.dynWidth = [];


			//Work out total width
			if($this.set.width === 'dyn') {

				$this.find('.' + $this.set.slideClass).each(function(i) {

					if($this.set.autoResize || $this.set.multiSlide) {
						$this.set.dynWidth[i] = pageWidth;
						$(this).width($this.set.dynWidth[i]);
					} else {
						//To get exact width of element including floating point. Javascript clientWidth rounds giving rounding errors for larger amounts of slides.
						rect = $(this)[0].getBoundingClientRect();
						$this.set.dynWidth[i] = rect.width ? rect.width : rect.right - rect.left;
					}

					$this.set.contWidth += $this.set.dynWidth[i];
					if($this.set.debug) console.log('Slide widths: ', $this.set.dynWidth[i]);
				});
			} else {
				$this.set.contWidth = $this.set.totalAmount * parseInt($this.set.width, 10);
			}

			if($this.set.overflow === 0 && $this.set.center) {
				//Give slide container padding to center first and last slides.
				applyStyles.paddingLeft = Math.ceil((pageWidth - $this.set.dynWidth[0]) / 2);
				applyStyles.paddingRight = Math.ceil((pageWidth - $this.set.dynWidth[$this.set.dynWidth.length - 1]) / 2);
			}

			applyStyles.width = $this.set.contWidth;

			$this.find('.' + $this.set.slideContClass).css(applyStyles);
			$this.data('dynWidth', $this.set.dynWidth);

		},
		overflow: function() {
			var $this = this;
			var $slides = $this.find('.' + $this.set.slideClass);
			var $cloneNext;
			var $clonePrev;
			//Add in extra slides depending on formation of slider.
			//Should repeat the last ones first and the first ones last. i.e. b|c + a|b|c + a|b
			for (var i = 0; i < $this.set.overflow; i++) {
				if($this.set.overflow <= $this.set.totalAmount) {
					$cloneNext = $slides.eq(i).clone(false).addClass('redils-duplicated');
					$this.find('.' + $this.set.slideContClass).append($cloneNext);
					$this.set.totalAmount++;
					
					$clonePrev = $slides.eq(-i - 1).clone(false).addClass('redils-duplicated');
					$this.find('.' + $this.set.slideContClass).prepend($clonePrev);

					$this.find('.redils-duplicated').removeAttr('id').find('[id]').removeAttr('id');
					$this.set.totalAmount++;
				
				}
			}

			// console.log('DEBUG: $this.data()', $this.data('position'), $this.set.overflow);
			$this.data('position', $this.set.overflow);
		},
		pagination: function() {
			if (this.set.pagination === 'counter') {
				this.siblings('.' + this.set.pagClass).find('.pagination-total').text(this.set.totalAmount);
				return;
			}
			var html = '<div class="center-pagination">';
			var str = 'a';
			var num = 1;
			var pre = '';
			var post = '';

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
				} else if(this.set.pagination === 'thumb') {
					html += '<img src="' + this.find('.' + this.set.slideClass).eq(i).find('img').attr('src') + '">';
				}

				html += '</span>';
				if(this.set.attach === 'post' && post !== undefined) html += '<span class="post-pagination">' + post + '</span>';

				html += '</a>';
			}

			html += '</div>';
			
			this.siblings('.' + this.set.pagClass).html(html);
		},
		paginationLine: function() {
			var html = '<div class="pagination-inner"><a href="#" class="pagination-inner-handle"></a></div>';
			
			this.siblings('.' + this.set.pagClass).html(html);
		},
		updatePaginationLine: function(position) {

			var $this = this;
			var $container = $this.siblings('.' + $this.set.pagClass);
			var $handle = $container.find('.pagination-inner a');
			var handleLength = $handle.width();
			var containerLength = $container.width() - handleLength;

			$handle.animate({
				left: position / ($this.set.totalAmount - 1) * containerLength
			}, $this.set.speed);

		},
		beforeAnimating: function(dir, newPosition) {
			var $this = this;
			
			if($this.set.totalAmount <= 1) return;

			var position = $this.data('position');
			var prevPosition = position;

			//Adding the overflow offset will enable us to use absolute positions.
			if(position + dir > $this.set.totalAmount - 1 - $this.set.overflow) {
				if($this.set.debug) { console.log('Before Sliding -> reached end | pos: ', position,' dir: ', dir,' total: ', $this.set.totalAmount,' overflow: ', $this.set.overflow, ' case left: ', position + dir, ' case right: ', $this.set.totalAmount - 1 - $this.set.overflow); }
				$this.set.ends = position + dir;
				position = 0 + $this.set.overflow;
				
			} else if(position + dir < 0 + $this.set.overflow) {
				if($this.set.debug) { console.log('Before Sliding -> reached start | pos: ', position,' dir: ', dir,' overflow: ', $this.set.overflow, ' case left: ', position + dir, ' case right: ', 0 + $this.set.overflow); }
				$this.set.ends = position + dir;
				position = $this.set.totalAmount - 1 - $this.set.overflow;
			} else {
				if($this.set.debug) { console.log('Before Sliding -> middle | pos: ', position,' dir: ', dir,' overflow: ', $this.set.overflow); }
				position = (newPosition !== undefined) ? newPosition : position + dir;
			}

			$this.data('prevPosition', prevPosition);
			$this.data('position', position);
			$this.trigger('redils.beforeAnimating', [$this]);
			//This should be the previous slide.
			if(!$this.set.slide && !$this.set.stacked) $this.find('.' + $this.set.slideClass).css({'z-index': '', 'display': 'block'}).eq(prevPosition).css('z-index', 3);

			if($this.set.debug) { console.log('Current settings object before animation ', $this.set); }

			$this.set.isAnimating = true;
			priv.animating.apply($this, [dir]);
			priv.currentSlide.apply($this, [dir]);

		},
		currentSlide: function(dir) {
			dir = dir || 0;
			var $this = this;
			var position = $this.data('position');
			var barTimer = null;
			var hash = '';

			if($this.set.stacked) {
				if(dir > 0) {
					// hidden < left < center < right < hidden
					$this.find('.' + $this.set.slideClass).removeClass('hidden left center right back')
						.eq((position - 2) % $this.set.totalAmount).addClass('hidden back').end()
						.eq((position - 1) % $this.set.totalAmount).addClass('left back').end()
						.eq((position + 0) % $this.set.totalAmount).addClass('center back').end()
						.eq((position + 1) % $this.set.totalAmount).addClass('right back').end();
				} else {
					$this.find('.' + $this.set.slideClass).removeClass('hidden left center right back')
						.eq((position - 1) % $this.set.totalAmount).addClass('left').end()
						.eq((position + 0) % $this.set.totalAmount).addClass('center').end()
						.eq((position + 1) % $this.set.totalAmount).addClass('right').end()
						.eq((position + 2) % $this.set.totalAmount).addClass('hidden').end();
				}
			}

			$this.find('.' + $this.set.slideClass).removeClass($this.set.currentSlideClass).eq(position).addClass($this.set.currentSlideClass);

			//This should be the future slide.
			if(!$this.set.slide && !$this.set.stacked) $this.find('.' + $this.set.slideClass).eq(position).css('z-index', 2);
			$this.siblings('.' + $this.set.pagClass).find('a').removeClass('selected').eq(position - $this.set.overflow).addClass('selected');
			$this.siblings('.' + $this.set.pagClass).find('.pagination-current').text(position - $this.set.overflow + 1);

			if($this.set.pagination === 'line' && $this.set.paginationLinePosition !== position) {
				priv.updatePaginationLine.apply($this, [position]);
				$this.set.paginationLinePosition = position;
			}

			if($this.set.updateHash) {
				hash = $this.find('.' + $this.set.currentSlideClass).data('hash');
				if(hash === undefined) hash = 'slide-' + ($this.find('.' + $this.set.currentSlideClass).index() + 1 - $this.set.overflow);
				window.location.hash = hash;
			}

			if($this.set.timerBar && $this.set.auto !== false) {

				var width = 0;
				var speed = 1000 / 60;
				var $el = $this.siblings('.' + $this.set.timerBarContClass).find('.' + $this.set.timerBarFillClass);
				var dist = Math.round(100 / $this.set.auto * speed * 10) / 10;

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
		animating: function(dir) {
			//Handle scroll animation.
			var $this = this;
			var moveTo = $this.data('position');
			var totalPos = priv.totalPos.apply($this);
			var currentPos = $this.scrollLeft();
			var callback = function() { priv.afterAnimating.apply($this); };
			var speed = $this.set.speed !== $this.set.temporarySpeed ? $this.set.temporarySpeed : $this.set.speed;
			var easing = $this.set.easing || 'swing';
			var endScrollLeft;

			if($this.set.width === 'dyn' && $this.set.center) {
				//Sets new offset as image may be different size than previous image.
				priv.center.apply($this, [moveTo]);
			}
			
			if(speed === 0) {
				if($this.set.slide) {
					$this.scrollLeft(totalPos - $this.set.offset);
				} else {
					$this.find('.' + $this.set.slideClass).eq($this.data('prevPosition')).hide();
				}
				priv.afterAnimating.apply($this);
			} else {
				if($this.set.slide) {

					if($this.set.overflow && ((dir > 0 && currentPos > totalPos - $this.set.offset) || (dir < 0 && currentPos < totalPos - $this.set.offset))) {
						//We need to scroll to an end and scroll from there to the position.
						destinationPos = (dir > 0) ? ($this.set.totalAmount - $this.set.overflow) : ($this.set.overflow - 1);
						startPos = (dir > 0) ? $this.set.overflow : ($this.set.totalAmount - $this.set.overflow - 1);
						endScrollLeft = priv.totalPos.apply($this, [destinationPos]) - $this.set.offset;

						$this.stop().animate({
							scrollLeft: endScrollLeft
						}, {
							duration: speed,
							queue: 'redilsSlide',
							easing: easing,
							complete: function() {
								$this.scrollLeft(priv.totalPos.apply($this, [startPos]) - $this.set.offset);
								totalPos = priv.totalPos.apply($this);
								
								if(totalPos !== $this.scrollLeft()) {

									$this.animate({
										scrollLeft: totalPos - $this.set.offset
									}, {
										duration: (speed / 1.6),
										queue: 'redilsSlide',
										easing: easing,
										complete: callback
									}).dequeue('redilsSlide');
								} else {
									callback();
								}
							}
						}).dequeue('redilsSlide');

					} else {
						//Normal animation

						$this.animate({
							scrollLeft: totalPos - $this.set.offset
						}, {
							duration: speed,
							queue: 'redilsSlide',
							complete: callback,
							easing: easing
						}).dequeue('redilsSlide');
					}
				} else {
					if(!this.set.stacked) {
						$this.find('.' + $this.set.slideClass).eq($this.data('prevPosition')).fadeOut({
							duration: speed,
							queue: false,
							complete: callback,
							easing: easing
						});
					}
				}
			}

			$this.set.temporarySpeed = $this.set.speed;

		},
		afterAnimating: function() {
			var $this = this;

			//Trigger an event on after slide to connect to.
			$this.trigger('redils.afterAnimating', [$this]);

			$this.set.isAnimating = false;

			if($this.set.drag) {
				$this.find('#redils-click-blocker').hide();
			}

			if($this.set.overflow && $this.set.ends !== false) {
				$this.find('.' + $this.set.slideClass).show();
				$this.set.ends = false;
			}

		},
		dismantle: function(options) {
			$this = this;

			//Clear attributes
			$this.removeAttr('style').removeClass('redils-activated disabled redils--imagesLoaded');
			$this.parent().removeAttr('style');
			$this.siblings('.redils-controls').find('.' + $this.set.arrowContClass).removeAttr('style');
			$this.siblings('.' + this.set.pagClass).empty();
			$this.find('.' + $this.set.slideClass).removeAttr('style').removeClass('hidden left center right back ' + $this.set.currentSlideClass);
			$this.find('.' + $this.set.slideContClass).removeAttr('style');

			//Special logic for multislider
			if($this.set.multiSlide) {
				$this.find('.' + $this.set.slideContClass).empty().append($this.set.subSlides);
				$this.parent().removeClass($this.set.singleMultiSlideClass);
				$this.set.slideClass = $this.set.prevSlideClass;
			}

			//Remove elements
			$this.find('#redils-click-blocker').remove();
			$this.find('.redils-duplicated').remove();
			$('body').find('#redils-hiddenscroll-test').remove();

			//Maintain total width property
			if(options.maintainWidth) {
				$this.set.overflow = 0;
				$this.set.center = false;
				$this.set.width = 'dyn';
				$this.set.autoResize = false;
				$this.set.multiSlide = false;
				priv.totalWidth.apply($this);
			}

			//Reset scrolls
			$this.scrollLeft(0);
		}
	};

	var methods = {
		init: function(options) {

			window.requestAnimFrame = (function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); }; })();

			return this.each(function() {
				
				var $this = $(this);
				var objectData = $this.data();
				var pos = 0;

				$this.set = $.extend({}, defaultOpts, options, objectData, privateOpts);

				if($this.set.multiSlide) {
					//Rewrap slides in a superSlide and work with that from here on.
					priv.multiSlide.apply($this);
				}

				$this.set.temporarySpeed = $this.set.speed;

				if($this.set.updateHash) {
					pos = $this.find('[data-hash="' + window.location.hash.replace('#','') + '"]').index();
					if(pos === -1) pos = parseInt(window.location.hash.replace('#slide-',''), 10) - 1;
					if(isNaN(pos)) pos = 0;
					$this.data('position', pos);
				} else if($this.data('position') === undefined) {
					$this.data('position', $this.set.position);
				}

				$this.set.totalAmount = $this.find('.' + $this.set.slideClass).length;
				
				if(!$this.set.slide && !$this.set.stacked) { $this.set.overflow = 0; }


				//Create additional elements.
				if($this.set.pagination !== false && ($this.set.totalAmount > 1 || $this.set.multiSlide)) {
					if($this.set.pagination === 'line') {
						priv.paginationLine.apply($this);
					} else {
						priv.pagination.apply($this);
					}
				}

				if($this.set.overflow > 0 && ($this.set.totalAmount > 1 || $this.set.multiSlide)) {
					priv.overflow.apply($this);
				} else {
					$this.scrollLeft(0);
				}

				if($this.set.fullWidth !== false) {
					priv.fullWidth.apply($this);
				}

				priv.enableEvents.apply($this);
				if($this.set.totalAmount > 1 || $this.set.multiSlide) {
					if($this.set.auto && !$this.set.timerBar) {
						$this.set.timer = setInterval(function() { priv.beforeAnimating.apply($this, [1]); }, $this.set.auto);
					}
				}

				//Quickly apply sizes if not using image sizes.
				if($this.set.autoResize || $this.set.multiSlide) {
					priv.totalWidth.apply($this);
				}

				//Test if images are loaded only if there are images
				if($this.find('img').length > 0) {
					priv.testIfLoaded.apply($this);
				} else {
					priv.update.apply($this);
				}

				if($this.set.totalAmount > 1 || $this.set.multiSlide) {
					
					priv.currentSlide.apply($this);
					$this.addClass('redils-activated');

				} else {

					if($this.set.debug) console.info('Slider is disabled due to insufficient slides');
					$this.addClass('disabled');
					$this.siblings('.redils-controls').find('.' + $this.set.arrowContClass).hide();

				}

				$this.data($.extend({}, $this.set, $this.data()));
			});
		},
		update: function(options) {
			
			return this.each(function() {
				var $this = $(this);

				$this.set = $.extend({}, $this.data(), options);
				if(!$this.set.slide && !$this.set.stacked) { $this.set.overflow = 0; }
				priv.testIfLoaded.apply($this, [true]);

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
		moveTo: function(options) {

			return this.each(function() {
				var $this = $(this);
				var dir = 0;

				$this.set = $this.data();
				dir = options.moveTo > 0 ? 1 : -1;
				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [dir]);
				
			});

		},
		skipTo: function(options) {

			return this.each(function() {
				var $this = $(this);

				$this.set = $this.data();
				var skipToSlide = options.skipToSlide || 0;
				$this.set.temporarySpeed = options.skipToSlideSpeed || $this.set.speed;
				$this.data('position', skipToSlide + $this.set.overflow);

				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [0]);
				
			});

		},
		destroy: function(options) {

			return this.each(function() {
				var $this = $(this);
				options = options || {};  

				$this.set = $this.data();

				//Remove events
				priv.disableEvents.apply($this);

				//Remove timers
				clearInterval($this.data('timer'));

				//Remove elements
				priv.dismantle.apply($this, [options]);

				//Remove data
				$this.removeData();
				delete $this.set;
			});
		}
	};

	var defaultOpts	= {
		width: 'dyn',
		position: 0,
		overflow: 1,
		speed: 200,
		temporarySpeed: 200,
		center: false,
		pagination: true,
		attach: false,
		fullWidth: false,
		timerBar: false,
		auto: 4000,
		multiSlide: false,
		multiSlidePadding: 0,
		autoResize: false,
		setHeight: true,
		ratio: false,
		allowKeyboard: false,
		updateHash: false,
		breakPoints: false,
		stacked: false,
		drag: false,
		easing: false,
		slideClass: 'slides',
		multiSlideClass: 'super-slide',
		pagClass: 'pagination',
		slideContClass: 'slide-cont',
		arrowContClass: 'arrow-area',
		rightArrowClass: 'arrow-area-right',
		timerBarContClass: 'redils-timer',
		timerBarFillClass: 'redils-fill',
		singleMultiSlideClass: 'single-multislide-disable',
		previousSlideClass: 'previous',
		currentSlideClass: 'current',
		nextSlideClass: 'next',
		slide: true,
		debug: false
	};

	var privateOpts = {
		isRendered: false,
		contWidth: 0,
		subSlides: null,
		dynWidth: [],
		subSlideWidths: [],
		totalAmount: 0, //in pixel distance
		ends: false,
		offset: 0,
		totalPos: 0,
		timer: null,
		animationStopped: false,
		handleMoving: false,
		paginationLinePosition: 0,
		hasScrollBars: null,
		isAnimating: false
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

}));
