angular.module('app.directives').directive('videoPreview', function ($compile) {
    var varToPropertiesMapping = [
        {varName: "link", propertyName: "videoUrl"},
        {varName: "preview_image", propertyName: "videoBigPreviewUrl"},
        {varName: "title", propertyName: "videoTitle"},
        {varName: "subtitle", propertyName: "videoSubtitle"},
        {varName: "body", propertyName: "videoBody"}
    ];

    function convertToAngularHtml(madrillTemplate) {
        var result = madrillTemplate.code;
        for (var i = 0; i < varToPropertiesMapping.length; i++) {
            var oneVarMapping = varToPropertiesMapping[i];
            result = result.replace("*|" + oneVarMapping.varName.toUpperCase() + "|*", "{{video." + oneVarMapping.propertyName + "}}")
        }
        return result;
    }

    return {
        scope: {
            video: "=",
            template: "=",
            courseDetails: "=",
            editMode: "="
        },
        restrict: 'E',
        controller: function ($scope, $sce) {
        },
        link: function (scope, element, attrs) {
            element.html(convertToAngularHtml(scope.template));
            $compile(element.contents())(scope);
        }
    }
});
