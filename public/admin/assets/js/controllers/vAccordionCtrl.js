'use strict';
/** 
 * controller for v-accordion
 * AngularJS multi-level accordion component.
 */
(function(angular) {
    app.controller('vAccordionCtrl', ["$scope", function($scope) {
        $scope.firstAccordionControl = {
            onExpand: function(expandedPaneIndex) {
                console.log('expanded:', expandedPaneIndex);
            },
            onCollapse: function(collapsedPaneIndex) {
                console.log('collapsed:', collapsedPaneIndex);
            }
        };
        $scope.panes = [{
                header: "Can I use my own domain name?",
                content: "Yes! No need to go changing all of those business cards! Please send a request via chat or email to info@indigenous.io.",
                category: "Website"
            }, {
                header: "Can I use my existing website?",
                content: "No. For you to be able to utilize all of the cool integrated features we have, your site needs to be built on the Indigenous platform. However, you can customize our templates to get a feel very similar to your existing website. Or, try something fresh and give your site a makeover. Remember, you can always easily make changes.",
                category: "Website"
            }, {
                header: "Will I lose all of my content and blog posts?",
                content: "Not at all. You can upload your content and media to use in our templates. We can also move your blog posts over for you; just sent us a request via chat or email to info@indigenous.io.",
                category: "Website"
            }, {
                header: "Do I need a designer to make changes to my website?",
                content: "Absolutely not. Using our templates and drag-and-drop technology, it’s easy to upload media and restructure the design of your site.",
                category: "Website"
            }, {
                header: "How do I select a page template?",
                content: "Go to the Website tab, click on “Themes,” and select your template.",
                category: "Website"
            }, {
                header: "How do I create a page?",
                content: "Go to the Website tab, click “Add” in the top right corner, and select “Page.”",
                category: "Website"
            }, {
                header: "Can I create pages without selecting a theme?",
                content: "Yes. However, selecting a theme first will help you to create a cohesive site efficiently. If you’re not sure where to begin, use our Getting Started Checklist.",
                category: "Website"
            }, {
                header: "How do I create a blog post?",
                content: "Go to the Website tab, click “Add” in the top right corner, and select “Post.”",
                category: "Website"
            }, {
                header: "How do I add a feature or functionality to my site that’s not offered in the templates?",
                content: "We’re working to make sure everything you need is at your fingertips, but if there’s a feature you don’t see, send us a request via chat or email to info@indigenous.io. We like wish lists because we know how to answer them.",
                category: "Website"
            }, {
                header: "How do I add a new customer?",
                content: "Go to the Customers tab and click “Add” in the top right corner.",
                category: "Customers"
            }, {
                header: "Are customers added automatically?",
                content: "Yes. When a visitor enters his/her email address on your site, a profile is automatically generated.",
                category: "Customers"
            }, {
                header: "Is there a limit to how many customers I can add?",
                content: "No. Currently, there is no tiered membership. You can add as many customers as you like.",
                category: "Customers"
            }, {
                header: "Can I import/export my existing contact data?",
                content: "Yes. You can import your contacts from Facebook, LinkedIn, and Google+). Soon, you will be able to import .csv files. If you need to export files, please send a request via chat or email to info@indigenous.io.",
                category: "Customers"
            }, {
                header: "How can I tag customers with labels?",
                content: "All customers are automatically tagged as “Lead.” You can then go in and edit that label, which allows for targeted communication and marketing. Soon, you will be able to have multiple labels for each customer.",
                category: "Customers"
            }, {
                header: "Can I add variables/fields in customer profiles? ",
                content: "Indigenous tracks all of the activities of your customers in their respective profiles, but if there’s additional field that you’d like to see, please send a request via chat or email to info@indigenous.io.",
                category: "Customers"
            }, {
                header: "How do I see my customers in a list?",
                content: "Go the Customers tab, click on the gear (Settings) icon in the top right corner, and select “List” under Default View.",
                category: "Customers"
            }, {
                header: "How do I add products?",
                content: "Go to the Commerce tab, click “Add” in the top right corner, and fill in the fields. These products will not be visible on your site until you have added a store page with the products component under the Website tab.",
                category: "Commerce"
            }, {
                header: "How do I add a store to my site?",
                content: "A store is a page on your site. Go to the Website tab, click “Add” in the top right corner, and select “Page.” Then, select a store template and add the product component. ",
                category: "Commerce"
            }, {
                header: "What happens if I add a store before I add products?",
                content: "Visitors will see a message saying, “We’re busy getting our products ready. Please come back soon!”",
                category: "Commerce"
            }, {
                header: "What kinds of products can I add?",
                content: "You can add physical, digital, subscription, and external link products.",
                category: "Commerce"
            }, {
                header: "Where can I see my customer orders?",
                content: "This feature is coming soon and when complete you will go the Commerce tab and click on “Orders.” You can also see orders in individual customer profile activity feeds and in your dashboard activity feed.",
                category: "Commerce"
            }, {
                header: "Where does my money go?",
                content: "Straight into your wallet! Commerce is linked to and processed through your Stripe account.",
                category: "Commerce"
            }, {
                header: "How do I add my social accounts?",
                content: "Go to the Account tab, click on “Integrations,” and easily connect your Facebook, LinkedIn, Twitter, and Google+ accounts.",
                category: "Marketing"
            }, {
                header: "How do I track my social media?",
                content: "Go to the Marketing tab and click on “Social Feed” to see a collaborative filterable view of your social media activity. ",
                category: "Marketing"
            }, {
                header: "How do I post to social media?",
                content: "Go to the Marketing tab and click on “Social Feed” to post, like, comment, edit, and delete on multiple sites, all from one place!",
                category: "Marketing"
            }, {
                header: "Can I create targeted social media messages?",
                content: "You will be able to use the labels and tracked activities in your customer profiles to create targeted social media messages.",
                category: "Marketing"
            }, {
                header: "Can I set up automated campaigns?",
                content: "Absolutely! You can use our campaign builder under the Marketing tab to enter your own content into smart and modifiable campaign templates. We will soon have more trigger and conditional options that allow you to send communication based on tracked customer activity (e.g. whether a specific email is opened, if no emails are opened for a certain amount of time, etc.).",
                category: "Marketing"
            }, {
                header: "How do I know what marketing is working well?",
                content: "Go to your Dashboard and click on “Marketing” to see what campaigns and individual posts are generating leads and conversions.",
                category: "Marketing"
            }, {
                header: "How do I send out a targeted email?",
                content: "Go to the Marketing tab and click on “Campaigns” to filter customers by label.",
                category: "Marketing"
            }, {
                header: "How do I know what my customers are doing on my site?",
                content: "Go the Dashboard tab and click on “Activity” to see what customers are doing alongside easy-to-read summaries of your site analytics (who’s visiting and how often, etc.).",
                category: "Dashboard"
            }, {
                header: "Where can I see my site analytics?",
                content: "Go to the Dashboard tab and click on “Site Analytics” to who’s visiting and how often, etc. in easy-to-read graphs and charts.",
                category: "Dashboard"
            }, {
                header: "Can I add additional employees?",
                content: "Not currently. If you require multiple users on one account, please send your request via chat or email to info@indigenous.io.",
                category: "Dashboard"
            }, {
                header: "Can I use Indigenous on my mobile phone or device?",
                content: "Absolutely. You have all of the same capabilities on a mobile device that you would have on your computer.",
                category: "Dashboard"
            }, {
                header: "Can I rearrange how my dashboard looks?",
                content: "Not currently, but if there’s a concern, please let us know via chat or email to info@indigenous.io.",
                category: "Dashboard"
            }, {
                header: "Where can I see my past invoices?",
                content: "Go to the Account tab and click on “Billing.”",
                category: "Account"
            }, {
                header: "Where can I see my past invoices?",
                content: "Go to the Account tab and click on “Billing.”",
                category: "Account"
            }, {
                header: "What happens if I cancel Indigenous?",
                content: "We will store your data for 30 days, and you may request export of your data, but more importantly, please let us know why you’re considering canceling, and how our platform can serve you better.",
                category: "Account"
            }, {
                header: "Can I get my money back?",
                content: "Your startup fee and monthly payments are non-refundable, but we are committed to making Indigenous work for you, so please send your concerns via chat or email to info@indigenous.io.",
                category: "Account"
            }, {
                header: "What is the first thing I should do?",
                content: "Enter your basic personal and business information under “Account information.” Then, consult our Getting Started checklist and begin building your business with Indigenous.",
                category: "Account"
            }, {
                header: "Where can I change my credit card information?",
                content: "Go to the Account tab and click on “Billing.” ",
                category: "Account"
            }, {
                header: "What if forget my password?",
                content: "Click on “Forgot Your Password?” on the login page to have instructions for setting up a new password sent to your associated email account. If you cannot access that email account, please send a request via email to info@indigenous.io.",
                category: "Account"
            }, {
                header: "Where can I get one-on-one support?",
                content: "We provide 24/7 live chat support. You can also schedule a one-on-one demo with one of our team members.",
                category: "Account"
            }

        ];
    }]);
})(angular);
