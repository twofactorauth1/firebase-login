(function(){

app.controller('DashboardWorkstreamTileComponentController', dashboardWorkstreamTileComponentController);

dashboardWorkstreamTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$modal'];
/* @ngInject */
function dashboardWorkstreamTileComponentController($scope, $attrs, $filter, DashboardService, $modal) {

    var vm = this;

    vm.init = init;
    vm.workstreamClick = workstreamClick;
    vm.playWorkstreamVideo = playWorkstreamVideo;
    vm.openModal = openModal;
    vm.videoConfig = {
        version: 3,
        text: 'Workstream Video',
        visibility: true,
        type: 'video',
        videoType: 'youtube',
        video: null,
        videoWidth: 400,
        videoHeight: 400,
        videoAutoPlay: true,
        videoMp4: false,
        videoWebm: false,
        videoControls: false
    }

    function workstreamClick() {

        if (!vm.workstream.unlocked) {

            /*

            [x] show video overlay
            [ ] on overlay close, set unlocked=true
            [ ] show block list

            */

            vm.playWorkstreamVideo();

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

    function unlockWorkstream() {
        //call API
        // vm.workstream._id
    }

    function init(element) {
        vm.element = element;
    }

}

})();
