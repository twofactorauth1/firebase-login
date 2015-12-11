


var defaultWorkstreams = [];

defaultWorkstreams[0] = {
    "_id" : null,
    "accountId" : 0,
    "unlockVideoUrl" : "https://www.youtube.com/watch?v=VfbQ4gww7aI",
    "unlocked" : false,
    "completed" : false,
    "blocks" : [
        {
            "_id" : 3,
            "name" : "Upload Media",
            "link" : "",
            "alias" : "mediaManager",
            "helpText" : "Upload images for use on your website.",
            "complete" : false
        },
        {
            "_id" : 0,
            "name" : "Create Page",
            "link" : "/admin/#/website/pages",
            "helpText" : "Create a page on your website that will collect information on leads.",
            "complete" : false
        },
        {
            "_id" : 4,
            "name" : "Website & SEO",
            "link" : "",
            "alias" : "websiteSeo",
            "helpText" : "Configure the title, description, and favicon for your website and pages.",
            "complete" : false
        }
    ],
    "analyticWidgets" : [
        {name:"visitors", link:''}
    ],
    "name" : "Build a Website",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-website-builder-2.png",
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
defaultWorkstreams[1] = {
    "_id" : null,
    "accountId" : 0,
    "unlockVideoUrl" : "https://www.youtube.com/watch?v=VfbQ4gww7aI",
    "unlocked" : false,
    "completed" : false,
    "blocks" : [
        {
            "_id" : 6,
            "name" : "Add Contacts",
            "link" : "/admin/#/customers",
            "helpText" : "Import or add existing contacts.",
            "complete" : false
        },
        {
            "_id" : 7,
            "name" : "Configure Autoresponse Email",
            "link" : "/admin/#/emails",
            "helpText" : "Create an email to send to your new contacts when they register their email address.",
            "complete" : false
        },
        {
            "_id" : 2,
            "name" : "Configure Form for Leads",
            "link" : "/admin/#/website/pages",
            "helpText" : "Configure the form on your page to apply a label of 'Lead' to new contacts.  Then send them the email you created earlier.",
            "complete" : false
        }
    ],
    "analyticWidgets" : [
        {name:"contacts"}
    ],
    "name" : "Generate Leads",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-website-builder-2.png",
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
defaultWorkstreams[2] = {
    "_id" : null,
    "accountId" : 0,
    "unlockVideoUrl" : "https://www.youtube.com/watch?v=VfbQ4gww7aI",
    "unlocked" : false,
    "completed" : false,
    "blocks" : [
        {
            "_id" : 6,
            "name" : "Add Contacts",
            "link" : "/admin/#/customers",
            "helpText" : "Import or add existing contacts.",
            "complete" : false
        },
        {
            "_id" : 8,
            "name" : "Configure a Campaign",
            "link" : "/admin/#/marketing/campaigns",
            "helpText" : "Create an email, select your audience, and schedule it for delivery.",
            "complete" : false
        },
        {
            "_id" : 9,
            "name" : "Social Media Integration",
            "link" : "/admin/#/account/integrations",
            "helpText" : "Connect your social media accounts.",
            "complete" : false
        },
        {
            "_id" : 10,
            "name" : "Create Blog Post",
            "link" : "/admin/#/website/posts",
            "helpText" : "Create a blog post.",
            "complete" : false
        }
    ],
    "analyticWidgets" : [
        {name: "CampaignMetrics"},
        {name: "SocialMedia"},
        {name: "visitors"}
    ],
    "name" : "Engage Your Customers",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-website-builder-2.png",
    "_v" : "0.1",
    "created" : {
        "date" : new Date(),
        "by" : null
    },
    "modified" : {
        "date" : null,
        "by" : null
    }
}
defaultWorkstreams[3] = {
    "_id" : null,
    "accountId" : 0,
    "unlockVideoUrl" : "https://www.youtube.com/watch?v=VfbQ4gww7aI",
    "unlocked" : false,
    "completed" : false,
    "blocks" : [
        {
            "_id" : 11,
            "name" : "Integrate Stripe",
            "link" : "/admin/#/account/integrations",
            "helpText" : "Connect your Stripe account in order to receive payments.",
            "complete" : false
        },
        {
            "_id" : 12,
            "name" : "Add a Product",
            "link" : "/admin/#/commerce/products",
            "helpText" : "Add a product to your product catalog.",
            "complete" : false
        },
        {
            "_id" : 13,
            "name" : "Setup Online Store",
            "link" : "/admin/#/website/pages",
            "helpText" : "Add a product component to a page to give your customers a way to view and purchase your products.",
            "complete" : false
        }
    ],
    "analyticWidgets" : [
        {name:"Orders"},
        {name:"Revenue"}
    ],
    "name" : "Make Money",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-website-builder-2.png",
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
    defaultWorkstreams: defaultWorkstreams
}