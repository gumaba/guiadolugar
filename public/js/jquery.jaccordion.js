/*jslint browser: true, white: true */
/*global jQuery*/

/*
 * jAccordion
 * Version 1.2.5
 * @requires jQuery v1.4.3 or newer (except v1.8.0)
 * @requires jQuery easing plugin in most cases
 * 
 * Author maniacpc
 * Created exclusively for http://codecanyon.net
 * Licensed under codecanyon's regular license:
 * http://codecanyon.net/licenses/regular_extended
 *
 * jAccordion can be bought at http://codecanyon.net/item/jaccordion/512859
 */

(function ($) {
	"use strict";
    var Accordion = function (element, userSettings) {
        var options = $.extend({}, $.fn.jAccordion.defaults, userSettings),
            version = '1.2.5',
            $_accordion = $(element),
            $slidesWrapper = $(' > .jAccordion-slidesWrapper', $_accordion),
            $slides = $(' > .jAccordion-slide', $slidesWrapper),
            slidesNumber = $slides.length,
            $headers = $(options.headers, $slides),
			// User-defined size of the accordion via CSS
            accDefaultSize = {
                width: parseInt($_accordion.css('max-width'), 10),
                height: $_accordion.height()
            },
			// The actual size of the accordion if responsiveness is used
            accCurrSize = {
                width: 0,
                height: 0
            },
            activeSlideSize,	// Vertical/horizontal size of active slide (depends on option "vertical")
            inactiveSlideSize,	// Vertical/horizontal size of a slide (if no slide is open)
            shrinkedSlideSize,	// Vertical/horizontal size of a non-active slide (if a slide is open)
			/* Stores primary and secondary size. The primary property is height for vertical accordion
			 * and width for horizontal accordion.
			 */
            sizeProp = {
                primary: options.vertical ? 'height' : 'width',
                secondary: options.vertical ? 'width' : 'height'
            },
			/* Stores primary and secondary offset properties. The primary properties are top 
			 * and bottom for vertical accordion and left and right for horizontal accordion.
			 */
            offsetProp = {
				primary1 : options.vertical ? 'top' : 'left',
				primary2 : options.vertical ? 'bottom' : 'right',
				secondary1 : options.vertical ? 'left' : 'top',
				secondary2 : options.vertical ? 'right' : 'bottom'
			},
			/* Sum of left and right and top and bottom border widths. These values are used for calculation of
			 * offset of a slide.
			 */
            bordersWidth = {
                primary: parseInt($slides.eq(0).css('border' + (options.vertical ? 'Top' : 'Left') + 'Width'), 10) +
                    parseInt($slides.eq(0).css('border' + (options.vertical ? 'Bottom' : 'Right') + 'Width'), 10),
                secondary: parseInt($slides.eq(0).css('border' + (options.vertical ? 'Left' : 'Top') + 'Width'), 10) +
                    parseInt($slides.eq(0).css('border' + (options.vertical ? 'Right' : 'Bottom') + 'Width'), 10)
            },
            useCloseSlidesAnim = true,	// Determines whether all slides should be closed when cursor leaves the accordion (Depends on option "sticky")
            resized = false,			// Determines whether width of accordion changed when onResize event occurred
            $activeSlide = null,
            activeSlideIndex = -1,
			/* Variable stores information inidicating whether active slide is completely open, this information is used to determine
			 * whether to hide elements with attribute data-initEvent="onSlideOpened" of closing slide.
			 * It's unwanted to hide these elements when displaying of them didn't start.
			 */
			activeSlideCompletelyOpen = false,
			/* Variable stores width of browser window. It's used to determine change of browser width.
			 * IE triggers resize event even when an element size or position is changed which is unwanted behaviour, that's why
			 * handler of resize event is executed only when browser width changes.
			 */
			windowWidth = -1,
            isAnimated = false, // Stores information about accordion state (isAnimated == true while a slide is opening or closing)
            autoplay = null, // Variable which stores "Timer" which is used as a representation of autoplay
            base = this; // Scope


        /*
         * --------------- Public API ---------------
         */

        // Public variable which stores jQuery object of the accordion.
        base.$accordion = $_accordion;

        /* Method returns version of the plugin.
		 *
		 * @return version of the plugin
		 */
        base.getVersion = function () {
            return version;
        };

        /* Method opens a slide with specified index.
		 *
		 * @param index - index of a slide to open
		 *
		 * @return scope of the plugin
		 */
        base.goToSlide = function (index) {
            $slides.eq(index).triggerHandler('openSlide');
            return base;
        };

        /* Method opens the first slide.
		 *
		 * @return scope of the plugin
		 */
        base.goToFirstSlide = function () {
            base.goToSlide(0);
            return base;
        };

        /* Method opens the last slide.
		 *
		 * @return scope of the plugin
		 */
        base.goToLastSlide = function () {
            base.goToSlide(slidesNumber - 1);
            return base;
        };

        /* Method opens the next slide or the first slide if none or the last one is open.
		 *
		 * @return scope of the plugin
		 */
        base.next = function () {
            if ($activeSlide === null || (activeSlideIndex + 1) === slidesNumber) {
                base.goToSlide(0);
            } else {
                base.goToSlide(activeSlideIndex + 1);
            }
            return base;
        };

        /* Method opens the previous slide or the last slide if none or the first one is open.
		 *
		 * @return scope of the plugin
		 */
        base.prev = function () {
            if ($activeSlide === null || activeSlideIndex === 0) {
                base.goToSlide(slidesNumber - 1);
            } else {
                base.goToSlide(activeSlideIndex - 1);
            }
            return base;
        };

        /* Method closes all slides.
         * Method takes effect only if one of the slide is open and autoplay is disabled.
         *
		 * @return scope of the plugin
		 */
        base.closeSlides = function () {
            if ($activeSlide !== null && !options.autoplay) {
                useCloseSlidesAnim = true;
                $activeSlide.triggerHandler('closeSlide');
            }
            return base;
        };

        /* Method returns boolean value which determines whether any slide is opening or closing.
		 *
		 * @return state of the plugin
		 */
        base.isAnimated = function () {
            return isAnimated;
        };

        /* Method returns number of slides.
		 *
		 * @return number of slides
		 */
        base.getSlidesCount = function () {
            return slidesNumber;
        };

        /* Method returns active slide (if there is one) as jQuery object or null.
		 *
		 * @return active slide as jQuery object
		 */
        base.getActiveSlide = function () {
            return $activeSlide;
        };

        /* Method returns index of active slide or -1 if none is selected. Slides are numbered from 0.
		 *
		 * @return index of active slide (numbered from 0)
		 */
        base.getActiveSlideIndex = function () {
            return activeSlideIndex;
        };

        /* Method returns boolean value which specifies whether autoplay is paused.
		 *
		 * @return state of autoplay functionality
		 */
        base.isPaused = function () {
            if (options.autoplay) {
                return autoplay.isPaused();
            }
            return false;
        };


        /*
         * --------------- Private functions ---------------
         */

		/* Timer represents autoplay functionality of plugin.
		 *
		 * @param callback - function to be executed when timer finishes countdown




		 * @param duration - time period after which @callback is called
         */
        function Timer(callback, duration) {
            var timer,
				startTime,
				timeLeft = duration,
                paused = false;

			// Method restarts timer
            this.restart = function () {
                startTime = new Date();
                timeLeft = duration;
                timer = window.setTimeout(callback, duration);
            };

			// Method resumes timer
            this.resume = function () {
                if (!isAnimated) {
                    startTime = new Date();
                    timer = window.setTimeout(callback, timeLeft);
                }
                paused = false;
                // Callback function to be executed when autoplay is resumed
                if ($.isFunction(options.onResume)) {
                    options.onResume.call(base, {
                        remainingTime: timeLeft
                    });
                }
            };

			// Method stops timer. It can't be resumed again
            this.stop = function () {
                clearTimeout(timer);
                timeLeft = duration;
            };

			// Method pauses timer. It can be resumed again
            this.pause = function () {
                if (!isAnimated) {
                    clearTimeout(timer);
                    timeLeft -= new Date() - startTime;
                }
                paused = true;
                // Callback function to be executed when autoplay gets paused
                if ($.isFunction(options.onPause)) {
                    options.onPause.call(base);
                }
            };

			// Method returns state of timer
            this.isPaused = function () {
                return paused;
            };
        }

		/* Function calculates final size (width/height) of a slide specified by index.
		 *
		 * @param index - index of a slide (numbered from 0)
		 *
		 * @return final size of a slide specified by index
		 */
        function getSlideFinalSize(index) {
			// No slide is active
            if (activeSlideIndex === -1) {
                return inactiveSlideSize;
            }
			// There is active slide but its index is not equal to the one passed to function
            if (index !== activeSlideIndex) {
                return shrinkedSlideSize;
            }
			// Passed index is equal to index of active slide and active slide size is same for every slide
            if (!options.activeSlideAutoHeight) {
                return activeSlideSize;
            }
			/* option activeSlideAutoHeight is enabled, which means that height of every slide (when they are active) can vary
			 * so it's necessary to recalculate size of active slide.
			 */
			activeSlideSize = $slides.eq(index).children('.jAccordion-slideWrapper').height() + bordersWidth.primary;
            return activeSlideSize;
        }

        /* Function calculates final left/top offset of a slide specified by index
		 *
		 * @param index - index of a slide (numbered from 0)
		 *
		 * @return primary offset of a slide specified by index
		 */
        function getSlideFinalOffset(index) {
			// No slide is active
            if (activeSlideIndex === -1) {
                return index * (inactiveSlideSize + options.spacing);
            }
			// Passed index is same or lower than index of active slide
            if (index <= activeSlideIndex) {
                return index * (shrinkedSlideSize + options.spacing);
            }
			// Passed index is higher than index of active slide
            return Math.min(activeSlideSize + options.spacing + (index - 1) * (shrinkedSlideSize + options.spacing), accCurrSize[sizeProp.primary]);
        }

		/* Function returns final left/top and right/bottom offset of a slide specified by index.
		 *
		 * @param index - index of a slide (numbered from 0)
		 *
		 * @return map of final css properties (offset) of a slide specified by index
		 *
		 */
        function getSlideFinalStyle(index) {
			var finalPropsMap = {},
				sizeTemp = getSlideFinalSize(index);
			finalPropsMap[offsetProp.primary1] = getSlideFinalOffset(index);
			finalPropsMap[offsetProp.primary2] = Math.max(0, accCurrSize[sizeProp.primary] - finalPropsMap[offsetProp.primary1] - sizeTemp);
			return finalPropsMap;
        }

		/* Function finds out which slides are going to be animated (final left/top or final right/bottom offset differs from current values)
		 * and whether size of the whole accordion is going to change.
		 *
		 * @return object containing all kinds of attributes necessary for animation of opening/closing slide
		 */
		function precalcAnimProps() {
			var $currSlide,
				currSlideIndex,
				firstAnimatedSlideFinalStyle = {},	//Map of final css properties of the first animated slide
				accStartCSSMap = null,		// Map of css properties assigned to accordion before start of animation
				slidePropsMap = {},			// Map of final css properties of a slide
				animSlidesStartStyle = [],	// Array of properties maps assigned to slides which are going to be animated
				/* Array which stores slides which are going to be animated so only these slides are going to be effected 
				 * inside the step function of animation (improves performance).
				 */
				$animatedSlides = [],
				slideStartCSSMap = {};	// Map of css properties assigned to a slide before start of the animation
			if (options.accordionAutoSize) {
				accStartCSSMap = {};
				accStartCSSMap[sizeProp.primary] = $_accordion[sizeProp.primary]();
				// Calculate final size of accordion when a slide is going to open
				if (activeSlideIndex > -1) {
					if (options.activeSlideAutoHeight) {
						getSlideFinalSize(activeSlideIndex);
					}
					accCurrSize[sizeProp.primary] = activeSlideSize + (slidesNumber - 1) * (shrinkedSlideSize + options.spacing);
				} else {	// Calculate final size of accordion when all slides are going to close
					accCurrSize[sizeProp.primary] = slidesNumber * (inactiveSlideSize + options.spacing) - options.spacing;
				}
				// Save values important for animation only if current size of accordion differs from final size
				if (accStartCSSMap[sizeProp.primary] !== accCurrSize[sizeProp.primary]) {
					// Precalculated value which would have to be calculated in every step of animation
					accStartCSSMap[sizeProp.primary + 'PreCalc'] = accStartCSSMap[sizeProp.primary] - accCurrSize[sizeProp.primary];
				} else {
					accStartCSSMap = null;
				}
			}
			$slides.each(function () {
				$currSlide = $(this);
				currSlideIndex = $currSlide.prevAll('.jAccordion-slide').length;
				slidePropsMap = getSlideFinalStyle(currSlideIndex);
				// top/left offset of the slide before start of animation (depends on option "vertical").
				slideStartCSSMap[offsetProp.primary1] = $currSlide.position()[offsetProp.primary1];
				// bottom/right offset of the slide before start of animation (depends on option "vertical").
				slideStartCSSMap[offsetProp.primary2] = parseFloat($currSlide.css(offsetProp.primary2), 10);
				/* Store only slides which are going to be animated. i.e. their offset is going to change.
				 * If there is only one slide it's going to be animated every time.
				 */
				if ((slideStartCSSMap[offsetProp.primary1] !== slidePropsMap[offsetProp.primary1]) ||
					(slideStartCSSMap[offsetProp.primary2] !== slidePropsMap[offsetProp.primary2]) ||
					(slidesNumber === 1)) {
					// Precalculated value which would have to be calculated in every step of animation
					slideStartCSSMap[offsetProp.primary1 + 'PreCalc'] = slideStartCSSMap[offsetProp.primary1] - slidePropsMap[offsetProp.primary1];
					if ($animatedSlides.length !== 0) {
						// Precalculated value which would have to be calculated in every step of animation
						slideStartCSSMap[offsetProp.primary2 + 'PreCalc'] = slideStartCSSMap[offsetProp.primary2] - slidePropsMap[offsetProp.primary2];
					} else {
						delete slidePropsMap[offsetProp.primary1];
						firstAnimatedSlideFinalStyle = slidePropsMap;
					}
					animSlidesStartStyle.push(slideStartCSSMap);
					$animatedSlides.push($currSlide);
				}
				slideStartCSSMap = {};
			});
			return {
				accPrecalcProps : accStartCSSMap,
				firstAnimSlideFinalStyle : firstAnimatedSlideFinalStyle,
				$animSlides : $animatedSlides,
				animSlidesPrecalcProps : animSlidesStartStyle
			};
		}

		/* Function sets animated elements of a specific slide to their starting positions.
		 *
		 * @param $elem - an animated element which is supposed to be hidden or displayed
		 * @param show - boolean variable specifying whether animated element will be displayed or hidden
		 */
		function showHideAnimElem($elem, show) {
			var moveDirection = $elem.attr('data-moveDirection'),
                offset = $elem.attr('data-offset'),
				elemFinalProps = {},
                fade = $elem.attr('data-fade') === 'true',
				transitionSpeed,
				transitionEasing,
				elemVisibility = {};
			if (!!offset && !!moveDirection) {
				elemFinalProps[moveDirection] = show ? ('-=' + offset) : ('+=' + offset);
			}
			if (show) {
				transitionSpeed = parseInt($elem.attr('data-speed'), 10);
				transitionEasing = $elem.attr('data-easing');
                transitionSpeed = (!!transitionSpeed) ? transitionSpeed : 500;
				transitionEasing = (!!transitionEasing) ? transitionEasing : 'swing';
				if (fade) {
					elemFinalProps.opacity = 1;
					// Restore z-index of faded elements
					$elem.css('z-index', $elem.data('defaultIndex'));
				}
				$elem
					.animate(elemFinalProps, transitionSpeed, transitionEasing, function () {
						/* Remove filter from animated element (applies to IE7 or IE8) so its 
						 * overall look is smooth at least after animation finished.
						 */
						try {
							$(this)[0].style.removeAttribute('filter');
						} catch (e) {}
					});
			} else {
				if (fade) {
					elemFinalProps.opacity = 0;
					elemVisibility['z-index'] = -999;	// Element is "sent to back" so it's impossible to click it
				}
				/* Element is moved to its final state using stop(true, true) and then moved back to starting state.
				 * Method animate() is used instead of method css() because css() supports += and -= since jQuery 
				 * version 1.6 but animate supports this functionality since earlier versions (including 1.4.3
				 * which is the oldest version jAccordion works with).
				 * Default z-index is saved so it can be restored when the element is displayed.
				 */
				$elem
					.stop(true, true)
					.data('defaultIndex', $elem.css('z-index'))
					.animate(elemFinalProps, 0).css(elemVisibility);
			}
		}

		/* Function sets animated elements of a specific slide to their starting positions.
		 *
		 * @param $slide - a slide whose elements are initialized
		 */
        function initAnimElems($slide) {
            $('*[data-initEvent]', $slide).each(function () {
				/* Display all hidden (animated) elements. The elements are never really hidden,
				 * they have visibility: hidden and negative z-index because elements with display: none
				 * don't occupy any space which would cause problems to option activeSlideAutoHeight.
				 * Their position is set to relative (if not absolute already) so z-index takes effect.
				 */
				$(this).css({
					'position' : $(this).css('position') === 'absolute' ? 'absolute' : 'relative',
					'display' : 'block'
				});
				if ($(this).attr('data-initEvent') !== 'onSlideStartClosing') {
					showHideAnimElem($(this), false);
				}
            });
        }

        /* Function displays, delays or hides appropriate elements of a slide
		 *
		 * @param $slide - jQuery object containing an HTML element whose elements will be shown or hidden
		 * @param initEvent - value of attribute data-initEvent of an HTML element which specifies the affected elements
		 * @param show - boolean variable specifying whether elements of the slide will be shown or hidden
		 */
        function showHideAnimElems($slide, initEvent, show) {
            $('*[data-initEvent=' + initEvent + ']', $slide).each(function () {
                var $currElem = $(this),
                    transitionDelay = parseInt($currElem.attr('data-delay'), 10);
                transitionDelay = (!!transitionDelay) ? transitionDelay : 0;
				if (show) {
					if (transitionDelay === 0) {
						showHideAnimElem($(this), true);
					} else {
						/* Delay of displaying animated element.
						 * State of delay and timer (setTimeout()) are stored in data of the animated element so the delay 
						 * can be interrupted if slide is closed before the animation even started.
						 * jQuery method delay() cannot be used because it's improperly stopped by method stop(true, true).
						 * setTimeout() method of javascript and $.proxy() method of jQuery are used instead.
						 */
						$currElem.data(
							{
								'delayState' : 'running',
								'timerDelay' : setTimeout($.proxy(function () {
									showHideAnimElem($(this).data('delayState', 'finished'), true);
								}, $currElem.get(0)), transitionDelay)
							}
						);
					}
				} else {
					/* Delayed animated element which hasn't been displayed yet doesn't have to be hidden
					 * because its displaying hasn't started.
					 */
					if (transitionDelay > 0 && $currElem.data('delayState') === 'running') {
						clearTimeout($currElem.data('delayState', 'finished').data('timerDelay'));
					} else {
						showHideAnimElem($(this), false);
					}
				}
            });
        }

		/* Function removes and sets approprieate attributes/css style to achieve scaling of images.
		 * 
		 * Note: Only images with class 'jAccordion-img' are scaled
		 */
		function scaleImages() {
			var imagesCSSMap = {};
			if (options.scaleImgs === 'fit') {
				imagesCSSMap.width = '100%';
				imagesCSSMap.height = '100%';
			} else if (options.scaleImgs === 'fitWidth') {
				imagesCSSMap.width = '100%';
			} else {
				imagesCSSMap.height = '100%';
			}
			$('img.jAccordion-img', $slides)
					.removeAttr('width')
					.removeAttr('height')
					.css(imagesCSSMap);
		}

		// Function initializes previous and next buttons events
        function initBtnsEvents() {
            if (options.prevBtn !== null) {
                (options.prevBtn).click(function (e) {
					/* Propagation of click event has to be stopped because clicking button placed inside a slide
					 * would also trigger event 'openSlide'.
					 */
                    e.stopPropagation();
                    if ((!options.disableBtnsDuringTransition) || (options.disableBtnsDuringTransition && !isAnimated)) {
                        base.prev();
                    }
                });
            }
            if (options.nextBtn !== null) {
                (options.nextBtn).click(function (e) {
					/* Propagation of click event has to be stopped because clicking button placed inside a slide
					 * would also trigger event 'openSlide'.
					 */
                    e.stopPropagation();
                    if ((!options.disableBtnsDuringTransition) || (options.disableBtnsDuringTransition && !isAnimated)) {
                        base.next();
                    }
                });
            }
        }

		/* Function "disables" links of a specific slide using method of jQuery preventDefault().
		 *
		 * @param $slide - jQuery object containing an HTML element whose links will be disabled
		 */
        function disableLinks($slide) {
			if (!$_accordion.hasClass('jAccordion-keepLinksEnabled')) {
				$('a:not(.jAccordion-keepEnabled)', $slide).bind('click.smartLink', function (e) {
					e.preventDefault();
				});
			}
        }

        /* Function enables links of a slide by unbinding click event in namespace smartLink
		 * so click event handler created by user is not affected.
		 *
		 * @param $slide - jQuery object containing an HTML element whose links will be enabled
		 */
        function enableLinks($slide) {
			if (!$_accordion.hasClass('jAccordion-keepLinksEnabled')) {
				$('a:not(.jAccordion-keepEnabled)', $slide).unbind('click.smartLink');
			}
        }

		/* Function intitializes events of a slide.
		 *
		 * @param $slide - jQuery object containing an HTML element whose events will be initialized
		 */
        function initSlideEvents($slide) {
            var currSlideIndex = $slide.prevAll('.jAccordion-slide').length;
			// Close slide by clicking header inside the slide
            if ($headers !== null) {
                $headers.eq(currSlideIndex).click(function (e) {
					/* It's necessary to check activeSlideIndex first because $activeSlide could be null so 
					 * $activeSlide[0] would cause an error.
					 */
                    if (activeSlideIndex !== -1 && $(this).closest('.jAccordion-slide')[0] === $activeSlide[0]) {
                        e.stopPropagation();
                        base.closeSlides();
                    }
                });
            }

            $slide.bind(options.event, function () {
                $_accordion.focus();	//Activate this instance of jAccordion so only this one can be controlled by keyboard
                $(this).triggerHandler('openSlide');
            }).bind({
                'openSlide': function () {
                    /* In case there is no active slide or user tries to open non-open slide then a slide is open.
                     * DOM comparison method is used to determine whether user tries to open slide which is already open.
                     */
                    if (activeSlideIndex === -1 || $(this)[0] !== $activeSlide[0]) {
                        isAnimated = true;
                        $slides.stop(true);
                        if (options.autoplay) {
                            autoplay.stop();
                        }
                        // Close previously open slide
                        if ($activeSlide !== null) {
                            useCloseSlidesAnim = false;
                            $activeSlide.triggerHandler('closeSlide');
                        }
                        $activeSlide = $(this).addClass(options.activeSlideClass);
                        activeSlideIndex = $activeSlide.prevAll('.jAccordion-slide').length;

						var animProps = precalcAnimProps(),
							animSlidesCount = animProps.$animSlides.length;
                        // Callback function to be executed when a slide starts opening
                        if ($.isFunction(options.onSlideStartOpening)) {
                            options.onSlideStartOpening.call(base, {
                                $slide: $activeSlide,
                                index: activeSlideIndex
                            });
                        }
                        // Display appropriate elements of opening slide
                        showHideAnimElems($activeSlide, 'onSlideStartOpening', true);
                        // Hide elements (of opening slide) which are visible when the slide is closed
                        showHideAnimElems($activeSlide, 'onSlideStartClosing', false);
                        /* Animate only right/bottom offset of the first animated slide and set its primary offset and offset of the other 
						 * slides inside the step function. Only secondary offset is set via method animate to prevent execution of method 
						 * step for every property.
						 */
                        animProps.$animSlides[0].animate(animProps.firstAnimSlideFinalStyle, {
                            duration: options.transitionSpeed,
                            easing: options.easing,
                            step: function (now, fx) {
								var i;
								// Set left/top offset of first animated slide
								animProps.$animSlides[0]
										.css(offsetProp.primary1,
											animProps.animSlidesPrecalcProps[0][offsetProp.primary1] - animProps.animSlidesPrecalcProps[0][offsetProp.primary1 + 'PreCalc'] * fx.pos);
								// Set left/top and right/bottom offset of animated slides
								for (i = 1; i < animSlidesCount; i = i + 1) {
                                    animProps.$animSlides[i]
										.css(offsetProp.primary1,
											animProps.animSlidesPrecalcProps[i][offsetProp.primary1] - animProps.animSlidesPrecalcProps[i][offsetProp.primary1 + 'PreCalc'] * fx.pos)
										.css(offsetProp.primary2,
											animProps.animSlidesPrecalcProps[i][offsetProp.primary2] - animProps.animSlidesPrecalcProps[i][offsetProp.primary2 + 'PreCalc'] * fx.pos);
                                }
								// Set height of accordion (if necessary)
								if (!!animProps.accPrecalcProps) {
                                    $_accordion.css(sizeProp.primary, animProps.accPrecalcProps[sizeProp.primary] - animProps.accPrecalcProps[sizeProp.primary + 'PreCalc'] * fx.pos);
                                }
                            },
                            complete: function () {
								isAnimated = false;
								activeSlideCompletelyOpen = true;
                                // Callback function to be executed after a slide is completely open
                                if ($.isFunction(options.onSlideOpened)) {
                                    options.onSlideOpened.call(base, {
                                        $slide: $activeSlide,
                                        index: activeSlideIndex
                                    });
                                }
                                // Display appropriate elements when the slide is completely open
                                showHideAnimElems($activeSlide, 'onSlideOpened', true);
								if (options.autoplay && !autoplay.isPaused()) {
                                    autoplay.restart();
                                }
                                enableLinks($activeSlide);
								/* Add scrollbars if the slide has class jAccordion-scrollbar or accordion has class jAccordion-scrollbars.
								 * Note: Value "auto" makes scrollbar visible only when necessary.
								 */
								if ($activeSlide.hasClass('jAccordion-scrollbar') || $_accordion.hasClass('jAccordion-scrollbars')) {
									$activeSlide.children('.jAccordion-slideWrapper')
										.css('overflow-' + (options.vertical ? 'y' : 'x'), 'auto')
										.css('overflow-' + (options.vertical ? 'x' : 'y'), 'hidden');
								}
                            }
                        });
                    }
                },
                'closeSlide': function () {
                    isAnimated = true;
                    disableLinks($activeSlide);
					var $closingSlide = $activeSlide,
						closingSlideIndex = activeSlideIndex,
						animProps,
						animSlidesCount;
					// Remove class (added to active slide), scroll slide back to left and top and remove scrollbar of closing slide
					$activeSlide
						.removeClass(options.activeSlideClass)
						.children('.jAccordion-slideWrapper')
						.scrollLeft(0)
						.scrollTop(0)
						.css({
							'overflow-x' : '',
							'overflow-y' : ''
						});
                    $activeSlide = null;
                    activeSlideIndex = -1;
                    // Callback function to be executed when a slide starts closing
                    if ($.isFunction(options.onSlideStartClosing)) {
                        options.onSlideStartClosing.call(base, {
                            $slide: $closingSlide,
                            index: closingSlideIndex
                        });
                    }
                    // Hide appropriate elements of closing slide
                    showHideAnimElems($closingSlide, 'onSlideStartOpening', false);
                    if (activeSlideCompletelyOpen) {
						showHideAnimElems($closingSlide, 'onSlideOpened', false);
						activeSlideCompletelyOpen = false;
					}
					// Show elements which are visible when the slide is closed
                    showHideAnimElems($closingSlide, 'onSlideStartClosing', true);
                    if (useCloseSlidesAnim) {
						$slides.stop(true);
						animProps = precalcAnimProps();
						animSlidesCount = animProps.$animSlides.length;
						/* Animate only right/bottom offset of the first animated slide and set its primary offset and offset of the other 
						 * slides inside the step function. Only secondary offset is set via method animate to prevent execution of method 
						 * step for every property.
						 */
                        animProps.$animSlides[0].animate(animProps.firstAnimSlideFinalStyle, {
                            duration: options.transitionSpeed,
                            easing: options.easing,
                            step: function (now, fx) {
								var i;
								// Set left/top offset of first animated slide
								animProps.$animSlides[0]
										.css(offsetProp.primary1,
											animProps.animSlidesPrecalcProps[0][offsetProp.primary1] - animProps.animSlidesPrecalcProps[0][offsetProp.primary1 + 'PreCalc'] * fx.pos);
								// Set left/top and right/bottom offset of animated slides
								for (i = 1; i < animSlidesCount; i = i + 1) {
                                    animProps.$animSlides[i]
										.css(offsetProp.primary1,
											animProps.animSlidesPrecalcProps[i][offsetProp.primary1] - animProps.animSlidesPrecalcProps[i][offsetProp.primary1 + 'PreCalc'] * fx.pos)
										.css(offsetProp.primary2,
											animProps.animSlidesPrecalcProps[i][offsetProp.primary2] - animProps.animSlidesPrecalcProps[i][offsetProp.primary2 + 'PreCalc'] * fx.pos);
                                }
								// Set height of accordion (if necessary)
								if (!!animProps.accPrecalcProps) {
                                    $_accordion.css(sizeProp.primary, animProps.accPrecalcProps[sizeProp.primary] - animProps.accPrecalcProps[sizeProp.primary + 'PreCalc'] * fx.pos);
                                }
                            },
                            complete: function () {
                                isAnimated = false;
                            }
                        });
                    }
                }
            });
        }

		/* Function sets some initial css properties of a slide.
		 *
		 * @param $slide - jQuery object containing an HTML element
		 */
        function initSlideStyle($slide) {
            var slideIndex = $slide.prevAll('.jAccordion-slide').length,
				slidePropsMap = getSlideFinalStyle(slideIndex);
            slidePropsMap.position = 'absolute';
            slidePropsMap[offsetProp.secondary1] = slidePropsMap[offsetProp.secondary2] = 0;

			$slide
				.css(slidePropsMap)
				.children()
				.wrapAll('<div class="jAccordion-slideWrapper" />')
				.parent('.jAccordion-slideWrapper')
				.css(sizeProp.primary, options.activeSlideAutoHeight ? 'auto' : activeSlideSize - bordersWidth.primary)
				.css(sizeProp.secondary, accCurrSize[sizeProp.secondary] - bordersWidth.secondary)
				.css({'position' : 'relative', 'filter' : 'inherit'});
        }

		// Function changes size of accordion.
        function updateAccordionSize() {
			$_accordion
				.css(sizeProp.primary, accCurrSize[sizeProp.primary])
				.css(sizeProp.secondary, accCurrSize[sizeProp.secondary]);
        }

		/* Function recalculates size of accordion and variables which depend on it.
		 * This function is called for the first time during initialization of the plugin and
		 * it's necessary to calculate all kinds of values even though size of accordion hasn't changed.
		 *
		 * @param firstCall - boolean variable specifying whether this function is called for the first time
		 */
        function recalcAccordionVars(firstCall) {
            var prevWidth = $_accordion.width(),
				ratio;
            $_accordion.css('width', '');
            ratio = $_accordion.width() / accDefaultSize.width;
            if (prevWidth !== $_accordion.width() || firstCall) {
				// Don't change width if option "responsive" is disabled
                accCurrSize.width = options.responsive ? Math.round(accDefaultSize.width * ratio) : accDefaultSize.width;
                /* Ratio for vertical accordion (with option "keepAspectRatio" disabled) is set to 1 => 
				 * height of active slide, inactive slide and shrinked slide won't change. Ratio
				 * is also set to 1 if option "responsive" is disabled.
				 * Note: Ratio can't be set to 1 for horizontal accordion because it would cause static 
				 * width of slides.
				 */
				if ((!options.keepAspectRatio && options.vertical) || !options.responsive) {
                    ratio = 1;
                }
                accCurrSize.height = Math.round(accDefaultSize.height * (options.keepAspectRatio ? ratio : 1));
                if (options.inactiveSlideSize > 0) {
                    inactiveSlideSize = shrinkedSlideSize = Math.round((options.inactiveSlideSize) * ratio);
					if (!options.activeSlideAutoHeight) {
						activeSlideSize = accCurrSize[sizeProp.primary] - (inactiveSlideSize + options.spacing) * (slidesNumber - 1);
					} else if (activeSlideIndex > -1) {
						activeSlideSize = $activeSlide
							.children('.jAccordion-slideWrapper')
							.css({width : accCurrSize.width - bordersWidth.secondary})
							.height() + bordersWidth.primary;
					}
                } else {
                    activeSlideSize = Math.round((options.activeSlideSize) * ratio);
                    inactiveSlideSize = Math.round((accCurrSize[sizeProp.primary] - (options.spacing * (slidesNumber - 1))) / slidesNumber);
                    shrinkedSlideSize = Math.max(0, Math.round((accCurrSize[sizeProp.primary] - activeSlideSize) / (slidesNumber - 1)) - options.spacing);
                }
				if (options.accordionAutoSize) {
					if (activeSlideIndex > -1) {
						accCurrSize[sizeProp.primary] = activeSlideSize + (slidesNumber - 1) * (shrinkedSlideSize + options.spacing);
					} else {
						accCurrSize[sizeProp.primary] = (inactiveSlideSize + options.spacing) * slidesNumber - options.spacing;
					}
				}
				resized = true;
            } else {
                /* If width of accordion didn't change it has to be set back because it was removed in the beginining of this function
                 * and without setting it back its width would change to max-width, which would basically disable responsiveness.
                 */
                updateAccordionSize();
                resized = false;
            }
        }

		/* Function initializes events of the accordion such as mouseenter, mouseleave,
		 * onResize event and keys events.
		 */
        function initAccordionEvents() {
            $slidesWrapper.bind({
                /* Callback function which is executed when mouse enters accordion.
                 * Specifically it's executed when mouse enters .accordion > .jAccordion-slidesWrapper
                 */
                mouseenter: function () {
                    if ($.isFunction(options.onAccordionMouseEnter)) {
                        options.onAccordionMouseEnter.call(base);
                    }
                    if (options.autoplay && options.pauseOnHover) {
                        autoplay.pause();
                    }
                },
                /* Callback function which is executed when mouse leaves accordion.
                 * Specifically it's executed when mouse leaves .accordion > .jAccordion-slidesWrapper.
                 */
                mouseleave: function () {
                    /* Active slide is closed only when mouse leaves .accordion > .jAccordion-slidesWrapper,
					 * which means that cursor can move over space between slides (if option "spacing" 
					 * is specified) and slides won't close (handy if option "sticky" is false).
                     */
                    if (!options.sticky) {
                        useCloseSlidesAnim = true;
                        $activeSlide.triggerHandler('closeSlide');
                    }
                    if ($.isFunction(options.onAccordionMouseLeave)) {
                        options.onAccordionMouseLeave.call(base);
                    }
                    /* It's unwanted to resume autoplay while a slide is opening.
                     * In fact callback onResume is fired anyway but autoplay will start
                     * after a slide is fully open.
                     */
                    if (options.autoplay && options.pauseOnHover) {
                        autoplay.resume();
                    }
                }
            });

            /* ----- Responsiveness -----
             * All animations are immediately finished when size of accordion is changed.
             */
            if (options.responsive) {
                $(window).resize(function () {
					/* Not only javascript engine of IE is slow but that browser is so messed up
					 * that resize event is triggered even when size of any element is changed
					 * even though I specifically write $(window) that's why the condition below.
					 */
					if (windowWidth !== $(window).width()) {
						windowWidth = $(window).width();
						recalcAccordionVars(false);
						if (resized) {
							var slidePropsMap = {};
							$slides.stop(true, true).each(function (e) {
								// Finish animation of all elements inside a slide
								$('*[data-initEvent]:animated', $slides.eq(e)).stop(true, true);
								// Recalculate offset of current slide
								slidePropsMap = getSlideFinalStyle(e);
								// Set offset of current slide and size of slideWrapper
								$slides.eq(e)
									.css(slidePropsMap)
									.children('.jAccordion-slideWrapper')
									.css(sizeProp.secondary, accCurrSize[sizeProp.secondary] - bordersWidth.secondary)
									.css(sizeProp.primary, options.activeSlideAutoHeight ? 'auto' : activeSlideSize - bordersWidth.primary);
							});
							updateAccordionSize();
						}
					}
                });
            }

            // Arrow keys navigation
            if (options.arrowKeysNav) {
                /* Elements with tabindex -1 can be focused. User can control only focused accordion via arrow keys, 
                 * which is very handy if there are more instances of accordion on one page.
                 */
                $_accordion.attr('tabindex', -1);
				// Disable scrolling of page via arrow keys if accordion is active.
				var arrowKeys = [37, 38, 39, 40];
				$(document).keydown(function (e) {
					var code = e.keyCode || e.which;
					if ($.inArray(code, arrowKeys) > -1) {
						if (document.activeElement === $_accordion[0]) {
							e.preventDefault();
						}
					}
				});

                $_accordion.keyup(function (e) {
                    var code = e.keyCode || e.which;
                    switch (code) {
                    case 37:	// left arrow
                    case 38:	// Up arrow
                        base.prev();
                        break;
                    case 39:	// Right arrow
                    case 40:	// Bottom arrow
                        base.next();
                        break;
                    }
                });
            }
        }

		// Function enables/disables dependent options
        function validateOptions() {
			var scaleImgsMethods = ['fit', 'fitWidth', 'fitHeight'];
            /* Handheld devices don't have cursor so they can't trigger 'mouseenter' event 
             * that's why the event is changed to 'click'.
             */
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                options.event = 'click';
            }
            if (options.arrowKeysNav || options.autoplay) {
                options.sticky = true;
            }
			if (options.autoplay && options.defaultActiveSlideIdx === null) {
				options.defaultActiveSlideIdx = 0;
            }
            if ($headers.length !== slidesNumber || options.autoplay) {
                options.headers = $headers = null;
            } else {
				options.sticky = true;
				options.event = 'click';
			}
            if (options.inactiveSlideSize <= 0) {
                options.accordionAutoSize = false;
            }
            if (options.activeSlideAutoHeight) {
                if (options.inactiveSlideSize <= 0 || !options.vertical) {
                    options.activeSlideAutoHeight = false;
                } else {
                    options.accordionAutoSize = true;
                }
            }
			if ($.inArray(options.scaleImgs, scaleImgsMethods) === -1) {
				options.scaleImgs = 'fit';
			}
            if ($(options.prevBtn).length === 0) {
                options.prevBtn = null;
            }
            if ($(options.nextBtn).length === 0) {
                options.nextBtn = null;
            }
        }

        // Function initializes the whole accordion
        function init() {
            validateOptions();
            recalcAccordionVars(true);
            updateAccordionSize();
            initAccordionEvents();
			$_accordion.removeClass('noJS');
            $slides.each(function () {
                var $currSlide = $(this);
                initSlideStyle($currSlide);
                disableLinks($currSlide);
                initSlideEvents($currSlide);
                initAnimElems($currSlide);
            });
			scaleImages();
            initBtnsEvents();
            if (options.autoplay) {
                autoplay = new Timer(function () {
                    base.next();
                }, options.autoplayInterval);
            }
            // Callback function to be executed after accordion is fully loaded
            if ($.isFunction(options.ready)) {
                $_accordion.data('jAccordion', base);
                options.ready.call(base);
            }
            // Open default slide if defined
            if (options.defaultActiveSlideIdx !== null) {
                var userDefinedSlideDuration = options.transitionSpeed;
                options.transitionSpeed = 0;
                base.goToSlide(options.defaultActiveSlideIdx);
                options.transitionSpeed = userDefinedSlideDuration;
				// Finish animations of all elements, it's necessary to delay this action so the animation can start
				window.setTimeout(function () {
					$('*[data-initEvent]:animated', $slides.eq(options.defaultActiveSlideIdx)).each(function () {
						$(this).stop(true, true);
					});
				}, 100);
            }
        }

        // Function configures preloader of images.
        function preload() {
			/* Enable or disable responsiveness before preloading is finished
			 * because the actual responsiveness handled by jQuery is activated
			 * after preloading is complete.
			 */
			if (options.responsive && options.keepAspectRatio) {
				var ratio = accDefaultSize.height / accDefaultSize.width;
				$_accordion
				.css('height', 'auto')
				.append('<div class="jAccordion-CSSResponsive" style="padding-top: ' + (ratio * 100) + '%"></div>');
			} else if (!options.responsive) {
				$_accordion.css('width', accDefaultSize.width);
			}
            $slidesWrapper.hide().jImgPreloader({
                onImagesLoaded: function () {
					if (options.responsive && options.keepAspectRatio) {
						$_accordion.css('height', '').children('.jAccordion-CSSResponsive').remove();
					}
					$slidesWrapper.fadeIn(options.preloadTransitionSpeed, function () {
						try {
							$slidesWrapper.get(0).style.removeAttribute('filter');
						} catch (e) {}
					});
                    init();
                }
            });
        }

        if (options.preloadImages) {
            preload();
        } else {
            init();
        }
    };

    $.fn.jAccordion = function (options) {
        return this.each(function () {
            if (!$(this).data('jAccordion')) {
                new Accordion(this, options);
            }
        });
    };

    $.fn.jAccordion.defaults = {
        vertical: false,
        activeSlideSize: 650,
        inactiveSlideSize: 0,
        transitionSpeed: 500,
        spacing: 0,
        event: 'mouseenter',
        sticky: false,
        autoplay: false,
        autoplayInterval: 3000,
        pauseOnHover: true,
        defaultActiveSlideIdx: null,
        preloadImages: true,
        preloadTransitionSpeed: 500,
        activeSlideClass: 'active_slide',
        easing: 'swing',
        responsive: true,
        keepAspectRatio: true,
		scaleImgs : 'fit',
        arrowKeysNav: false,
        headers: null,
        accordionAutoSize: false,
        activeSlideAutoHeight: false,
        prevBtn: null,
        nextBtn: null,
        disableBtnsDuringTransition: true,
        ready: function () {},
		onSlideOpened: function () {},
        onSlideStartOpening: function () {},
        onSlideStartClosing: function () {},
        onAccordionMouseEnter: function () {},
        onAccordionMouseLeave: function () {},
        onPause: function () {},
        onResume: function () {}
    };
}(jQuery));

