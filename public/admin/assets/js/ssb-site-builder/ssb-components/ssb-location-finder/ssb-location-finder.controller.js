(function(){

app.controller('SiteBuilderLocationFinderComponentController', ssbLocationFinderComponentController);

ssbLocationFinderComponentController.$inject = ['$scope', '$q', '$timeout', 'geocodeService'];
/* @ngInject */
function ssbLocationFinderComponentController($scope, $q, $timeout, geocodeService) {

    console.info('ssb-location-finder directive init...')

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

    $scope.$watch('vm.loading', function(val) {
        if (!val) {
            vm.submitBtn.button('reset');
        }
    });

    function setupMap() {

        if (typeof google === 'object' && typeof google.maps === 'object') {

            $timeout(vm.initMap, 2000);

        } else {

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

        var helmsLocation = new google.maps.LatLng(32.837377, -117.138966);

        var MY_MAPTYPE_ID = 'custom_style';

        var featureOpts = [ { "stylers": [ { "saturation": -100 }, { "lightness": -5 } ] } ];

        vm.initIcons();

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
                '<li><b>Helms Brewing Co</b></li>' +
                '<li>5640 Kearny Mesa Rd.</li>' +
                '<li>Suite C/N</li>' +
                '<li>San Diego, CA 92111</li>' +
                '</ul>' +
            '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        vm.helmsMarker = new google.maps.Marker({
          position: helmsLocation,
          map: vm.map,
          draggable: false,
          icon: vm.helmsMarkerIcon,
          title: 'Helms Brewing Co'
        });

        vm.setupInfoWindowCallback(infowindow, vm.helmsMarker);

        vm.map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

        // google.maps.event.addDomListener(window, 'load', initialize);

        google.maps.event.addDomListener(window, "resize", function() {
            var center = vm.map.getCenter();
            google.maps.event.trigger(vm.map, "resize");
            vm.map.setCenter(center);
        });

    }

    function initIcons() {

        vm.helmsMarkerIcon = {
            path: "M0-165c-27.618 0-50 21.966-50 49.054C-50-88.849 0 0 0 0s50-88.849 50-115.946C50-143.034 27.605-165 0-165z",
            fillColor: '#333333',
            fillOpacity: .8,
            strokeWeight: 0,
            scale: 1/4,
            anchor: new google.maps.Point(0,0)
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
                height: 75
            },
            {
                textColor: 'white',
                url: '/images/indi-location-marker-medium.png',
                width: 100,
                height: 100
            },
            {
                textColor: 'white',
                url: '/images/indi-location-marker-large.png',
                width: 125,
                height: 125
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

    function setupInfoWindowCallback(infowindow, marker) {
        google.maps.event.addListener(marker, 'click', function() {
            if (vm.infowindow && vm.infowindow.close) {
                vm.infowindow.close();
            }
            vm.infowindow = infowindow;
            vm.infowindow.open(vm.map, marker);
        });
    }

    function getDirectionsLink(location) {
        var destinationAddress = location.name + ' ' +
                location.address + ' ' +
                location.address2 + ' ' +
                location.city + ' ' +
                location.state + ' ' +
                location.zip + ' ' +
                location.country;
        return geocodeService.getDirectionsLinkGoogle(vm.searchAddress, destinationAddress);
    }

    function init(element) {

        vm.element = element;

        vm.setupMap();

        vm.setupSubmitBtn();

        window['initialize' + vm.component._id] = $timeout(vm.initMap, 1000);

        if(navigator.geolocation) {
            vm.geolocationEnabled = true;
        }

    }

}


})();
