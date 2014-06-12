#!/bin/sh

# create a campaign
curl -X POST http://localhost:3000/api/1.0/campaignmanager/campaign --header "Content-Type:application/json" -d'
{
    "name": "Beer Campaign",
    "description": "Campaign to sell beers",
    "revision": "1.0",
    "templateName": "my_mandrill_template_for_beers",
    "numberOfMessages": 2,
    "messageDeliveryFrequency": "Every other day"

}'

# add contact with id 2 to campaign
curl -X POST http://localhost:3000/api/1.0/campaignmanager/campaign/7b9c5fde-af4e-425c-bf91-e78f4df6f5f4/contact/2 --header "Content-Type:application/json" -d'
{
    "arrayOfMergeVarsArrays":      [
                [
                    {
                        "name": "balance",
                        "content": "100"
                    },
                    {
                        "name" : "dueDate",
                        "content" : "01/01/2014"
                    }
                ],
                [
                    {
                        "name": "balance",
                        "content": "200"
                    },
                    {
                        "name" : "dueDate",
                        "content" : "02/01/2014"
                    }
                ]
            ]
}'

# cancel contact's campaign
curl -X DELETE http://localhost:3000/api/1.0/campaignmanager/campaign/7b9c5fde-af4e-425c-bf91-e78f4df6f5f4/contact/2 --header "Content-Type:application/json"