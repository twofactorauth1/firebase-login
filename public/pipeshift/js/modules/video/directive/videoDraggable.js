angular.module('var.directives').directive('videoDraggable', function () {
    return {scope: {
        index: '='
    }, link: function (scope, elm, attr) {
        elm.attr("draggable", true);
        elm.bind("dragstart", function (event) {
            event.originalEvent.dataTransfer.setData('videoIndex', scope.index+"");
        });
    }};
});
