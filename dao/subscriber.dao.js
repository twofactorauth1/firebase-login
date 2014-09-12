/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var constants = requirejs('constants/constants');
require('../models/subscriber');


var dao = {

    options: {
        name: "subscriber.dao",
        defaultModel: $$.m.Subscriber
    },

    listCourseSubscribers: function (courseId, fn) {
        this.findMany({courseId: courseId, _id: { $ne: "__counter__" }}, fn);
    },

    createSubscriber: function (subscriberData, fn) {
        var newSubscriber = new $$.m.Subscriber(subscriberData);
        newSubscriber.set('_id', null);
        this.saveOrUpdate(newSubscriber, fn);
    }


};

function clearVideoFieldsForUnauthorizedUser(video) {
    //todo: check if some other params should be removed
    video.videoUrl = null;
}

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserDao = dao;

module.exports = dao;
