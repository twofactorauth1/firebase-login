define(['app', 'campaignService', 'userService', 'jsPlumb'], function(app) {
    app.register.controller('CampaignDetailCtrl', ['$scope', '$compile', 'UserService', 'CampaignService', '$stateParams', '$state', function($scope, $compile, UserService, CampaignService, $stateParams, $state) {
        $scope.$back = function() {
            console.log('$scope.lastState.state ', $scope.lastState.state);
            console.log('$scope.lastState.params ', $scope.lastState.params);
            if ($scope.lastState === undefined || $scope.lastState.state === '' || $state.is($scope.lastState.state, $scope.lastState.params)) {
                $state.go('marketing');
            } else {
                $state.go($scope.lastState.state, $scope.lastState.params);
            }
        };
        // $scope.campaigns = [];
        // $scope.feeds = [];
        $scope.campaignId = $stateParams.id;

        $scope.mytime = new Date();
        $scope.myDays = 0;

        $scope.hstep = 1;
        $scope.mstep = 15;

        $scope.wizardStep = 1;

        $scope.nextStep = function() {
            $scope.wizardStep += 1;
        };

        $scope.prevStep = function() {
            $scope.wizardStep -= 1;
        };

        $scope.goToStep = function(step) {
            $scope.wizardStep = step;
        };

        $scope.options = {
            hstep: [1, 2, 3],
            mstep: [1, 5, 10, 15, 25, 30]
        };

        $scope.incrementDays = function() {
            console.log('incrementDays');
            $scope.myDays += 1;
        };

        $scope.decrementDays = function() {
            console.log('decrementDays');
            $scope.myDays -= 1;
        };

        CampaignService.getCampaign($scope.campaignId, function(campaign) {
            console.log('campaign returned ', campaign);
            $scope.campaign = campaign;
            //ng-repeat is not executing before jsplumb must wait
            setTimeout(function() {
                $scope.initializeJSPlumb();
            });
        });

        // $scope.$watch('activeTab', function(newValue, oldValue) {
        //     if ($scope.userPreferences) {
        //         $scope.userPreferences.indi_default_tab = newValue;
        //         $scope.savePreferencesFn();
        //     }
        // });

        // UserService.getUserPreferences(function(preferences) {
        //     $scope.userPreferences = preferences;
        //     $scope.activeTab = preferences.indi_default_tab || 'getting-started';
        //     $scope.initialWelcome = preferences.welcome_alert.initial;
        // });

        // $scope.savePreferencesFn = function() {
        //     UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        // };

        $scope.initializeJSPlumb = function() {
            jsPlumb.ready(function() {

                $scope.addEmailFn = function() {
                    CampaignService.addCampaign($scope.newCampaign, function(campaign) {
                        $scope.campaigns.push(campaign);
                        $('#marketing-add-campaign').modal('hide');
                    });
                };

                $scope.deleteWidget = function(widgetId, $event) {
                    console.log('event ', $event);
                    console.log('deleting widget ', widgetId);
                    instance.detachAllConnections(widgetId);
                    instance.removeAllEndpoints(widgetId);
                    $('#' + widgetId).remove();
                };

                //add step to single campaign in scope
                $scope.addStep = function(type, id, xcoord, ycoord) {

                    var windowLength = $('.flowchart-demo .window').length;
                    console.log("windowLength " + windowLength);

                    var step2add;
                    if (type === 'email') {
                        step2add = {
                            "type": "email",
                            "trigger": null,
                            "index": windowLength,
                            "settings": {
                                "templateId": "000000-0000-000000-00000000",
                                "offset": "320000",
                                "from": "john@indigenous.io",
                                "fromName": 'John Doe',
                                "subject": 'Email Subject',
                                "pageId": 'uuid:0000-aaaa-bbbb',
                                "vars": {},
                                "scheduled": {
                                    "minute": 1,
                                    "hour": 2,
                                    "day": 1
                                }
                            }
                        };
                    }

                    if (type === 'page') {
                        step2add = {
                            "type": "page",
                            "trigger": null,
                            "index": windowLength,
                            "settings": {}
                        };
                    }

                    if (type === 'wait') {
                        step2add = {
                            "type": "wait",
                            "trigger": null,
                            "index": windowLength,
                            "settings": {}
                        };
                    }

                    if (type === 'conditional') {
                        step2add = {
                            "type": "conditional",
                            "trigger": null,
                            "index": windowLength,
                            "settings": {}
                        };
                    }

                    if (type === 'absplit') {
                        step2add = {
                            "type": "absplit",
                            "trigger": null,
                            "index": windowLength,
                            "settings": {}
                        };
                    }

                    console.log('$scope.campaign.steps ', $scope.campaign.steps);
                    $scope.$apply(function() {
                        $scope.campaign.steps.push(step2add);
                    });
                    console.log('$scope.campaign.steps ', $scope.campaign.steps);

                    $('#step-' + windowLength).css({
                        'left': (xcoord - 95) + 'px',
                        'top': (ycoord - 225) + 'px'
                    });

                    console.log('coords x: ' + xcoord + ' y: ', ycoord);

                    // var newWidget = precompile.appendTo(".flowchart-demo");
                    // newWidget.attr('id', 'step-' + windowLength);
                    // newWidget.find('.deleteWidget').attr('ng-click', "deleteWidget('step-" + windowLength + "')");
                    instance.draggable('step-' + windowLength);
                    _addEndpoints('step-' + windowLength, ["RightMiddle"], ["LeftMiddle"]);
                    $("#" + id).hide();
                    setTimeout(function() {
                        $("#" + id).css({
                            'top': '',
                            'left': ''
                        }).fadeIn();
                    }, 500);
                };

                $scope.saveConnections = function() {
                    var connections = [];
                    console.log('jsPlumb.getConnections() ', jsPlumb);
                    console.log('jsPlumb.getConnections() ', jsPlumb.getConnections());
                    $.each(jsPlumb.getConnections(), function(idx, connection) {
                        connections.push({
                            connectionId: connection.id,
                            pageSourceId: connection.sourceId,
                            pageTargetId: connection.targetId,
                            anchors: $.map(connection.endpoints, function(endpoint) {

                                return [
                                    [endpoint.anchor.x,
                                        endpoint.anchor.y,
                                        endpoint.anchor.orientation[0],
                                        endpoint.anchor.orientation[1],
                                        endpoint.anchor.offsets[0],
                                        endpoint.anchor.offsets[1]
                                    ]
                                ];

                            })
                        });
                    });
                    console.log(' connections ', connections);
                };

                setTimeout(function() {
                    $scope.saveConnections();
                }, 5000);

                jsPlumb.draggable($(".newCampaignWidget"), {
                    cursorAt: { top: 0, left: 0 },
                    start: function(event) {
                        console.log('event ', event);
                        var offset = $(this).offset();
                        var xPos = offset.left;
                        var yPos = offset.top;
                        console.log('xpos ', xpos);
                        console.log('yPos ', yPos);
                        // $('#posX').text('x: ' + xPos);
                        // $('#posY').text('y: ' + yPos);
                    },
                    stop: function(params) {
                        console.log('stop draggable');
                        console.log('params ', params);
                        $scope.addStep(params.el.getAttribute("data-type"), params.el.id, params.e.clientX, params.e.clientY);
                        jsPlumb.repaintEverything();
                        $('#'+params.el.id).css({'position':'relative','left':params.e.clientX+'px','top':params.e.clientY+'px'});
                    },
                    drag: function(params) {
                        console.log('xpos ', params.el.offsetLeft);
                        console.log('yPos ', params.el.offsetTop);
                        $('#'+params.el.id).css({'position':'absolute','left':params.el.offsetLeft+'px','top':params.el.offsetTop+'px'});
                    }
                });

                var instance = jsPlumb.getInstance({
                    DragOptions: {
                        cursor: 'pointer',
                        zIndex: 2000
                    },
                    Container: "flowchart-demo"
                });

                var connectorPaintStyle = {
                    lineWidth: 4,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 2
                };

                var connectorHoverStyle = {
                    lineWidth: 4,
                    strokeStyle: "#216477",
                    outlineWidth: 2,
                    outlineColor: "white"
                };

                var endpointHoverStyle = {
                    fillStyle: "#216477",
                    strokeStyle: "#216477"
                };

                var sourceEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        strokeStyle: "#f7941d",
                        fillStyle: "transparent",
                        radius: 7,
                        lineWidth: 3
                    },
                    isSource: true,
                    connector: ["Flowchart", {
                        stub: [40, 60],
                        gap: 10,
                        cornerRadius: 5,
                        alwaysRespectStubs: true
                    }],
                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    dragOptions: {}
                    // overlays: [
                    //     ["Label", {
                    //         location: [0.5, 1.5],
                    //         label: "Drag",
                    //         cssClass: "endpointSourceLabel"
                    //     }]
                    // ]
                };

                var targetEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        fillStyle: "#f7941d",
                        radius: 11
                    },
                    hoverPaintStyle: endpointHoverStyle,
                    maxConnections: -1,
                    dropOptions: {
                        hoverClass: "hover",
                        activeClass: "active"
                    },
                    isTarget: true
                        // overlays: [
                        //     ["Label", {
                        //         location: [0.5, -0.5],
                        //         label: "Drop",
                        //         cssClass: "endpointTargetLabel"
                        //     }]
                        // ]
                };

                var init = function(connection) {
                    connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                    connection.bind("editCompleted", function(o) {
                        if (typeof console != "undefined")
                            console.log("connection edited. path is now ", o.path);
                    });
                };

                var _addEndpoints = function(toId, sourceAnchors, targetAnchors) {
                    for (var i = 0; i < sourceAnchors.length; i++) {
                        var sourceUUID = toId + sourceAnchors[i];
                        instance.addEndpoint(toId, sourceEndpoint, {
                            anchor: sourceAnchors[i],
                            uuid: sourceUUID
                        });
                    }
                    for (var j = 0; j < targetAnchors.length; j++) {
                        var targetUUID = toId + targetAnchors[j];
                        instance.addEndpoint(toId, targetEndpoint, {
                            anchor: targetAnchors[j],
                            uuid: targetUUID
                        });
                    }
                };

                // suspend drawing and initialise.
                instance.doWhileSuspended(function() {

                    console.log('$scope.campaign.steps ', $scope.campaign.steps);
                    console.log('window length ', $(".flowchart-demo .window").length);
                    for (var i = 0; i < $scope.campaign.steps.length; i++) {
                        console.log('step ID ', $('#step-' + $scope.campaign.steps[i].index).attr('id'));
                        instance.draggable($('#step-' + $scope.campaign.steps[i].index).attr('id'));
                        _addEndpoints($('#step-' + $scope.campaign.steps[i].index).attr('id'), ["RightMiddle"], ["LeftMiddle"]);
                    };
                    // _addEndpoints("startWidget", ["RightMiddle"], []);


                    // listen for new connections; initialise them the same way we initialise the connections at startup.
                    instance.bind("connection", function(connInfo, originalEvent) {
                        init(connInfo.connection);
                    });

                    // make all the window divs draggable
                    console.log('window length ', $(".flowchart-demo .window").length);
                    instance.draggable($(".flowchart-demo .window"));

                    // instance.draggable(jsPlumb.getSelector(".widgets .window"), {
                    //     grid: [20, 20]
                    // });
                    // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
                    // method, or document.querySelectorAll:
                    //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

                    // connect a few up
                    // instance.connect({
                    //     uuids: ["flowchartWindow1RightMiddle", "flowchartWindow2LeftMiddle"],
                    //     editable: true
                    // });
                    // instance.connect({
                    //     uuids: ["flowchartWindow2RightMiddle", "flowchartWindow3LeftMiddle"],
                    //     editable: true
                    // });
                    // instance.connect({
                    //     uuids: ["flowchartWindow3RightMiddle", "flowchartWindow4LeftMiddle"],
                    //     editable: true
                    // });
                    // instance.connect({
                    //     uuids: ["flowchartWindow4RightMiddle", "flowchartWindow5LeftMiddle"],
                    //     editable: true
                    // });
                    //

                    //
                    // listen for clicks on connections, and offer to delete connections on click.
                    //
                    instance.bind("click", function(conn, originalEvent) {
                        if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                            jsPlumb.detach(conn);
                    });

                    instance.bind("connectionDrag", function(connection) {
                        console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
                    });

                    instance.bind("connectionDragStop", function(connection) {
                        console.log("connection " + connection.id + " was dragged");
                    });

                    instance.bind("connectionMoved", function(params) {
                        console.log("connection " + params.connection.id + " was moved");
                    });
                });

                jsPlumb.fire("jsPlumbDemoLoaded", instance);

            });
        };

    }]);
});
