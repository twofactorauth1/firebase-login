/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var segmentWriteKey = process.env.SEGMENT_WRITE_KEY || 'vVXdSwotRr';
//PROD xot1dd3rul
//TEST vVXdSwotRr
var segmentReadKey = process.env.SEGMENT_READ_KEY || 'w80757cy56';

module.exports = {
    SEGMENT_WRITE_KEY : segmentWriteKey,
    SEGMENT_READ_KEY : segmentReadKey
}