/*
 * imgPreloader is sold as a part of jAccordion plugin.
 *
 * imgPreloader
 * Version 1.3
 * @requires jQuery v1.4.3 or newer
 * 
 * Author maniacpc
 * Created exclusively for http://codecanyon.net
 * Licensed under regular license:
 * http://codecanyon.net/licenses/regular_extended
 */
(function ($) {
	"use strict";
    var ImgPreloader = function (element, userSettings) {
        var options = $.extend({}, $.fn.jImgPreloader.defaults, userSettings),
            $imgsContainer = $(element),
            $images = $('img', $imgsContainer),
			total = $images.length,
            toLoad = total,
			imageStateChecker,
			base = this;

		function preloadingDone() {
			if ($.isFunction(options.onImagesLoaded)) {
				options.onImagesLoaded.call(base, {
                    $images: $images
                });
			}
		}

		function imgLoaded($img) {
			if ($.isFunction(options.onImageLoaded)) {
				options.onImageLoaded.call(base, {
                    $image: $img,
					loaded: total - toLoad,
					totalImages: total
                });
			}
		}

		function imgLoadedHandler(img) {
			if ($(img).data('complete') !== true) {
				$(img).data('complete', true);
				/* Remove attrbiute alt of the image because it's displayed when cursor is 
				 * over the image (in IE).
				 */
				img.removeAttribute('alt');
				toLoad -= 1;
				imgLoaded($(img));
				if (toLoad === 0) {
					preloadingDone();
				}
			}
		}

        if (toLoad === 0) {
			preloadingDone();
		} else {
			$images.one('load error', function () {
				imgLoadedHandler(this);
			});
			imageStateChecker = window.setInterval(function () {
				if (toLoad > 0) {
					$images.each(function(i, img) {
						if (!$images.eq(i).data('complete') && img.complete) {
							imgLoadedHandler(img);
						}
					});
				} else {
					window.clearInterval(imageStateChecker);
				}
			}, 500);
		}
    };

    $.fn.jImgPreloader = function (options) {
        return this.each(function () {
            if (!$(this).data('jImgPreloader')) {
                var preloader = new ImgPreloader(this, options);
                $(this).data('jImgPreloader', preloader);
            }
        });
    };

    $.fn.jImgPreloader.defaults = {
		onImageLoaded : function () {},
        onImagesLoaded : function () {}
    };
}(jQuery));