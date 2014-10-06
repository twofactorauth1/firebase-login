define(['app', 'jqueryGridster', 'jqueryUI', 'ngProgress', 'userService', 'chartFacebookService', 'chartStripService', 'chartTwoNetService'], function(app) {
    app.register.controller('DashboardCtrl', ['$scope', 'ngProgress', 'UserService', 'ChartFacebookService', 'ChartStripService', 'ChartTwoNetService', function ($scope, ngProgress, UserService, ChartFacebookService, ChartStripService, ChartTwoNetService) {
        ngProgress.start();
    	$('.header.accordion').click(function (e) {
    		var self = $(e.target);
            self.next().toggleClass('open');
            self.find('.arrow').toggleClass('open closed');
    	});

    	$('.module_sidebar').draggable({
    		helper: 'clone',
    		revert: true,
            stop: function (event, ui) {
                UserService.postUserDashboard(chartGrid.serialize(), function (data) {
                });
            }
    	});

    	var chartGrid = $(".gridster ul").gridster({
    		widget_margins: [20, 20],
        	widget_base_dimensions: [400, 200],
            shift_larger_widgets_down: false,
            serialize_params: function ($w, wgd) {
                return {col: wgd.col, row: wgd.row, size_x: wgd.size_x, size_y: wgd.size_y,
                        class: $w.attr('class'), create: (!$w.hasClass('preview-holder'))};
            }
    	}).data('gridster');

    	var charts = {};

    	charts.ST_plan_creations = function (boxId) {
    		ChartStripService.getPlanCreations(boxId);
    	};

    	charts.ST_plan_subscriptions = function (boxId) {
    		ChartStripService.getPlanSubscriptions(boxId);
    	};

        charts.TN_prolific_bio = function (boxId) {
    		ChartTwoNetService.getProlificBio(boxId);
    	};

        charts.TN_debbie_abbot_bio = function (boxId) {
    		ChartTwoNetService.getDebbieAbbotBio(boxId);
    	};

		charts.FB_overview = function(boxId) {
		    ChartFacebookService.getOverview(boxId);
		};

		charts.FB_likesPerDay = function(boxId) {
		    ChartFacebookService.getLikesPerDay(boxId);
		};

		charts.FB_postTimeline = function(boxId) {
		     ChartFacebookService.getPostTimeline(boxId);
		};

		charts.FB_postInteractionsPerDay = function(boxId) {
		     ChartFacebookService.getPostInteractionsPerDay(boxId);
		};

		charts.FB_reachPerDay = function(boxId) {
		    ChartFacebookService.getReachPerDay(boxId);
		};

		charts.FB_topTenPosts = function(boxId) {
		   ChartFacebookService.getTopTenPosts(boxId);
		};
		charts.FB_engagedDemographics = function(boxId) {
		   ChartFacebookService.getEngagedDemographics(boxId);
		};

		charts.FB_topFans = function(boxId) {
		    ChartFacebookService.getTopFans(boxId);
		};

    	$('.gridster').droppable({
    		drop: function (event, ui) {
    			var boxId = ui.draggable.attr('data-name') + '-' + Math.floor((Math.random() * 100) + 1);
    			chartGrid.add_widget('<li class="' + boxId + ' gridster-item"></li>', 1, 1);
    			charts[ui.draggable.attr('data-name')](boxId);
    		}
    	});

        UserService.getUserDashboard(function (dashboard) {
            dashboard.config.forEach(function(value, index) {
                if (value.create) {
                    var setId = value.class.split(' ')[0];
                    var setType = setId.split('-')[0];
                    chartGrid.add_widget('<li class="' + setId + ' gridster-item"></li>', value.size_x, value.size_y, value.col, value.row);
                    charts[setType](setId);
                }
            });
            ngProgress.complete();
        });

    }]);
});
