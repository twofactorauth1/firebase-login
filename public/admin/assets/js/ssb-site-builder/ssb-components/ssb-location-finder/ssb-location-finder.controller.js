(function(){

app.controller('SiteBuilderLocationFinderComponentController', ssbLocationFinderComponentController);

ssbLocationFinderComponentController.$inject = ['$scope', '$q', '$timeout'];
/* @ngInject */
function ssbLocationFinderComponentController($scope, $q, $timeout) {

    console.info('ssb-location-finder directive init...')

    var vm = this;

    vm.map = {};
    vm.mapId = 'ssb-map-canvas-' + vm.component._id;

    vm.init = init;
    vm.setupMap = setupMap;
    vm.loadScript = loadScript;
    vm.initMap = initMap;
    vm.search = search;



    function setupMap() {

        if (typeof google === 'object' && typeof google.maps === 'object') {

            $timeout(vm.initMap, 2000);

        } else {

            vm.loadScript('http://maps.googleapis.com/maps/api/js?v=3&callback=initialize' + vm.component._id, function(){
                console.log('google-loader has been loaded, but not the maps-API ');
            });

        }

    }

    function loadScript(src,callback){
        var script = document.createElement("script");
        script.type = "text/javascript";
        if(callback)script.onload=callback;
        document.getElementsByTagName("head")[0].appendChild(script);
        script.src = src;
    }

    function initMap() {

        var helmsLocation = new google.maps.LatLng(32.837377, -117.138966);

        var MY_MAPTYPE_ID = 'custom_style';

        var featureOpts = [ { "stylers": [ { "saturation": -100 }, { "lightness": -5 } ] } ];

        var mapOptions = {
            zoom: 12,
            center: helmsLocation,
            mapTypeControl: false,
            scrollwheel: false,
            zoomControl: true,
            mapTypeId: MY_MAPTYPE_ID
        };

        console.debug(vm.mapId);
        console.debug(angular.element('#' + vm.mapId)[0])

        vm.map = new google.maps.Map(angular.element('#' + vm.mapId)[0], mapOptions);

        var customMapType = new google.maps.StyledMapType(featureOpts);

        var contentString = '<div class="ssb-infowindow-content">' +
                '<ul>' +
                '<li>5640 Kearny Mesa Rd.</li>' +
                '<li>Suite C/N</li>' +
                '<li>San Diego, CA 92111</li>' +
                '</ul>' +
            '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var icon = {
            path: "M0-165c-27.618 0-50 21.966-50 49.054C-50-88.849 0 0 0 0s50-88.849 50-115.946C50-143.034 27.605-165 0-165z",
            fillColor: '#c21f31',
            fillOpacity: .8,
            anchor: new google.maps.Point(0,0),
            strokeWeight: 0,
            scale: 1/4
        };

        var marker = new google.maps.Marker({
          position: helmsLocation,
          map: vm.map,
          draggable: false,
          icon: icon,
          title: 'Helms Brewing Co'
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
        });

        vm.map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

        // google.maps.event.addDomListener(window, 'load', initialize);

        google.maps.event.addDomListener(window, "resize", function() {
            var center = vm.map.getCenter();
            google.maps.event.trigger(vm.map, "resize");
            vm.map.setCenter(center);
        });

    }

    function search() {

        var deferred = $q.defer();

        var testData = [{'stuff':true}];

        $timeout(function(){
            deferred.resolve(testData);
            // deferred.reject("Location error");
        }, 1000);

    }


    function init(element) {
        vm.element = element;
        vm.setupMap();

        window['initialize' + vm.component._id] = $timeout(vm.initMap, 1000);

    }

}


})();
