var BaseApi = require('../base.api');
var formidable = require('formidable');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "upload",

    dao: null,

    initialize: function () {
        //GET
        app.get(this.url("contact/photo"), this.confirmUpload.bind(this));
        app.post(this.url("contact/photo"), this.isAuthApi, this.uploadContactPhoto.bind(this));
    },


    confirmUpload: function(req,resp) {
        resp.send("ok");
    },


    uploadContactPhoto: function(req,resp) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(er, fields, files) {
            resp.send({status:"received upload"});
        });
        var body = req.body;

        var files = req.files;

        var data = "";
        req.on("data", function(buffer) {
            console.log("data");
            //data += buffer;
        });

        req.on("end", function() {
            var end = true;
        })
    }
});

return new api();