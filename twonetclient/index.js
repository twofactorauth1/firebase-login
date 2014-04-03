var userRegistration = require('./twonet_user_registration'),
    deviceRegistration = require('./twonet_device_registration'),
    bodyMeasurements = require('./twonet_body_measurements'),
    bloodMeasurements = require('./twonet_blood_measurements');

module.exports = {
    userRegistration: userRegistration,
    deviceRegistration: deviceRegistration,
    bodyMeasurements: bodyMeasurements,
    bloodMeasurements: bloodMeasurements
};
