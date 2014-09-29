define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('truncate', [function () {
            return {
                restrict: 'A',
                scope: {
                    list: '=truncateList',
                    limit: '=truncateLimit',
                    symbol: '=truncateSymbol'
                },
                transclude: false,
                template: '{{displayValue}}',
                link: function (scope, element, attrs) {
                    var tmpList = [];
                    scope.list.forEach(function (value, index) {
                        if (value)
                            tmpList.push(value);
                    });
                    var tmpStr = tmpList.join(' ');
                    scope.displayValue = tmpStr.substring(0, scope.limit);
                    if (scope.displayValue.length == scope.limit)
                        scope.displayValue += scope.symbol;
                }
            };
    }]);
});
