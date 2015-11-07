# strong-smooth-scroll

Smooth scroll for AngularJS without any additional dependencies.

## Feautures

- directive that scroll the window to the element
- different easing functions
- scrolling on condition
- scrolling options: offset, duration, delay, callback
- cancel auto scrolling when user starts scrolling himself
- doesn't require jQuery or other dependencies (except AngularJS)

## Install

### bower

Will be available soon!

Add `<script>` to your `index.html`:

```html
<script src="/bower_components/strong-smooth-scroll/strong-smooth-scroll.js"</script>
```

Then add `StrongSmoothScroll` as a dependency for your app:

```javascript
angular.module('myApp', ['StrongSmoothScroll']);
```

## Documentation

### st-smooth-scroll directive

st-smooth-scroll directive is used to scroll the window to the element.

Basic example:
```html
<input type="text" class="email"
    st-smooth-scroll
    st-scroll-if="vm.scrollToEmail"
    st-scroll-offset="20"
    st-scroll-duration="400"
    st-scroll-delay="200"
    st-scroll-easing="easeInQuad"
    st-scroll-after="vm.scrollToEmailDone = true" />
```

#### Options

##### st-scroll-if

Scrolling trigger condition expression. If provided, scrolling starts when given expression evaluates to `true`. If not provided, scrolling starts immediatelly after app bootstrap.  
Value: expression.

Examples:

```html
<div st-smooth-scroll st-scroll-if="ctrl.someCondition"></div>

<div st-smooth-scroll st-scroll-if="ctrl.needToScroll()"></div>

<div st-smooth-scroll st-scroll-if="ctrl.scrollTo === 'cur-element'"></div>
```


##### st-scroll-duration

Smooth scroll animation duration.  
Value: expression.  
Default: 500.

Examples:

```html
<div st-smooth-scroll st-scroll-duration="500"></div>

<div st-smooth-scroll st-scroll-duration="ctrl.scrollDuration"></div>
```


##### st-scroll-delay

Scroll start delay time.  
Value: expression.  
Default: 0.

```html
<div st-smooth-scroll st-scroll-delay="200"></div>

<div st-smooth-scroll st-scroll-delay="ctrl.isCustomDelay ? 100 : ctrl.getDefaultDelay()"></div>
```


##### st-scroll-offset

Element top offset after scrolling.  
Value: expression.  
Default: 100.

Examples:

```html
<div st-smooth-scroll st-scroll-offset="80"></div>

<div st-smooth-scroll st-scroll-offset="ctrl.elementOffset"></div>
```


##### st-scroll-easing

Easing function for smooth scrolling animation.  
Value: string.  
Options: easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart, easeInQuint, easeOutQuint, easeInOutQuint.  
Default: easeInOutCubic.

Examples:

```html
<div st-smooth-scroll st-scroll-easing="easeInQuad"></div>
```


##### st-scroll-cancel-on-bounds

If `true`, scrolling animation will be cancelled, when page bounds are reached.  
Value: expression.  
Default: `true`.

Examples:

```html
<div st-smooth-scroll st-scroll-cancel-on-bounds="false"></div>

<div st-smooth-scroll st-scroll-cancel-on-bounds="ctrl.stopScrollingOnBounds"></div>
```


##### st-scroll-after

Smooth scroll animation finished callback.  
Value: expression.

Examples:

```html
<div st-smooth-scroll st-scroll-after="ctrl.scrollingDone = true"></div>

<div st-smooth-scroll st-scroll-after="ctrl.afterScrollingCallback()"></div>
```


## License

Comming soon...
