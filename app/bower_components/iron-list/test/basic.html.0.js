

  suite('basic features', function() {
    var list, container;

    setup(function() {
      container = fixture('trivialList');
      list = container.list;
    });

    test('defaults', function() {
      assert.equal(list.items, null);
      assert.equal(list.as, 'item');
      assert.equal(list.indexAs, 'index');
    });

    test('check items length', function(done) {
      container.data = buildDataSet(100);

      flush(function() {
        assert.equal(list.items.length, container.data.length);
        done();
      });
    });

    test('check physical item heights', function(done) {
      container.data = buildDataSet(100);

      flush(function() {
        var rowHeight = list._physicalItems[0].offsetHeight;

        list._physicalItems.forEach(function(item) {
          assert.equal(item.offsetHeight, rowHeight);
        });

        done();
      });
    });

    test('check physical item size', function(done) {
      var setSize = 10;
      container.data = buildDataSet(setSize);

      flush(function() {
        assert.equal(list.items.length, setSize);
        done();
      });
    });

    test('first visible index', function(done) {
      container.data = buildDataSet(100);

      flush(function() {
        var setSize = list.items.length;
        var rowHeight = list._physicalItems[0].offsetHeight;
        var viewportHeight = list.offsetHeight;
        var scrollToItem;

        function checkFirstVisible() {
          assert.equal(list.firstVisibleIndex, scrollToItem);
          assert.equal(getFirstItemFromList(list).textContent, scrollToItem);
        }

        function doneScrollDown() {
          checkFirstVisible();

          scrollToItem = 1;

          flush(function() {
            simulateScroll({
              list: list,
              contribution: rowHeight,
              target: scrollToItem*rowHeight
            }, doneScrollUp);
          });
        }

        function doneScrollUp() {
          checkFirstVisible();
          done();
        }

        scrollToItem = 50;
        simulateScroll({
          list: list,
          contribution: 50,
          target: scrollToItem*rowHeight
        }, doneScrollDown);

      });
    });

    test('scroll to index', function(done) {
      list.items = buildDataSet(100);

      flush(function() {
        list.scrollToIndex(30);
        assert.equal(list.firstVisibleIndex, 30);

        list.scrollToIndex(0);
        assert.equal(list.firstVisibleIndex, 0);

        var rowHeight = getFirstItemFromList(list).offsetHeight;
        var viewportHeight = list.offsetHeight;
        var itemsPerViewport = Math.floor(viewportHeight/rowHeight);

        list.scrollToIndex(99);
        assert.equal(list.firstVisibleIndex, list.items.length - itemsPerViewport);

        // make the height of the viewport same as the height of the row
        // and scroll to the last item
        list.style.height = list._physicalItems[0].offsetHeight + 'px';

        setTimeout(function() {
          list.scrollToIndex(99);
          assert.equal(list.firstVisibleIndex, 99);
          done();
        }, 100);

      });
    });

    test('reset items', function(done) {
      list.items = buildDataSet(100);

      flush(function() {
        var firstItem = getFirstItemFromList(list);
        assert.equal(firstItem.textContent, '0');

        list.items = null;

        flush(function() {
          assert.notEqual(getFirstItemFromList(list), firstItem);
          list.items = buildDataSet(100);

          flush(function() {
            assert.equal(getFirstItemFromList(list), firstItem);
            done();
          });
        });
      });
    });

  });
