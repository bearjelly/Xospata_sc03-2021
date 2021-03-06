var com = com || {};
com.vclm = com.vclm || {};
com.vclm.mt = {
    /* DOM Caching */
    dom: {
        body: $("body"),
        container: $("#container"),
        email: null
    },

    /* Interaction */
    isVeeva: false,
    extension: ".html",

    noSwipe: false,
    pressEvent: "mousedown",
    releaseEvent: "mouseup",
    exitEvent: "beforeunload",
    fastClick: null,

    /* Animation */
    animations: 1,

    /* Navigation */
    currentSlide: "",
    previousSlide: "",
    nextSlide: "",

    /**
     * Initialisation of MT
     */

    start: function() {
        if (
            navigator.userAgent.match(/iPad/i) !== null ||
            com.vclm.mt.isVeevaEnvironment()
        ) {
            com.veeva.clm.getDataForCurrentObject(
                "Presentation",
                "Presentation_Id_vod__c",
                function(result) {
                    com.vclm.mt.initConfig(result.Presentation.Presentation_Id_vod__c);
                }
            );
        } else {
            com.vclm.mt.initConfig(com.vclm.mt.getCurrentPresentation());
        }
    },
    initConfig: function(presentation) {
        switch (presentation) {

            case "Xospata_sc03-2021":
                com.vclm.mtconfig = com.vclm.main;
                break;


        }
        com.vclm.mt.initialise();
    },
    initialise: function() {
        // Prevent rubberbanding.
        if (com.vclm.mtconfig.vclmPortrait == 0) {
            document.addEventListener(
                "touchmove",
                function(e) {
                    e.preventDefault();
                },
                false
            );
        }
        com.vclm.mt.fastClick = Origami.fastclick;
        com.vclm.mt.fastClick(document.getElementById("container"));

        // If the application is running in iRep, either on desktop or iPad
        // set up initialise for this environment
        if (
            navigator.userAgent.match(/iPad/i) !== null ||
            com.vclm.mt.isVeevaEnvironment()
        ) {
            com.vclm.mt.isVeeva = true;
            com.vclm.mt.extension = ".zip";
            com.vclm.mt.pressEvent = "mousedown";
            com.vclm.mt.releaseEvent = "touchend";
        }

        if (navigator.userAgent.match(/iPad/i) !== null) {
            com.vclm.mt.exitEvent = "pagehide";
        }

        com.vclm.mt.currentSlide = com.vclm.mt.getCurrentSlide();
        com.vclm.mt.previousSlide = com.vclm.mt.getPreviousSlide();
        com.vclm.mt.nextSlide = com.vclm.mt.getNextSlide();

        // If not using veeva swiping store the current slide and presentation
        // so that slides outside the flow can return to the correct slide.
        if (com.vclm.mtconfig.veevaSwipe === "0") {
            if (com.vclm.mtconfig.pagesAll.indexOf(com.vclm.mt.currentSlide) != -1) {
                window.sessionStorage.setItem(
                    "vclmPreviousSlide",
                    com.vclm.mt.currentSlide
                );
                window.sessionStorage.setItem(
                    "vclmPreviousPres",
                    com.vclm.mtconfig.presentation
                );
            }
        }

        com.vclm.mt.initNavigation();

        // noSwipe elements will prevent swiping to the next and previous slide
        var $noSwipe = $(".noSwipe");
        if ($noSwipe.length) {
            $noSwipe.on(com.vclm.mt.pressEvent, function(e) {
                e.stopPropagation();
            });
        }
    },

    /**
     * Initialise navigation elements
     */
    initNavigation: function() {
        // Disable or activate nav elements where applicable.
        // com.vclm.mt.initNavElements();

        // If not using veeva swipes, swiping the container will move to the
        // next or previous slide depending upon direction. If using custom
        // swipes (indicated by the container having the class customSwipe)
        // this binding will be ignored.
        if (
            (com.vclm.mtconfig.veevaSwipe == 0 || !com.vclm.mt.isVeeva) &&
            com.vclm.mt.dom.container.length &&
            !com.vclm.mt.dom.container.hasClass("customSwipe") &&
            !com.vclm.mt.dom.container.hasClass("noSwipe")
        ) {
            var actions = com.vclm.mt.isVeeva ? "swipe" : "swipe drag";
            com.vclm.mt.bindInteraction(
                "#container",
                actions, { swipeVelocityX: 0.2 },
                function(e) {
                    var direction = e.gesture.direction;
                    if (direction == Hammer.DIRECTION_RIGHT) {
                        com.vclm.mt.gotoPreviousSlide();
                    } else if (direction == Hammer.DIRECTION_LEFT) {
                        com.vclm.mt.gotoNextSlide();
                    }
                }
            );
        }
        // Double-click bumpers on either side of the screen
        var $navBumper = $(".navBumper");
        if ($navBumper.length) {
            $.each($navBumper, function() {
                var $this = $(this);
                var id = $this.attr("id");
                if (id == "doubleClickLeft") {
                    com.vclm.mt.bindInteraction(
                        "#doubleClickLeft",
                        "doubletap", {},
                        com.vclm.mt.gotoPreviousSlide
                    );
                } else if (id == "doubleClickRight") {
                    com.vclm.mt.bindInteraction(
                        "#doubleClickRight",
                        "doubletap", {},
                        com.vclm.mt.gotoNextSlide
                    );
                }
            });
        }

        // Trigger processing of gotoSlide elements on tap
        if ($(".gotoSlide").length) {
            com.vclm.mt.bindInteraction(".gotoSlide", "tap", {}, function(e) {
                com.vclm.mt.processGotoSlide($(e.target));
            });
        }

        // Close a slide, returning to the previously stored slide
        if ($("#btn-close").length) {
            com.vclm.mt.bindInteraction(
                "#btn-close",
                "tap", {},
                com.vclm.mt.closeSlide
            );
        }

        // Initialise portrait mode
        if (com.vclm.mtconfig.vclmPortrait === "1") {
            com.vclm.mt.bindInteraction(
                "#doubleClickCentre",
                "doubletap", {},
                com.vclm.mt.resizePortrait
            );
            com.vclm.mt.dom.body.addClass("portrait");
        }
    },

    /* Debugging */

    /**
     * Trigger a console message if the presentation is running in a desktop browser
     * @param {string} message
     */

    /**
     *
     * @param {*} message
     */
    debug: function(message) {
        if (!com.vclm.mt.isVeeva) {
            console.log(message);
        }
    },

    /**
     * Detect whether the presentation is running in a browser (excluding Engage)
     * @returns {boolean}
     */
    isVeevaEnvironment: function() {
        console.log('userAgent ==> ', navigator.userAgent);
        if (
            navigator.userAgent.match(/iPad/i) !== null ||
            navigator.userAgent.match(/iPhone/i) !== null
        ) {
            return true;
        }
        const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
        const firefox = navigator.userAgent.indexOf("Firefox") > -1;
        const safari = navigator.userAgent.indexOf("Safari") > -1;

        if (isChrome || firefox || safari) {
            return false;
        } else {
            return true;
        }
    },

    /* Interaction */

    /**
     * Bind interaction to an element - helper function for binding interactions
     * to an element: necessary to maintain abstraction!
     * @param {string} element
     * @param {string} eventType
     * @param {Object} options
     * @param {function} callback
     */
    bindInteraction: function(element, eventType, options, callback) {
        var $element = $(element);
        options.domEvents = true;
        if ($element == null) {
            return;
        }

        if (element === "#container") {
            com.vclm.mt.dom.container.hammer(options).on(eventType, function(e) {
                callback(e);
            });
        } else {
            com.vclm.mt.dom.container
                .hammer(options)
                .on(eventType, element, function(e) {
                    callback(e);
                });
        }
    },

    /* Navigation */

    /**
     * Gets the current slide in the presentation
     * @returns {string} Current slide
     */
    getCurrentPresentation: function() {
        var parser = document.createElement("a");
        parser.href = window.location.href.replace("/index.html", "");
        var slide = String(parser.pathname).substring(
            parser.pathname.lastIndexOf("/") + 1
        );
        parser.href = String(parser.href).replace("/" + slide, "");
        return String(parser.pathname).substring(
            parser.pathname.lastIndexOf("/") + 1
        );
    },
    // getCurrentPresentation: function() {
    //   var parser = document.createElement("a");
    //   parser.href = window.location.href.replace("/index.html", "");
    //   var slide = String(parser.pathname).substring(
    //     parser.pathname.lastIndexOf("/") + 1
    //   );
    //   let pres = (slide = slide.substr(0, slide.length - 4));
    //   return pres;
    // },
    getCurrentSlide: function() {
        var parser = document.createElement("a");
        parser.href = window.location.href.replace("/index.html", "");
        return String(parser.pathname).substring(
            parser.pathname.lastIndexOf("/") + 1
        );
    },

    /**
     * Gets the previous slide in the presentation if not at the first slide
     * @returns {string} Previous slide
     */
    getPreviousSlide: function() {
        var slideIndex = com.vclm.mtconfig.pagesAll.indexOf(
            com.vclm.mt.currentSlide
        );
        if (slideIndex === 0) {
            return com.vclm.mtconfig.pagesAll[slideIndex];
        } else {
            return com.vclm.mtconfig.pagesAll[slideIndex - 1];
        }
    },

    /**
     * Gets the next slide in the presentation if not at the last slide
     * @returns {string} Next slide
     */
    getNextSlide: function() {
        var slideIndex = com.vclm.mtconfig.pagesAll.indexOf(
            com.vclm.mt.currentSlide
        );
        if (slideIndex + 1 === com.vclm.mtconfig.pagesAll.length) {
            return com.vclm.mtconfig.pagesAll[slideIndex];
        } else {
            return com.vclm.mtconfig.pagesAll[slideIndex + 1];
        }
    },

    /**
     * Go to the next slide in the presentation
     */
    gotoNextSlide: function() {
        com.vclm.mt.debug("Going to slide " + com.vclm.mt.nextSlide);
        if (com.vclm.mt.isVeeva) {
            com.veeva.clm.nextSlide();
        } else {
            document.location.href = com.vclm.mt.buildUrl(com.vclm.mt.nextSlide);
        }
    },

    /**
     * Go to the previous slide in the presentation
     */
    gotoPreviousSlide: function() {
        console.log("slide");
        com.vclm.mt.debug("Going to slide " + com.vclm.mt.previousSlide);
        if (com.vclm.mt.isVeeva) {
            com.veeva.clm.prevSlide();
        } else {
            document.location.href = com.vclm.mt.buildUrl(com.vclm.mt.previousSlide);
        }
    },

    /**
     * Go to the specified slide/presentation
     * @param {string} slide
     * @param {string} [presentation]
     */

    /**
     * @param {string} slide
     * @param {string} slide
     */
    gotoSlide: function(slide, presentation) {
        if (!slide) return;
        if (presentation != "" && presentation != undefined) {
            com.vclm.mt.debug("Going to slide " + presentation + "/" + slide);
        } else {
            com.vclm.mt.debug("Going to slide " + slide);
        }

        if (com.vclm.mt.isVeeva) {
            com.veeva.clm.gotoSlide(slide + com.vclm.mt.extension, presentation);
        } else {
            document.location.href = com.vclm.mt.buildUrl(slide, presentation);
        }
    },

    /**
     * Offline workaround to allow linking to assets without an index.html file
     * @param {string} type Type of asset - 'pdf' or 'video'
     * @param {string} slide
     * @param {string} [presentation]
     */
    gotoAsset: function(type, slide, presentation) {
        if (com.vclm.mt.isVeeva || !type || !slide) return;

        var format = type === "pdf" ? "pdf" : "mp4";
        if (
            presentation != null &&
            presentation != "" &&
            presentation != undefined
        ) {
            com.vclm.mt.debug("Going to slide " + presentation + "/" + slide);
            document.location.href =
                "../../" + presentation + "/" + slide + "/" + type + "." + format;
        } else {
            com.vclm.mt.debug("Going to slide " + slide);
            document.location.href = "../" + slide + "/" + type + "." + format;
        }
    },

    /**
     * Construct a url for gotoSlide
     * @param {string} slide
     * @param {string} [presentation]
     */
    buildUrl: function(slide, presentation) {
        var url = presentation ? "../../" + presentation + "/" : "../";
        return url + slide + "/index" + com.vclm.mt.extension;
    },

    /**
     * Return to the stored slide
     */
    closeSlide: function() {
        var previousSlide = window.sessionStorage.getItem("vclmPreviousSlide"),
            previousPres = window.sessionStorage.getItem("vclmPreviousPres");
        com.vclm.mt.gotoSlide(previousSlide, previousPres);
    },

    /**
     * Process the gotoSlide call and pass relevant params to gotoSlide or in
     * the case of assets, gotoAsset
     * @param {Object} $element
     */
    processGotoSlide: function($element) {
        var slide = $element.attr("data-slide"),
            presentation = $element.attr("data-presentation");
        if ($element.hasClass("logged")) {
            // Track a gotoSlide link
            com.vclm.mt.trackedLink = $element;
        }

        if (slide === "prev") {
            // Go to the previous slide
            com.vclm.mt.gotoPreviousSlide();
        } else if (slide === "next") {
            // Go to the next slide
            com.vclm.mt.gotoNextSlide();
        } else if (
            $element.attr("data-type") != undefined &&
            !com.vclm.mt.isVeeva
        ) {
            // In order to enable offline transition to assets a function has
            // been created to handle this. This will only be invoked offline
            com.vclm.mt.gotoAsset($element.attr("data-type"), slide, presentation);
        } else if (slide != undefined) {
            // A standard gotoSlide event
            com.vclm.mt.gotoSlide(slide, presentation);
        } else if (com.vclm.mtconfig[$element.attr("id")] != undefined) {
            // Process nav button gotoSlide
            slide = com.vclm.mtconfig[$element.attr("id")];
            presentation = com.vclm.mtconfig[$element.attr("id") + "Presentation"];
            // In the case of the home presentation, this is just the value of
            // presentation so prefixing with "home" will result in an undefined
            // presentation
            if ($element.attr("id") === "home") {
                presentation = com.vclm.mtconfig["presentation"];
            }
            com.vclm.mt.gotoSlide(slide, presentation);
        }
    },

    /**
     * initialise a custom swipe
     * @param {Object} navDestinations
     */
    customSwipe: function(navDestinations) {
        if (
            com.vclm.mt.dom.container.length &&
            com.vclm.mt.dom.container.hasClass("customSwipe") &&
            !$.isEmptyObject(navDestinations)
        ) {
            var actions = com.vclm.mt.isVeeva ? "swipe" : "swipe drag";
            com.vclm.mt.bindInteraction(
                "#container",
                actions, { swipeVelocityX: 0.2, swipeVelocityY: 0.2, dragMinDistance: 100 },
                function(e) {
                    var direction = e.gesture.direction;
                    if (direction == Hammer.DIRECTION_RIGHT) {
                        com.vclm.mt.gotoSlide(
                            navDestinations.rightSlide,
                            navDestinations.rightPres
                        );
                    } else if (direction == Hammer.DIRECTION_LEFT) {
                        com.vclm.mt.gotoSlide(
                            navDestinations.leftSlide,
                            navDestinations.leftPres
                        );
                    } else if (direction == Hammer.DIRECTION_UP) {
                        com.vclm.mt.gotoSlide(
                            navDestinations.upSlide,
                            navDestinations.upPres
                        );
                    } else if (direction == Hammer.DIRECTION_DOWN) {
                        com.vclm.mt.gotoSlide(
                            navDestinations.downSlide,
                            navDestinations.downPres
                        );
                    }
                }
            );
        }
    }
};

