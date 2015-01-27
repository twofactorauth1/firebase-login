define(['app', 'campaignService', 'userService', 'jsPlumb'], function(app) {
    app.register.controller('CampaignDetailCtrl', ['$scope', 'UserService', 'CampaignService', '$stateParams', '$state', function($scope, UserService, CampaignService, $stateParams, $state) {
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

        CampaignService.getCampaign($scope.campaignId, function(campaign) {
            console.log('campaign ', campaign);
            $scope.campaign = campaign;
        });

        $scope.addEmailFn = function() {
            CampaignService.addCampaign($scope.newCampaign, function(campaign) {
                $scope.campaigns.push(campaign);
                $('#marketing-add-campaign').modal('hide');
            });
        };

        //add step to single campaign in scope
        $scope.addStep = function(type) {
            console.log('addStep >>> ', type);
            var step2add;
            if (type === 'email') {
                step2add = {
                    "type": "email",
                    "trigger": null,
                    "index": 1,
                    "settings" : {
                        "templateId" : "000000-0000-000000-00000000",
                        "offset" : "320000",
                        "from" : "john@indigenous.io",
                        "fromName" : 'John Doe',
                        "subject" : 'Email Subject',
                        "pageId": 'uuid:0000-aaaa-bbbb',
                        "vars": {},
                        "scheduled" : {
                            "minute":1,
                            "hour": 2,
                            "day":1
                        }
                    }
                };
            }

            if (type === 'page') {
                //create page with form
                //get page id
                //add step to campaign
            }

            $scope.campaign.steps.push(step2add);
            console.log('$scope.campaign >>> ', $scope.campaign);
        };

        $scope.modify

        jsPlumb.ready(function() {


            // jsPlumb.makeTarget($("#newPageWidget"), {
            //     dropOptions:{
            //         drop:function(e, ui) {
            //             console.log("drop", ui);
            //             //_addEndpoints("newPageWidget", ["RightMiddle"], ["LeftMiddle"]);
            //         }
            //     },
            //     scope:"scope"
            // });

            jsPlumb.draggable($("#newPageWidget"),
                {
                    start: function(event) {
                        console.log('event ', event);
                        //alert("You clicked x:" + event.clientX + " y:" + event.clientY);
                    },
                    stop:function(params) {
                        console.log(params);
                        console.log("DragEND!");
                        var newWidget = $("#newPageWidget").clone().appendTo( "#flowchart-demo" );
                        jsPlumb.draggable(newWidget, { grid: [20, 20] });
                        _addEndpoints(newWidget, ["RightMiddle"], ["LeftMiddle"]);
                        $("#newPageWidget").fadeOut();
                        setTimeout(function() {
                            $("#newPageWidget").css({'top': '','left': ''}).fadeIn();
                        }, 500);
                    }


                }
            );

            var instance = jsPlumb.getInstance({
                // default drag options
                DragOptions: {
                    cursor: 'pointer',
                    zIndex: 2000
                },
                // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
                // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
                // ConnectionOverlays: [
                //     ["Arrow", {
                //         location: 1
                //     }],
                //     ["Label", {
                //         location: 0.1,
                //         id: "label",
                //         cssClass: "aLabel"
                //     }]
                // ],
                Container: "flowchart-demo"
            });

            // this is the paint style for the connecting lines..
            var connectorPaintStyle = {
                    lineWidth: 4,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 2
                },
                // .. and this is the hover style. 
                connectorHoverStyle = {
                    lineWidth: 4,
                    strokeStyle: "#216477",
                    outlineWidth: 2,
                    outlineColor: "white"
                },
                endpointHoverStyle = {
                    fillStyle: "#216477",
                    strokeStyle: "#216477"
                },
                // the definition of source endpoints (the small blue ones)
                sourceEndpoint = {
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
                },
                // the definition of target endpoints (will appear when the user drags a connection) 
                targetEndpoint = {
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
                },
                init = function(connection) {
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

                _addEndpoints("flowchartWindow5", ["RightMiddle"], ["LeftMiddle"]);
                _addEndpoints("flowchartWindow4", ["RightMiddle"], ["LeftMiddle"]);
                _addEndpoints("flowchartWindow3", ["RightMiddle"], ["LeftMiddle"]);
                _addEndpoints("flowchartWindow2", ["RightMiddle"], ["LeftMiddle"]);
                _addEndpoints("flowchartWindow1", ["RightMiddle"], []);


                // listen for new connections; initialise them the same way we initialise the connections at startup.
                instance.bind("connection", function(connInfo, originalEvent) {
                    init(connInfo.connection);
                });

                // make all the window divs draggable
                instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {
                    grid: [20, 20]
                });

                // instance.draggable(jsPlumb.getSelector(".widgets .window"), {
                //     grid: [20, 20]
                // });
                // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
                // method, or document.querySelectorAll:
                //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

                // connect a few up
                instance.connect({
                    uuids: ["flowchartWindow1RightMiddle", "flowchartWindow2LeftMiddle"],
                    editable: true
                });
                instance.connect({
                    uuids: ["flowchartWindow2RightMiddle", "flowchartWindow3LeftMiddle"],
                    editable: true
                });
                instance.connect({
                    uuids: ["flowchartWindow3RightMiddle", "flowchartWindow4LeftMiddle"],
                    editable: true
                });
                instance.connect({
                    uuids: ["flowchartWindow4RightMiddle", "flowchartWindow5LeftMiddle"],
                    editable: true
                });
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

    }]);
});
