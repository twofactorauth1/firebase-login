/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

require('./model.base');

var message = $$.m.ModelBase.extend({

    /**
     * _id:""
     * providerMessageId: ""
     * sourceMessageId: "",
     * sourceThreadId: "",
     * sourceLabel: ""
     *
     * from: {
     *  sourceId: "",
     *  name: "",
     *  username: ""
     * }
     * to: ["",""]
     * date: timestamp
     * subject: "",
     * body: {
     *  html: "",
     *  text: "",
     * }
     * attachments: [
     *      fileId: ""
     *      fileName: ""
     *      url: ""
     *      size: 0
     *      hasPreview: ""
     *      type: ""
     * ],
     * flagged: true|false,
     * seen: true|false,
     */
    defaults: {

    },


    initialize: function(options) {

    },


    convertFromContextIOEmail: function(email) {
        var obj = {
            _id: $$.u.idutils.generateUniqueAlphaNumeric(16),
            providerMessageId: email.message_id,
            date: email.date,
            subject: email.subject
        };

        if (email.gmail_message_id != null) {
            obj.sourceMessageId = email.gmail_message_id;
        }

        if (email.gmail_thread_id != null) {
            obj.sourceThreadId = email.gmail_thread_id;
        }


        if (email.sources != null && email.sources.length > 0) {
            obj.sourceLabel = email.sources[0].label;
        }

        if (email.addresses && email.addresses.from != null) {
            obj.from = {};
            obj.from.name = email.addresses.from.name;
            obj.from.username = email.addresses.from.email;
        }

        if (email.addresses && email.addresses.to != null && email.addresses.to.length > 0) {
            obj.to = [];
            email.addresses.to.forEach(function(_to) {
               obj.to.push(_to.email);
            });
        }

        if (email.files != null && email.files.length > 0) {
            obj.attachments = [];
            email.files.forEach(function(file) {
                var _file = {
                    fileId: file.file_id,
                    fileName: file.file_name,
                    url: file.resource_url,
                    size: file.size,
                    hasPreview: file.supports_preview,
                    type: file.type
                };

                obj.attachments.push(_file);
            });
        }

        if (email.flags != null) {
            obj.seen = email.flags.seen;
            obj.flagged = email.flags.flagged;
        }

        if (email.body != null) {
            obj.body = {};
            if (_.isArray(email.body)) {
                email.body.forEach(function(body) {
                   if (body.content != null) {
                       if (body.type == "text/plain") {
                           obj.body.text = body.content;
                       } else if(body.type == "text/html") {
                           obj.body.html = body.content;
                       }
                   }
                });
            } else {
                if (email.body.content != null) {
                    obj.body.html = obj.body.text = email.body.content;
                }
            }
        }
        this.set(obj);
        return this;
    },


    convertFromFacebookMessage: function(message) {
        var obj = {
            _id: $$.u.idutils.generateUniqueAlphaNumeric(16),
            from: {
                sourceId: message.author_id,
                name: message.name
            },
            sourceThreadId: message.thread_id,
            date: message.created_time,

            body: {
                text:message.body
            }
        };

        this.set(obj);
        return this;
    }

}, {
    db: {
        storage: "mongo",
        table: "message"
    }
});

$$.m.Message = message;

module.exports = message;
