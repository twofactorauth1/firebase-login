/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var mandrillConfig = require('../configs/mandrill.config');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(mandrillConfig.CLIENT_API_KEY);
var moment = require('moment');

var mandrillHelper =  {

    sendAccountWelcomeEmail: function(fromAddress, fromName, toAddress, toName, subject, htmlContent, accountId, userId, fn) {
        var self = this;
        //console.log('Sending mail from ' + fromName + ' with address ' + fromAddress);
        //console.dir(htmlContent);

        var message = {
            'html': htmlContent,
            'subject': subject,
            'from_email':fromAddress,
            //'from_name': fromName,
            'to': [
                {
                    'email': toAddress,
                    'name': toName,
                    'type': 'to'
                }
            ],
            "headers": {
                'encoding': 'UTF8'
            },
            "important": false,
            "track_opens": true,
            "track_clicks": true,
            "auto_text": null,
            "auto_html": null,
            "inline_css": null,
            "url_strip_qs": null,
            "preserve_recipients": null,
            "view_content_link": false,
            "bcc_address": null,
            "tracking_domain": null,
            "signing_domain": null,
            "return_path_domain": null,
            "merge": false,
            "merge_vars": [
                {
                    "rcpt": toAddress,
                    "vars": [
                         {
                            "name": "send_date",
                            "content": new Date()
                        }
                    ]
                }
            ],
            "subaccount": null,
            "google_analytics_domains": [
                "indigenous.io" //TODO: This should be dynamic
            ],
            "google_analytics_campaign": null,
            "metadata": {
                "accountId": accountId
            },
            "recipient_metadata": [
                {
                    "rcpt": toAddress,
                    "values": {
                        "userId": userId
                    }
                }
            ],
            "attachments": null,
            "images": null
        };
        if(fromName && fromName.length > 0) {
            message.from_name = fromName;
        }
        var async = false;
        var ip_pool = "Main Pool";
        var send_at = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        //gconsole.dir(message);
        mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
            console.log(result);
            /*
             [{
             "email": "recipient.email@example.com",
             "status": "sent",
             "reject_reason": "hard-bounce",
             "_id": "abc123abc123abc123abc123abc123"
             }]
             */
            fn(null, result);
        }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
            fn(e, null);
        });
    }
}

$$.u = $$.u || {};
$$.u.mandrillHelper = mandrillHelper;

module.exports = mandrillHelper;
