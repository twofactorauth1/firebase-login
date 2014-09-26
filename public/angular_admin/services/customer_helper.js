define(['app', 'constants'], function(app) {
	app.register.service('CustomerHelperService', function() {
		this.contactLabel = function(contact) {
			var contactTypes = $$.constants.contact.contact_types.dp;
			var type = _.find(contactTypes, function(type) {
				return type.data === contact.type
			});
			return type == null ? "" : type.label;
		};

		this.checkBestEmail = function(contact) {
			if (contact.details != null && contact.details.length > 0) {
				//see if we have a google contact, that's the best source of email
				var details = _.findWhere(contact.details, {
					type : $$.constants.social.types.GOOGLE
				});
				if (details != null && details.emails != null && details.emails.length > 0) {
					contact.email = details.emails[0];
					return true;
				}
				var details = contact.details[0];
				if (details != null && details.emails != null && details.emails.length > 0) {
					contact.email = details.emails[0];
					return true;
				}
			return false;
			}
		};

		this.checkFacebookId = function(contact) {
			if (contact.details != null && contact.details.length > 0) {
				//see if we have a google contact, that's the best source of email
				var details = _.findWhere(contact.details, {
					type : $$.constants.social.types.FACEBOOK
				});
				if (details != null) {
					contact.facebookId = details.socialId;
					return true;
				}
				return false;
			}
		}

		this.checkTwitterId = function(contact) {
			if (contact.details != null && contact.details.length > 0) {
				//see if we have a google contact, that's the best source of email
				var details = _.findWhere(contact.details, {
					type : $$.constants.social.types.TWITTER
				});
				if (details != null) {
					contact.twitterId = details.socialId;
					return true;
				}
				return false;
			}
		}

		this.checkLinkedInId = function(contact) {
			if (contact.details != null && contact.details.length > 0) {
				//see if we have a google contact, that's the best source of email
				var details = _.findWhere(contact.details, {
					type : $$.constants.social.types.LINKEDIN
				});
				if (details != null) {
					if (details.websites != null && details.websites.length > 0) {
						for (var i = 0; i < details.websites.length; i++) {
							if (details.websites[i] != null) {
								contact.linkedInUrl = details.websites[i];
								return true;
							}
						}
					}
					contact.linkedInId = details.socialId;
					return true;
				}
				return false;
			}
		}

		this.checkAddress = function(contact) {
			var _address = null;
			if (contact.details != null && contact.details.length > 0) {
				for (var i = 0; i < contact.details.length; i++) {
					var details = contact.details[i];
					if (details.addresses != null && details.addresses.length > 0) {
						for (var j = 0; j < details.addresses.length; j++) {
							var address = details.addresses[j];
							if (address) {
								if (address.displayName != null) {
									contact.address = encodeURIComponent(address.displayName);
									return true;
								} else {
									if (_address == null) {
										_address = address;
									} else {
										if (address.address != null && address.city != null) {
											_address = address;
										}
									}
								}
							}
						}
					}
				}
			}

			if (_address != null) {
				var addressStr = "";
				if (String.isNullOrEmpty(_address.address)) {
					addressStr += _address.address;
				}

				if (String.isNullOrEmpty(_address.city)) {
					addressStr += ", " + address.city;
				}

				if (String.isNullOrEmpty(_address.state)) {
					addressStr += ", " + address.state;
				}

				if (String.isNullOrEmpty(_address.zip)) {
					addressStr += ", " + _address.zip;
				}

				contact.address = encodeURIComponent(addressStr);
				return true;
			}

			return false;
		}
	});
});
