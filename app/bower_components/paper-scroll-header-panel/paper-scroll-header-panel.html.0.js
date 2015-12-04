
(function() {

  'use strict';

  Polymer.PaperScrollHeaderPanel = Polymer({

    /**
     * Fired when the content has been scrolled.
     *
     * @event content-scroll
     */

    /**
     * Fired when the header is transformed.
     *
     * @event paper-header-transform
     */

    is: 'paper-scroll-header-panel',

    behaviors: [
      Polymer.IronResizableBehavior
    ],

    properties: {

      /**
       * If true, the header's height will condense to `condensedHeaderHeight`
       * as the user scrolls down from the top of the content area.
       */
      condenses: {
        type: Boolean,
        value: false
      },

      /**
       * If true, no cross-fade transition from one background to another.
       */
      noDissolve: {
        type: Boolean,
        value: false
      },

      /**
       * If true, the header doesn't slide back in when scrolling back up.
       */
      noReveal: {
        type: Boolean,
        value: false
      },

      /**
       * If true, the header is fixed to the top and never moves away.
       */
      fixed: {
        type: Boolean,
        value: false
      },

      /**
       * If true, the condensed header is always shown and does not move away.
       */
      keepCondensedHeader: {
        type: Boolean,
        value: false
      },

      /**
       * The height of the header when it is at its full size.
       *
       * By default, the height will be measured when it is ready.  If the height
       * changes later the user needs to either set this value to reflect the
       * new height or invoke `measureHeaderHeight()`.
       */
      headerHeight: {
        type: Number,
        value: 0
      },

      /**
       * The height of the header when it is condensed.
       *
       * By default, `condensedHeaderHeight` is 1/3 of `headerHeight` unless
       * this is specified.
       */
      condensedHeaderHeight: {
        type: Number,
        value: 0
      },

      /**
       * By default, the top part of the header stays when the header is being
       * condensed.  Set this to true if you want the top part of the header
       * to be scrolled away.
       */
      scrollAwayTopbar: {
        type: Boolean,
        value: false
      },

      /**
       * The state of the header. Depending on the configuration and the `scrollTop` value,
       * the header state could change to
       *      Polymer.PaperScrollHeaderPanel.HEADER_STATE_EXPANDED
       *      Polymer.PaperScrollHeaderPanel.HEADER_STATE_HIDDEN
       *      Polymer.PaperScrollHeaderPanel.HEADER_STATE_CONDENSED
       *      Polymer.PaperScrollHeaderPanel.HEADER_STATE_INTERPOLATED
       */
      headerState: {
        type: Number,
        readOnly: true,
        notify:true,
        value: 0
      },

      _prevScrollTop: {
        type: Number,
        value: 0
      },

      _y: {
        type: Number,
        value: 0
      },

      /** @type {number|null} */
      _defaultCondsensedHeaderHeight: {
        type: Number,
        value: 0
      }
    },

    observers: [
      '_setup(headerHeight, condensedHeaderHeight, fixed)',
      '_condensedHeaderHeightChanged(condensedHeaderHeight)',
      '_headerHeightChanged(headerHeight, condensedHeaderHeight)',
      '_condensesChanged(condenses)',
    ],

    listeners: {
      'iron-resize': 'measureHeaderHeight'
    },

    ready: function() {
      this.async(this.measureHeaderHeight, 5);
      this._scrollHandler = this._scroll.bind(this);
      this.scroller.addEventListener('scroll', this._scrollHandler);
    },

    /**
     * Returns the header element.
     *
     * @property header
     * @type Object
     */
    get header() {
      return Polymer.dom(this.$.headerContent).getDistributedNodes()[0];
    },

    /**
     * Returns the content element.
     *
     * @property content
     * @type Object
     */
    get content() {
      return Polymer.dom(this.$.mainContent).getDistributedNodes()[0];
    },

    /**
     * Returns the scrollable element.
     *
     * @property scroller
     * @type Object
     */
    get scroller() {
      return this.$.mainContainer;
    },

    get _headerMaxDelta() {
      return this.keepCondensedHeader ? this._headerMargin : this.headerHeight;
    },

    get _headerMargin() {
      return this.headerHeight - this.condensedHeaderHeight;
    },

    _y: 0,

    _prevScrollTop: 0,

    /**
     * Invoke this to tell `paper-scroll-header-panel` to re-measure the header's
     * height.
     *
     * @method measureHeaderHeight
     */
    measureHeaderHeight: function() {
      var header = this.header;
      if (header && header.offsetHeight) {
        this.headerHeight = header.offsetHeight;
      }
    },

    /**
     * Scroll to a specific y coordinate.
     *
     * @method scroll
     * @param {number} top The coordinate to scroll to, along the y-axis.
     * @param {boolean} smooth true if the scroll position should be smoothly adjusted.
     */
    scroll: function(top, smooth) {
      // the scroll event will trigger _updateScrollState directly,
      // However, _updateScrollState relies on the previous `scrollTop` to update the states.
      // Calling _updateScrollState will ensure that the states are synced correctly.

      if (smooth) {
        // TODO(blasten): use CSS scroll-behavior once it ships in Chrome.
        var easingFn = function easeOutQuad(t, b, c, d) {
          t /= d;
          return -c * t*(t-2) + b;
        };
        var animationId = Math.random();
        var duration = 200;
        var startTime = Date.now();
        var currentScrollTop = this.scroller.scrollTop;
        var deltaScrollTop = top - currentScrollTop;

        this._currentAnimationId = animationId;

        (function updateFrame() {
          var now = Date.now();
          var elapsedTime = now - startTime;

          if (elapsedTime > duration) {
            this.scroller.scrollTop = top;
            this._updateScrollState(top);

          } else if (this._currentAnimationId === animationId) {
            this.scroller.scrollTop = easingFn(elapsedTime, currentScrollTop, deltaScrollTop, duration);
            requestAnimationFrame(updateFrame.bind(this));
          }

        }).call(this);

      } else {
        this.scroller.scrollTop = top;
        this._updateScrollState(top);
      }
    },

   /**
     * Condense the header.
     *
     * @method condense
     * @param {boolean} smooth true if the scroll position should be smoothly adjusted.
     */
    condense: function(smooth) {
      var ctx = Polymer.PaperScrollHeaderPanel;
      if (this.condenses && !this.fixed && !this.noReveal) {
        switch (this.headerState) {
          case ctx.HEADER_STATE_HIDDEN:
            this.scroll(this.scroller.scrollTop - (this._headerMaxDelta - this._headerMargin), smooth);
          break;
          case ctx.HEADER_STATE_EXPANDED:
          case ctx.HEADER_STATE_INTERPOLATED:
            this.scroll(this._headerMargin, smooth);
          break;
        }
      }
    },

    /**
     * Scroll to the top of the content.
     *
     * @method scrollToTop
     * @param {boolean} smooth true if the scroll position should be smoothly adjusted.
     */
    scrollToTop: function(smooth) {
      this.scroll(0, smooth);
    },

    _headerHeightChanged: function(headerHeight) {
      if (this._defaultCondsensedHeaderHeight !== null) {
        this._defaultCondsensedHeaderHeight = Math.round(headerHeight * 1/3);
        this.condensedHeaderHeight = this._defaultCondsensedHeaderHeight;
      }
    },

    _condensedHeaderHeightChanged: function(condensedHeaderHeight) {
      if (condensedHeaderHeight) {
        // a user custom value
        if (this._defaultCondsensedHeaderHeight != condensedHeaderHeight) {
          // disable the default value
          this._defaultCondsensedHeaderHeight = null;
        }
      }
    },

    _condensesChanged: function() {
      this._updateScrollState(this.scroller.scrollTop);
      this._condenseHeader(null);
    },

    _setup: function() {
      var s = this.scroller.style;

      s.paddingTop = this.fixed ? '' : this.headerHeight + 'px';
      s.top = this.fixed ? this.headerHeight + 'px' : '';

      if (this.fixed) {
        this._setHeaderState(this.HEADER_STATE_EXPANDED);
        this._transformHeader(null);
      } else {
        switch (this.headerState) {
          case this.HEADER_STATE_HIDDEN:
            this._transformHeader(this._headerMaxDelta);
            break;
          case this.HEADER_STATE_CONDENSED:
            this._transformHeader(this._headerMargin);
            break;
        }
      }
    },

    _transformHeader: function(y) {
      this._translateY(this.$.headerContainer, -y);

      if (this.condenses) {
        this._condenseHeader(y);
      }

      this.fire('paper-header-transform',
        { y: y,
          height: this.headerHeight,
          condensedHeight: this.condensedHeaderHeight
        }
      );
    },

    _condenseHeader: function(y) {
      var reset = (y === null);

      // adjust top bar in paper-header so the top bar stays at the top
      if (!this.scrollAwayTopbar && this.header && this.header.$ && this.header.$.topBar) {
        this._translateY(this.header.$.topBar,
            reset ? null : Math.min(y, this._headerMargin));
      }
      // transition header bg
      if (!this.noDissolve) {
        this.$.headerBg.style.opacity = reset ? '' :
            ( (this._headerMargin - y) / this._headerMargin);
      }
      // adjust header bg so it stays at the center
      this._translateY(this.$.headerBg, reset ? null : y / 2);
      // transition condensed header bg
      if (!this.noDissolve) {
        this.$.condensedHeaderBg.style.opacity = reset ? '' :
            (y / this._headerMargin);

        // adjust condensed header bg so it stays at the center
        this._translateY(this.$.condensedHeaderBg, reset ? null : y / 2);
      }
    },

    _translateY: function(node, y) {
      this.transform((y === null) ? '' : 'translate3d(0, ' + y + 'px, 0)', node);
    },

    /** @param {Event=} event */
    _scroll: function(event) {
      if (this.header) {
        this._updateScrollState(this.scroller.scrollTop);

        this.fire('content-scroll', {
          target: this.scroller
        },
        {
          cancelable: false
        });
      }
    },

    _updateScrollState: function(scrollTop) {
      var ctx = Polymer.PaperScrollHeaderPanel;
      var deltaScrollTop = scrollTop - this._prevScrollTop;
      var y = Math.max(0, (this.noReveal) ? scrollTop : this._y + deltaScrollTop);

      if (y > this._headerMaxDelta) {
        y = this._headerMaxDelta;
        this._setHeaderState(ctx.HEADER_STATE_HIDDEN);

      } else if (this.condenses && this._prevScrollTop >= scrollTop && scrollTop >= this._headerMargin) {
        y = Math.max(y, this._headerMargin);
        this._setHeaderState(ctx.HEADER_STATE_CONDENSED);

      } else if (y === 0) {
        this._setHeaderState(ctx.HEADER_STATE_EXPANDED);

      } else {
        this._setHeaderState(ctx.HEADER_STATE_INTERPOLATED);
      }

      if (!this.fixed && y !== this._y) {
        this._transformHeader(y);
      }

      this._prevScrollTop = Math.max(scrollTop, 0);
      this._y = y;
    }
  });

  Polymer.PaperScrollHeaderPanel.HEADER_STATE_EXPANDED = 0;
  Polymer.PaperScrollHeaderPanel.HEADER_STATE_HIDDEN = 1;
  Polymer.PaperScrollHeaderPanel.HEADER_STATE_CONDENSED = 2;
  Polymer.PaperScrollHeaderPanel.HEADER_STATE_INTERPOLATED = 3;

})();

