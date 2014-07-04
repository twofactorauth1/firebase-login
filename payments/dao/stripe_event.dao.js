/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../../dao/base.dao');
requirejs('constants/constants');
require('../model/stripe_event');

var dao = {

    options: {
        name:"stripe.event.dao",
        defaultModel: $$.m.StripeEvent
    },

    getStripeEventByStripeId: function(stripeId, fn) {
        var self = this;
        self.log.debug(">> getStripeEventByStripeId");
        var query = {'eventId': stripeId};
        this.findOne(query, fn);
    },

    getStripeEventsByState: function(state, fn) {
        var self = this;
        self.log.debug(">> getStripeEventsByState");
        var query = {'state': state};
        this.findMany(query, fn);
    },

    updateStripeEventState: function(id, state, fn) {
        var self = this;
        self.log.debug(">> updateStripeEventState");
        self.getById(id, $$.m.StripeEvent, function(err, stripeEvent){
            if(err) {
                self.log.error('Error retrieving stripe event: ' + err);
                return fn(err, null);
            }
            self.log.debug('got the event.  Updating state...');
            stripeEvent.set('state', state);
            self.saveOrUpdate(stripeEvent, function(err, updatedStripeEvent){
                if(err) {
                    self.log.error('Error updating stripe event: ' + err);
                    return fn(err, null);
                }
                self.log.debug('<< updateStripeEventState');
                return fn(err, updatedStripeEvent);
            });
        });
    }


};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.StripeEventDao = dao;

module.exports = dao;
