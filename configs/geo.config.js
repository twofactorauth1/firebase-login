/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

module.exports = {

    openStreetMaps: {

        SEARCH_URL: "http://nominatim.openstreetmap.org/search/",
        DEFAULT_SEARCH_TYPE: "json",
        DEFAULT_ADDRESS_DETAILS: "1",

        constructSearchForAddress: function(addressString) {
            return this.SEARCH_URL + addressString + "?format=" + this.DEFAULT_SEARCH_TYPE + "&addressdetails=" + this.DEFAULT_ADDRESS_DETAILS;
        }
    }
};