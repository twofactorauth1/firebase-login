(function(){

app.controller('DashboardAnalyticTileComponentController', dashboardAnalyticTileComponentController);

dashboardAnalyticTileComponentController.$inject = ['$scope', '$attrs', '$filter', 'DashboardService', '$modal', '$timeout', 'UserPermissionsConfig'];
/* @ngInject */
function dashboardAnalyticTileComponentController($scope, $attrs, $filter, DashboardService, $modal, $timeout, UserPermissionsConfig) {

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
                        {label: 'Qty OH'}
                    ];

                    $scope.$watch(function() { return DashboardService.inventory; }, function(inventory){

                        ret.data = []
                        _.each(inventory, function(item){
                            ret.data.push({
                                field1: item.OMRC_FirmName,
                                field2: item.OITM_ItemName,
                                field3: item.In_Stock <0 ? '' : item.In_Stock,
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


                    if(vm.state.orgCardAndPermissions){
                        if(vm.state.orgCardAndPermissions.isVendor){
                            if(vm.state.orgCardAndPermissions.config && vm.state.orgCardAndPermissions.config.cardCodes && vm.state.orgCardAndPermissions.config.cardCodes.length == 1){
                                ret.link = "#/ledger/" + vm.state.orgCardAndPermissions.config.cardCodes[0];
                            }
                            else if(vm.state.orgCardAndPermissions.config && vm.state.orgCardAndPermissions.config.cardCodes && vm.state.orgCardAndPermissions.config.cardCodes.length >1){
                                ret.link = '#/customers';
                            }
                            else{
                                ret.link = '#';
                            }
                        }
                    }

                    ret.header = [ 

                        {label: 'Amount'},                        
                        {label: 'Invoice #'},
                        {label: 'Due Date'}

                    ];
                    $scope.$watch(function() { return DashboardService.invoices; }, function(invoices){
                        ret.data = [];
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


    $scope.$watchGroup(["$parent.account", "$parent.currentUser"], _.debounce(function(values) {
        if(values[0] && values[1]){
            vm.state.orgCardAndPermissions = UserPermissionsConfig.getOrgConfigAndPermissions(values[1], values[0]);
        }
    }, 0), true);
}

})();
