(function($) {
  'use strict';
  $.fn.batchedImageLoader = function(opts) {
    var defaults = {
      delay: 1000,
      batchSize: 10,
      className: 'batched-image-loader'
    };
    var options = $.extend({}, defaults, opts);
    var i = 0,
        batchSize = options.batchSize;

    var process_batch = function(batch) {
      batch.each(function() {
        var $el = $(this),
            el = $el.get(0),
            loaded = $el.data('imgLoaded');
        if (!loaded) {
          el.src = $el.data('imgSrc');
          $el.data('imgLoaded', true);
          $el.removeClass(options.className);
        }
      });
    };

    var timeout_batch = function(batch, i) {
      window.setTimeout(function() {
        process_batch(batch);
      }, options.delay * i);
    };

    while (true) {
      var batch = this.slice(i * batchSize, batchSize + (i * batchSize));
      timeout_batch(batch, i);
      if (batch.length < 10) {
        break;
      }
      i++;
    }
  };
}(jQuery));
