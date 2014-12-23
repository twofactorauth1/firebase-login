define(['app'], function(app) {
	app.register.service('GeocodeService', function () {

	        // var locations = {};

	        // var queue = [];

	        // // Amount of time (in milliseconds) to pause between each trip to the
	        // // Geocoding API, which places limits on frequency.
	        // var queryPause = 250;

	        // /**
	        //  * executeNext() - execute the next function in the queue.
	        //  *                  If a result is returned, fulfill the promise.
	        //  *                  If we get an error, reject the promise (with message).
	        //  *                  If we receive OVER_QUERY_LIMIT, increase interval and try again.
	        //  */
	        // this.executeNext = function() {
	        // 	console.log('executeNext ');
	        //     var task = queue[0],
	        //         geocoder = new google.maps.Geocoder();
	        //         console.log('queue[0] ', queue[0]);
	        //     geocoder.geocode({
	        //         address: task.address
	        //     }, function(result, status) {
	        //         if (status === google.maps.GeocoderStatus.OK) {
	        //             var latLng = {
	        //                 lat: result[0].geometry.location.lat(),
	        //                 lng: result[0].geometry.location.lng()
	        //             };

	        //             queue.shift();

	        //             locations[task.address] = latLng;

	        //             task.d.resolve(latLng);

	        //             if (queue.length) {
	        //                 $timeout(this.executeNext, queryPause);
	        //             }
	        //         } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
	        //             queue.shift();
	        //             task.d.reject({
	        //                 type: 'zero',
	        //                 message: 'Zero results for geocoding address ' + task.address
	        //             });
	        //         } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
	        //             queryPause += 250;
	        //             $timeout(this.executeNext, queryPause);
	        //         } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
	        //             queue.shift();
	        //             task.d.reject({
	        //                 type: 'denied',
	        //                 message: 'Request denied for geocoding address ' + task.address
	        //             });
	        //         } else if (status === google.maps.GeocoderStatus.INVALID_REQUEST) {
	        //             queue.shift();
	        //             task.d.reject({
	        //                 type: 'invalid',
	        //                 message: 'Invalid request for geocoding address ' + task.address
	        //             });
	        //         }
	        //     });
	        // };

	        this.geocodeAddress = function(address, fn) {
	        	var self = this;
	        	var geocoder = new google.maps.Geocoder();
	        	console.log('address ', address);
                geocoder.geocode( { 'address': address}, function(results, status) {
	                if (status == google.maps.GeocoderStatus.OK) {
	                        fn({success: true, err: null, results: results});
	                } else {
	                        fn({success:false, err: new Error('Geocode was not successful for the following reason: ' + status), results: null});
	                }
                });
	        };
	});
});