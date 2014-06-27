
// Top ten posts
// ======================

$$.Charts.FB_topFans = new $$.Chart({
    id: 'FB_topFans'
    , url: '/facebook/{{id}}/topFiveFans'
    , gridWidth: 2
    , testData: [
        {
            "id": "782909993"
            , "name": "Fabiane Bergmann"
            , "username": "fabiane.bergmann"
            , "gender": "female"
            , "locale": "en_US"
            , "picture": "http://profile.ak.fbcdn.net/hprofile-ak-prn1/161431_782909993_7059411_q.jpg"
            , "likes": 21
            , "comments": 7
        }
        , {
            "id": "100000104875096"
            , "name": "Ricardo Tomasi"
            , "username": "ricardobeat"
            , "gender": "male"
            , "locale": "pt_BR"
            , "picture": "http://profile.ak.fbcdn.net/hprofile-ak-snc6/275176_100000104875096_4576679_q.jpg"
            , "likes": 12
            , "comments": 5
        }
        , {
            "id": "1176303547"
            , "name": "André Tomasi"
            , "username": "andretomasi"
            , "gender": "male"
            , "locale": "pt_BR"
            , "picture": "http://profile.ak.fbcdn.net/hprofile-ak-ash4/371818_1176303547_2128660313_q.jpg"
            , "likes": 8
            , "comments": 4
        }
        , {
            "id": "100001142536664"
            , "name": "John Murowaniecki"
            , "username": "jmurowaniecki"
            , "gender": "male"
            , "locale": "en_US"
            , "picture": "http://profile.ak.fbcdn.net/hprofile-ak-prn1/157822_100001142536664_1115866076_q.jpg"
            , "likes": 5
            , "comments": 5
        }
        , {
            "id": "1176303547"
            , "name": "André Tomasi"
            , "username": "andretomasi"
            , "gender": "male"
            , "locale": "pt_BR"
            , "picture": "http://profile.ak.fbcdn.net/hprofile-ak-ash4/371818_1176303547_2128660313_q.jpg"
            , "likes": 4
            , "comments": 2
        }
    ]
    , render: function (data, options) {

        $$.log("Rendering %s", this.id, data, options)

        var parseDate = d3.time.format("%Y-%m-%d").parse

        // Normalize data.
        // Make sure you don't modify the original data object,
        // otherwise this might fail on subsequent renders
        data = data.slice(0, 5)

        this.process(options)

        this.addTitle("Top 5 fans")
        this.addRangeSelector(options.range)

        if (data.length === 0) {
            this.module.addClass('no-data')
            return
        }

        var maxLikes    = d3.max(data, function(d){ return d.likes })
            , maxComments = d3.max(data, function(d){ return d.comments })

        $(Handlebars.templates['top-fans']({
            users: data
        })).appendTo(this.module)

    }
})
