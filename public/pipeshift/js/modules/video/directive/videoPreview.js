angular.module('app.directives').directive('videoPreview', function ($compile) {
    var varToPropertiesMapping = [
        {varName: "link", propertyName: "videoUrl"},
        {varName: "percents", propertyName: "percents"},
        {varName: "video_index", propertyName: "videoIndex"},
        {varName: "total_videos", propertyName: "totalVideos"},
        {varName: "preview_image", propertyName: "videoBigPreviewUrl"},
        {varName: "title", propertyName: "videoTitle"},
        {varName: "subtitle", propertyName: "videoSubtitle"},
        {varName: "body", propertyName: "videoBody"}
    ];

    function convertToAngularHtml(madrillTemplate) {
        var result = madrillTemplate.code;
        for (var i = 0; i < varToPropertiesMapping.length; i++) {
            var oneVarMapping = varToPropertiesMapping[i];
            result = replaceAll(result, "*|" + oneVarMapping.varName.toUpperCase() + "|*", "{{video." + oneVarMapping.propertyName + "}}");
        }
        return result;
    }

    function escapeRegExp(string) {
        console.log(string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"));
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    function replaceAll(string, find, replace) {
        return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
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
