;(function($, window) {

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
					priv.update.apply($this, [forced]);
					halfway = true;
				}

				if(imgIsLoaded || startTimer < new Date().getTime()) {
					$this.trigger('redils.imagesLoaded').addClass('redils--imagesLoaded');
					//ensure all images are loaded before determining the length use natural dimensions when possible
					if($this.set.ratio === false) $this.set.ratio = ($imgs[0].naturalWidth !== undefined) ? $imgs[0].naturalWidth / $imgs[0].naturalHeight : $imgs.eq(0).width() / $imgs.eq(0).height();
					priv.update.apply($this, [forced]);
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
				$this.data({'animationStopped':true});
				clearInterval($this.set.timer);
				$this.set.timerBar = false;
			}
		},
		enableEvents: function() {
			var $this = this;
			var touches = {};

			//Pagination Line variables.
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

			var moveSlider = function(e) {
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

			$this.on({
				touchstart: function(e) {
					//Get initial values
					touches.slide = false;
					touches.startX = e.originalEvent.targetTouches[0].pageX;
					touches.startY = e.originalEvent.targetTouches[0].pageY;
				},
				touchmove: function(e) {
					var totalX;
					var totalY;

					//Determine if scrolling handle accordingly
					touches.endX = e.originalEvent.targetTouches[0].pageX;
					touches.endY = e.originalEvent.targetTouches[0].pageY;

					//See how far we've moved in either positive or negative direction...
					totalX = Math.abs(Math.abs(touches.startX) - Math.abs(touches.endX));
					totalY = Math.abs(Math.abs(touches.startY) - Math.abs(touches.endY));
					
					//Check that we are not scrolling more than sliding.
					if(totalX > totalY) {
						//We're moving sideways disable scroll.
						e.preventDefault();
					}

					//Check that we haven't already made the slider slide.
					//Check if we've moved our finger more than 50 px sideways left or right.
					if(!touches.slide && totalX > 50) {
						touches.slide = true;
						
						//We started at a lower amount than where we have finished. 
						//We slid our finger from left to right and therefore gone backwards
						if (touches.endX > touches.startX) {
							priv.interaction.apply($this);
							priv.beforeAnimating.apply($this, [-1]);
						} else {
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

			$this.siblings('.' + $this.set.pagClass).on('click', '.center-pagination a', function(e) {
				e.preventDefault();

				var index = $(this).index();
				if($this.set.debug) { console.log('Pagination links clicked index: ', index); }
				
				priv.interaction.apply($this);
				priv.beforeAnimating.apply($this, [0, (index + $this.set.overflow)]);
			});

			//Pagination slider control.
			$this.siblings('.' + $this.set.pagClass).on('click', function(e) {
				if($this.set.pagination === 'line') {
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
				}
			}).on('mousedown touchstart', function(event) {
				if($this.set.pagination === 'line') {

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

					$this.set.handleMoving = true;

					if(event.type === 'mousedown') {
						$(this).on('mousemove', function(e) {
							window.requestAnimFrame(function() {
								moveSlider(e);
							});
						});
					}

				}

			}).on('touchmove', function(e) {
				window.requestAnimFrame(function() {
					moveSlider(e);
				});
			});

			$(window).on('mouseup touchend', function() {
				if($this.set.handleMoving) {
					$this.siblings('.' + $this.set.pagClass).off('mousemove');
					$this.set.handleMoving = false;

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

			$this.on('redils.imagesLoaded', function() {
				var $slides = $(this).find('.' + $this.set.slideClass).not('.redils-duplicated');
				var subSlideWidths = [];

				if($this.set.slideClass === $this.set.multiSlideClass && $this.set.multiSlide) {
					$slides = $slides.find('.' + $this.set.prevSlideClass);
				}

				$slides.each(function(i) {
					if($this.set.multiSlide && $this.set.breakPoints === false) {
						subSlideWidths[i] = $(this).find('img').width() + $this.set.multiSlidePadding * 2;
					} else {
						subSlideWidths[i] = $(this).width() + $this.set.multiSlidePadding * 2;
					}
				});

				$this.set.subSlideWidths = subSlideWidths;
				if($this.set.debug) console.log('Individual multislide slide widths: ', $this.set.subSlideWidths);
				if($this.set.multiSlide) priv.multiSlide.apply($this);

			});

			$(window).on('resize', function() {
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

				if($this.set.autoResize || $this.set.multiSlide) priv.update.apply($this);
			});

			if($this.set.allowKeyboard) {

				$(window).on('keydown', function(e) {
					if($this.set.debug) console.log('Allow keyboard on key pressed is: ', e.keyCode);
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

			}

		},
		update: function(force) {
			var $this = this,
				pageWidth =  $this.parent().width(),
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
				//Fader update
				priv.compress.apply($this);

				//If Dyn get new array of widths.
				priv.totalWidth.apply($this);
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
		center: function(pos) {
			var $this = this;
			var position = pos || $this.data('position');
			var startPadding = parseInt($this.find('.' + $this.set.slideContClass).css('paddingLeft'));

			if($this.set.width === 'dyn') {
				$this.set.offset = startPadding - ($this.width() - parseInt($this.set.dynWidth[position], 10)) / 2;
			} else {
				$this.set.offset = startPadding - ($this.width() - parseInt($this.set.width, 10)) / 2;
			}

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
			var $this = this,
				pageWidth = $this.parent().width(),
				$slides = null,
				superSlides = [''],
				slideHTML = '',
				totalWidth = 0,
				slideWidth = 0,
				currentWidth = 0,
				totalWidthBefore = 0,
				j = 0,
				slidesPerSuper = 0,
				slidesPerSuperMax = 0,
				breakPoint = null,
				currentBreakPoint = 0;


			//Save original slides.
			if($this.set.subSlides === null) $this.set.subSlides = $this.find('.' + $this.set.slideClass).clone();
			$slides = $this.set.subSlides.clone();

			//Make .superSlides
			$slides.each(function(i) {
				var $img = $(this).find('img');

				//For automatically calculated fixed images.
				if($this.set.breakPoints === false) {
					slideWidth = ($this.set.subSlideWidths.length === 0) ? $img.width() + $this.set.multiSlidePadding * 2 : $this.set.subSlideWidths[i];
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

						if(pageWidth > breakPoint) {
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
			$this.data('position', 0);

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

			$this.data('position', $this.set.overflow);
		},
		pagination: function() {
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

			//$this.set.oldPosition = $this.set.position;
			//$this.set.position = $this.data('position');
			//console.log('var $this.set.position, $this.set.oldPosition', $this.set.position, $this.set.oldPosition);


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
			if(!$this.set.slide) $this.find('.' + $this.set.slideClass).css({'z-index': '', 'display': 'block'}).eq(prevPosition).css('z-index', 3);

			if($this.set.debug) { console.log('Current settings object before animation ', $this.set); }

			priv.animating.apply($this);
			priv.currentSlide.apply($this);

		},
		currentSlide: function() {
			var $this = this;
			var position = $this.data('position');
			var barTimer = null;
			var hash = '';

			$this.find('.' + $this.set.slideClass).removeClass('focused').eq(position).addClass('focused');
			//This should be the future slide.
			if(!$this.set.slide) $this.find('.' + $this.set.slideClass).eq(position).css('z-index', 2);
			$this.siblings('.' + $this.set.pagClass).find('a').removeClass('selected').eq(position - $this.set.overflow).addClass('selected');

			if($this.set.pagination === 'line' && $this.set.paginationLinePosition !== position) {
				priv.updatePaginationLine.apply($this, [position]);
				$this.set.paginationLinePosition = position;
			}

			if($this.set.updateHash) {
				hash = $this.find('.focused').data('hash');
				if(hash === undefined) hash = 'slide-' + ($this.find('.focused').index() + 1 - $this.set.overflow);
				window.location.hash = hash;
			}

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
			var $this = this;
			var moveTo = $this.data('position');
			var totalPos = priv.totalPos.apply($this);
			var callback = function() { priv.afterAnimating.apply($this); };
			var speed = $this.set.speed !== $this.set.temporarySpeed ? $this.set.temporarySpeed : $this.set.speed;

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
			
			if(speed === 0) {
				if($this.set.slide) {
					$this.scrollLeft(totalPos - $this.set.offset);
				} else {
					$this.find('.' + $this.set.slideClass).eq($this.data('prevPosition')).hide();
				}
				priv.afterAnimating.apply($this);
			} else {
				if($this.set.slide) {
					$this.animate({
						scrollLeft: totalPos - $this.set.offset
					}, {
						duration: speed,
						queue: false,
						complete: callback
					});
				} else {
					$this.find('.' + $this.set.slideClass).eq($this.data('prevPosition')).fadeOut({
						'duration': speed,
						'queue': false,
						'complete': callback
					});
				}
			}

			$this.set.temporarySpeed = $this.set.speed;

		},
		afterAnimating: function() {
			var $this = this;

			$this.trigger('redils.afterAnimating', [$this]);

			//Trigger an event on after slide to connect to.
			if($this.set.overflow && $this.set.ends !== false) {
				$this.scrollLeft(priv.totalPos.apply($this) - $this.set.offset);
				$this.find('.' + $this.set.slideClass).show();
				$this.set.ends = false;
			}

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
				
				if(!$this.set.slide) { $this.set.overflow = 0; }


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

				$this.data($this.set);

			});
		},
		update: function(options) {
			
			return this.each(function() {
				var $this = $(this);

				$this.set = $.extend({}, $this.data(), options);
				if(!$this.set.slide) { $this.set.overflow = 0; }
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

				$this.set = $.extend({}, $this.data(), options, privateOpts);

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
		slideClass: 'slides',
		multiSlideClass: 'super-slide',
		pagClass: 'pagination',
		slideContClass: 'slide-cont',
		arrowContClass: 'arrow-area',
		rightArrowClass: 'arrow-area-right',
		timerBarContClass: 'redils-timer',
		timerBarFillClass: 'redils-fill',
		singleMultiSlideClass: 'single-multislide-disable',
		slide: true,
		debug: false
	};

	var privateOpts = {
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
		paginationLinePosition: 0
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
