# Redils - A HTML slider #

A jQuery plugin that changes any HTML content into a slider or fader. Content should be contained within .slide containers. The slider has pagination (numbers, letters, text), timer, timer bar, arrows, carousel animation, rewind animation and overflow slides so that the next and prev slides can be viewed.

### Usage ###


Initiate with `$(selector).redils({'some':'property'});`   
Invoke methods with `$(selector).redils('method', {'some':'property'});`   
Listen for various events on the slider with `$(selector).on('redils.interaction', function(){})`
Example

	$('.redils').redils({
		debug: true,
		pagination: 'num'
	})

### HTML ###

Following structure is required for selector to work. (Using Emmet tab complete for full HTML or check /dev/index.html)

	div
	div.redils>div.slide-cont[style="width: 7020px"]>div.slides*5>img
	table.redils-controls>tbody>tr>td.arrow-area.arrow-area-left>div.arrow^td.center-cell+td.arrow-area.arrow-area-right>div.arrow
	div.redils-controls>div.arrow-area.arrow-area-left>span.chevron-left^div.arrow-area.arrow-area-right>span.chevron-right
	div.pagination


### Events ###

#### redils.interaction ####

Triggers when interacting with the slider. Swipe, click, arrow etc. Is not triggered in automatic slide mode.

	$(selector).on('redils.interaction', function(){ });


#### redils.imagesLoaded ####

Triggers when images in the slider are completely loaded. This triggers before rendered. Not many use cases for this.

	$(selector).on('redils.imagesLoaded', function(){ });


#### redils.rendered ####

When a **multi slider** is fully rendered for the first time and after every recalculation.

	$(selector).on('redils.rendered', function(){ });


#### redils.updated ####

When a the slider is rendered and at every update.

	$(selector).on('redils.updated', function(){ });


#### redils.beforeAnimating ####

This is triggered before the slider starts animating.

	$(selector).on('redils.beforeAnimating', function(){ });


#### redils.afterAnimating ####

This is triggered after the slider starts animating.

	$(selector).on('redils.afterAnimating', function(){ });


### Properties ###

#### width ####

*Default* `'dyn'`   
*Expects* `'dyn', integer`

Enables dynamic widths of the slider. Redils works out how wide each slide is.

	$(selector).redils({width: 'dyn'});


#### overflow ####

*Default* `1`   
*Expects* `0, 1, 2`

Show slides around the main slider area. Clones slides to the end and the beginning of the slide container. Also important for using the slider in a carousel way. Infinity loop of slides.

	$(selector).redils({width: 'dyn'});


#### speed ####

*Default* `200`   
*Expects* `integer`

How fast the animation between slides is.

	$(selector).redils({width: 'dyn'});


#### center ####

*Default* `false`   
*Expects* `boolean`

If the container is bigger than the slide it will center the slide. If not using overflow then padding will be added to the start and the end of the slideshow to center the first and last slides.

	$(selector).redils({center: false});


#### pagination ####

*Default* `true`   
*Expects* `boolean, 'num', 'str', 'line'`

Adds dynamically created elements to pagination container. Pagination *will only be true* if a sibling to the called container has a container with `.pagination`.   
`'num'` `'str'` prints out consecutive numbers, letters respectively. `data-pagination="String"` can be set on each slide to define indivdual unique pagination names on each slide.
Pagination will create following html structure `div.center-pagination>a*5>span.default-pagination` (default-pagination and 5 are subject to options).   
If using `'line'` then a slider will be created as a timeline of the slideshow.

	$(selector).redils({pagination: true});


#### attach ####

*Default* `false`   
*Expects* `false, 'pre', 'post'`

Used in combination with pagination to determine whether or not to add a prefix or suffix to the pagination.

	$(selector).redils({attach: false});


#### fullWidth ####

*Default* `false`   
*Expects* `integer, false`

This makes the slide container fill it's container completely. Integer is the minimum width of the slide container.

	$(selector).redils({fullWidth: false});


#### auto ####

*Default* `4000`   
*Expects* `integer, false`

Integer determines pause length before animating further. False takes away auto animation. Interaction with slider stops animation. To restart it call method resumAnimation.

	$(selector).redils({auto: 4000});


#### autoResize ####

*Default* `false`   
*Expects* `boolean`

Slider resizes based on width of it's container and changes everytime window changes size. Good for stretch resposnsive websites better to handle breakpoint responsive sizing with method update.

	$(selector).redils({autoResize: false});


#### setHeight ####

*Default* `true`   
*Expects* `boolean`

