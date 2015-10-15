/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var appConfig =  require('./app.config');

var closeIOApiKey = process.env.CLOSEIO_API_KEY || 'e349a7ec2fcc8370231d85455f21ea3b405e9220d926e2dccfc0e34f';
var closeEnabled = process.env.CLOSEIO_ENABLED || 'true';

var leadStatuses = {
customer: {
	label: "Customer",
	id: "stat_rxJ0q0eTtPzgo1a1HjrzWxdrnjHT9XQs8NvK6bm6GJY"
}};

var oppurtunityStatuses = {
active: {
	label: "Active",
	id: "stat_qfQbJm5FjlvX6S6tnVSmmbmyg2bQklS9JW4XzF53N2j"
}};

module.exports = {
    CLOSEIO_API_KEY: closeIOApiKey,
    //No Test key available

    //Tags Constant
    CLOSEIO_CUSTOMER_STATUS_LABEL: leadStatuses.customer.label,
    CLOSEIO_CUSTOMER_STATUS_ID: leadStatuses.customer.id,

    CLOSEIO_ACTIVE_STATUS_LABEL: oppurtunityStatuses.active.label,
    CLOSEIO_ACTIVE_STATUS_ID: oppurtunityStatuses.active.id,

    CLOSIO_ENABLED: closeEnabled
}
