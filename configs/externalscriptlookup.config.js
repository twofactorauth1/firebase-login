/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var externalScriptLookup = process.env.EXTERNAL_SCRIPT_LOOKUP || {
	'<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>': ['products', 'ssb-form-donate'],
	'<script src="https://www.paypalobjects.com/js/external/apdg.js" async></script>': ['products', 'ssb-form-donate'],	
	'<script src="https://js.stripe.com/v2/?tmp" async></script>': ['products', 'ssb-form-donate', 'payment-form'],
	'<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDMI1SIOEHJm83bMZ-lWjzZN1nXdk6S0X0" async></script>': ['contact-us', 'ssb-location-finder']
} 

module.exports = {
    EXTERNAL_SCRIPT_LOOKUP: externalScriptLookup
}
