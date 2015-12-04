
    function isHidden(element) {
      var rect = element.getBoundingClientRect();
      return (rect.width == 0 && rect.height == 0);
    }

    suite('basic', function() {
      test('tooltip is shown when target is focused', function() {
        var f = fixture('no-text');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isTrue(isHidden(actualTooltip));
      });

      test('tooltip is not shown if empty', function() {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));
      });

      test('tooltip is positioned correctly (bottom)', function() {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));

        var divRect = target.getBoundingClientRect();
        expect(divRect.width).to.be.equal(100);
        expect(divRect.height).to.be.equal(20);

        var contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.width).to.be.equal(70);
        expect(contentRect.height).to.be.equal(30);

        // The target div width is 100, and the tooltip width is 70, and
        // it's centered. The height of the target div is 20, and the
        // tooltip is 14px below.
        expect(contentRect.left).to.be.equal((100 - 70)/2);
        expect(contentRect.top).to.be.equal(20 + 14);

        // Also check the math, just in case.
        expect(contentRect.left).to.be.equal((divRect.width - contentRect.width)/2);
        expect(contentRect.top).to.be.equal(divRect.height + tooltip.offset);
      });

      test('tooltip is positioned correctly (top)', function() {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');
        tooltip.position = 'top';

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));

        var divRect = target.getBoundingClientRect();
        expect(divRect.width).to.be.equal(100);
        expect(divRect.height).to.be.equal(20);

        var contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.width).to.be.equal(70);
        expect(contentRect.height).to.be.equal(30);

        // The target div width is 100, and the tooltip width is 70, and
        // it's centered. The height of the tooltip is 30, and the
        // tooltip is 14px above the target.
        expect(contentRect.left).to.be.equal((100 - 70)/2);
        expect(contentRect.top).to.be.equal(0 - 30 - 14);

        // Also check the math, just in case.
        expect(contentRect.left).to.be.equal((divRect.width - contentRect.width)/2);
        expect(contentRect.top).to.be.equal(0 - contentRect.height - tooltip.offset);
      });

      test('tooltip is positioned correctly (right)', function() {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');
        tooltip.position = 'right';

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));

        var divRect = target.getBoundingClientRect();
        expect(divRect.width).to.be.equal(100);
        expect(divRect.height).to.be.equal(20);

        var contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.width).to.be.equal(70);
        expect(contentRect.height).to.be.equal(30);

        // The target div width is 100, and the tooltip is 14px to the right.
        // The target div height is 20, the height of the tooltip is 20px, and
        // the tooltip is centered.
        expect(contentRect.left).to.be.equal(100 + 14);
        expect(contentRect.top).to.be.equal((20 - 30)/2);

        // Also check the math, just in case.
        expect(contentRect.left).to.be.equal(divRect.width + tooltip.offset);
        expect(contentRect.top).to.be.equal((divRect.height - contentRect.height)/2);
      });

      test('tooltip is positioned correctly (left)', function() {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');
        tooltip.position = 'left';

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));

        var divRect = target.getBoundingClientRect();
        expect(divRect.width).to.be.equal(100);
        expect(divRect.height).to.be.equal(20);

        var contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.width).to.be.equal(70);
        expect(contentRect.height).to.be.equal(30);

        // The tooltip width is 70px, and the tooltip is 14px to the left of the target.
        // The target div height is 20, the height of the tooltip is 20px, and
        // the tooltip is centered.
        expect(contentRect.left).to.be.equal(0 - 70 - 14);
        expect(contentRect.top).to.be.equal((20 - 30)/2);

        // Also check the math, just in case.
        expect(contentRect.left).to.be.equal(0 - contentRect.width - tooltip.offset);
        expect(contentRect.top).to.be.equal((divRect.height - contentRect.height)/2);
      });

      test('tooltip is fitted correctly if out of bounds', function() {
        var f = fixture('fitted');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');
        target.style.top = 0;
        target.style.left = 0;

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));

        var contentRect = tooltip.getBoundingClientRect();
        var divRect = target.getBoundingClientRect();

        // Should be fitted on the left side.
        expect(contentRect.left).to.be.equal(0);
        expect(contentRect.top).to.be.equal(divRect.height + tooltip.offset);
      });

      test('tooltip is positioned correctly after being dynamically set', function() {
        var f = fixture('dynamic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        // Skip animations in this test, which means we'll show and hide
        // the tooltip manually, instead of calling focus and blur.

        // The tooltip is shown because it's a sibling of the target,
        // but it's positioned incorrectly
        tooltip.toggleClass('hidden', false, actualTooltip);
        assert.isFalse(isHidden(actualTooltip));

        var contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.left).to.not.be.equal((100 - 70)/2);

        tooltip.for = 'target';

        // The tooltip needs to hide before it gets repositioned.
        tooltip.toggleClass('hidden', true, actualTooltip);
        tooltip.updatePosition();
        tooltip.toggleClass('hidden', false, actualTooltip);
        assert.isFalse(isHidden(actualTooltip));

        // The target div width is 100, and the tooltip width is 70, and
        // it's centered. The height of the target div is 20, and the
        // tooltip is 14px below.
        contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.left).to.be.equal((100 - 70)/2);
        expect(contentRect.top).to.be.equal(20 + 14);
      });

      test('tooltip is hidden after target is blurred', function(done) {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');

        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));
        // Simulate but don't actually run the entry animation.
        tooltip.toggleClass('hidden', false, actualTooltip);
        tooltip._showing = true;
        assert.isFalse(isHidden(actualTooltip));

        tooltip.addEventListener('neon-animation-finish', function() {
          assert.isTrue(isHidden(actualTooltip));
          done();
        });
        MockInteractions.blur(target);
      });

      test('tooltip unlistens to target on detach', function(done) {
        var f = fixture('basic');
        var target = f.querySelector('#target');
        var tooltip = f.querySelector('paper-tooltip');

        sinon.spy(tooltip, 'show');

        MockInteractions.focus(target);
        expect(tooltip.show.callCount).to.be.equal(1);

        MockInteractions.focus(target);
        expect(tooltip.show.callCount).to.be.equal(2);

        f.removeChild(tooltip);

        setTimeout(function() {
          // No more listener means no more calling show.
          MockInteractions.focus(target);
          expect(tooltip.show.callCount).to.be.equal(2);
          done();
        }, 200);
      });
    });

    suite('tooltip is inside a custom element', function() {
      var f, tooltip, target;

      setup(function() {
        f = fixture('custom');
        target = f.$.button;
        tooltip = f.$.buttonTooltip;
      });

      test('tooltip is shown when target is focused', function() {
        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));
      });

      test('tooltip is positioned correctly', function() {
        var actualTooltip = Polymer.dom(tooltip.root).querySelector('#tooltip');
        assert.isTrue(isHidden(actualTooltip));

        MockInteractions.focus(target);
        assert.isFalse(isHidden(actualTooltip));

        var divRect = target.getBoundingClientRect();
        expect(divRect.width).to.be.equal(100);
        expect(divRect.height).to.be.equal(20);

        var contentRect = tooltip.getBoundingClientRect();
        expect(contentRect.width).to.be.equal(70);
        expect(contentRect.height).to.be.equal(30);

        // The target div width is 100, and the tooltip width is 70, and
        // it's centered. The height of the target div is 20, and the
        // tooltip is 14px below.
        expect(contentRect.left).to.be.equal((100 - 70)/2);
        expect(contentRect.top).to.be.equal(20 + 14);

        // Also check the math, just in case.
        expect(contentRect.left).to.be.equal((divRect.width - contentRect.width)/2);
        expect(contentRect.top).to.be.equal(divRect.height + tooltip.offset);
      });
    });

    suite('a11y', function() {
      test('has aria role "tooltip"', function() {
        var f = fixture('basic');
        var tooltip = f.querySelector('paper-tooltip');

        assert.isTrue(tooltip.getAttribute('role') == 'tooltip');
      });

      a11ySuite('basic');
      a11ySuite('fitted');
      a11ySuite('no-text');
      a11ySuite('dynamic');
      a11ySuite('custom');
    });
  