If slider is responsive it's default behaviour is to set the height based on images (due to legacy implications). Having height automatically set is not always necessary or desired as CSS can do this normally fine if the slider is based on image sizes.

	$(selector).redils({setHeight: true});


#### ratio ####

*Default* `false`   
*Expects* `integer, float, false`

If there is more than one image per slide that has different image ratios then this setting will need to be set. Recommended to be set as a data attribute i.e. data-ratio="". Ratio works out as width / height.

	$(selector).redils({ratio: false});


#### multiSlide ####

*Default* `false`   
*Expects* `boolean`

Automatically resizes the size of the container and how many slides that are in that container. Container can be styled with CSS. Super slide container can be defined by changing the multiSlideClass.

	$(selector).redils({multiSlide: false});


#### multiSlidePadding ####

*Default* `0`   
*Expects* `integer`

If there is padding or distance between images in the multislider use this variable to adjust for this. The integer will be doubled to account for both sides of the image. Also can be used to make fewer slides per superSlide.

	$(selector).redils({multiSlidePadding: 0});


#### breakPoints ####

*Default* `false`   
*Expects* `array, false`

Stipulate break points for multislider to change number of sub slides in super slide container. Allows for multiple slides in a super slide container. This requires multislide for it to work.

	$(selector).redils({
		multiSlide: true,
		breakPoints: [{breakAfter: 1200, numSlides: 9}, {breakAfter: 600, numSlides: 4}, {breakAfter: 0, numSlides: 1}],
	});


#### slide ####

*Default* `false`   
*Expects* `boolean`

Should only be used if the plugin is already being used or if you want to switch between the two. Collapses the slider so that the slides are lying on top of each other and has a fade transition.

	$(selector).redils({slide: false});


#### allowKeyboard ####

*Default* `false`   
*Expects* `boolean`

Manipulate the position of the slider with the left and right keys. The animation is on keydown and does not prevent any other listeners on the window event. If you want to preventDefaults then create a listener for that.

	$(selector).redils({allowKeyboard: false});


#### updateHash ####

*Default* `false`   
*Expects* `boolean`

Updates the location hash `window.location.hash`. Each slide should have a data attribute with the desired hash. If none is set it defaults back to slide-# where # is the slide number with index starting at 1.

	$(selector).redils({updateHash: false});


#### debug ####

*Default* `false`   
*Expects* `boolean`

Sets debug mode on, should be off for production.

	$(selector).redils({debug: false});


#### Classes ####

