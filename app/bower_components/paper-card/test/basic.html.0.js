
    suite('a11y', function() {
      var f;
      setup(function () {
        f = fixture('basic');
      });

      test('aria-label set on card', function() {
        assert.strictEqual(f.getAttribute('aria-label'), f.heading);
      });

      test('aria-label can be updated', function() {
        assert.strictEqual(f.getAttribute('aria-label'), f.heading);
        f.heading = 'batman';
        assert.strictEqual(f.getAttribute('aria-label'), 'batman');
      });
    });
    suite('header image', function() {
      var f, img;
      setup(function () {
        f = fixture('basic');
        img = f.querySelector('iron-image');
      });

      test('is iron-image', function(){
        expect(img).to.be.ok;
      });

      test('width properly setup', function() {
        assert.strictEqual(img.offsetWidth, 0);
        f.image = 'some-img-url';
        assert.strictEqual(img.src, f.image);
        assert.strictEqual(img.offsetWidth, f.offsetWidth);
      });

      test('preload properly setup', function() {
        assert.strictEqual(img.preload, f.preloadImage);
        f.preloadImage = !f.preloadImage;
        assert.strictEqual(img.preload, f.preloadImage);
      });

      test('fade properly setup', function() {
        assert.strictEqual(img.fade, f.fadeImage);
        f.fadeImage = !f.fadeImage;
        assert.strictEqual(img.fade, f.fadeImage);
      });
    });
  