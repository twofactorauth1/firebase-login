(function(){

app.controller('DashboardWorkstreamTileComponentController', dashboardWorkstreamTileComponentController);

dashboardWorkstreamTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal', '$timeout', '$document', '$interval'];
/* @ngInject */
function dashboardWorkstreamTileComponentController($scope, $attrs, $filter, DashboardService, $modal, $timeout, $document, $interval) {

    var vm = this;

    vm.init = init;
    vm.workstreamClick = workstreamClick;
    vm.playWorkstreamVideo = playWorkstreamVideo;
    vm.videoClosed = videoClosed;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.getVideoConfigObject = getVideoConfigObject;
    vm.callAliasMethod = callAliasMethod;
    vm.openMediaModal = openMediaModal;
    vm.augmentCompletePercentage = augmentCompletePercentage;
    vm.completePercentageStyle = '0%';
    vm.callbackOnMediaClose = callbackOnMediaClose;
    vm.videoConfig = {
        version: 3,
        text: null,
        visibility: true,
        type: 'video',
        videoType: 'youtube',
        // videoType: 'html5',
        video: null,
        videoWidth: 400,
        videoHeight: 400,
        videoAutoPlay: true,
        videoMp4: false,
        videoWebm: false,
        videoControls: false

    }

    // vm.onPlayerReady = onPlayerReady;

    /*
     * @workstreamClick
     * play video if workstream is not unlocked
     */
    function workstreamClick() {

        if (!vm.workstream.unlocked) {
            vm.uiState.openWorkstream = null;
            vm.playWorkstreamVideo().result.then(vm.videoClosed);

        } else {

            if (vm.uiState.openWorkstream && vm.uiState.openWorkstream._id === vm.workstream._id) {

                vm.uiState.openWorkstream = null;

            } else {
                vm.uiState.openWorkstream = vm.workstream;
                $timeout(function () {
                    var elementId = vm.workstream._id;
                    var element = document.getElementById(elementId);
                    if (element) {
                      $document.scrollToElementAnimated(element, 175, 1000);
                    }
                }, 0);

            }

        }

    }

    /*
     * @playWorkstreamVideo
     * open video in modal
     */
    function playWorkstreamVideo() {
        vm.videoConfig.video = vm.workstream.unlockVideoUrl;
        return vm.openModal('dashboard-workstream-tile-video');
    }

    /*
     * @videoClosed
     * called when video modal closes
     */
    function videoClosed(data) {
        DashboardService.unlockWorkstream(vm.workstream._id).then(function() {
            vm.workstreamClick();
        });
    }

    /*
     * @closeModal
     * default close modal
     */
    function closeModal() {
        vm.modalInstance.close();
    }

    /*
     * @openModal
     * open any modal by passing modal templateId
     */

    function openModal(modalTemplate) {
      vm.modalInstance = $modal.open({
        templateUrl: modalTemplate,
        keyboard: false,
        backdrop: 'static',
        size: 'lg',
        scope: $scope
      });

      return vm.modalInstance;
    }

    // function onPlayerReady(videogularApi) {
    //     debugger;
    // }

    function getVideoConfigObject(workstream) {
        var parsedUrl = urlParser.parse(workstream.unlockVideoUrl);
        var posterImage = null
        if(parsedUrl){
          posterImage = "//img.youtube.com/vi/"+parsedUrl.id+"/0.jpg";
        }
        return (
            angular.extend(vm.videoConfig, {
                video: workstream.unlockVideoUrl,
                videoAutoPlay: true,
                videoPosterImage : posterImage
            })
        )
    }

    /*
     * @callAliasMethod
     * call to alias methods
    */

    function callAliasMethod(alias){
        switch(alias.toLowerCase()) {
        case "mediamanager":
            vm.openMediaModal('media-modal', 'MediaModalCtrl', 'lg');
            break;
        case "websiteseo":
            $timeout(function () {
                angular.element(".topbar-settings").click();
            }, 0)
            break;
        default:
            //code
        }
    }

    /*
     * @openMediaModal
     * open Media Modal
    */

    function openMediaModal(modal, controller, size) {
        console.log('openModal >>> ', modal, controller);
        $scope.showDone = true;
        var _modal = {
            templateUrl: modal,
            keyboard: false,
            backdrop: 'static',
            size: 'md',
            scope: $scope,
            resolve: {
                vm: function() {
                    return vm;
                }
            }
        };
        if (controller) {
            _modal.controller = controller;
            _modal.resolve.showInsert = function () {
              return vm.showInsert;
            };
            _modal.resolve.insertMedia = function () {
              return vm.callbackOnMediaClose;
            };
        }

        if (size) {
            _modal.size = 'lg';
        }

        vm.modalInstance = $modal.open(_modal);

        vm.modalInstance.result.then(null, function () {
            angular.element('.sp-container').addClass('sp-hidden');
        });
    }

    function callbackOnMediaClose(){
        // Need to call getWorkstream(vm.uiState.openWorkstream._id)
        // but it is not returning updated object.
        DashboardService.getWorkstreams().then(function(response){
            var data = response.data;
            if(data){
                vm.uiState.openWorkstream = _.findWhere(data, {
                    _id: vm.uiState.openWorkstream._id
                });
            }
        })
    }

    function augmentCompletePercentage(percentage) {

        var p = 0;

        var stop = $interval(function() {
            console.log('p = ', p);
            if (p === percentage) {
                $interval.cancel(stop);
            }

            p = p + 1;

            vm.completePercentageStyle = p + '%';

        }, 10);

    }

    function init(element) {

        vm.element = element;

        $timeout(function() {
            vm.augmentCompletePercentage(parseInt(vm.workstream.completePercentage, 10));
        }, 1000);

    }

}

})();

