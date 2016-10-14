(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout', '$window', '$location'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, $transclude, $sce, $timeout, $window, $location) {

    console.info('page-section directive init...')

    var vm = this;

    vm.init = init;
    vm.sectionClass = sectionClass;
    vm.sectionBGClass = sectionBGClass;
    vm.sectionStyle = sectionStyle;
    vm.sectionBGStyle = sectionBGStyle;
    vm.componentClass = componentClass;
    vm.componentStyle = componentStyle;
    vm.sectionHasFooter = sectionHasFooter;
    vm.sectionHasLegacyUnderNavSetting = sectionHasLegacyUnderNavSetting;
    vm.getTrustedUrl = getTrustedUrl;
    vm.setupVideoBackground = setupVideoBackground;
    vm.playerObject = {};
    vm.player = {};
    vm.sectionInitDelayDone = false;
    vm.setFixedPosition = setFixedPosition;



    $scope.$watch('vm.section.bg.video.id', function (_id) {
        if (_id && vm.section.bg.video.show) {
            $timeout(function() {
                vm.setupVideoBackground();
            }, 1000);
        }
    });

    //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

    function sectionClass(section) {
        var classString = 'container-fluid '; //col-xs-12 was messing up legacy

        if (section) {
            var title = section.title || section.name;
            var version = section.version;

            if (title) {

                classString += ' ssb-page-section-' + $filter('slugify')(title);

                if (version) {
                    classString += ' ssb-page-section-' + $filter('slugify')(title); + '-v' + version;
                }

            }

            if (section.layout) {

                classString += ' ssb-page-section-layout-' + section.layout;

                if (version) {
                    classString += ' ssb-page-section-layout-' + section.layout + '-v' + version;
                }

            }

            if (section.layoutModifiers) {

                if (section.layoutModifiers.fixed) {

                    classString += ' ssb-page-section-layout-' + section.layout + '-fixed';
                    if(vm.elementLoaded){
                        classString += ' ssb-fixed sticky';

                        if (vm.index === 0) {
                            classString += ' ssb-fixed-first-element';
                        }
                    }
                    

                }
                if(section.layoutModifiers.columns && section.layoutModifiers.columns.columnsNum){
                    var _col = section.layoutModifiers.columns.columnsNum;
                    classString += ' ssb-text-column-layout ssb-text-column-' + _col;
                }

            }

            if (vm.sectionHasFooter(section)) {
                classString += ' ssb-page-section-layout-overflow-visible';
            }

            if (vm.sectionHasLegacyUnderNavSetting(section)) {
                classString += ' ssb-page-section-layout-legacy-undernav';
            }

            if (section.bg && section.bg.video && section.bg.video.show && section.bg.video.urlProcessed) {

                if (!angular.equals(vm.playerObject, {})) {
                    classString += ' ssb-page-section-layout-video-bg';
                }
            }

            if (section.bg && section.bg.img && section.bg.img.blur) {
                classString += ' ssb-page-section-layout-blur-image';
            }

            if(section.spacing && section.spacing.default){
                classString += " no-component-vertical-space";
            }

        }
        // console.debug('section classString')
        // console.debug(classString)

        return classString;
    }

    function sectionBGClass(section) {
        var classString = ' ';


        if (section && section.bg) {

            if (section.bg.img && section.bg.img.blur) {
                classString += ' blur-image';
            }

            if (section.bg.img && section.bg.img.parallax) {
                classString += ' parallax';
            }

        }

        return classString;
    }

    function sectionStyle(section) {
        var styleString = ' ';

        if (section && section.spacing) {
            if (section.spacing.pt) {
                styleString += 'padding-top: ' + section.spacing.pt + 'px;';
            }

            if (section.spacing.pb) {
                styleString += 'padding-bottom: ' + section.spacing.pb + 'px;';
            }

            if (section.spacing.pl) {
                styleString += 'padding-left: ' + section.spacing.pl + 'px;';
            }

            if (section.spacing.pr) {
                styleString += 'padding-right: ' + section.spacing.pr + 'px;';
            }

            if (section.spacing.mt) {
                styleString += 'margin-top: ' + section.spacing.mt + 'px;';
            }

            if (section.spacing.mb) {
                styleString += 'margin-bottom: ' + section.spacing.mb + 'px;';
            }

            if (section.spacing.ml) {
                styleString += section.spacing.ml == 'auto' ? 'margin-left: ' + section.spacing.ml + ';float: none;' : 'margin-left: ' + section.spacing.ml + 'px;';
            }

            if (section.spacing.mr) {
                styleString += (section.spacing.mr == 'auto') ? 'margin-right: ' + section.spacing.mr + ';float: none;' : 'margin-right: ' + section.spacing.mr + 'px;';
            }

            if (section.spacing.mw) {
                styleString += (section.spacing.mw == '100%') ?
                     'max-width: ' + section.spacing.mw + ';' :
                     'max-width: ' + section.spacing.mw  + 'px;margin-left:auto!important;margin-right:auto!important;';
            }

            if (section.spacing.lineHeight) {
                styleString += 'line-height: ' + section.spacing.lineHeight;
            }

        }

        if (section && section.txtcolor) {
            styleString += 'color: ' + section.txtcolor + ';';
        }

        if(section && section.border && section.border.show && section.border.color){
            styleString += 'border-color: ' + section.border.color + ';';
            styleString += 'border-width: ' + section.border.width + 'px;';
            styleString += 'border-style: ' + section.border.style + ';';
            styleString += 'border-radius: ' + section.border.radius + '%;';
        }
        setUpFroalaVideoSize(section);
        resizeSliderImagesToFullHeight(section);


        return styleString;
    }


    function resizeSliderImagesToFullHeight(section){
        if(section){
            var sectionElement = angular.element("#section_"+ section._id)
            if(sectionElement.hasClass("ssb-page-section-layout-nav-hero-v2")){
                var innerSectionHeaderElement = sectionElement.find(".navigation-header");
                var innerSectionTextElement = sectionElement.find(".ssb-nav-hero-text");
                if(innerSectionHeaderElement.length && innerSectionTextElement.length){                     
                    sectionElement.find(".single-testimonial .component-slider-image img").css("min-height", innerSectionHeaderElement.height() + innerSectionTextElement.height() + 120);                    
                }
            }
        }
    }

    function sectionBGStyle(section) {
        var styleString = ' ';

        if (section && section.bg) {

            /*
            bg:
                color: ""
                img:
                    blur: false
                    height: null
                    overlay: true
                    overlaycolor: "#d24d57"
                    overlayopacity: 60
                    parallax: false
                    show: true
                    url: "//s3.amazonaws.com/indigenous-digital-assets/account_1191/graph_paper_1447199316134.gif"
                    width: null
                opacity: 0.4

            */

            if (section.bg.color) {
                styleString += 'background-color: ' + section.bg.color + ';';
            }

            if (section.bg.img && section.bg.img.show && section.bg.img.url && section.bg.img.url !== '') {
                styleString += 'background-image: url("' + section.bg.img.url + '")';
            }

        }

        return styleString;
    }

    function componentClass(component, index) {
        var classString = 'container-fluid ';

        if (vm.section.layout === '1-col') {
          // classString += 'col-sm-12 ';
        }

        if (vm.section.layout === '2-col') {
          classString += ' col-md-6 ';
        }

        if (vm.section.layout === '2-col-right') {
          classString += ' col-md-6 ';
          if(index > 1){
            classString += ' ssb-col-md-float-right';
          }
        }

        if (vm.section.layout === '3-col') {
          classString += ' col-md-4 ';
        }

        if (vm.section.layout === '4-col') {
          classString += ' col-md-3';
        }

        if (index !== undefined) {
          classString += ' ssb-component-index-' + index + ' ';
        }

        if(vm.section.layoutModifiers && vm.section.layoutModifiers.columns){
            if (vm.section.layoutModifiers.columns.columnsNum) {
                var _lastCoulmnFullWidth = false;
                var actualColumnsToIgnore = [];
                if(vm.section.layoutModifiers.columns.ignoreColumns && vm.section.layoutModifiers.columns.ignoreColumns.length){
                    var ignoreColumns = vm.section.layoutModifiers.columns.ignoreColumns;                    
                    _.each(ignoreColumns, function(val){
                        if(val === 'last'){
                            actualColumnsToIgnore.push(vm.section.components.length - 1);
                            _lastCoulmnFullWidth = true;
                        }
                        else{
                            actualColumnsToIgnore.push(val - 1);   
                        }
                    });
                }
                var fixedColumn = actualColumnsToIgnore.indexOf(index) > -1 ? true : false;

                var colCount = parseInt(vm.section.layoutModifiers.columns.columnsNum);
                var colClass = " col-xs-12 col-md-" + Math.floor(12/colCount);
                
                if(!fixedColumn) {
                    classString += colClass;
                    if(colCount == 5){
                        classString += " col-xs-15 col-md-15";
                    }
                }             
                    
                var totalCoulmns = colCount;
                var actualColumnsIndexes = [];
                for(var i = 0; i<= vm.section.components.length -1; i++){
                    actualColumnsIndexes.push(i);
                }
                if(actualColumnsToIgnore.length){
                    totalCoulmns = totalCoulmns + actualColumnsToIgnore.length;  
                    actualColumnsIndexes = _.difference(actualColumnsIndexes, actualColumnsToIgnore);                  
                }

                if (index !== undefined && index >= totalCoulmns && !fixedColumn) {
                    classString += " ssb-col-hide"; 
                    //actualColumnsIndexes = _.reject(actualColumnsIndexes, function(num){ return num === index; });                   
                }

                
                if (vm.section.layoutModifiers.columns.columnsSpacing && !fixedColumn) {
                    if(parseInt(vm.section.layoutModifiers.columns.columnsNum) > 1){
                        if(actualColumnsIndexes.indexOf(index) === 0){
                            classString += ' ssb-component-layout-columns-spacing-first-column-' + vm.section.layoutModifiers.columns.columnsSpacing + ' ';    
                        }
                        else if(actualColumnsIndexes.indexOf(index) === vm.section.layoutModifiers.columns.columnsNum - 1){
                            classString += ' ssb-component-layout-columns-spacing-last-column-' + vm.section.layoutModifiers.columns.columnsSpacing + ' ';    
                        }
                        else{
                            classString += ' ssb-component-layout-columns-spacing-' + vm.section.layoutModifiers.columns.columnsSpacing + ' ';    
                        }
                    }
                    
                }

                if(index === vm.section.components.length - 1 && _lastCoulmnFullWidth){
                    classString += " ssb-text-last-column-full-width";
                }
            }

            if(!fixedColumn && parseInt(vm.section.layoutModifiers.columns.columnsNum) > 1){            
                var element = angular.element(".inner-component-style." + component.type + "" + component._id);
                if (vm.section.columnBorder && vm.section.columnBorder.show && vm.section.columnBorder.color) {
                    
                    if(element){
                        element.css({
                            'border-color':  vm.section.columnBorder.color,
                            'border-width':  vm.section.columnBorder.width + 'px',
                            'border-style':  vm.section.columnBorder.style,
                            'border-radius':  vm.section.columnBorder.radius + "%"
                        })
                    }
                }
                else{
                    if(element){
                        element.css({
                            'border': 'none'
                        })
                    }
                }                    
            }
            
        }




        if (component.layoutModifiers) {

            if (component.layoutModifiers.columns) {
                if (component.layoutModifiers.columnsNum) {
                    classString += ' ssb-component-layout-columns-' + component.layoutModifiers.columnsNum + ' ';
                }

                if (component.layoutModifiers.columnsSpacing) {
                    classString += ' ssb-component-layout-columns-spacing-' + component.layoutModifiers.columnsSpacing + ' ';
                }
            }

        }

        return classString;

    }

    function componentStyle(component) {
        var styleString = ' ';

        if (component.type.indexOf('ssb-') === 0) {

            if (component.spacing) {
                if (component.spacing.pt) {
                    styleString += 'padding-top: ' + component.spacing.pt + 'px;';
                }

                if (component.spacing.pb) {
                    styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
                }

                if (component.spacing.pl) {
                    styleString += 'padding-left: ' + component.spacing.pl + 'px;';
                }

                if (component.spacing.pr) {
                    styleString += 'padding-right: ' + component.spacing.pr + 'px;';
                }

                if (component.spacing.mt) {
                    styleString += 'margin-top: ' + component.spacing.mt + 'px;';
                }

                if (component.spacing.mb) {
                    styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
                }

                if (component.spacing.ml) {
                    styleString += component.spacing.ml == 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + 'px;';
                }

                if (component.spacing.mr) {
                    styleString += (component.spacing.mr == 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + 'px;';
                }

                if (component.spacing.mw) {
                    styleString += (component.spacing.mw == '100%') ?
                        'max-width: ' + component.spacing.mw + ';' :
                        'max-width: ' + component.spacing.mw  + 'px;margin:0 auto!important;';
                }

                if (component.spacing.lineHeight) {
                    styleString += 'line-height: ' + component.spacing.lineHeight;
                }
            }

            if (component.txtcolor) {
                styleString += 'color: ' + component.txtcolor + ';';
            }

            if (component.visibility === false) {
                styleString += 'display: none!important;';
            }

            if (component.bg) {
              if (component.bg.color) {
                styleString += 'background-color: ' + component.bg.color + ';';
              }

              if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
                styleString += 'background-image: url("' + component.bg.img.url + '");';
              }
            }

            if (component.src) {
                if (component.src && component.src !== '') {
                    styleString += 'background-image: url("' + component.src + '");';
                }
            }

        }

        if (component.layoutModifiers) {
            if (component.layoutModifiers.columns) {
                if (component.layoutModifiers.columnsMaxHeight) {
                    styleString += ' max-height: ' + component.layoutModifiers.columnsMaxHeight + 'px';
                }
            }
        }

        if (component.border && component.border.show && component.border.color && component.visibility !== false) {
            styleString += 'border-color: ' + component.border.color + ';';
            styleString += 'border-width: ' + component.border.width + 'px;';
            styleString += 'border-style: ' + component.border.style + ';';
            styleString += 'border-radius: ' + component.border.radius + '%;';
        }
        

        return styleString;
    }

    /**
     * setFixedPosition
     * - If fixed element is first on page, just make it fixed
     * - Else, create new StickyState for element to fix at scroll position
     */
    function setFixedPosition() {
        var elementIsFirstPosition = vm.index === 0;
        if (elementIsFirstPosition) {
            var dup = vm.element.clone();
            dup.addClass('ssb-fixed-clone-element');
            dup.attr('id', 'clone_of_' + vm.section._id);
            dup.insertAfter(vm.element);
        } else {
            $timeout(function() {
                new StickyState(vm.element[0]);
            }, 2000);
        }
        vm.elementLoaded = true;
    }

    function sectionHasFooter(section) {
        return _.findWhere(section.components, { type: 'footer' });
    }

    function sectionHasLegacyUnderNavSetting(section) {
        var isUnderNav = false;
        var masthead = _.findWhere(section.components, { type: 'masthead' });

        if (masthead && masthead.bg && masthead.bg.img && masthead.bg.img.undernav) {
            isUnderNav = true;
        }

        return isUnderNav;
    }

    function getTrustedUrl(url) {
        return $sce.trustAsResourceUrl(url);
    }

    function setUpFroalaVideoSize(section){
        if(section){
            var sectionElement = angular.element("#section_"+ section._id);
            if(sectionElement.length){
                var iframes = sectionElement.find(".fr-video>iframe");
                if(iframes.length){
                    _.each(iframes, function(iframe){
                        var width = $(iframe).width();
                        var height = (width/16)*9;
                        $(iframe).height(height + "px");
                    })
                }
            }
        }
    }

    function setupVideoBackground() {

        var windowWidth = angular.element($window).width();

        if (windowWidth > 767 && vm.section.bg.video && vm.section.bg.video.id) {

            if (vm.playerObject.destroy) {
                vm.playerObject.destroy();
            }

            if (YT && YT.Player) {
                vm.playerObject = new YT.Player('section_video_' + vm.section._id, {
                    height: '100%',
                    width: '100%',
                    videoId: vm.section.bg.video.id,
                    events: {
                        'onReady': vm.onPlayerReady,
                        'onStateChange': vm.onPlayerStateChange,
                        'onError': vm.onPlayerError
                    },
                    playerVars: {
                        autohide: 1,
                        loop: 1,
                        rel: 0,
                        enablejsapi: 1,
                        controls: 0,
                        autoplay: 1,
                        showinfo: 0,
                        modestbranding: 1,
                        playlist: vm.section.bg.video.id,
                    }
                });
            } else {
                $timeout(setupVideoBackground, 500);
            }

        }

    }

    vm.onPlayerReady = function(event) {
        vm.player = event.target;
        vm.player.playVideo();
        vm.player.mute();
    }

    vm.onPlayerStateChange = function(event) {
        // console.log('onPlayerStateChange', JSON.stringify(event));
    }

    vm.onPlayerError = function(event) {
        console.log('onPlayerError', JSON.stringify(event));
    }

    vm.showSection = function(section){
        var _showSection = false;
        if(section)
        {
            _showSection = section.visibility || section.visibility === undefined;
            if(section.global && section.hiddenOnPages){
                var _pageHandle;
                if(vm.state){
                    _pageHandle = vm.state.page.handle;
                }
                else{
                    _pageHandle = $scope.$root.pageHandle;
                }
                _showSection = !section.hiddenOnPages[_pageHandle];
                section.visibility =  _showSection;
            }
        }
        return _showSection;
    }

    function init(element) {
        vm.element = element;

        $timeout(function() {
            vm.sectionInitDelayDone = true;
        });

        if (!vm.uiState && vm.section &&  vm.section.layoutModifiers && vm.section.layoutModifiers.fixed) {
            $timeout(function() {
                vm.setFixedPosition();
            }, 200);
        }

    }

}


})();
