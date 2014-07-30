angular.module('app.directives').directive('videoDraggable', function () {
    return {scope: {
        index: '='
    }, link: function (scope, elm, attr) {
        elm.attr("draggable", true);
        elm.bind("dragstart", function (event) {
            event.dataTransfer.setData('videoIndex', scope.index+"");
        });
    }};
});
