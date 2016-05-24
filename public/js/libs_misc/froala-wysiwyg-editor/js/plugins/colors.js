/*!
 * froala_editor v2.2.3 (https://www.froala.com/wysiwyg-editor)
 * License https://froala.com/wysiwyg-editor/terms/
 * Copyright 2014-2016 Froala Labs
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function (a) {

  'use strict';

  a.extend(a.FroalaEditor.POPUP_TEMPLATES, {
    'colors.picker': '[_BUTTONS_][_TEXT_COLORS_][_BACKGROUND_COLORS_]'
  })

  // Extend defaults.
  a.extend(a.FroalaEditor.DEFAULTS, {
    colorsText: [
      '#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC',
      '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#000000',
      '#F7DA64', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF',
      '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', 'REMOVE'
    ],
    colorsBackground: [
      '#61BD6D', '#1ABC9C', '#54ACD2', '#2C82C9', '#9365B8', '#475577', '#CCCCCC',
      '#41A85F', '#00A885', '#3D8EB9', '#2969B0', '#553982', '#28324E', '#000000',
      '#F7DA64', '#FBA026', '#EB6B56', '#E25041', '#A38F84', '#EFEFEF', '#FFFFFF',
      '#FAC51C', '#F37934', '#D14841', '#B8312F', '#7C706B', '#D1D5D8', 'REMOVE'
    ],
    colorsStep: 7,
    colorsDefaultTab: 'text',
    colorsButtons: ['colorsBack', '|', '-'],
    defaultColors:{
        background: {
            init: false,
            color: ''
        },
        text: {
            init: false,
            color: ''
        }
    },
    isIE: document.documentMode || /Edge/.test(navigator.userAgent)
  });

  a.FroalaEditor.PLUGINS.colors = function (editor) {
    /*
     * Show the colors popup.
     */





    function _showColorsPopup () {
      var $btn = editor.$tb.find('.fr-command[data-cmd="color"]');



      var $popup = editor.popups.get('colors.picker');
      if (!$popup) $popup = _initColorsPopup();

      if (!$popup.hasClass('fr-active')) {
        // Colors popup
        editor.popups.setContainer('colors.picker', editor.$tb);

        // Refresh selected color.
        _refreshColor($popup.find('.fr-selected-tab').attr('data-param1'));

        // Colors popup left and top position.
        var left = $btn.offset().left + $btn.outerWidth() / 2;
        var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);
        editor.selection.save();

        editor.popups.show('colors.picker', left, top, $btn.outerHeight());
        if (editor.opts.isIE)
        {
            $(".fr-popup").find(".sp-input").hide();
            $(".fr-popup").find(".sp-palette-toggle").hide();
            $(".fr-popup").find(".sp-picker-container").hide();
        }
        else{
            $(".sp-input").show();
        }
        editor.selection.restore();
        _setInitialColors();
      }
    }

    /*
     * Hide colors popup.
     */
    function _hideColorsPopup () {
      // Hide popup.
      editor.popups.hide('colors.picker');
    }

    /**
     * Init the colors popup.
     */
    function _initColorsPopup () {
      var colors_buttons = '<div class="fr-buttons fr-colors-buttons">';

      if (editor.opts.toolbarInline) {
        // Colors buttons.
        if (editor.opts.colorsButtons.length > 0) {
          colors_buttons += editor.button.buildList(editor.opts.colorsButtons)
        }
      }

      colors_buttons += _colorsTabsHTML() + '</div>';

      var template = {
        buttons: colors_buttons,
        text_colors: _colorPickerHTML('text'),
        background_colors: _colorPickerHTML('background')
      };

      // Create popup.
      var $popup = editor.popups.create('colors.picker', template);

      return $popup;
    }

    /*
     * HTML for the color picker text and background tabs.
     */
    function _colorsTabsHTML () {
      var tabs_html = '<div class="fr-colors-tabs">';

      // Text tab.
      tabs_html += '<span class="fr-colors-tab ' + (editor.opts.colorsDefaultTab == 'background' ? '' : 'fr-selected-tab ') + 'fr-command" data-param1="text" data-cmd="colorChangeSet" title="' + editor.language.translate('Text') + '">' + editor.language.translate('Text') + '</span>';

      // Background tab.
      tabs_html += '<span class="fr-colors-tab ' + (editor.opts.colorsDefaultTab == 'background' ? 'fr-selected-tab ' : '') + 'fr-command" data-param1="background" data-cmd="colorChangeSet" title="' + editor.language.translate('Background') + '">' + editor.language.translate('Background') + '</span>';

      return tabs_html + '</div>';
    }

    /*
     * HTML for the color picker colors.
     */
    function _colorPickerHTML (tab) {
      // Get colors according to tab name.
      var colors = (tab == 'text' ? editor.opts.colorsText : editor.opts.colorsBackground);

      var dataCmdClear = (tab == 'text' ? "clearTextColor" : "clearBackgroundColor");

      var dataCmdSpectrum = (tab == 'text' ? "textColorSpectrum" : "bgColorSpectrum");

      var dataToggle = (tab == 'text' ? "toggleTextSpectrum" : "toggleBgSpectrum");

      var dataChooseColor = (tab == 'text' ? "chooseTextColor" : "chooseBGColor");

      // Create colors html.
      var colors_html = '<div class="sp-container sp-light sp-alpha-enabled sp-clear-enabled sp-initial-disabled fr-color-set fr-' + tab + '-color' + ((editor.opts.colorsDefaultTab == tab || (editor.opts.colorsDefaultTab != 'text' && editor.opts.colorsDefaultTab != 'background' && tab == 'text')) ? ' fr-selected-set' : '') + '">';
      //colors_html += '<div class="sp-palette-container"><div class="sp-palette sp-thumb sp-cf">';
      // Add colors.
      colors_html += '<div class="color-inner-row">'
      for (var i = 0; i < colors.length; i++) {
        if (i !== 0 && i % editor.opts.colorsStep === 0) {
          colors_html += '<br>';
        }

        if (colors[i] != 'REMOVE') {
          colors_html += '<span class="fr-command fr-select-color" style="background: ' + colors[i] + ';" data-cmd="' + tab + 'Color" data-param1="' + colors[i] + '"></span>';
        }

        else  {
          if(editor.opts.isIE){
            colors_html += '<span class="fr-command fr-select-color" data-cmd="' + tab + 'Color" data-param1="REMOVE" title="' + editor.language.translate('Clear Formatting') + '"><i class="fa fa-eraser"></i></span>';
          }
          else
          {
            colors_html += '<span style="visibility: hidden;" class="fr-command fr-select-color" data-cmd="' + tab + 'Color" data-param1="REMOVE" title="' + editor.language.translate('Clear Formatting') + '"><i class="fa fa-eraser"></i></span>';
          }
        }
      }


     colors_html += '<div class="sp-palette-button-container sp-cf"><button type="button" class="sp-palette-toggle fr-command" data-cmd="'+dataToggle+'">less</button></div>';

     colors_html += '</div>';
     colors_html += '<div class="sp-picker-container"><div class="sp-top sp-cf"><div class="sp-fill"></div><div class="sp-top-inner"><div class="sp-color fr-command" data-cmd="'+dataCmdSpectrum+'" style="background-color: rgb(255, 0, 0);"><div class="sp-sat"><div class="sp-val"><div class="sp-dragger" style="display: none;"></div></div></div></div><div class="sp-clear sp-clear-display fr-command" data-cmd="'+ dataCmdClear +'" title="Clear Color Selection"></div><div class="sp-hue"><div class="sp-slider" style="display: none;"></div></div></div><div class="sp-alpha"><div class="sp-alpha-inner"><div class="sp-alpha-handle" style="display: none;"></div></div></div></div><div class="sp-input-container sp-cf"><input style="display:none;" class="sp-input" type="text" spellcheck="false" placeholder=""></div><div class="sp-initial sp-thumb sp-cf"></div><div class="sp-button-container sp-cf"><a class="sp-cancel fr-command" data-cmd="cancelColor" href="#">cancel</a><button type="button" class="sp-choose fr-command" data-cmd="'+dataChooseColor+'">choose</button></div></div>'
     colors_html += '</div>';
      return colors_html
    }

    /*
     * Show the current selected color.
     */
    function _refreshColor (tab) {
      var $popup = editor.popups.get('colors.picker');
      var $element = $(editor.selection.element());

      // The color css property.
      var color_type;
      if (tab == 'background') {
        color_type = 'background-color';
      }
      else {
        color_type = 'color';
      }

      // Remove current color selection.
      $popup.find('.fr-' + tab + '-color .fr-select-color').removeClass('fr-selected-color');

      // Find the selected color.
      while ($element.get(0) != editor.$el.get(0)) {
        // Transparent or black.
        setTimeout(function() {
            initializeSpectrum(color_type, color_type == 'color' ? editor.opts.defaultColors.text.color : editor.opts.defaultColors.background.color);
        }, 0)
        if ($element.css(color_type) == 'transparent' || $element.css(color_type) == 'rgba(0, 0, 0, 0)') {
          $element = $element.parent();
        }

        // Select the correct color.
        else {
          $popup.find('.fr-' + tab + '-color .fr-select-color[data-param1="' + editor.helpers.RGBToHex($element.css(color_type)) + '"]').addClass('fr-selected-color');
          break;
        }
      }
    }

    function _setInitialColors () {
      var $element = $(editor.selection.element());
        // Check initial colors means txt color and bg color

        editor.opts.defaultColors.background.color = $element.css('background-color');
        editor.opts.defaultColors.text.color = $element.css('color');
    }

    /*
     * Change the colors' tab.
     */
    function _changeSet ($tab, val) {
      // Only on the tab that is not selected yet. On left click only.
      if (!$tab.hasClass('fr-selected-tab')) {
        // Switch selected tab.
        $tab.siblings().removeClass('fr-selected-tab');
        $tab.addClass('fr-selected-tab');

        // Switch the color set.
        $tab.parents('.fr-popup').find('.fr-color-set').removeClass('fr-selected-set');
        $tab.parents('.fr-popup').find('.fr-color-set.fr-' + val + '-color').addClass('fr-selected-set');

        // Refresh selected color.
        _refreshColor(val);
      }
    }

    /*
     * Change background color.
     */
    function background (val, init) {
      var $popup = editor.popups.get('colors.picker');
      // Set background  color.
      if (val != 'REMOVE') {
        $popup.find('input.sp-input').val(val);
        var val_hex =  editor.helpers.RGBToHex(val);
        editor.format.applyStyle('background-color', val);
        editor.selection.save();
        $(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color");

        $(".fr-command.fr-select-color[data-cmd='backgroundColor'][data-param1='"+val_hex+"']").addClass("fr-selected-color");

      }

      // Remove background color.
      else {
        $popup.find('input.sp-input').val("");
        editor.format.applyStyle('background-color', '#123456');

        editor.selection.save();
        editor.$el.find('span').each(function (index, span) {
          var $span = $(span);
          var color = $span.css('background-color');

          if (color === '#123456' || editor.helpers.RGBToHex(color) === '#123456') {
            $span.replaceWith($span.html());
          }
        });
        editor.selection.restore();
      }

      if(init){
        //editor.opts.defaultColors.background.init = false;
        initializeSpectrum("background-color", val);
      }



     // _hideColorsPopup();
    }

    /*
     * Change text color.
     */
    function text (val, init) {
      var $popup = editor.popups.get('colors.picker');
      // Set text color.
      if (val != 'REMOVE') {
        $popup.find('input.sp-input').val(val);
        var val_hex =  editor.helpers.RGBToHex(val);
        editor.format.applyStyle('color', val);
        editor.selection.save();
        $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color");
        $(".fr-command.fr-select-color[data-cmd='textColor'][data-param1='"+val_hex+"']").addClass("fr-selected-color");

      }

      // Remove text color.
      else {
        editor.format.applyStyle('color', '#123456');
        $popup.find('input.sp-input').val(val);
        editor.selection.save();
        editor.$el.find('span').each(function (index, span) {
          var $span = $(span);
          var color = $span.css('color');

          if (color === '#123456' || editor.helpers.RGBToHex(color) === '#123456') {
            $span.replaceWith($span.html());
          }
        });
        editor.selection.restore();
      }
      if(init){
            //editor.opts.defaultColors.text.init = false;
            initializeSpectrum("color", val);
        }
    }

    /*
     * Remove color.
     */
    function removeColor (tab, val) {
      var $popup = editor.popups.get('colors.picker');
      $popup.find('input.sp-input').val("");
      // Remove text color.
      if(tab === 'text') {

        $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color");
        editor.format.applyStyle('color', '#123456');

        editor.selection.save();
        editor.$el.find('span').each(function (index, span) {
          var $span = $(span);
          var color = $span.css('color');

          if (color === '#123456' || editor.helpers.RGBToHex(color) === '#123456') {
            $span.replaceWith($span.html());
          }
        });
        editor.selection.restore();
        initializeSpectrum("color");
      }
      else{
        $(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color");
        editor.format.applyStyle('background-color', '#123456');
        editor.selection.save();
        editor.$el.find('span').each(function (index, span) {
          var $span = $(span);
          var color = $span.css('background-color');

          if (color === '#123456' || editor.helpers.RGBToHex(color) === '#123456') {
            $span.replaceWith($span.html());
          }
        });
        editor.selection.restore();
        initializeSpectrum("background-color");
      }
    }

    /*
     * Remove color.
     */
    function closeColorPicker(cancel) {
        if(cancel){
            background(editor.opts.defaultColors.background.color || 'REMOVE');
            text(editor.opts.defaultColors.text.color || 'REMOVE');
        }
      _hideColorsPopup();
    }

    function chooseColorPicker(val){
        var popup = editor.popups.get('colors.picker');
        var container = val === 'text' ? popup.find(".fr-color-set.sp-container.fr-text-color") : popup.find(".fr-color-set.sp-container.fr-background-color");
        var textInput = container.find(".sp-input");
        var color = textInput.val();
        editor.selection.restore();
        if(val === 'text'){
           text(color || 'REMOVE');
        }
        else
            background(color || 'REMOVE');
        _hideColorsPopup();

    }
    function toggleSpectrum(val){
        var popup = editor.popups.get('colors.picker');
        var container = val === 'text' ? popup.find(".fr-color-set.sp-container.fr-text-color") : $(".fr-color-set.sp-container.fr-background-color"),
        toggleContainer = container.find(".sp-picker-container"),
        toggleButton = container.find(".sp-palette-toggle");
        toggleContainer.toggle();
        var isVisible = toggleContainer.is(":visible");
        if(isVisible){
            toggleButton.text("less");
            container.removeClass("no-spectrum");
        }
        else{
            toggleButton.text("more");
            container.addClass("no-spectrum");
        }
    }

    /*
     * init Spectrum.
     */
    function initializeSpectrum(val, current_color) {
        var popup = editor.popups.get('colors.picker');
        popup.find('input:focus').blur();
        var container = val === 'color' ? popup.find(".fr-color-set.sp-container.fr-text-color") : popup.find(".fr-color-set.sp-container.fr-background-color"),
        dragHelper = container.find(".sp-dragger"),
        slideHelper = container.find(".sp-slider"),
        alphaSlideHelper = container.find(".sp-alpha-handle"),
        dragger = container.find(".sp-color"),
        slider = container.find(".sp-hue"),
        alphaSlider = container.find(".sp-alpha"),
        dragWidth = dragger.width(),
        dragHeight = dragger.height(),
        dragHelperHeight = dragHelper.height(),
        slideWidth = slider.width(),
        slideHeight = slider.height(),
        slideHelperHeight = slideHelper.height(),
        alphaWidth = alphaSlider.width(),
        alphaSlideHelperWidth = alphaSlideHelper.width(),
        alphaSliderInner = container.find(".sp-alpha-inner"),
        draggingClass = "sp-dragging",
        shiftMovementDirection = null,
        isEmpty = true,
        isDragging = false,
        currentHue = 0,
        currentSaturation = 0,
        currentValue = 0,
        currentAlpha = 1,
        textInput = container.find(".sp-input");
        txtInputFocus(textInput, val);
        draggable(alphaSlider, function (dragX, dragY, e) {

                currentAlpha = (dragX / alphaWidth);
                isEmpty = false;
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
        }, dragStart, dragStop);

        draggable(slider, function (dragX, dragY) {

            currentHue = parseFloat(dragY / slideHeight);
            isEmpty = false;
            move();
        }, dragStart, dragStop);

        draggable(dragger, function (dragX, dragY, e) {

            currentSaturation = parseFloat(dragX / dragWidth);

            currentValue = parseFloat((dragHeight - dragY) / dragHeight);

            isEmpty = false;

            move();
        }, dragStart, dragStop);

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            isDragging = true;
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            //boundElement.trigger('dragstart.spectrum', [ get() ]);
        }

        function dragStop() {
            isDragging = false;
            container.removeClass(draggingClass);
            //boundElement.trigger('dragstop.spectrum', [ get() ]);
        }

        function move() {
            updateUI(val);
        }

        function reflow() {
            updateHelperLocations();
        }

        function updateUI(val, update) {

            updateHelperLocations();

            if(isEmpty)
                return;

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)


            var realColor = get();

            if (!realColor) {
                return;
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();
                    if(!update){
                        if(val === 'color')
                            text(realRgb);
                        else
                            background(realRgb);
                    }

                // Update the replaced elements background color (with actual selected color)

                    var rgb = realColor.toRgb();
                    rgb.a = 0;
                    var realAlpha = tinycolor(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (editor.opts.isIE) {
                        alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        alphaSliderInner.css("background", "-webkit-" + gradient);
                        alphaSliderInner.css("background", "-moz-" + gradient);
                        alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
            }
        }

        function get(opts) {

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: 'rgb' });
        }

        function set(color, update) {
            if (tinycolor.equals(color, get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                updateUI(val, update);
                return;
            }

            var newColor, newHsv;
            if (!color) {
                isEmpty = true;
            } else {
                isEmpty = false;
                newColor = tinycolor(color);
                newHsv = newColor.toHsv();

                currentHue = (newHsv.h % 360) / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                currentAlpha = newHsv.a;
            }
            updateUI(val, update);
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            if(isEmpty) {
                //if selected color is empty, hide the helpers
                alphaSlideHelper.hide();
                slideHelper.hide();
                dragHelper.hide();
            }
            else {
                //make sure helpers are visible
                alphaSlideHelper.show();
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = s * dragWidth;
                var dragY = dragHeight - (v * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                var alphaX = currentAlpha * alphaWidth;
                alphaSlideHelper.css({
                    "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (currentHue) * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        if(current_color){
            set(current_color, true);
            move();
        }
        else
        {
            isEmpty = true;
            move();
        }
        //textInput.show();
    }

    /*
     * Go back to the inline editor.
     */
    function back () {
      editor.popups.hide('colors.picker');
      editor.toolbar.showInline();
    }

    function txtInputFocus(element, val){
        $(element).off("keypress").on("keypress", function(e){
            if(e.which == 13) {
                //e.preventDefault();
                //e.stopPropagation();
                var realRgb = $(element).val();
                editor.selection.restore();
                if(val === 'color')
                    text(realRgb, true);
                else
                    background(realRgb, true);
                _hideColorsPopup();
            }
        });

    }

    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            editor.events.disableBlur();
            editor.selection.restore();
            if (dragging) {
                // Mouseup happened outside of window
                if (editor.opts.isIE && doc.documentMode < 9 && !e.button) {
                    return stop();
                }

                var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
                var pageX = t0 && t0.pageX || e.pageX;
                var pageY = t0 && t0.pageY || e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
                //editor.popups.show('colors.picker');
            }
        }

        function start(e) {

            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");

                // Wait a tick before notifying observers to allow the click event
                // to fire in Chrome.
                setTimeout(function() {
                    onstop.apply(element, arguments);
                }, 0);
            }
            dragging = false;
        }


        $(element).off("touchstart mousedown").on("touchstart mousedown", start);
        $(element).off("touchend mouseup").on("touchend mouseup", stop);
        var $popup = editor.popups.get('colors.picker');
        $popup.on("touchend mouseup", stop);
    }

    return {
      showColorsPopup: _showColorsPopup,
      hideColorsPopup: _hideColorsPopup,
      changeSet: _changeSet,
      background: background,
      text: text,
      back: back,
      removeColor: removeColor,
      chooseColorPicker: chooseColorPicker,
      closeColorPicker: closeColorPicker,
      initializeSpectrum: initializeSpectrum,
      toggleSpectrum: toggleSpectrum
    }
  }

  // Toolbar colors button.
  a.FroalaEditor.DefineIcon('colors', { NAME: 'tint' });
  a.FroalaEditor.RegisterCommand('color', {
    title: 'Colors',
    undo: false,
    focus: true,
    refreshOnCallback: false,
    popup: true,
    callback: function () {

      if (!this.popups.isVisible('colors.picker')) {
        this.colors.showColorsPopup();
      }
      else {
        if (this.$el.find('.fr-marker')) {
          this.events.disableBlur();
          this.selection.restore();
        }
        this.popups.hide('colors.picker');
      }
    },
    plugin: 'colors'
  });

  // Select text color command.
  a.FroalaEditor.RegisterCommand('textColor', {
    undo: true,
    callback: function (cmd, val) {
        //this.events.disableBlur();
        this.selection.restore();
        this.colors.text(val, true);
    }
  });

  // Select background color command.
  a.FroalaEditor.RegisterCommand('backgroundColor', {
    undo: true,
    callback: function (cmd, val) {
        //this.events.disableBlur();
        this.selection.restore();
        this.colors.background(val, true);
    }
  });

  a.FroalaEditor.RegisterCommand('colorChangeSet', {
    undo: false,
    focus: false,
    callback: function (cmd, val) {
      var $tab = this.popups.get('colors.picker').find('.fr-command[data-cmd="' + cmd + '"][data-param1="' + val + '"]');
      this.colors.changeSet($tab, val);
    }
  });

  // Clear text color selection
  a.FroalaEditor.RegisterCommand('clearTextColor', {
    undo: false,
    focus: false,
    callback: function (cmd, val) {
      var $tab = this.popups.get('colors.picker').find('.fr-command[data-cmd="' + cmd + '"][data-param1="' + val + '"]');
      this.colors.removeColor('text', val);
    }
  });

  // Clear bg color selection
  a.FroalaEditor.RegisterCommand('clearBackgroundColor', {
    undo: false,
    focus: false,
    callback: function (cmd, val) {
      var $tab = this.popups.get('colors.picker').find('.fr-command[data-cmd="' + cmd + '"][data-param1="' + val + '"]');
      this.colors.removeColor('background', val);
    }
  });


  // Choose text color picker
  a.FroalaEditor.RegisterCommand('chooseTextColor', {
    undo: false,
    focus: false,
    callback: function (cmd, val) {
      this.colors.chooseColorPicker("text");
    }
  });

  // Choose bg color picker
  a.FroalaEditor.RegisterCommand('chooseBGColor', {
    undo: false,
    focus: false,
    callback: function (cmd, val) {
      this.colors.chooseColorPicker("background");
    }
  });

  // Cancel current color selection
  a.FroalaEditor.RegisterCommand('cancelColor', {
    undo: false,
    focus: false,
    callback: function (cmd, val) {
      this.colors.closeColorPicker(true);
    }
  });



  //on initialize text Spectrum
  a.FroalaEditor.RegisterCommand('textColorSpectrum', {
    undo: false,
    focus: false,
    callback: function (cmd) {
      this.colors.initializeSpectrum("text", true);
    }
  });

//on initialize bg Spectrum
  a.FroalaEditor.RegisterCommand('bgColorSpectrum', {
    undo: false,
    focus: false,
    callback: function (cmd) {
      this.colors.initializeSpectrum("background", true);
    }
  });

  //toggle text Spectrum
  a.FroalaEditor.RegisterCommand('toggleTextSpectrum', {
    undo: false,
    focus: false,
    callback: function (cmd) {
      this.colors.toggleSpectrum("text");
    }
  });

  //toggle bg Spectrum
  a.FroalaEditor.RegisterCommand('toggleBgSpectrum', {
    undo: false,
    focus: false,
    callback: function (cmd) {
      this.colors.toggleSpectrum("background");
    }
  });




  // Colors back.
  a.FroalaEditor.DefineIcon('colorsBack', { NAME: 'arrow-left' });
  a.FroalaEditor.RegisterCommand('colorsBack', {
    title: 'Back',
    undo: false,
    focus: false,
    back: true,
    refreshAfterCallback: false,
    callback: function () {
      this.colors.back();
    }
  });

}));