Numerous classes can be reassigned. Check the `defaultOpts {} as to which classes are able to be manipulated.


### Methods ###

#### update ####

Run update when the slider has changed size that requires the recalculation of positions and size widths.

	$(selector).redils('update');


#### pauseAnimation ####

Used to pause animation i.e. onmousenter of container pause animation.

	$(selector).redils('pauseAnimation');


#### resumeAnimation ####

Used to resume animation i.e. onmouseleave of container resume animation.

	$(selector).redils('resumeAnimation');


#### moveTo ####

Define outside of the plugin container which slide to move to. Option moveTo takes either a positive integer or negative integer. Positive moves the slider one to the right, negative, one to the left.

	$(selector).redils('moveTo', {moveTo: 1});


#### skipTo ####

Define outside of the plugin container which slide to skip to. 

	$(selector).redils('skipTo', {skipToSlide: 3});


### Changelog ###

**Version 1.11.2**   
Fixed bugs with touch interaction on pagination line.

**Version 1.11.1**   
A more accurate representation of size for each slide. Slides previously were automatically rounded via javascript's clientWidth therefore not giving an accurate length when using many slides.

**Version 1.11.0**   
Added a new type of pagination for continuous sliding of the slideshow. Added padding to the slideshow for center to center the first and last slides.

**Version 1.10.0**   
Even if slider only has one slide will now get all dimensions of a non-disabled slider. Making it easier when implementing.

**Version 1.9.10**   
Changed bower dependencies.

**Version 1.9.9**   
Total width now runs preliminarily for responsive slides before checking if images are loaded as this is based on size of container. Also updated fader to have updated total widths.

**Version 1.9.8**   
If all images are not loaded after 2.5 seconds carry on with execution of slider anyway. This will probably need further refinement.

**Version 1.9.7**   
Added a new event for when slider is updated and on initial load.

**Version 1.9.6**   
Added a class for when the slider's images had completed loading.

**Version 1.9.5**   
Running update was converting non-multisliders into multisliders.

**Version 1.9.4**   
Moved position of the before animating event. So that the position is correctly defined as the next position.

**Version 1.9.3**   
Edited bower dependencies for jQuery to >=1.8

**Version 1.9.2**   
Added two triggers for listening to before the slider slides and after the slider finishes its animation.

**Version 1.9.1**   
Multislide now has a class added to it for the disabling of arrows and pagination when there is only one slide left. This does not disable sliding in any way and is responsive.

**Version 1.9.0**   
Added in an optional height for responsive sliders. This is so that there can be headers on some slides.

**Version 1.8.2**   
Removed id's on duplicated slides to avoid conflicts with original slides.

**Version 1.8.1**   
Updated the method update to force a reload and re-calculation of multisliders. Also ran update through test for images as it is likely that images may not be fully loaded on update.

**Version 1.8.0**   
Added a new slider layout. Contact sheet. Several slides with a predetermined breakpoint. *Important* breakpoint is not window based but based on container that slides sit in. This allows responsive images that stretch and at a certain point break into more slides. This is an addition to the multislide function. Also in this release a minor bug was discovered and fixed related to having several multisiders of different proportions on the same page.

**Version 1.7.1**   
Edited default values for hash. Removed overflow slides from being counted. Fixed on load with no hash.

**Version 1.7.0**   
Added many more external controls. Now possible to control the slider with keyboard and via external buttons to move to the next/prev slide. Hash is updateable via adding a data-hash attribute to the elements. On reload the slider automatically comes back to that position. Removed variables from scss.

**Version 1.6.5**   
Small touch ups. Added arrows to demo and did a test with padding for the slider. Updated to latest gulp plugin locally.

**Version 1.6.4**   
Tweaked the feel of touch sliding. If sliding to the right or the left more than vertically scrolling is disabled.

**Version 1.6.3**   
Touch events have been rewritten and optimized so that it's not on touchend but on touchmove the slider slides among other optimizations for touch events. Rewrote how position works for the slides, now completely dependent on the data object. Pagination now works for multislide and fader.

**Version 1.6.2**   
Added a class for redils activated.

**Version 1.6.1**   
Refactored how the slider fades between slides. Now using relative z-indexes. Fader now is by-directional.

**Version 1.6.0**   
Initialized deprecation of using tables as arrow controls now using divs. Added a bug fix to the slider that is not multislide or autoresize.

**Version 1.5.5**   
Many fixes to the way multislider works. When the slides within the multislider is only one the slider changes back to single slides.

**Version 1.5.4**   
Event on the redils element for when the slider is finished rendering.

**Version 1.5.3**   
Added a fixed ratio property for sliders that have multiple images in it.

**Version 1.5.2**   
Removed some faulty logic that made multislide not update on resize.

**Version 1.5.1**   
Better image width handling. Image width was based on `naturalWidth` which meant if the image was naturally large i.e. for retina screens the size of the image was read wrong. Now back to using jQuery `.width()` command. Code needs to be refactored to take into account image loading. Too many functions doing similar things.

**Version 1.5.0**   
Added the possibility for multiple slides to be placed in one super slide. The slider can then slide multiple slides at the one time. The CSS has changed a bit and is now dependent on redils-responsive and redils-multislide. This will continue for all use cases. 

**Version 1.4.2**   
Fixes to the resize feature. Slider was not responding on all browsers to resizing.

**Version 1.4.1**   
Added a development version of the code in the final dist folder as well.

**Version 1.4.0**   
Auto resize now updates the size of the slider based on parent container's width and ratio of slides. Using naturalWidth/naturalHeight

**Version 1.3.4**   
Tidying up resize of the slider added an option to have the resize decided by the plugin or from outside.

**Version 1.3.3**   
Added 1px to each slide to account for subpixels.

**Version 1.3.2**   
Fixed a few bugs regarding resizing the slider and updating slide widths.

**Version 1.3.1**   
If on interaction slider stops, if on pause or resume slider continues only if it hasn't been interacted with.

**Version 1.3**   
Added a new method skipToSlide.

**Version 1.2.1**   
Added a small fix for pagination pre/post so if there is no data tag and it returns undefined it isn't printed.

**Version 1.2**   
Added in pause and resume animation

**Version 1.1**   
Individual pagination menu items
Full width slides
Fix on update

**Version 1.0**  
Basic slider finished.



### Development ###

**Requirements**
* This plugin requires [node](http://nodejs.org/), [gulpjs](http://gulpjs.com/) and [bower](http://bower.io/).
* Follow JSCS guidelines a styling-example.js is also included.
* Run `bower install` and `npm install` to get dev dependencies. Bower and Gulp is assumed to be running globally.

### Contact ###

This is a small plugin by Young Skilled.
Contact [richard](mailto:richard@youngskilled) for more details about this plugin.