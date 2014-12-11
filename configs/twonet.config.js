
/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var base_path = process.env.TWONET_BASEPATH || 'https://twonetcom.qualcomm.com/kernel';
var key = process.env.TWONET_KEY || '36ODKJ1HdJD1y29hk203';
var secret = process.env.TWONET_SECRET || 'OMItCcxnrlI0db67HhPKkIM70ZhHZcJe';
var user_guid = process.env.TWONET_USERGUID || '50f97bb9-a38d-46eb-8e5a-d1716aed1da3';
var track_guid = process.env.TWONET_TRACKGUID || 'b64d7234-2398-021d-2b64-b5999a31aaff';

module.exports = {

    TWONET_BASEPATH: base_path,
    TWONET_KEY: key,
    TWONET_SECRET: secret,

    TWONET_USERGUID: user_guid,
    TWONET_TRACKGUID: track_guid

}