/*! jQuery plugin for Hammer.JS - v1.1.3 - 2014-05-20
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */
(function(window, undefined) {
    "use strict";

    function setupPlugin(Hammer, $) {
        // provide polyfill for Date.now()
        // browser support: http://kangax.github.io/es5-compat-table/#Date.now
        if (!Date.now) {
            Date.now = function now() {
                return new Date().getTime();
            };
        }

        /**
         * the methods on/off are called by the instance, but with the jquery plugin
         * we use the jquery event methods instead.
         * @this    {Hammer.Instance}
         * @return  {jQuery}
         */
        Hammer.utils.each(["on", "off"], function(method) {
            Hammer.utils[method] = function(element, type, handler) {
                $(element)[method](type, function($ev) {
                    // append the jquery fixed properties/methods
                    var data = $.extend({}, $ev.originalEvent, $ev);
                    if (data.button === undefined) {
                        data.button = $ev.which - 1;
                    }
                    handler.call(this, data);
                });
            };
        });

        /**
         * trigger events
         * this is called by the gestures to trigger an event like 'tap'
         * @this    {Hammer.Instance}
         * @param   {String}    gesture
         * @param   {Object}    eventData
         * @return  {jQuery}
         */
        Hammer.Instance.prototype.trigger = function(gesture, eventData) {
            var el = $(this.element);
            if (el.has(eventData.target).length) {
                el = $(eventData.target);
            }

            return el.trigger({
                type: gesture,
                gesture: eventData
            });
        };

        /**
         * jQuery plugin
         * create instance of Hammer and watch for gestures,
         * and when called again you can change the options
         * @param   {Object}    [options={}]
         * @return  {jQuery}
         */
        $.fn.hammer = function(options) {
            return this.each(function() {
                var el = $(this);
                var inst = el.data("hammer");

                // start new hammer instance
                if (!inst) {
                    el.data("hammer", new Hammer(this, options || {}));
                    // change the options
                } else if (inst && options) {
                    Hammer.utils.extend(inst.options, options);
                }
            });
        };
    }

    // AMD
    if (typeof define == "function" && define.amd) {
        define(["hammerjs", "jquery"], setupPlugin);
    } else {
        setupPlugin(window.Hammer, window.jQuery || window.Zepto);
    }
})(window);

$(document).ready(function() {
    com.vclm.mt.start();
});
const TOUCH = "click";