(function(){

app.controller('SiteBuilderLocationFinderComponentController', ssbLocationFinderComponentController);

ssbLocationFinderComponentController.$inject = ['$scope', '$q', '$timeout', '$injector'];
/* @ngInject */
function ssbLocationFinderComponentController($scope, $q, $timeout, $injector) {

    console.info('ssb-location-finder directive init...')

    var geocodeService;

    if ($injector.has("geocodeService")) {
        geocodeService = $injector.get('geocodeService');
    }

    var vm = this;

    vm.map = {};
    vm.submitBtn = {};
    vm.mapId = 'ssb-map-canvas-' + vm.component._id;
    vm.searchAddress = '';
    vm.searchLat = '';
    vm.searchLong = '';
    vm.searchRadius = 5;
    vm.searchResults = {}; // { count: 10, results: [] }
    vm.loading = false;
    vm.markers = [];
    vm.infowindow = {};
    vm.helmsMarkerIcon = {};
    vm.searchBasisMarkerIcon = {};
    vm.locationMarkerIcon = {};
    vm.clusterOptions = {};
    vm.geolocationEnabled = false;
    vm.mapCenterLocation = new google.maps.LatLng(32.837377, -117.138966); //helms

    vm.helmsMarker = {};
    vm.searchBasisMarker = {};

    vm.init = init;
    vm.setupMap = setupMap;
    vm.setupSubmitBtn = setupSubmitBtn;
    vm.loadScript = loadScript;
    vm.initMap = initMap;
    vm.initIcons = initIcons;
    vm.search = search;
    vm.setMapCenter = setMapCenter;
    vm.getLocations = getLocations;
    vm.searchMyLocation = searchMyLocation;
    vm.clearMarkers = clearMarkers;
    vm.displayMarkers = displayMarkers;
    vm.displayMarker = displayMarker;
    vm.setupInfoWindowCallback = setupInfoWindowCallback;
    vm.getDirectionsLink = getDirectionsLink;
    vm.onDestroy = onDestroy;
    vm.addStaticLocations = addStaticLocations;

    $scope.$watch('vm.loading', function(val) {
        if (!val) {
            vm.submitBtn.button('reset');
        }
    });

    function setupMap() {

        if (typeof google === 'object' && typeof google.maps === 'object') {

            $timeout(vm.initMap, 2000);

        } else {

            window['initialize' + vm.component._id] = $timeout(vm.initMap, 1000);

            vm.loadScript('http://maps.googleapis.com/maps/api/js?v=3&callback=initialize' + vm.component._id, function(){
                console.debug('google-loader async loaded');
            });

        }

    }

    function setupSubmitBtn() {

        vm.submitBtn = vm.element.find('input[type="submit"]');

        vm.submitBtn.on('click', function() {
            vm.submitBtn.button('loading');
        });

    }

    function loadScript(src,callback){
        var script = document.createElement("script");
        script.type = "text/javascript";
        if(callback)script.onload=callback;
        document.getElementsByTagName("head")[0].appendChild(script);
        script.src = src;
    }

    function initMap() {

        // var MY_MAPTYPE_ID = 'custom_style';
        var MY_MAPTYPE_ID = 'HYBRID';

        // var featureOpts = [ { "stylers": [ { "saturation": -100 }, { "lightness": -5 } ] } ];
        var featureOpts = [];

        vm.initIcons();

        var mapOptions = {
            zoom: 11,
            center: vm.mapCenterLocation,
            mapTypeControl: false,
            scrollwheel: false,
            zoomControl: true,
            mapTypeId: MY_MAPTYPE_ID
        };

        console.debug(vm.mapId);
        console.debug(angular.element('#' + vm.mapId)[0])

        vm.map = new google.maps.Map(angular.element('#' + vm.mapId)[0], mapOptions);

        var customMapType = new google.maps.StyledMapType(featureOpts);

        addStaticLocations();

        vm.map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

        google.maps.event.addDomListener(window, "resize", function() {
            var center = vm.map.getCenter();
            google.maps.event.trigger(vm.map, "resize");
            vm.map.setCenter(center);
        });

    }

    function initIcons() {

        vm.helmsMarkerIcon = {
            url: '/images/indi-location-marker-small-helms.png'
        };

        vm.searchBasisMarkerIcon = {
            url: '/images/indi-location-marker-home.png'
        };

        vm.locationMarkerIcon = {
            url: '/images/indi-location-marker-small.png'
        };

        vm.clusterOptions = {
            styles: [{
                textColor: 'white',
                url: '/images/indi-location-marker-small.png',
                width: 75,
                height: 75,
                fontFamily:  "inherit",
                textSize: 15
            },
            {
                textColor: 'white',
                url: '/images/indi-location-marker-medium.png',
                width: 100,
                height: 100,
                fontFamily:  "inherit",
                textSize: 18
            },
            {
                textColor: 'white',
                url: '/images/indi-location-marker-large.png',
                width: 125,
                height: 125,
                fontFamily:  "inherit",
                textSize: 20
            }]
        };

    }

    function search() {

        if (vm.searchAddress.length) {

            vm.loading = true;

            vm.geocoder = vm.geocoder || new google.maps.Geocoder();

            vm.geocoder.geocode( { 'address': vm.searchAddress }, function(results, status) {

                if (status == google.maps.GeocoderStatus.OK) {

                    vm.setMapCenter(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    vm.getLocations();

                } else {
                    console.debug("Geocode was not successful for the following reason: " + status);
                    vm.loading = false;
                }

            });

        }

    }

    function setMapCenter(lat, lng) {

        vm.map.setCenter({ lat: lat, lng: lng });
        vm.searchLat = lat;
        vm.searchLong = lng;

        vm.searchBasisMarker.setMap && vm.searchBasisMarker.setMap(null);

        vm.searchBasisMarker = new google.maps.Marker({
            position: new google.maps.LatLng(vm.searchLat, vm.searchLong),
            map: vm.map,
            draggable: false,
            icon: vm.searchBasisMarkerIcon,
            title: 'Your search location',
            opacity: 0.8
        });

    }

    function getLocations() {
        geocodeService.getLocations(vm.searchLat, vm.searchLong, vm.searchRadius).then(function(data) {
            vm.searchResults = data.data;
            vm.displayMarkers();
        }).catch(function(err) {
            console.error(JSON.stringify(err));
        }).finally(function() {
            vm.loading = false;
        });
    }

    function searchMyLocation() {

        if(navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(function(position) {

                vm.setMapCenter(position.coords.latitude, position.coords.longitude);
                vm.getLocations();

            }, function() {

                console.error('no geo');

            });

        } else {

            console.error('no geo');

        }

    }

    function displayMarkers() {

        vm.clearMarkers();

        vm.bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < vm.searchResults.results.length; i++) {

            var result = vm.searchResults.results[i];

            var latLng = new google.maps.LatLng(result.lat, result.lng);

            vm.displayMarker(result, latLng);

        }

        vm.markerCluster = new MarkerClusterer(vm.map, vm.markers, vm.clusterOptions);

        if (vm.searchResults.results.length) {
            console.debug(vm.searchBasisMarker.getPosition().lat(), vm.searchBasisMarker.getPosition().lng());
            vm.bounds.extend(vm.searchBasisMarker.getPosition());
            vm.map.fitBounds(vm.bounds);
        }

        vm.loading = false;

    }

    function clearMarkers() {
        for (var i = 0; i < vm.markers.length; i++) {
            vm.markers[i].setMap(null);
        }
        vm.markers = [];
    }

    function displayMarker(result, latLng) {

        var marker = new google.maps.Marker({
            map: vm.map,
            position: latLng,
            draggable: false,
            icon: vm.locationMarkerIcon,
            title: result.name,
            opacity: 0.8
        });

        var contentString =
            '<div class="ssb-infowindow-content">' +
                '<ul>' +
                '<li><b>' + result.name + '</b></li>' +
                '<li>' + result.address + '</li>' +
                '<li>' + result.address2 + '</li>' +
                '<li>' + result.city + ', ' + result.state + ' ' + result.zip + '</li>' +
                '<li><a href="' + vm.getDirectionsLink(result) + ' class="btn ssb-theme-btn" target="_blank">Directions</a>' +
                '</ul>' +
            '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        vm.bounds.extend(marker.getPosition());

        vm.setupInfoWindowCallback(infowindow, marker);

        vm.markers.push(marker);

    }

    function setupInfoWindowCallback(infowindow, marker, open) {
        google.maps.event.addListener(marker, 'click', function() {
            if (vm.infowindow && vm.infowindow.close) {
                vm.infowindow.close();
            }
            vm.infowindow = infowindow;
            vm.infowindow.open(vm.map, marker);
        });

        if (open) {
            $timeout(function() {
                vm.infowindow = infowindow;
                vm.infowindow.open(vm.map, marker);
            }, 1000);
        }

    }

    function getDirectionsLink(location) {
        var destinationAddress = location.name + ' ' +
                location.address + ' ' +
                location.address2 + ' ' +
                location.city + ' ' +
                location.state + ' ' +
                location.zip + ' ' +
                location.country;
        return geocodeService && geocodeService.getDirectionsLinkGoogle(vm.searchAddress, destinationAddress);
    }

    function onDestroy() {
        window['initialize' + vm.component._id] = angular.noop;
    }

    function addStaticLocations() {

        var staticLocations = [{
            name: 'Helms Brewing Co',
            address: '5640 Kearny Mesa Road',
            address2: '',
            city: 'San Diego',
            state: 'CA',
            zip: '92111',
            lat: 32.837377,
            lng: -117.138966
        },
        {
            name: 'Tasting Room',
            address: '4896 Newport Ave',
            address2: '',
            city: 'San Diego',
            state: 'CA',
            zip: '92107',
            lat: 32.7458203,
            lng: -117.24903540000003
        }];

        staticLocations.forEach(function(location, index) {

            vm.setupInfoWindowCallback(new google.maps.InfoWindow({
                content: '<div class="ssb-infowindow-content">' +
                    '<ul>' +
                    '<li><b>' + location.name + '</b></li>' +
                    '<li>' + location.address + '</li>' +
                    '<li>' + location.address2 + '</li>' +
                    '<li>' + location.city + ', ' + location.state + ' ' + location.zip + '</li>' +
                    '<li><a href="' + vm.getDirectionsLink(location) + ' class="btn ssb-theme-btn" target="_blank">Directions</a>' +
                    '</ul>' +
                '</div>'
            }), new google.maps.Marker({
                position: new google.maps.LatLng(location.lat, location.lng),
                map: vm.map,
                draggable: false,
                icon: vm.helmsMarkerIcon,
                title: location.name
            }), index === 0); //trigger click on first static location

        });


    }

    function init(element) {

        vm.element = element;

        vm.setupMap();

        vm.setupSubmitBtn();

        if(navigator.geolocation) {
            vm.geolocationEnabled = true;
        }

        vm.element.on('$destroy', vm.onDestroy);

    }

}


})();
