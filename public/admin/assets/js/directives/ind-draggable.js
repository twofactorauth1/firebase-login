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

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content (if not form element)
        if (event.target.nodeName !== 'INPUT' &&
            event.target.nodeName !== 'TEXTAREA' &&
            event.target.nodeName !== 'SELECT') {

          event.preventDefault();

        }

        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    }
  };
}]);
