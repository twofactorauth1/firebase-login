angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noPrevious()}\"><a href=\"{{$parent.$parent.getHref(1)}}\" ng-click=\"selectPage(1, $event)\">{{getText('first')}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noPrevious()}\"><a href=\"{{$parent.$parent.getHref(page, 'prev')}}\" ng-click=\"selectPage(page - 1, $event)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active}\"><a href=\"{{::$parent.$parent.getHref(page.number)}}\" ng-click=\"selectPage(page.number, $event)\">{{page.text}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noNext()}\"><a href=\"{{$parent.$parent.getHref(page, 'next')}}\" ng-click=\"selectPage(page + 1, $event)\">{{getText('next')}}</a></li>\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noNext()}\"><a href=\"{{$parent.$parent.getHref(totalPages + 1)}}\" ng-click=\"selectPage(totalPages, $event)\">{{getText('last')}}</a></li>\n" +
    "</ul>");
}]);