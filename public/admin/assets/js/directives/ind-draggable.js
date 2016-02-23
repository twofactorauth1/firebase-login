app.directive('indDraggable', ['$document', function($document) {
  return {
    link: function(scope, element, attr) {

      var startX = element.position().left || 0;
      var startY = element.position().top || 0;
      var x = startX;
      var y = startY;

      element.css({
       position: 'fixed',
       // border: '1px solid red',
       // backgroundColor: 'lightgrey',
       // cursor: 'pointer'
      });

      // Added handle to drag element
      var container = element.find(".draggable-handle");
      if(container.length === 0)
        container = element;

      container.on('mousedown', function(event) {

        // Prevent default dragging for input elements
        if (event.target.nodeName !== 'INPUT' &&
            event.target.nodeName !== 'TEXTAREA' &&
            event.target.nodeName !== 'SELECT') {

            startX = event.pageX - x;
            startY = event.pageY - y;
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);

        }

        //allow dragging a draggable item within a draggable panel... ah!
        //TODO: not working
        // if ($(event.target).parents('.ssb-page-section-settings-item').children('.ti-move').length < 1) {

        //     event.preventDefault();

        // }

        
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });

        if (y > 3 || x > 3) {
            event.stopPropagation();
        }

      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    }
  };
}]);
