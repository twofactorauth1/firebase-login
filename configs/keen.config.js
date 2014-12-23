/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

    /*
     * These are the keys for the test project.
     */
var keenProjectId = process.env.KEEN_PROJECT_ID || '54908e6d2fd4b15c4b443aa9';
var keenWriteKey = process.env.KEEN_WRITE_KEY || '93d5d3131a0f241452dfb6db44dc1784087aadb4b48e11fd26733f6e912927303a303f0278663d48333de5ba3f7afe4d0472f8812f23b6e469e8e923a2c1f86c1f49f4c9a21a7e282e99fe7e47116e988a651632dbdc339cba606f85695c552018838a0cf8a47f7c2f73ae71dde54d08';
var keenReadKey = process.env.KEEN_READ_KEY || '8208aaeddb48179c9d184ae2ab947ebe3f5eb411b1e936688fbc7192a2ea81d44d88e33d2021f6b613c37a06751e0b99ea05fed5b02e683c1d3b10135729be47e7f10bb5385c57b5608cee0c4c776a91a0d8fd37eb420dfae7abe1f21e7385dd862c28c38db75b844bd35fae67fbc4ba';
var keenMasterKey = process.env.KEEN_MASTER_KEY || 'F084BF524827091454B88739EADABBD2';


/*
 * Test Creds:
 * ProjectID: 54908e6d2fd4b15c4b443aa9
 * Write Key: 93d5d3131a0f241452dfb6db44dc1784087aadb4b48e11fd26733f6e912927303a303f0278663d48333de5ba3f7afe4d0472f8812f23b6e469e8e923a2c1f86c1f49f4c9a21a7e282e99fe7e47116e988a651632dbdc339cba606f85695c552018838a0cf8a47f7c2f73ae71dde54d08
 * Read Key: 8208aaeddb48179c9d184ae2ab947ebe3f5eb411b1e936688fbc7192a2ea81d44d88e33d2021f6b613c37a06751e0b99ea05fed5b02e683c1d3b10135729be47e7f10bb5385c57b5608cee0c4c776a91a0d8fd37eb420dfae7abe1f21e7385dd862c28c38db75b844bd35fae67fbc4ba
 * Master Key: F084BF524827091454B88739EADABBD2
 *
 * Prod Creds:
 * ProjectID: 547edcea46f9a776b6579e2c
 * Write Key: 98f22da64681d5b81e2abb7323493526d8d258f0d355e95f742335b4ff1b75af2709baa51d16b60f168158fe7cfd8d1de89d637ddf8a9ca721859b009c4b004d443728df52346307e456f0511b3e82be4a96efaa9f6dcb7f847053e97eee2b796fc3e2d1a57bb1a86fb07d2e00894966
 * Read Key: 16348ac352e49c12881e5a32ee37fdd6167ead382071330af9788d9c9e6cae41a8b3fb663bc59bb19e0ec0968bf1c4bdd9f62f29d6545663863932805ff6eac7df34c9202db4f294c0d8cd70d9c9846a99ea00d85f973dfa41e6448e9d05e9ecad9f9ffcb7a7e146dba7de20642e892a
 * Master Key: 400E23A715A403D70E10AAA8B4572109
 *
 */

module.exports = {
    KEEN_PROJECT_ID: keenProjectId,
    KEEN_WRITE_KEY : keenWriteKey,
    KEEN_READ_KEY: keenReadKey,
    KEEN_MASTER_KEY: keenMasterKey
}