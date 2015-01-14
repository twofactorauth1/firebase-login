angular.module('var.directives').directive('videoDraggable', function () {
    return {scope: {
        index: '=',
        dragFn: '='
    }, link: function (scope, elm, attr) {
        elm.attr("draggable", true);
        elm.bind("dragstart", function (event) {
            if (scope.dragFn) {
              scope.dragFn();
            }
            event.originalEvent.dataTransfer.setData('videoIndex', scope.index+"");
        });
    }};
});
