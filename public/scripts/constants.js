app.constant('externalScriptLookup', {
    '<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>': ['products', 'ssb-form-donate'],
    '<script src="https://js.stripe.com/v2/?tmp" async></script>': ['products', 'ssb-form-donate', 'payment-form'],
    '<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDMI1SIOEHJm83bMZ-lWjzZN1nXdk6S0X0" async></script>': ['contact-us', 'ssb-location-finder']
});
app.constant("nonShippingChargeStates",[
	{
		name: "Alabama",
		abbr: "AL"
	},
	{
		name: "Arizona",
		abbr: "AZ"
	},
	{
		name: "California",
		abbr: "CA"
	},
	{
		name: "Idaho",
		abbr: "ID"
	},
	{
		name: "Iowa",
		abbr: "IA"
	},
	{
		name: "Louisiana",
		abbr: "LA"
	},
	{
		name: "Maine",
		abbr: "ME"
	},
	{
		name: "Maryland",
		abbr: "MD"
	},
	{
		name: "Massachusetts",
		abbr: "MA"
	},
	{
		name: "Nevada",
		abbr: "NV"
	},
	{
		name: "Oklahoma",
		abbr: "OK"
	},
	{
		name: "Utah",
		abbr: "UT"
	},
	{
		name: "Virginia",
		abbr: "VA"
	},
	{
		name: "Wyoming",
		abbr: "WY"
	}
]) 