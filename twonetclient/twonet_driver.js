var uuid = require('node-uuid');

var twonetClient = require('../twonetclient');

var guid = uuid.v4();
twonetClient.userRegistration.register(guid, function(err, response) {
    if (err) throw err;

    console.log("succesfully registered: " + response);

    twonetClient.userRegistration.unregister(guid, function(err, response) {
        if (err) throw err;

        console.log("successfully unregistered: " + response);
    });
});



