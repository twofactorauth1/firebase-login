/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

    /*
     * These are the keys for the test project.
     */
var keenProjectId = process.env.KEEN_PROJECT_ID || '547edcea46f9a776b6579e2c';
var keenWriteKey = process.env.KEEN_WRITE_KEY || '98f22da64681d5b81e2abb7323493526d8d258f0d355e95f742335b4ff1b75af2709baa51d16b60f168158fe7cfd8d1de89d637ddf8a9ca721859b009c4b004d443728df52346307e456f0511b3e82be4a96efaa9f6dcb7f847053e97eee2b796fc3e2d1a57bb1a86fb07d2e00894966';
var keenReadKey = process.env.KEEN_READ_KEY || '16348ac352e49c12881e5a32ee37fdd6167ead382071330af9788d9c9e6cae41a8b3fb663bc59bb19e0ec0968bf1c4bdd9f62f29d6545663863932805ff6eac7df34c9202db4f294c0d8cd70d9c9846a99ea00d85f973dfa41e6448e9d05e9ecad9f9ffcb7a7e146dba7de20642e892a';
var keenMasterKey = process.env.KEEN_MASTER_KEY || '400E23A715A403D70E10AAA8B4572109';


module.exports = {
    KEEN_PROJECT_ID: keenProjectId,
    KEEN_WRITE_KEY : keenWriteKey,
    KEEN_READ_KEY: keenReadKey,
    KEEN_MASTER_KEY: keenMasterKey
}