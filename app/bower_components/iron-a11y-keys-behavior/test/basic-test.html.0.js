
suite('Polymer.IronA11yKeysBehavior', function() {
  var keys;

  suiteSetup(function() {
    var KeysTestBehavior = [Polymer.IronA11yKeysBehavior, {
      properties: {
        keyCount: {
          type: Number,
          value: 0
        }
      },

      _keyHandler: function(event) {
        this.keyCount++;
        this.lastEvent = event;
      },

      // Same as _keyHandler, used to distinguish who's called before who.
      _keyHandler2: function(event) {
        this.keyCount++;
        this.lastEvent = event;
      },

      _preventDefaultHandler: function(event) {
        event.preventDefault();
        this.keyCount++;
        this.lastEvent = event;
      }
    }];

    Polymer({
      is: 'x-a11y-basic-keys',

      behaviors: [
        KeysTestBehavior
      ],

      keyBindings: {
        'space': '_keyHandler'
      }
    });

    Polymer({
      is: 'x-a11y-combo-keys',

      behaviors: [
        KeysTestBehavior
      ],

      keyBindings: {
        'enter': '_keyHandler2',
        'ctrl+shift+a shift+enter': '_keyHandler'
      }
    });

    Polymer({
      is: 'x-a11y-alternate-event-keys',

      behaviors: [
        KeysTestBehavior
      ],

      keyBindings: {
        'space:keyup': '_keyHandler'
      }
    });

    var XA11yBehavior = {
      keyBindings: {
        'enter': '_keyHandler'
      }
    };

    Polymer({
      is: 'x-a11y-behavior-keys',

      behaviors: [
        KeysTestBehavior,
        XA11yBehavior
      ],

      keyBindings: {
        'enter': '_keyHandler'
      }
    });

    Polymer({
      is: 'x-a11y-prevent-keys',

      behaviors: [
        KeysTestBehavior,
        XA11yBehavior
      ],

      keyBindings: {
        'space a': '_keyHandler',
        'enter shift+a': '_preventDefaultHandler'
      }
    });
  });

  suite('basic keys', function() {
    setup(function() {
      keys = fixture('BasicKeys');
    });

    test('trigger the handler when the specified key is pressed', function() {
      MockInteractions.pressSpace(keys);

      expect(keys.keyCount).to.be.equal(1);
    });

    test('trigger the handler when the specified key is pressed together with a modifier', function() {
      var event = new CustomEvent('keydown');
      event.ctrlKey = true;
      event.keyCode = event.code = 32;
      keys.dispatchEvent(event);
      expect(keys.keyCount).to.be.equal(1);
    });

    test('do not trigger the handler for non-specified keys', function() {
      MockInteractions.pressEnter(keys);

      expect(keys.keyCount).to.be.equal(0);
    });

    test('can have bindings added imperatively', function() {
      keys.addOwnKeyBinding('enter', '_keyHandler');

      MockInteractions.pressEnter(keys);
      expect(keys.keyCount).to.be.equal(1);

      MockInteractions.pressSpace(keys);
      expect(keys.keyCount).to.be.equal(2);
    });

    test('can remove imperatively added bindings', function() {
      keys.addOwnKeyBinding('enter', '_keyHandler');
      keys.removeOwnKeyBindings();

      MockInteractions.pressEnter(keys);
      expect(keys.keyCount).to.be.equal(0);

      MockInteractions.pressSpace(keys);
      expect(keys.keyCount).to.be.equal(1);
    });

    test('allows propagation beyond the key combo handler', function() {
      var keySpy = sinon.spy();
      document.addEventListener('keydown', keySpy);

      MockInteractions.pressEnter(keys);

      expect(keySpy.callCount).to.be.equal(1);
    });

    suite('edge cases', function() {
      test('knows that `spacebar` is the same as `space`', function() {
        var event = new CustomEvent('keydown');
        event.key = 'spacebar';
        expect(keys.keyboardEventMatchesKeys(event, 'space')).to.be.equal(true);
      });

      test('handles `+`', function() {
        var event = new CustomEvent('keydown');
        event.key = '+';
        expect(keys.keyboardEventMatchesKeys(event, '+')).to.be.equal(true);
      });

      test('handles `:`', function() {
        var event = new CustomEvent('keydown');
        event.key = ':';
        expect(keys.keyboardEventMatchesKeys(event, ':')).to.be.equal(true);
      });

      test('handles ` ` (space)', function() {
        var event = new CustomEvent('keydown');
        event.key = ' ';
        expect(keys.keyboardEventMatchesKeys(event, 'space')).to.be.equal(true);
      });
    });

    suite('matching keyboard events to keys', function() {
      test('can be done imperatively', function() {
        var event = new CustomEvent('keydown');
        event.keyCode = 65;
        expect(keys.keyboardEventMatchesKeys(event, 'a')).to.be.equal(true);
      });

      test('can be done with a provided keyboardEvent', function() {
        var event;
        MockInteractions.pressSpace(keys);
        event = keys.lastEvent;

        expect(event.detail.keyboardEvent).to.be.okay;
        expect(keys.keyboardEventMatchesKeys(event, 'space')).to.be.equal(true);
      });

      test('can handle variations in arrow key names', function() {
        var event = new CustomEvent('keydown');
        event.key = 'up';
        expect(keys.keyboardEventMatchesKeys(event, 'up')).to.be.equal(true);
        event.key = 'ArrowUp';
        expect(keys.keyboardEventMatchesKeys(event, 'up')).to.be.equal(true);
      });
    });
  });

  suite('combo keys', function() {
    setup(function() {
      keys = fixture('ComboKeys');
    });

    test('trigger the handler when the combo is pressed', function() {
      var event = new CustomEvent('keydown');

      event.ctrlKey = true;
      event.shiftKey = true;
      event.keyCode = event.code = 65;

      keys.dispatchEvent(event);

      expect(keys.keyCount).to.be.equal(1);
    });

    test('trigger also bindings without modifiers', function() {
      var event = new CustomEvent('keydown');
      // Combo `shift+enter`.
      event.shiftKey = true;
      event.keyCode = event.code = 13;
      keys.dispatchEvent(event);
      expect(keys.keyCount).to.be.equal(2);
    });

    test('give precendence to combos with modifiers', function() {
      var enterSpy = sinon.spy(keys, '_keyHandler2');
      var shiftEnterSpy = sinon.spy(keys, '_keyHandler');
      var event = new CustomEvent('keydown');
      // Combo `shift+enter`.
      event.shiftKey = true;
      event.keyCode = event.code = 13;
      keys.dispatchEvent(event);
      expect(enterSpy.called).to.be.true;
      expect(shiftEnterSpy.called).to.be.true;
      expect(enterSpy.calledAfter(shiftEnterSpy)).to.be.true;
    });
  });

  suite('alternative event keys', function() {
    setup(function() {
      keys = fixture('AlternativeEventKeys');
    });

    test('trigger on the specified alternative keyboard event', function() {
      MockInteractions.keyDownOn(keys, 32);

      expect(keys.keyCount).to.be.equal(0);

      MockInteractions.keyUpOn(keys, 32);

      expect(keys.keyCount).to.be.equal(1);
    });
  });

  suite('behavior keys', function() {
    setup(function() {
      keys = fixture('BehaviorKeys');
    });

    test('bindings in other behaviors are transitive', function() {
      MockInteractions.pressEnter(keys);
      expect(keys.keyCount).to.be.equal(2);
    });
  });

  suite('stopping propagation automatically', function() {
    setup(function() {
      keys = fixture('NonPropagatingKeys');
    });

    test('does not propagate key events beyond the combo handler', function() {
      var keySpy = sinon.spy();

      document.addEventListener('keydown', keySpy);

      MockInteractions.pressEnter(keys);

      expect(keySpy.callCount).to.be.equal(0);
    });
  });

  suite('prevent default behavior of event', function() {
    setup(function() {
      keys = fixture('PreventKeys');
    });

    test('`defaultPrevented` is correctly set', function() {
      MockInteractions.pressEnter(keys);
      expect(keys.lastEvent.defaultPrevented).to.be.equal(true);
    });

    test('only 1 handler is invoked', function() {
      var aSpy = sinon.spy(keys, '_keyHandler');
      var shiftASpy = sinon.spy(keys, '_preventDefaultHandler');
      var event = new CustomEvent('keydown', {
        cancelable: true
      });
      // Combo `shift+a`.
      event.shiftKey = true;
      event.keyCode = event.code = 65;
      keys.dispatchEvent(event);

      expect(keys.keyCount).to.be.equal(1);
      expect(shiftASpy.called).to.be.true;
      expect(aSpy.called).to.be.false;
    });
  });

});
  