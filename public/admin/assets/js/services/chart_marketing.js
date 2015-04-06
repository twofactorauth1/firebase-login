define(['app'], function(app) {
    app.register.service('ChartMarketingService', function() {
        this.queryReports = function() {
            $scope.conversationsConfig = {
                options: {
                    chart: {
                        height: 465,
                        spacing: [25, 25, 25, 25],
                        type: 'column'
                    },
                    colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949'],
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    tooltip: {
                        headerFormat: '<b>{point.x:%b %d}</b><br>',
                        pointFormat: '<b class="text-center">{point.y}</b>',
                    },
                    legend: {
                        enabled: true
                    },
                    exporting: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: "{value:%b %d}"
                    }
                },
                yAxis: {
                    // min: 0,
                    // max: Math.max.apply(Math, lineData) + 100,
                    title: {
                        text: ''
                    }
                },
                series: [{
                    name: 'Conversations',
                    data: [
                        [1412985600000, 220],
                        [1413072000000, 118],
                        [1413158400000, 362],
                        [1413244800000, 459],
                        [1413331200000, 366],
                        [1413417600000, 210],
                        [1413504000000, 77],
                        [1413590400000, 25],
                        [1413676800000, 12],
                        [1413763200000, 28],
                        [1413849600000, 18],
                        [1413936000000, 46],
                        [1414022400000, 25],
                        [1414108800000, 32],
                        [1414195200000, 7],
                        [1414281600000, 11],
                        [1414368000000, 27],
                        [1414454400000, 50],
                        [1414540800000, 30],
                        [1414627200000, 15],
                        [1414713600000, 12],
                        [1414800000000, 6],
                        [1414886400000, 26],
                        [1414972800000, 378],
                        [1415059200000, 558],
                        [1415145600000, 873],
                        [1415232000000, 591],
                        [1415318400000, 626],
                        [1415404800000, 531],
                        [1415491200000, 595]
                    ]
                }, {
                    name: 'Customers',
                    data: [
                        [1412985600000, 4],
                        [1413072000000, 8],
                        [1413158400000, 18],
                        [1413244800000, 16],
                        [1413331200000, 8],
                        [1413417600000, 15],
                        [1413504000000, 12],
                        [1413590400000, 3],
                        [1413676800000, 3],
                        [1413763200000, 6],
                        [1413849600000, 8],
                        [1413936000000, 10],
                        [1414022400000, 14],
                        [1414108800000, 9],
                        [1414195200000, 4],
                        [1414281600000, 7],
                        [1414368000000, 13],
                        [1414454400000, 8],
                        [1414540800000, 27],
                        [1414627200000, 7],
                        [1414713600000, 8],
                        [1414800000000, 6],
                        [1414886400000, 9],
                        [1414972800000, 12],
                        [1415059200000, 13],
                        [1415145600000, 8],
                        [1415232000000, 14],
                        [1415318400000, 11],
                        [1415404800000, 13],
                        [1415491200000, 11]
                    ]
                }],
                credits: {
                    enabled: false
                }
            };

            $scope.responseTimeConfig = {
                options: {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        spacing: [25, 25, 25, 25]
                    },
                    title: {
                        text: ''
                    },
                    tooltip: {
                        pointFormat: '{point.x}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                distance: -50,
                                style: {
                                    fontWeight: 'bold',
                                    color: 'white',
                                    textShadow: '0px 1px 2px black'
                                }
                            },
                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                        }
                    },
                    exporting: {
                        enabled: false
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Response Time',
                    innerSize: '40%',
                    data: [
                        ['15 min', 17],
                        ['15-30 min', 33],
                        ['30-60 min', 35],
                        ['1-2 hrs', 15]
                    ]
                }],
                credits: {
                    enabled: false
                }
            };

            $scope.genderConfig = {
                options: {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: 0,
                        plotShadow: false,
                        spacing: [25, 25, 25, 25]
                    },
                    title: {
                        text: ''
                    },
                    tooltip: {
                        pointFormat: '{point.x}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                distance: -50,
                                style: {
                                    fontWeight: 'bold',
                                    color: 'white',
                                    textShadow: '0px 1px 2px black'
                                }
                            },
                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                        }
                    },
                    exporting: {
                        enabled: false
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Gender',
                    innerSize: '40%',
                    data: [
                        ['Male', 44.3],
                        ['Female', 55.7]
                    ]
                }],
                credits: {
                    enabled: false
                }
            };

            $scope.purchaseFunnelConfig = {
                options: {
                    chart: {
                        marginRight: 100
                    },
                    title: {
                        text: ''
                    },
                    exporting: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b> ({point.y:,.0f})',
                                color: 'black',
                                softConnector: true
                            },
                            neckWidth: '30%',
                            neckHeight: '25%',
                            colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49', '#f8d949']
                                //-- Other available options
                                // height: pixels or percent
                                // width: pixels or percent
                        }
                    }
                },
                series: [{
                    name: 'Unique users',
                    type: 'funnel',
                    data: [
                        ['Website visits', 15654],
                        ['Downloads', 4064],
                        ['Requested price list', 1987],
                        ['Invoice sent', 976],
                        ['Finalized', 846]
                    ]
                }],
                credits: {
                    enabled: false
                }
            };
        };

    });
});
