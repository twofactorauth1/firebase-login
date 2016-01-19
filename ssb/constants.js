var defaultPages = [];

defaultPages[0] = {
    "_id" : null,
    "accountId" : 0,
    "handle": "",
    "title": "",
    seo: null,
    visibility: {
        visible: true,
        asOf: null,
        displayOn: null
    },
    sections: [],
    templateOverrides: {},
    templateId : null,
    secure:false,
    type:'page',
    version:0,
    latest:true,
    "_v" : "0.1",
    "created" : {
        "date" : new Date(),
        "by" : null
    },
    "modified" : {
        "date" : null,
        "by" : null
    }
};


module.exports = {
    defaultPages: defaultPages
}