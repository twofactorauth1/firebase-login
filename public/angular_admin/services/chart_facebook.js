define(['app','c3'], function (app,c3) {
	app.register.service('ChartFacebookService', function ($http) {
		this.getOverview = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data : {
				type : 'bar',
		            x : 'x',
		            columns : [['x', '2014-06-20', '2014-07-20', '2014-08-20', '2014-09-20'], ['friends', 30, 40, 55, 58], ['likes', 130, 340, 400, 500]]
		        },
		        axis : {
		            x : {
		                type : 'timeseries',
		                tick : {
		                    format : '%Y-%m-%d'
		                }
		            }
		        }
		    });
		};
		this.getLikesPerDay = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data : {
		            json:[{
		                date: '2014-06-20',
		                likes: '2',
		                unlikes: '0'
		            }
		            , {
		                date: '2014-06-21',
		                likes: '4',
		                unlikes: '1'
		            }
		            , {
		                date: '2014-06-22',
		                likes: '7',
		                unlikes: '2'
		            }
		            , {
		                date: '2014-06-24',
		                likes: '5',
		                unlikes: '2'
		            }
		            , {
		                date: '2014-06-25',
		                likes: '6',
		                unlikes: '1'
		            }],
		            keys: {
		                x: 'date',
		                value: ['likes', 'unlikes']
		            }
		        },
		        axis : {
		            x : {
		                type : 'timeseries',
		                tick : {
		                    format : '%Y-%m-%d'
		                }
		            }
		        }
		    });
		};

		this.getPostTimeline = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data : {
				type : 'pie',
		            json:[ {
		                date: '2014-06-21',
		                likes: '2',
		                shares: '2',
		                comments: '1',
		                title: 'Post title'
		            }
		            , {
		                date: '2014-06-22',
		                likes: '4',
		                shares: '1',
		                comments: '1',
		                title: 'Post title'
		            }
		            , {
		                date: '2014-06-23',
		                likes: '7',
		                shares: '2',
		                comments: '1',
		                title: 'Post title'
		            }
		            , {
		                date: '2014-06-24',
		                likes: '5',
		                shares: '3',
		                comments: '1',
		                title: 'Post title'
		            }
		            , {
		                date: '2014-06-25',
		                likes: '1',
		                shares: '1',
		                comments: '1',
		                title: 'Post title'
		            }],
		            keys: {
		                value: ['likes', 'shares','comments']
		            }
		        }
		    });
		};

		this.getPostInteractionsPerDay = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data : {
		            json:[{
		                date: '2014-06-21',
		                likes: 2,
		                shares: 2,
		                comments: 1
		            }
		            , {
		                date: '2014-06-22',
		                likes: 4,
		                shares: 1,
		                comments: 2
		            }
		            , {
		                date: '2014-06-23',
		                likes: 7,
		                shares: 2,
		                comments: 3
		            }
		            , {
		                date: '2014-06-24',
		                likes: 5,
		                shares: 3,
		                comments: 1
		            }
		            , {
		                date: '2014-06-25',
		                likes: 3,
		                shares: 4,
		                comments: 2
		            }
		            , {
		                date: '2014-06-26',
		                likes: 2,
		                shares: 5,
		                comments: 2
		            }
		            , {
		                date: '2014-06-27',
		                likes: 5,
		                shares: 6,
		                comments: 4
		            }
		            , {
		                date: '2014-06-28',
		                likes: 8,
		                shares: 5,
		                comments: 3
		            }
		            , {
		                date: '2014-06-29',
		                likes: 4,
		                shares: 5,
		                comments: 4
		            }
		            , {
		                date: '2014-06-10',
		                likes: 5,
		                shares: 6,
		                comments: 5
		            }
		            , {
		                date: '2014-06-11',
		                likes: 6,
		                shares: 7,
		                comments: 6
		            }
		            , {
		                date: '2014-06-12',
		                likes: 7,
		                shares: 8,
		                comments: 7
		            }
		            , {
		                date: '2014-06-13',
		                likes: 8,
		                shares: 9,
		                comments: 8
		            }],
		            keys: {
		                x: 'date',
		                value: ['likes', 'shares','comments']
		            }
		        },
		        axis : {
		            x : {
		                type : 'timeseries',
		                tick : {
		                    format : '%Y-%m-%d'
		                }
		            }
		        }
		    });
		};

		this.getReachPerDay = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data : {
				type: 'bar',
		            json:[{
		                date: '2014-06-21',
		                paid: 5000,
		                organic: 2000,
		                viral: 1000
		            }
		            , {
		                date: '2014-06-22',
		                paid: 8000,
		                organic: 1000,
		                viral: 200
		            }
		            , {
		                date: '2014-06-23',
		                paid: 4000,
		                organic: 2000,
		                viral: 300
		            }
		            , {
		                date: '2014-06-24',
		                paid: 5000,
		                organic: 3000,
		                viral: 100
		            }
		            , {
		                date: '2014-06-25',
		                paid: 3000,
		                organic: 4000,
		                viral: 200
		            }
		            , {
		                date: '2014-06-26',
		                paid: 2000,
		                organic: 5000,
		                viral: 200
		            }
		            , {
		                date: '2014-06-27',
		                paid: 8000,
		                organic: 6000,
		                viral: 400
		            }
		            , {
		                date: '2014-06-28',
		                paid: 4000,
		                organic: 5000,
		                viral: 700
		            }
		            , {
		                date: '2014-06-29',
		                paid: 4000,
		                organic: 7000,
		                viral: 6000
		            }
		            ],
		            keys: {
		                x: 'date',
		                value: ['paid', 'organic','viral']
		            }
		        },
		        axis : {
		            x : {
		                type : 'timeseries',
		                tick : {
		                    format : '%Y-%m-%d'
		                }
		            }
		        }
		    });
		};


		this.getTopTenPosts = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data: {
		            json: [
		            {
		                date: '2014-06-20',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 40087
		            }
		            , {
		                date: '2014-06-29',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 30087
		            }
		            , {
		                date: '2014-06-28',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 20087
		            }
		            , {
		                date: '2014-06-27',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 9087
		            }
		            , {
		                date: '2014-06-26',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 887
		            }
		            , {
		                date: '2014-06-25',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 787
		            }
		            , {
		                date: '2014-06-24',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 687
		            }
		            , {
		                date: '2014-06-23',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 587
		            }
		            , {
		                date: '2014-06-22',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 487
		            }
		            , {
		                date: '2014-06-21',
		                message: 'Hello World',
		                reach: 71213,
		                engaged: 1347,
		                talking: 387
		            }
		            ],
		            keys: {
		                x: 'date',
		                value: ['reach', 'engaged','talking']
		            }
		        },
		        axis : {
		            x : {
		                type : 'timeseries',
		                tick : {
		                    format : '%Y-%m-%d'
		                }
		            }
		        }
		    });

		};
		this.getEngagedDemographics = function(boxId) {
		    c3.generate({
		        bindto : '.' + boxId,
		        data: {
		            json: [
		            {
		                male: 12,
		                female: 14,
		                range: '25-34'
		            }
		            , {
		                male: 15,
		                female: 24,
		                range: '35-44'
		            }
		            , {
		                male: 19,
		                female: 7,
		                range: '45-54'
		            }
		            , {
		                male: 8,
		                female: 2,
		                range: '55-64'
		            }
		            , {
		                range: '65+',
		                male: 1,
		                female: 0,
		            },
		            ],
		            keys: {
		                x: 'range',
		                value: ['male', 'female']
		            }
		        },
		        axis: {
		            x: {
		                type: 'category'
		            }
		        }
		    });

		};

		this.getTopFans = function(boxId) {
		   c3.generate({
		        bindto : '.' + boxId,
		        data: {
		            json: [
		            {

		                "name": "Fabiane Bergmann",
		                "likes": 21,
		                "comments": 7
		            }
		            , {
		                "name": "Ricardo Tomasi",
		                "likes": 12,
		                "comments": 5
		            }
		            , {
		                "name": "André Tomasi",
		                "likes": 8,
		                "comments": 4
		            }
		            , {
		                "name": "John Murowaniecki",
		                "likes": 5,
		                "comments": 5
		            }
		            , {
		                "name": "André Tomasi",
		                "likes": 4,
		                "comments": 2
		            },
		            ],
		            keys: {
		                x: 'name',
		                value: ['likes', 'comments']
		            }
		        },
		        axis: {
		            x: {
		                type: 'category'
		            }
		        }
		    });

		};
	});
});
