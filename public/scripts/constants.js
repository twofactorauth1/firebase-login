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
]);

app.constant("shippingStates",[
	{
		name: "Alabama",
		abbr: "AL"
	},
	{
		name: "Alaska",
		abbr: "AK"
	},
	{
		name: "Arizona",
		abbr: "AZ"
	},
	{
		name: "Arkansas",
		abbr: "AR"
	},
	{
		name: "California",
		abbr: "CA"
	},
	{
		name: "Colorado",
		abbr: "CO"
	},
	{
		name: "Connecticut",
		abbr: "CT"
	},
	{
		name: "Delaware",
		abbr: "DE"
	},
	{
		name: "District of Columbia",
		abbr: "DC"
	},	
	{
		name: "Florida",
		abbr: "FL"
	},
	{
		name: "Georgia",
		abbr: "GA"
	},
	{
		name: "Hawaii",
		abbr: "HI"
	},
	{
		name: "Idaho",
		abbr: "ID"
	},
	{
		name: "Illinois",
		abbr: "IL"
	},
	{
		name: "Indiana",
		abbr: "IN"
	},
	{
		name: "Iowa",
		abbr: "IA"
	},
	{
		name: "Kansas",
		abbr: "KS"
	},
	{
		name: "Kentucky",
		abbr: "KY"
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
		name: "Michigan",
		abbr: "MI"
	},
	{
		name: "Minnesota",
		abbr: "MN"
	},
	{
		name: "Mississippi",
		abbr: "MS"
	},
	{
		name: "Missouri",
		abbr: "MO"
	},
	{
		name: "Montana",
		abbr: "MT"
	},
	{
		name: "Nebraska",
		abbr: "NE"
	},
	{
		name: "Nevada",
		abbr: "NV"
	},
	{
		name: "New Hampshire",
		abbr: "NH"
	},
	{
		name: "New Jersey",
		abbr: "NJ"
	},
	{
		name: "New Mexico",
		abbr: "NM"
	},
	{
		name: "New York",
		abbr: "NY"
	},
	{
		name: "North Carolina",
		abbr: "NC"
	},
	{
		name: "North Dakota",
		abbr: "ND"
	},
	{
		name: "Ohio",
		abbr: "OH"
	},
	{
		name: "Oklahoma",
		abbr: "OK"
	},
	{
		name: "Oregon",
		abbr: "OR"
	},
	{
		name: "Pennsylvania",
		abbr: "PA"
	},
	{
		name: "Rhode Island",
		abbr: "RI"
	},
	{
		name: "South Carolina",
		abbr: "SC"
	},
	{
		name: "South Dakota",
		abbr: "SD"
	},
	{
		name: "Tennessee",
		abbr: "TN"
	},
	{
		name: "Texas",
		abbr: "TX"
	},
	{
		name: "Utah",
		abbr: "UT"
	},
	{
		name: "Vermont",
		abbr: "VT"
	},
	{
		name: "Virginia",
		abbr: "VA"
	},
	{
		name: "Washington",
		abbr: "WA"
	},
	{
		name: "West Virginia",
		abbr: "WV"
	},
	{
		name: "Wisconsin",
		abbr: "WI"
	},
	{
		name: "Wyoming",
		abbr: "WY"
	}

])  