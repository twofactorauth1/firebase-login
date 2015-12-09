app.directive('videoComponent',['$sce', function ($sce) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.flvVideoUrl = function (iframeUrl, url, autoPlay) {
        var parsedUrl = urlParser.parse(url);
        var retUrl = "";
        if (parsedUrl) {
          retUrl = iframeUrl + parsedUrl.id + '?showinfo=0&rel=0&hd=1';
          if(autoPlay)
            retUrl = retUrl + '&autoplay=1';
        }
        else
          retUrl = iframeUrl
        return $sce.trustAsResourceUrl(retUrl);
      };

      scope.config = {
        width: 780,
        height: 320,
        autoHide: true,
        autoPlay: false,
        autoHideTime: 1500,
        responsive: false,
        stretch: 'fit',
        theme: {
          url: "../../js/libs/videogular-themes-default/videogular.css",
          playIcon: "&#xe000;",
          pauseIcon: "&#xe001;",
          volumeLevel3Icon: "&#xe002;",
          volumeLevel2Icon: "&#xe003;",
          volumeLevel1Icon: "&#xe004;",
          volumeLevel0Icon: "&#xe005;",
          muteIcon: "&#xe006;",
          enterFullScreenIcon: "&#xe007;",
          exitFullScreenIcon: "&#xe008;"
        }
      }
    }
  };
}]);
