// import $ from 'jquery';
let $ = require('jquery');

const TIMEOUT = new WeakMap();
const WINDOW = new WeakMap();

class StickyFooter {

  constructor($timeout, $window) {
    this.restrict = 'A';
    TIMEOUT.set(this, $timeout);
    WINDOW.set(this, $window);
    // Force binding to this instance
    this.link = this.link.bind(this);
  }

  get $timeout() {
    return TIMEOUT.get(this);
  }

  get $window() {
    return WINDOW.get(this);
  }

  adjustStickyPosition(scope, elem, attrs) {
    // measure positions
    var $w = $(this.$window);
    var viewPortBottom = $w.scrollTop() + $w.height();
    var ghostBottom = this.elGhost.offset().top + this.elGhost.outerHeight();
    var needsToStick = ghostBottom < viewPortBottom;
    $(elem).css('position', needsToStick ? 'fixed' : 'static');
  }

  adjustStickyDelayed(scope, elem, attrs) {
    if (!this.timer) {
      this.adjustStickyPosition(scope, elem, attrs);
      // Hold off next adjustments until a delay,
      // to avoid congesting up resize.
      this.timer = this.$timeout(() => {
        // Retry after the delay.
        this.adjustStickyPosition(scope, elem, attrs);
        this.timer = null;
      }, 100);
    }
  }

  link(scope, elem, attrs){
    this.elGhost = $(elem.clone(true))
      .css({
        opacity: 0
      })
      .insertAfter(elem);
    elem.css('bottom', 0);
    const f = () => {
      this.adjustStickyDelayed(scope, elem, attrs);
    }
    $(this.$window).bind('resize', f);
    scope.$on('resize.manually', f);
    f();
  }

  static directive($timeout, $window) {
    return new StickyFooter($timeout, $window);
  }

  static get directiveName() {
    return 'stickyFooter';
  }

}

StickyFooter.$inject = ['$timeout', '$window'];

export default {StickyFooter};
