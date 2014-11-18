/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
var jade = require('jade');
var stripeDao = require('./dao/stripe.dao.js');
var eventDao = require('./dao/stripe_event.dao.js');
var userDao = require('../dao/user.dao.js');
var log = $$.g.getLogger("stripe.event.handler");
var async = require('async');
var eventQ = async.queue(function(event, fn){
    $$.u.EventHandler._handleEvent(event, fn);
}, 2);//TODO: Make this configurable?

var eventHandler =  {

    /**
     * This method takes a stripe event, transforms it into an "indigenous stripe event" (payemts/models/stripe_event)
     * and then puts it on a queue for later processing by the "_handleEvent" method.  This is done so we can return a 200
     * quickly on the webhook and scale to handle a large number of events.
     * @param event
     * @param fn
     */
    handleEvent: function(event, fn) {
        var self = this;
        //save it
        //TODO: How can we accountId?
        var iEvent = new $$.m.StripeEvent({
            eventId: event.id,
            type: event.type,
            liveMode: event.livemode,
            created: event.created,
            entered: Date.now(),
            request: event.request,
            body: event,
            state: 'NEW',
            accountId: 0
        });
        eventDao.saveOrUpdate(iEvent, function(err, value){
            if(err) {
                log.error('Error saving indigenous event: ' + err);
                fn(err, null);
            } else {
                //push it
                eventQ.push(value.toJSON(), self.callback);

                //complete it
                fn(null, value);
            }
        });

    },

    callback:function(err, event) {
        if(err) {
            log.error('Error handling event.');
        } else {
            log.debug('finished handling event with id: ' + event.id());
        }
    },

    _handleEvent: function(event, fn) {
        var self = this;
        var iEvent = new $$.m.StripeEvent(event);
        //console.dir(event);
        var _t = iEvent.get('type');
        log.debug('handling event of type: ' + _t);
        switch(_t) {
            case 'account.updated':
                self.onAccountUpdated(iEvent, fn);
                break;
            case 'account.application.deauthorized':
                self.onAccountApplicationDeauthorized(iEvent, fn);
                break;
            case 'application_fee.created':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'application_fee.refunded':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'balance.available':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'charge.succeeded':
                self.onChargeSucceeded(iEvent, fn);
                break;
            case 'charge.failed':
                self.onChargeFailed(iEvent, fn);
                break;
            case 'charge.refunded':
                break;
            case 'charge.captured':
                break;
            case 'charge.updated':
                break;
            case 'charge.dispute.created':
              self.onChargeDisputeCreated(iEvent, fn);
                break;
            case 'charge.dispute.updated':
                break;
            case 'charge.dispute.closed':
                break;
            case 'customer.created':
                break;
            case 'customer.updated':
                break;
            case 'customer.deleted':
                break;
            case 'customer.card.created':
                break;
            case 'customer.card.updated':
                break;
            case 'customer.card.deleted':
                break;
            case 'customer.subscription.created':
                break;
            case 'customer.subscription.updated':
                break;
            case 'customer.subscription.deleted':
                break;
            case 'customer.subscription.trial_will_end':
                break;
            case 'customer.discount.created':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'customer.discount.updated':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'customer.discount.deleted':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'invoice.created':
                break;
            case 'invoice.updated':
                break;
            case 'invoice.payment_succeeded':
                break;
            case 'invoice.payment_failed':
                self.onInvoicePaymentFailed(iEvent, fn);
                break;
            case 'invoiceitem.created':
                break;
            case 'invoiceitem.updated':
                break;
            case 'invoiceitem.deleted':
                break;
            case 'plan.created':
                break;
            case 'plan.updated':
                break;
            case 'plan.deleted':
                break;
            case 'coupon.created':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'coupon.deleted':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'transfer.created':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'transfer.updated':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'transfer.paid':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'transfer.failed':
                self.onNoOpEvent(iEvent, fn);
                break;
            case 'ping':
                self.onNoOpEvent(iEvent, fn);
                break;
            default:
                self.onUnknownEvent(iEvent, fn);
        }


    },

    sendEmailToOperationFn: function(iEvent, fn) {
        var context = {name: 'Operation Manager', event: iEvent.get('type'), response: JSON.stringify(iEvent.get('body'))};
        var emailBody = jade.renderFile('./../templates/emails/stripe/common.jade', context);
        $$.g.mailer.sendMail('admin@indigenous.io', 'operations@indigenous.io', null, iEvent.get('type') + ' Event', emailBody, null, function () {});

        $.when(p1).done(function(){
            eventDao.updateStripeEventState(iEvent.id(), status, function(err, value){
                //err or not... we're done here.
                log.debug('<< ' + iEvent.get('type'));
                fn(err, value);
            });
        });
    },

    onAccountUpdated: function(iEvent, fn) {
        log.debug('>> onAccountUpdated');
        log.debug('<<onAccountUpdated');
        fn(null, iEvent);
    },

    onAccountApplicationDeauthorized: function(iEvent, fn) {
        log.debug('>> onAccountApplicationDeauthorized');
        //undo the connect with stripe artifacts
        var p1 = $.Deferred();
        var status = 'PROCESSED';
        userDao.getUserBySocialUsername('stripe', iEvent.get('body')['user_id'], function(err, user){
            if(err) {
                log.error('Error getting user from stripe event: ' + err);
                status = 'ERROR';
                p1.resolve();
            } else {
                var credAry = user.get('credentials');
                var spliceIndex = -1;
                for(var i=0; i<credAry.length; i++) {
                    if(credAry[i].type === 'stripe') {
                        spliceIndex = i;
                        break;
                    }
                }
                if(spliceIndex !== -1) {
                    credAry.splice(spliceIndex, 1);
                    userDao.saveOrUpdate(user, function(err, user){
                        if(err) {
                            log.error('Error removing stripe credentials: ' + err);
                            status = 'ERROR';
                        }
                        p1.resolve();
                    });
                } else {
                    log.warn('Could not find stripe credentials for user with id: ' + user.id());
                    status = 'ERROR';
                    p1.resolve();
                }
            }
        });

        $.when(p1).done(function(){
            eventDao.updateStripeEventState(iEvent.id(), status, function(err, value){
                //err or not... we're done here.
                log.debug('<< onAccountApplicationDeauthorized');
                fn(err, value);
            });
        });
    },

    onChargeSucceeded: function(iEvent, fn) {
        /*
         * Look for payment record.
         * - if found, update it
         * - if missing, create it
         */
    },

    onChargeFailed: function(iEvent, fn) {
        self.sendEmailToOperationFn(iEvent, fn);
    },

    onChargeRefunded: function(iEvent, fn) {
        /*
         * Look for payment record.
         * - if found, update it
         * - if missing, create it
         * Notify customer.
         */
    },

    onChargeCaptured: function(iEvent, fn) {
        /*
         * Look for payment record.
         * - if found, update it
         * - if missing, create it
         */
    },

    onChargeUpdated: function(iEvent, fn) {
        /*
         * Look for payment record.
         * - if found, update it
         * - if missing, create it
         */
    },

    onChargeDisputeCreated: function(iEvent, fn) {
      self.sendEmailToOperationFn(iEvent, fn);
    },

    onChargeDisputeUpdated: function(iEvent, fn) {

    },

    onChargeDisputeClosed: function(iEvent, fn) {

    },

    onCustomerCreated: function(iEvent, fn) {

    },

    onCustomerUpdated: function(iEvent, fn) {

    },

    onCustomerDeleted: function(iEvent, fn) {

    },

    onCustomerCardCreated: function(iEvent, fn) {

    },

    onCustomerCardUpdated: function(iEvent, fn) {

    },

    onCustomerCardDeleted: function(iEvent, fn) {

    },

    onCustomerSubscriptionCreated: function(iEvent, fn) {

    },

    onCustomerSubscriptionUpdated: function(iEvent, fn) {

    },

    onCustomerSubscriptionDeleted: function(iEvent, fn) {

    },

    onCustomerSubscriptionTrialWillEnd: function(iEvent, fn) {

    },

    onInvoiceCreated: function(iEvent, fn) {

    },

    onInvoiceUpdated: function(iEvent, fn) {

    },

    onInvoicePaymentSucceeded: function(iEvent, fn) {

    },

    onInvoicePaymentFailed: function(iEvent, fn) {
      self.sendEmailToOperationFn(iEvent, fn);
    },

    onInvoiceItemCreated: function(iEvent, fn) {

    },

    onInvoiceItemUpdated: function(iEvent, fn) {

    },

    onInvoiceItemDeleted: function(iEvent, fn) {

    },

    onPlanCreated: function(iEvent, fn) {

    },

    onPlanUpdated: function(iEvent, fn) {

    },

    onPlanDeleted: function(iEvent, fn) {

    },


    onNoOpEvent: function(iEvent, fn) {
        log.debug('>> onNoOpEvent');
        log.debug('<< onNoOpEvent');
        fn(null, iEvent);
    },

    onUnknownEvent: function(iEvent, fn) {
        log.debug('>> onUnknownEvent');
        log.warn('No handler configured for event with type: ' + iEvent.get('type'));
        log.debug('<< onUnknownEvent');
        fn(null, iEvent);
    }

}
$$.u = $$.u || {};
$$.u.EventHandler = eventHandler;
module.exports = eventHandler;
