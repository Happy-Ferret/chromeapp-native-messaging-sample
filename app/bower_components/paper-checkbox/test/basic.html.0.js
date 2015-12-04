
    suite('defaults', function() {
      var c1;

      setup(function() {
        c1 = fixture('NoLabel');
      });

      test('check checkbox via click', function(done) {
        c1.addEventListener('click', function() {
          assert.isTrue(c1.getAttribute('aria-checked') == 'true');
          assert.isTrue(c1.checked);
          done();
        });
        MockInteractions.tap(c1);
      });

      test('toggle checkbox via click', function(done) {
        c1.checked = true;
        c1.addEventListener('click', function() {
          assert.isFalse(c1.getAttribute('aria-checked') != 'false');
          assert.isFalse(c1.checked);
          done();
        });
        MockInteractions.tap(c1);
      });

      test('disabled checkbox cannot be clicked', function(done) {
        c1.disabled = true;
        c1.checked = true;
        MockInteractions.tap(c1);
        setTimeout(function() {
          assert.isTrue(c1.getAttribute('aria-checked') == 'true');
          assert.isTrue(c1.checked);
          done();
        }, 1);
      });

      test('checkbox can be validated', function() {
        c1.required = true;
        assert.isFalse(c1.validate());

        c1.checked = true;
        assert.isTrue(c1.validate());
      });

      test('disabled checkbox is always valid', function() {
        c1.disabled = true;
        c1.required = true;
        assert.isTrue(c1.validate());

        c1.checked = true;
        assert.isTrue(c1.validate());
      });
    });

    suite('a11y', function() {
      var c1;
      var c2;

      setup(function() {
        c1 = fixture('NoLabel');
        c2 = fixture('WithLabel');
      });

      test('has aria role "checkbox"', function() {
        assert.isTrue(c1.getAttribute('role') == 'checkbox');
        assert.isTrue(c2.getAttribute('role') == 'checkbox');
      });

      test('checkbox with no label has no aria label', function() {
        assert.isTrue(!c1.getAttribute('aria-label'));
      });

      test('checkbox respects the user set aria-label', function() {
        var c = fixture('AriaLabel');
        assert.isTrue(c.getAttribute('aria-label') == "Batman");
      });

      a11ySuite('NoLabel');
      a11ySuite('WithLabel');
      a11ySuite('AriaLabel');
    });
  