
      suite('<iron-image>', function() {
        function randomImageUrl () {
          return '../demo/polymer.svg?' + Math.random();
        }

        var image;

        suite('basic behavior', function() {
          setup(function() {
            image = fixture('TrivialImage');
          });

          test('can load images given a src', function(done) {
            image.addEventListener('loaded-changed', function onLoadedChanged() {
              image.removeEventListener('loaded-changed', onLoadedChanged);

              try {
                expect(image.loaded).to.be.eql(true);
                done();
              } catch (e) {
                done(e);
              }
            });
            image.src = randomImageUrl();
          });

          test('will reload images when src changes', function(done) {
            var loadCount = 0;

            image.addEventListener('loaded-changed', function onLoadedChanged() {
              if (image.loaded === true) {
                loadCount++;

                if (loadCount === 2) {
                  done();
                } else {
                  image.src = randomImageUrl();
                  image.removeEventListener('loaded-changed', onLoadedChanged);
                }
              }
            });

            image.src = randomImageUrl();
          });
        });

        suite('--iron-image-width, --iron-image-height', function() {
          var fixedWidthContainer;
          var fixedWidthIronImage;
          var fixedHeightContainer;
          var fixedHeightIronImage;

          setup(function() {
            fixedWidthContainer = fixture('FixedWidthContainer');
            fixedWidthIronImage = fixedWidthContainer.querySelector('iron-image');
            fixedHeightContainer = fixture('FixedHeightContainer');
            fixedHeightIronImage = fixedHeightContainer.querySelector('iron-image');
          });

          test('100% width image fills container', function(done) {
            fixedWidthIronImage.$.img.addEventListener('load', function onLoadedChanged(e) {
              fixedWidthIronImage.$.img.removeEventListener('load', onLoadedChanged);
              Polymer.updateStyles();

              var containerRect = fixedWidthContainer.getBoundingClientRect();
              var ironImageRect = fixedWidthIronImage.getBoundingClientRect();
              var wrappedImageRect = fixedWidthIronImage.$.img.getBoundingClientRect();

              expect(containerRect.width).to.be.closeTo(500, 0.5);
              expect(ironImageRect.width).to.be.closeTo(500, 0.5);
              expect(wrappedImageRect.width).to.be.closeTo(500, 0.5);

              done();
            });

            fixedWidthIronImage.src = randomImageUrl();
          });

          test('100% height image fills container', function(done) {
            fixedHeightIronImage.$.img.addEventListener('load', function onLoadedChanged(e) {
              fixedHeightIronImage.$.img.removeEventListener('load', onLoadedChanged);
              Polymer.updateStyles();

              var containerRect = fixedHeightContainer.getBoundingClientRect();
              var ironImageRect = fixedHeightIronImage.getBoundingClientRect();
              var wrappedImageRect = fixedHeightIronImage.$.img.getBoundingClientRect();

              expect(containerRect.height).to.be.closeTo(500, 0.5);
              expect(ironImageRect.height).to.be.closeTo(500, 0.5);
              expect(wrappedImageRect.height).to.be.closeTo(500, 0.5);

              done();
            });

            fixedHeightIronImage.src = randomImageUrl();
          });
        });
      });
    