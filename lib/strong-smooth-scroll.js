// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


(function() {
    'use strict'

    angular.module('StrongComponents.smoothScroll', [])
        .factory('Utils', Utils)
        .factory('stScroller', stScroller)
        .directive('stSmoothScroll', stSmoothScroll)


    /**
     * Utils functions
     */
    Utils.$inject = []
    function Utils() {
        var service = {
            extend: extend
        }

        return service


        /**
         * Extends the destination object `dst` by copying own enumerable properties
         * from the `src` object(s) to `dst`. Undefined properties are not copyied.
         * (modified angular version)
         *
         * @param {Object} dst Destination object.
         * @param {...Object} src Source object(s).
         * @return {Object} Reference to `dst`.
         */
        function extend(dst) {
            var objs = [].slice.call(arguments, 1),
                h = dst.$$hashKey

            for (var i = 0, ii = objs.length; i < ii; ++i) {
                var obj = objs[i]
                if (!angular.isObject(obj) && !angular.isFunction(obj)) continue

                var keys = Object.keys(obj)
                for (var j = 0, jj = keys.length; j < jj; j++) {
                    var key = keys[j]
                    var src = obj[key]

                    if (!angular.isUndefined(src)) {
                        dst[key] = src
                    }
                }
            }

            if (h) {
                dst.$$hashKey = h
            }
            return dst
        }
    }



    /**
     * Smooth scrolling manager
     */
    stScroller.$inject = ['$window', '$document', '$timeout', '$q', 'Utils']
    function stScroller($window, $document, $timeout, $q, Utils) {
        var body = $document.find('body')[0]

        /**
         * Smooth scrolling manager constructor
         * @param {DOM Element} elem Element which window must be scrolled to
         * @param {Object} opts Scroller options
         */
        function Scroller(elem, opts) {
            this.opts = Utils.extend({
                duration: 500,
                offset: 100,
                easing: 'easeInOutCubic',
                cancelOnBounds: true,
                delay: 0
            }, opts)

            this.elem = elem
            this.startTime = null
            this.framesCount = 0
            this.frameRequest = null
            this.startElemOffset = elem.getBoundingClientRect().top
            this.endElemOffset = this.opts.offset
            this.isUpDirection = this.startElemOffset > this.endElemOffset
            this.curElemOffset = null
            this.curWindowOffset = null

            this.donePromise = $q.defer()  // this promise is resolved when scrolling is done
        }

        Scroller.prototype = {
            run: run,
            done: done,
            animationFrame: animationFrame,
            requestNextFrame: requestNextFrame,
            cancel: cancel,
            isElemReached: isElemReached,
            isWindowBoundReached: isWindowBoundReached,
            getEasingRatio: getEasingRatio
        }

        return Scroller


        /**
         * Run smooth scroll
         * @return {Promise} A promise which is resolved when scrolling is done
         */
        function run() {
            $timeout(angular.bind(this, this.requestNextFrame), +this.opts.delay)
            return this.donePromise.promise
        }


        /**
         * Add scrolling done callback
         * @param {Function} cb
         */
        function done(cb) {
            if (typeof cb !== 'function') return
            this.donePromise.promise.then(cb)
        }


        /**
         * Scrolling animation frame.
         * Calculate new element and window offsets, scroll window,
         * request next animation frame, check cancel conditions
         * @param {DOMHighResTimeStamp or Unix timestamp} time
         */
        function animationFrame(time) {
            this.requestNextFrame()

            // set startTime
            if (this.framesCount++ === 0) {
                this.startTime = time
                this.curElemOffset = this.elem.getBoundingClientRect().top
                this.curWindowOffset = $window.pageYOffset
            }

            var timeLapsed = time - this.startTime,
                perc = timeLapsed / this.opts.duration,
                newOffset = this.startElemOffset
                    + (this.endElemOffset - this.startElemOffset)
                    * this.getEasingRatio(perc)

            this.curWindowOffset += this.curElemOffset - newOffset
            this.curElemOffset = newOffset

            $window.scrollTo(0, this.curWindowOffset)

            if (timeLapsed >= this.opts.duration
                    || this.isElemReached()
                    || this.isWindowBoundReached()) {
                this.cancel()
            }
        }


        /**
         * Request next animation frame for scrolling
         */
        function requestNextFrame() {
            this.frameRequest = $window.requestAnimationFrame(
                angular.bind(this, this.animationFrame))
        }


        /**
         * Cancel next animation frame, resolve done promise
         */
        function cancel() {
            cancelAnimationFrame(this.frameRequest)
            this.donePromise.resolve()
        }


        /**
         * Check if element is reached already
         * @return {Boolean}
         */
        function isElemReached() {
            if (this.curElemOffset === null) return false

            return this.isUpDirection ? this.curElemOffset <= this.endElemOffset
                : this.curElemOffset >= this.endElemOffset
        }


        /**
         * Check if window bound is reached
         * @return {Boolean}
         */
        function isWindowBoundReached() {
            if (!this.opts.cancelOnBounds) {
                return false
            }
            return this.isUpDirection ?  body.scrollHeight <= this.curWindowOffset + $window.innerHeight
                : this.curWindowOffset <= 0
        }


        /**
         * Return the easing ratio
         * @param {Number} perc Animation done percentage
         * @return {Float} Calculated easing ratio
         */
        function getEasingRatio(perc) {
            switch(this.opts.easing) {
                case 'easeInQuad': return perc * perc; // accelerating from zero velocity
                case 'easeOutQuad': return perc * (2 - perc); // decelerating to zero velocity
                case 'easeInOutQuad': return perc < 0.5 ? 2 * perc * perc : -1 + (4 - 2 * perc) * perc; // acceleration until halfway, then deceleration
                case 'easeInCubic': return perc * perc * perc; // accelerating from zero velocity
                case 'easeOutCubic': return (--perc) * perc * perc + 1; // decelerating to zero velocity
                case 'easeInOutCubic': return perc < 0.5 ? 4 * perc * perc * perc : (perc - 1) * (2 * perc - 2) * (2 * perc - 2) + 1; // acceleration until halfway, then deceleration
                case 'easeInQuart': return perc * perc * perc * perc; // accelerating from zero velocity
                case 'easeOutQuart': return 1 - (--perc) * perc * perc * perc; // decelerating to zero velocity
                case 'easeInOutQuart': return perc < 0.5 ? 8 * perc * perc * perc * perc : 1 - 8 * (--perc) * perc * perc * perc; // acceleration until halfway, then deceleration
                case 'easeInQuint': return perc * perc * perc * perc * perc; // accelerating from zero velocity
                case 'easeOutQuint': return 1 + (--perc) * perc * perc * perc * perc; // decelerating to zero velocity
                case 'easeInOutQuint': return perc < 0.5 ? 16 * perc * perc * perc * perc * perc : 1 + 16 * (--perc) * perc * perc * perc * perc; // acceleration until halfway, then deceleration
                default: return perc;
            }
        }
    }



    /**
     * Smooth scroll directive.
     */
    stSmoothScroll.$inject = ['$document', '$rootScope', 'stScroller']
    function stSmoothScroll($document, $rootScope, Scroller) {
        // subscribe to user scroll events to cancel auto scrollingj
        angular.forEach(['DOMMouseScroll', 'mousewheel', 'touchmove'], function(ev) {
            $document.on(ev, function(ev) {
                $rootScope.$emit('stSmoothScroll.documentWheel', angular.element(ev.target))
            })
        })

        var directive = {
            restrict: 'A',
            scope: {
                stScrollIf: '=',
                stScrollDuration: '=',
                stScrollOffset: '=',
                stScrollCancelOnBounds: '=',
                stScrollDelay: '=',
                stScrollAfter: '&'
            },
            link: link
        }

        return directive


        /**
         * Smooth scroll directive link function
         */
        function link(scope, elem, attrs) {
            var scroller = null

            // stop scrolling if user scrolls the page himself
            var offDocumentWheel = $rootScope.$on('stSmoothScroll.documentWheel', function() {
                if (!!scroller) {
                    scroller.cancel()
                }
            })

            // unsubscribe
            scope.$on('$destroy', function() {
                offDocumentWheel()
            })


            // init scrolling
            if (attrs.stScrollIf === undefined) {
                // no trigger specified, start scrolling immediatelly
                run()
            } else {
                // watch trigger and start scrolling, when it becomes `true`
                scope.$watch('stScrollIf', function(val) {
                    if (!!val) run()
                })
            }


            /**
             * Start scrolling, add callback
             */
            function run() {
                scroller = new Scroller(elem[0], {
                    duration: scope.stScrollDuration,
                    offset: scope.stScrollOffset,
                    easing: attrs.stScrollEasing,
                    cancelOnBounds: scope.stScrollCancelOnBounds,
                    delay: scope.stScrollDelay
                })

                scroller.run().then(function() {
                    // call `after` callback
                    if (typeof scope.stScrollAfter === 'function') scope.stScrollAfter()

                    // forget scroller
                    scroller = null
                })

            }
        }
    }
})();
