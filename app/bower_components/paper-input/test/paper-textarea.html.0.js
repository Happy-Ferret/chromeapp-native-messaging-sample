

    suite('basic', function() {

      test('setting value sets the input value', function() {
        var input = fixture('basic');
        input.value = 'foobar';
        assert.equal(input.inputElement.bindValue, input.value, 'inputElement value equals input.value');
      });

      test('empty required input shows error', function() {
        var input = fixture('required');
        forceXIfStamp(input);
        var error = Polymer.dom(input.root).querySelector('paper-input-error');
        assert.ok(error, 'paper-input-error exists');
        assert.notEqual(getComputedStyle(error).display, 'none', 'error is not display:none');
      });

      test('caret position is preserved', function() {
        var input = fixture('basic');
        var ironTextarea = Polymer.dom(input.root).querySelector('iron-autogrow-textarea');
        input.value = 'nananana';
        ironTextarea.selectionStart = 2;
        ironTextarea.selectionEnd = 2;

        input.updateValueAndPreserveCaret('nanananabatman');

        assert.equal(ironTextarea.selectionStart, 2, 'selectionStart is preserved');
        assert.equal(ironTextarea.selectionEnd, 2, 'selectionEnd is preserved');
      });

      test('input attributes are bound to textarea', function() {
        var input = fixture('basic');
        var attrs = {
          'autocomplete': 'true',
          'autofocus': true,
          'inputmode': 'number',
          'name': 'foo',
          'placeholder': 'bar',
          'readonly': true,
          'required': true,
          'maxlength': 3
        };
        for (var attr in attrs) {
          input[attr] = attrs[attr];
        }
        for (var attr in attrs) {
          var inputAttr = input.inputElement.getAttribute(attr);
          if (typeof attrs[attr] === 'boolean') {
            assert.equal(inputAttr !== null, attrs[attr], 'attribute "' + attr + '" is equal to property (' + attrs[attr] + ', ' + inputAttr !== null + ')');
          } else {
            assert.equal(inputAttr, attrs[attr], 'attribute "' + attr + '" is equal to property (' + attrs[attr] + ', ' + inputAttr + ')');
          }
        }
      });

      test('always-float-label attribute works', function() {
        var input = fixture('always-float-label');
        var container = Polymer.dom(input.root).querySelector('paper-input-container');
        var inputContent = Polymer.dom(container.root).querySelector('.input-content');
        assert.isTrue(inputContent.classList.contains('label-is-floating'), 'label is floating');
      });
    });

    suite('focus/blur events', function() {
      var input;

      setup(function() {
        input = fixture('basic');
      });

      test('focus/blur events fired on host element', function() {
        var nFocusEvents = 0;
        var nBlurEvents = 0;
        input.addEventListener('focus', function(event) {
          nFocusEvents += 1;
          assert(input.focused, 'input is focused');
          MockInteractions.blur(input.inputElement.textarea);
        });
        input.addEventListener('blur', function() {
          nBlurEvents += 1;
          assert(!input.focused, 'input is blurred');
        });
        MockInteractions.focus(input.inputElement.textarea);
        assert.isTrue(nFocusEvents >= 1, 'focus event fired');
        assert.isTrue(nBlurEvents >= 1, 'blur event fired')
      });

      test('focus a textarea with tabindex', function(done) {
        var input = fixture('has-tabindex');
        flush(function() {
          assert.notEqual(document.activeElement, input._focusableElement);
          MockInteractions.focus(input);
          setTimeout(function() {
            assert.equal(document.activeElement, input.shadowRoot ? input : input._focusableElement);
            done();
          }, 1);
        })
      });
    });

    suite('a11y', function() {

      test('has aria-labelledby', function() {
        var input = fixture('label');
        assert.isTrue(input.inputElement.textarea.hasAttribute('aria-labelledby'))
        assert.equal(input.inputElement.textarea.getAttribute('aria-labelledby'), Polymer.dom(input.root).querySelector('label').id, 'aria-labelledby points to the label');
      });

      test('has aria-describedby for error message', function() {
        var input = fixture('required');
        forceXIfStamp(input);
        assert.isTrue(input.inputElement.textarea.hasAttribute('aria-describedby'));
        assert.equal(input.inputElement.textarea.getAttribute('aria-describedby'), Polymer.dom(input.root).querySelector('paper-input-error').id, 'aria-describedby points to the error message');
      });

      test('has aria-describedby for character counter', function() {
        var input = fixture('char-counter');
        forceXIfStamp(input);
        assert.isTrue(input.inputElement.textarea.hasAttribute('aria-describedby'));
        assert.equal(input.inputElement.textarea.getAttribute('aria-describedby'), Polymer.dom(input.root).querySelector('paper-input-char-counter').id, 'aria-describedby points to the character counter');
      });

      test('has aria-describedby for character counter and error', function() {
        var input = fixture('required-char-counter');
        forceXIfStamp(input);
        assert.isTrue(input.inputElement.textarea.hasAttribute('aria-describedby'));
        assert.equal(input.inputElement.textarea.getAttribute('aria-describedby'), Polymer.dom(input.root).querySelector('paper-input-error').id + ' ' + Polymer.dom(input.root).querySelector('paper-input-char-counter').id, 'aria-describedby points to the error message and character counter');
      });

    });


  