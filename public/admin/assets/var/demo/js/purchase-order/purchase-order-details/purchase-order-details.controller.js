(function(){

app.controller('PurchaseOrderDetailsController', purchaseOrderDetailsController);

purchaseOrderDetailsController.$inject = ['$scope', '$state', '$attrs', '$filter', '$modal', '$timeout', '$stateParams', '$location', 'SweetAlert', 'toaster', 'PurchaseOrderService'];
/* @ngInject */
function purchaseOrderDetailsController($scope, $state, $attrs, $filter, $modal, $timeout, $stateParams, $location, SweetAlert, toaster, PurchaseOrderService) {

    var vm = this;

    vm.init = init;

    vm.state = {};

    vm.uiState = {
        loading: true
    };

    vm.newNote = {};

    console.log($stateParams.purchaseOrderId);

    vm.backToPurchaseOrders = backToPurchaseOrders;
    vm.getPurchaseOrderDetails = getPurchaseOrderDetails;
    vm.addNote = addNote;
    vm.archivePurchaseOrder = archivePurchaseOrder;
    vm.getSubmitterName = getSubmitterName;

    function backToPurchaseOrders(){
        $state.go("app.purchaseorders");
    }

    function getPurchaseOrderDetails(orderId){ 
        PurchaseOrderService.getPurchaseOrderDetails(orderId).then(function(response){
            vm.state.purchaseOrder = response.data;
            renderPdfToContainer(vm.state.purchaseOrder);
            vm.uiState.loading = false;
            vm.uiState.noteEnable = false;
        })
    }

    function getUserName(){
        var _userName = $scope.$parent.currentUser.email;
        if($scope.$parent.currentUser.first || $scope.$parent.currentUser.last){
            _userName = $scope.$parent.currentUser.first + " " + $scope.$parent.currentUser.last;
        }
        return _userName.trim();
    }

    /*
     * @addNote
     * add a note to an order
     */
    
    function addNote(_note) {
        vm.uiState.saveLoading = true;
        var date = moment();
        var _noteToPush = {
            note: _note,            
            date: date.toISOString()           
        };
        
        var emails = {};
        if(vm.uiState.noteEnable){
            emails = {
                sendTo: vm.state.purchaseOrder.submitterEmail || vm.state.purchaseOrder.submitter.username,
                fromEmail: $scope.$parent.currentUser.email,
                fromName: getUserName()
            }
        }  

        PurchaseOrderService.addPurchaseOrderNote($stateParams.purchaseOrderId, _noteToPush, emails).then(function(response){
            toaster.pop('success',"Notes added");
            if (!vm.state.purchaseOrder.notes)
                vm.state.purchaseOrder.notes = [];
            vm.state.purchaseOrder.notes.push(response.data);
            vm.newNote.text = '';
            vm.uiState.saveLoading = false;
            vm.uiState.noteEnable = false;
        })
        
    };


    function archivePurchaseOrder(po){
        SweetAlert.swal({
            title: "Are you sure?",
            text: "You want to archive this purchase order.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            
            if (isConfirm) {
                vm.uiState.saveLoading = true;
                PurchaseOrderService.archivePurchaseOrder(po._id).then(function(response){
                    console.log("PO archived");
                    vm.uiState.saveLoading = false;
                    toaster.pop('success', 'Purchase order successfully archived');
                    backToPurchaseOrders();
                })
            }
        });
        
    }

    function renderPdfToContainer(po){
        if(po.attachment && po.attachment.url &&  po.attachment.mimeType == 'application/pdf'){
            //var myPDF = new PDFObject({ url: 'https://research.google.com/pubs/archive/44678.pdf' }).embed('pdf-container');
            var myPDF = new PDFObject({ url: po.attachment.url }).embed('pdf-container');
        }
    }

    function getSubmitterName(user){
        var _userName = "";
        if(!user){
            return _userName;
        }
        if(user.first || user.last){
            _userName = user.first + " " + user.last;
        }
        else{
            _userName = user.username;
        }
        return _userName.trim();
    }

    function init(element) {
        vm.element = element;
        vm.getPurchaseOrderDetails($stateParams.purchaseOrderId);
    }

    $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
        if(angular.isDefined(permissions)){
            vm.state.orgCardAndPermissions = permissions;
        }
    });

}

})();
