(function(){

app.controller('DashboardWorkstreamTileComponentController', dashboardWorkstreamTileComponentController);

dashboardWorkstreamTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal'];
/* @ngInject */
function dashboardWorkstreamTileComponentController($scope, $attrs, $filter, DashboardService, $modal) {

    var vm = this;

    vm.init = init;
    vm.workstreamClick = workstreamClick;
    vm.playWorkstreamVideo = playWorkstreamVideo;
    vm.videoClosed = videoClosed;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.getVideoConfigObject = getVideoConfigObject;
    vm.videoConfig = {
        version: 3,
        text: null,
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

    vm.onPlayerReady = onPlayerReady;

    function workstreamClick() {

        if (!vm.workstream.unlocked) {

            /*

            [x] show video overlay
            [x] on overlay close, set unlocked=true
            [ ] show block list

            */

            var vid1 = vm.playWorkstreamVideo()

            vid1.result.finally(vm.videoClosed);
            vid1.result.catch(vm.videoClosed);
            vid1.result.then(vm.videoClosed);

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
        debugger;
        DashboardService.unlockWorkstream(vm.workstream._id);
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

    function onPlayerReady(videogularApi) {
        debugger;
    }

    function getVideoConfigObject(workstream) {
        return (
            angular.extend(vm.videoConfig, {
                video: workstream.unlockVideoUrl
            })
        )
    }

    function init(element) {
        vm.element = element;
    }

}

})();
