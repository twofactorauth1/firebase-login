/*
 * Getting Pages Data From Database
 *
 * */

'use strict';

mainApp.factory('pagesService', function () {

    //TODO Fetch Pages Data From DB

    return function (websiteId) {
        console.log(websiteId);
        var pages = [
            {
                "_id": "64da6cc0-bcf1-4bbb-a208-45ff2007941d",
                "accountId": 11,
                "websiteId": "e3e39555-2c1c-45d7-bdc5-b7a0d7df9cfe",
                "handle": "index",
                "title": "Home",
                "seo": null,
                "visibility": {
                    "visible": true,
                    "asOf": null,
                    "displayOn": null
                },
                "components": [
                    {
                        "_id": "b9d284c4-48f0-4718-a12b-210b8c73df60",
                        "anchor": null,
                        "type": "contact-us",
                        "label": "Contact US",
                        "description": "you can contact us any time on number give below",
                        "hours": [ ],
                        "location": {
                            "address": "B-4 82 Paschim Vihar New Delhi",
                            "address2": "B-1 90 Rajori Garden, Patalia",
                            "city": "City",
                            "state": "State",
                            "zip": "110063",
                            "lat": "112121212",
                            "lon": "332131312",
                            "showMap": false,
                            "addressDisplayLabel": "display label"
                        },
                        "contact": {
                            "email": "kashish.gupta@intelligrape.com",
                            "phone": "9999749722"
                        }
                    },
                    {
                        "_id": "1e2b6078-c1d2-4550-8747-35eb74c8d763",
                        "anchor": null,
                        "type": "feature-blocks",
                        "label": "Feature Block",
                        "description": "Feature Block Description",
                        "features": [ ]
                    },
                    {
                        "_id": "23ad6ee5-66ba-4a65-a82b-a187242599f3",
                        "anchor": null,
                        "title": "title",
                        "subtitle": "subtitle",
                        "text": "text",
                        "type": "freeform",
                        "label": "Free Form Label",
                        "description": "",
                        "value": "Free Form Value",
                        "assessment-title": "assessment-title",
                        "assessment-text": "assessment-text",
                        "btn": {"url": "url", "text": "text"},
                        "assessments": [
                            {
                                "assessment-icon": "assessment-icon",
                                "title": "title",
                                "subtitle": "subtitle",
                                "text": "text"
                            }
                        ]
                    },
                    {
                        "_id": "09bf4453-e567-4263-9042-cb2e9eb1adf2",
                        "anchor": null,
                        "main-feature-title": "main-feature-title",
                        "type": "feature-list",
                        "label": "feature-list-label",
                        "description": "feature-list-description",
                        "features": [
                            {
                                'feature-icon': 'feature-icon',
                                'feature-button-url': 'feature-button-url',
                                'src': 'src',
                                'feature-title': 'feature-title',
                                'feature-subtitle': 'feature-subtitle',
                                'feature-paragraph': 'feature-paragraph',
                                'btn': {text: 'button text'}
                            }
                        ]
                    },
                    {
                        "_id": "86663e44-c1d2-4743-b1b1-3a42d2f6ad5e",
                        "anchor": null,
                        "type": "image-gallery",
                        "label": "image-gallery-label",
                        "description": "image-gallery-description",
                        "imageSize": "medium",
                        "source": null,
                        "images": [
                            {
                                "image-url": "image-url",
                                "image-label": "image-label",
                                "image-description": "image-description"
                            }
                        ]
                    },
                    {
                        "_id": "fadf8b54-6c03-4d43-9a3e-6338ddc147d4",
                        "anchor": null,
                        "type": "image-slider",
                        "label": "image-slider-label",
                        "description": "image-slider-description",
                        "images": [
                            {"key": "key", "url": "url"}
                        ]
                    },
                    {
                        "_id": "fadf8b54-6c03-4d43-9a3e-6338ddc147d4",
                        "anchor": null,
                        "type": "blog",
                        "label": "blog-label",
                        "description": "blog-description",
                        "categories":["categorie1","categorie2"],
                        "blogposts": [
                            {
                                "attributes": {
                                    "_id": "_id",
                                    "post_url": "post_url",
                                    "post_title": "post_title",
                                    "post_author":"post_author",
                                    "post_category":"post_category",
                                    "comment_count":"comment_count",
                                    "post_excerpt":"post_excerpt",
                                    "post_tags":["tag1","tag2"],
                                    "comments":["comment1","comment2"],
                                    "created": {"date": "date"}
                                }
                            }
                        ]
                    }
                ],
                "created": {
                    "date": 1408599403942,
                    "by": null
                },
                "modified": {
                    "date": "",
                    "by": null
                }
            }
        ];
        return pages;
    };

});