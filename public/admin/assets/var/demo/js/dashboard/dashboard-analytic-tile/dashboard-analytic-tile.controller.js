(function(){

app.controller('DashboardAnalyticTileComponentController', dashboardAnalyticTileComponentController);

dashboardAnalyticTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal', '$timeout'];
/* @ngInject */
function dashboardAnalyticTileComponentController($scope, $attrs, $filter, DashboardService, $modal, $timeout) {

    var vm = this;

    vm.init = init;

    vm.analyticMap = analyticMap;
    vm.uiDetails = [];

    //TODO: get from Dashboard.service
    /*vm.analyticData = {
        'visitors': {},
        'contacts': {},
        'CampaignMetrics': {},
        'Revenue': {},
        'SocialMedia': {}
    };*/


        vm.analyticData = {
            'Inventory': {},
            'Quotes': {},
            'PurchaseOrders': {},
            'Invoices': {},
            'Renewals': {},
            'Promotions': {}
        };

    function analyticMap() {
        var ret = {};
        var analyticsObject = DashboardService.state.analytics;

        if (analyticsObject) {
            switch(vm.analytic.name) {
                case 'Inventory':

                    ret.widgetTitle = 'Inventory Watch';
                    ret.buttonTitle = 'View Inventory';
                    ret.link = '#/inventory';

                    ret.header = [
                        {label: 'Vendor'},
                        {label: 'Product'},
                        {label: 'Qty Avail'}
                    ];

                    $scope.$watch(function() { return DashboardService.inventory; }, function(inventory){
                        if(angular.isDefined(inventory)){
                            ret.widgetLoaded = true;
                        }
                        ret.data = []
                        _.each(inventory, function(item){
                            ret.data.push({
                                field1: item.OMRC_FirmName.split(" ")[0],
                                field2: item.OITM_ItemName,
                                field3: item.Available <0 ? '' : item.Available,
                                link: ret.link + "/" + item["@id"]
                            })
                        })
                    });

                    break;

                case 'Quotes':

                    ret.widgetTitle = 'Quotes';
                    ret.buttonTitle = 'Build a quote';
                    ret.header = [
                        {label: 'Quote #'},
                        {label: 'End User'},
                        {label: 'Amount'}
                    ];
                    ret.data = [
                        {
                            field1: "12345",
                            field2: "Tesla",
                            field3: "$432,000"
                        }
                    ];

                    break;
                case 'PurchaseOrders':
                    ret.widgetTitle = 'Purchase Orders';
                    ret.buttonTitle = 'Submit a PO';
                    ret.link = '#/purchase-orders';

                    ret.header = [
                        {label: 'PO #'},
                        {label: 'DESC'},
                        {label: 'Submitter'}
                    ];

                    $scope.$watch(function() { return DashboardService.purchaseOrders; }, function(purchaseOrders){
                        ret.data = []
                        if(angular.isDefined(purchaseOrders)){
                            ret.widgetLoaded = true;
                        }
                        _.each(purchaseOrders, function(order){
                            ret.data.push({
                                field1: order.title,
                                field2: order.text,
                                field3: getPoUser(order),
                                link: ret.link + "/" + order._id
                            })
                        })
                    });

                    break;
                case 'Invoices':

                    ret.widgetTitle = 'Invoices';
                    ret.buttonTitle = 'View Ledger';
                    ret.link = '#/customers'; // Really, this should go to ledger for non-Admin

                    $scope.$watch("$parent.orgCardAndPermissions", function(permissions) {
                        if(angular.isDefined(permissions)){
                            ret.link = permissions.userPermissions.dashbordLedgerUrl;
                        }
                    });

                    ret.header = [

                        {label: 'Amount'},
                        {label: 'Invoice #'},
                        {label: 'Due Date'}

                    ];
                    $scope.$watch(function() { return DashboardService.invoices; }, function(invoices){
                        ret.data = [];
                        if(angular.isDefined(invoices)){
                            ret.widgetLoaded = true;
                        }
                        _.each(invoices, function(invoice){

                            ret.data.push({

                                field1: parseValueToCurrency(invoice.totalInvoice, invoice.currency),
                                field2: invoice.invoiceNumber,
                                field3: $filter('date')(parseValueToDate(invoice.dueDate), 'M/d/yyyy'),
                                link: "#/invoices/" + invoice.cardCode + "/" + invoice.invoiceNumber
                            })
                        })
                    });
                    break;

                case 'Renewals':

                    ret.widgetTitle = 'Renewals';
                    ret.buttonTitle = 'View All renewals';
                    ret.header = [
                        {label: 'Date'},
                        {label: 'End User'},
                        {label: 'Amount'}
                    ];
                    ret.data = [
                        {
                            field1: "2/15/17",
                            field2: "Tesla",
                            field3: "$32,000",
                        },{
                            field1: "2/15/19",
                            field2: "Google",
                            field3: "$22,000",
                        }
                    ];
                    break;
                case 'Promotions':

                    ret.widgetTitle = 'Promotions';
                    ret.buttonTitle = 'View Promotions';
                    ret.header = [
                        {label: 'Promotion'},
                        {label: 'Promo Potential'}
                    ];
                    ret.data = [
                        {
                            field1: "Ruckus 10PK",
                            field2: "$1000,000"
                        }
                    ];

                    break;

                default:
                //code
            }

        } else {
            $timeout(function(){
                vm.analyticMap();;
            }, 100);
        }

        vm.uiDetails = ret;
        return ret;
    }

    $scope.$watch(function() { return DashboardService.state.analytics }, function(state, oldState) {
        if(state && state !== oldState){
            vm.analyticMap();
        }
    })


    function getPoUser(order){
        var _user = "";
        if(order.submitter){
            if(order.submitter.first){
                _user = order.submitter.first + " " + order.submitter.last;
            }
            else{
                _user = order.submitter.username;
            }
        }
        return _user;
    }

    function parseValueToDate(value){
        if(value){
            var formattedDate = Date.parse(value); // "M/d/yyyy h:mm:ss a"
            return formattedDate;
        }
    }

    function parseValueToCurrency(value, symbol){
        if(value){
            return $filter('currency')(value, symbol)
        }
    }

    function init(element) {
        vm.element = element;

        $timeout(function() {
            vm.analyticMap();
        }, 0);

    }



}

})();
