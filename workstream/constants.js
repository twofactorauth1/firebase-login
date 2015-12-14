


var defaultWorkstreams = [];

defaultWorkstreams[0] = {
    "_id" : null,
    "accountId" : 0,
    "unlockVideoUrl" : "https://www.youtube.com/watch?v=VfbQ4gww7aI",
    "unlocked" : false,
    "completed" : false,
    "blocks" : [
        {
            "_id" : 0,
            "name" : "Create a page",
            "link" : "/admin/#/website/pages",
            "helpText" : "Create a page on your website that will collect information on leads.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Select a page template", link: "/admin/#/support/help-topics?topic=d0d70109-a10f-4786-ace6-c5528df84eb3" },
                { type: "help", name: "Add and edit components", link: "/admin/#/support/help-topics?topic=efe36633-cafa-4c1f-b48c-98eb23fded7c" }
            ]
        },
        {
            "_id" : 1,
            "name" : "Upload media",
            "link" : "",
            "alias" : "mediaManager",
            "helpText" : "Upload images for use on your website.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Upload and manage media", link: "/admin/#/support/help-topics?topic=338ce58c-7119-4678-956f-1c9a45f8dc21" }
            ]
        },
        {
            "_id" : 4,
            "name" : "Modify website settings",
            "link" : "",
            "alias" : "websiteSeo",
            "helpText" : "Customize your site identity by renaming your site and/or adding a favicon and keywords for SEO.",
            "complete" : false
        },
        {
            "_id" : 3,
            "name" : "Associate an existing domain",
            "link" : "/admin/#/support/help-topics?topic=56fc13b6-48ea-4fe0-b0bf-1ba8c0afd62f",
            "helpText" : "Chat with us if you'd like to use your existing URL.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Change nameserver from GoDaddy", link: "/admin/#/support/help-topics?topic=56fc13b6-48ea-4fe0-b0bf-1ba8c0afd62f" }
            ]
        }
    ],
    "analyticWidgets" : [
        {
            name: "visitors",
            link: "/admin/#/website/site-an alytics"
        }
    ],
    "name" : "Build an Online Presence",
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
            "name" : "Add contacts",
            "link" : "/admin/#/customers",
            "helpText" : "Import contacts or create them individually.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Import from social networks or .csv files", link: "/admin/#/support/help-topics?topic=7a4d5cd1-fd74-4d15-bce7-3ee6076f56ce" }
            ]
        },
        {
            "_id" : 2,
            "name" : "Collect contact info",
            "link" : "/admin/#/website/pages",
            "helpText" : "Add a simple form on a page that automatically creates contacts.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Create a simple form", link: "/admin/#/support/help-topics?topic=4383048b-48df-4df5-852b-e11abe5d1366" }
            ]
        },
        {
            "_id" : 7,
            "name" : "Create an autoresponder",
            "link" : "/admin/#/emails",
            "helpText" : "Set up an email that is sent to customers when they fill out a simple form.",
            "complete" : false
        }
    ],
    "analyticWidgets" : [
        {
            name: "contacts",
            link: "/admin/#/customers"
        }
    ],
    "name" : "Manage Contacts",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-send-email-2.png",
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
            "name" : "Send an email",
            "link" : "/admin/#/customers",
            "helpText" : "Quickly send a simple, one-time email.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Send an email", link: "/admin/#/support/help-topics?topic=e7c74b68-cabd-4228-8b50-dce92cd71525" }
            ]
        },
        {
            "_id" : 8,
            "name" : "Create a campaign",
            "link" : "/admin/#/marketing/campaigns",
            "helpText" : "Create a reusable email, select your recipients, and schedule it for delivery.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Create automated email", link: "/admin/#/support/help-topics?topic=559719c0-c5c4-41bb-b11f-8962efbdd7cf" }
            ]
        },
        {
            "_id" : 9,
            "name" : "Integrate social media",
            "link" : "/admin/#/account/integrations",
            "helpText" : "Connect your social media accounts so you can view feeds and post to your own.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Connect to social networks", link: "/admin/#/support/help-topics?topic=47259629-279f-4365-bbb8-c7205d758f3d" },
                { type: "help", name: "Post to social networks", link: "/admin/#/support/help-topics?topic=a2ea8916-45c7-4aca-ada3-243920bb8a9a" }
            ]
        },
        {
            "_id" : 10,
            "name" : "Write a blog post",
            "link" : "/admin/#/website/posts",
            "helpText" : "Tell customers what you're thinking about and working on with blog posts that you can publish immediately or later.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Add a blog teaser to a page", link: "/admin/#/support/help-topics?topic=49abd6bc-dae1-4f34-a772-8b0c62c5bc92" }
            ]
        }
    ],
    "analyticWidgets" : [
        {
            name: "CampaignMetrics",
            link: "/admin/#/marketing/campaigns"
        },
        // {
        //     name: "SocialMedia",
        //     link: "/admin/#/marketing/social-feed"
        // },
        {
            name: "visitors",
            link: "/admin/#/website/site-analytics"
        }
    ],
    "name" : "Engage Customers",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-social-media-2.png",
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
            "helpText" : "Connect your Stripe account so that you can receive payments.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Create and post a product", link: "/admin/#/support/help-topics?topic=4c032f2d-0ef3-4fe5-946d-6970ae567333" }
            ]
        },
        {
            "_id" : 12,
            "name" : "Add a product",
            "link" : "/admin/#/commerce/products",
            "helpText" : "Add products with editable descriptions.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Create and post a product", link: "/admin/#/support/help-topics?topic=c92f5668-579f-468d-8883-3a85f1209852" }
            ]
        },
        {
            "_id" : 13,
            "name" : "Set up an online store",
            "link" : "/admin/#/website/pages",
            "helpText" : "Add a product component or store to a page so that customers can view and purchase your offerings.",
            "complete" : false,
            "helpLinks": [
                { type: "help", name: "Add and edit components", link: "/admin/#/support/help-topics?topic=efe36633-cafa-4c1f-b48c-98eb23fded7c" },
                { type: "help", name: "Manage orders", link: "/admin/#/support/help-topics?topic=f066dbed-ae82-4464-8046-70230859d26b" }
            ]
        }
    ],
    "analyticWidgets" : [
        // {
        //     name: "Orders",
        //     link: "/admin/#/commerce/orders"
        // },
        {
            name: "Revenue",
            link: "/admin/#/commerce/orders"
        }
    ],
    "name" : "Make Money",
    "icon" : "",
    "bgImage" : "//s3.amazonaws.com/indigenous-digital-assets/account_6/dohy-ecommerce-2.png",
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
