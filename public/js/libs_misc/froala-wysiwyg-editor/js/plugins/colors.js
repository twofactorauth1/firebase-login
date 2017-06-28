! function (a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function (b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function (a) {
    "use strict";
    a.extend(a.FE.POPUP_TEMPLATES, {
        "colors.picker": "[_BUTTONS_][_TEXT_COLORS_][_BACKGROUND_COLORS_]"
    }), a.extend(a.FE.DEFAULTS, {
        colorsText: ["#61BD6D", "#1ABC9C", "#54ACD2", "#2C82C9", "#9365B8", "#475577", "#CCCCCC", "#41A85F", "#00A885", "#3D8EB9", "#2969B0", "#553982", "#28324E", "#000000", "#F7DA64", "#FBA026", "#EB6B56", "#E25041", "#A38F84", "#EFEFEF", "#FFFFFF", "#FAC51C", "#F37934", "#D14841", "#B8312F", "#7C706B", "#D1D5D8", "REMOVE"]
        , colorsBackground: ["#61BD6D", "#1ABC9C", "#54ACD2", "#2C82C9", "#9365B8", "#475577", "#CCCCCC", "#41A85F", "#00A885", "#3D8EB9", "#2969B0", "#553982", "#28324E", "#000000", "#F7DA64", "#FBA026", "#EB6B56", "#E25041", "#A38F84", "#EFEFEF", "#FFFFFF", "#FAC51C", "#F37934", "#D14841", "#B8312F", "#7C706B", "#D1D5D8", "REMOVE"]
        , colorsStep: 7
        , colorsDefaultTab: "text"
        , colorsButtons: ["colorsBack", "|", "-"]
        , defaultColors: {
            background: {
                init: !1
                , color: ""
            }
            , text: {
                init: !1
                , color: ""
            }
        }
        , isIE: document.documentMode || /Edge/.test(navigator.userAgent)
        , isButton: !1
        , selectedElement: {
            color: ""
            , bg: ""
        }
    }), a.FE.PLUGINS.colors = function (a) {
        function b() {
            var b = a.$tb.find('.fr-command[data-cmd="color"]');
            a.opts.selectedElement.bg = "", a.opts.selectedElement.color = "";
            var c = a.popups.get("colors.picker");
            if (c || (c = d()), !c.hasClass("fr-active")) {
                a.popups.setContainer("colors.picker", a.$tb), g(c.find(".fr-selected-tab").attr("data-param1"));
                var e = b.offset().left + b.outerWidth() / 2
                    , f = b.offset().top + (a.opts.toolbarBottom ? 10 : b.outerHeight() - 10);
                a.popups.show("colors.picker", e, f, b.outerHeight()), a.opts.isIE ? ($(".fr-popup").find(".sp-input").hide(), $(".fr-popup").find(".sp-palette-toggle").hide(), $(".fr-popup").find(".sp-picker-container").hide()) : $(".sp-input").show(), h()
            }
        }

        function c() {
            a.opts.selectedElement.bg = "", a.opts.selectedElement.color = "", a.popups.hide("colors.picker")
        }

        function d() {
            var b = '<div class="fr-buttons fr-colors-buttons">';
            a.opts.toolbarInline && a.opts.colorsButtons.length > 0 && (b += a.button.buildList(a.opts.colorsButtons)), b += e() + "</div>";
            var c = {
                    buttons: b
                    , text_colors: f("text")
                    , background_colors: f("background")
                }
                , d = a.popups.create("colors.picker", c);
            return d
        }

        function e() {
            var b = '<div class="fr-colors-tabs">';
            return b += '<span class="fr-colors-tab ' + ("background" == a.opts.colorsDefaultTab ? "" : "fr-selected-tab ") + 'fr-command" data-param1="text" data-cmd="colorChangeSet" title="' + a.language.translate("Text") + '">' + a.language.translate("Text") + "</span>", b += '<span class="fr-colors-tab ' + ("background" == a.opts.colorsDefaultTab ? "fr-selected-tab " : "") + 'fr-command" data-param1="background" data-cmd="colorChangeSet" title="' + a.language.translate("Background") + '">' + a.language.translate("Background") + "</span>", b + "</div>"
        }

        function f(b) {
            var c = "text" == b ? a.opts.colorsText : a.opts.colorsBackground
                , d = "text" == b ? "clearTextColor" : "clearBackgroundColor"
                , e = "text" == b ? "textColorSpectrum" : "bgColorSpectrum"
                , f = "text" == b ? "toggleTextSpectrum" : "toggleBgSpectrum"
                , g = "text" == b ? "chooseTextColor" : "chooseBGColor"
                , h = '<div class="sp-container sp-light sp-alpha-enabled sp-clear-enabled sp-initial-disabled fr-color-set fr-' + b + "-color" + (a.opts.colorsDefaultTab == b || "text" != a.opts.colorsDefaultTab && "background" != a.opts.colorsDefaultTab && "text" == b ? " fr-selected-set" : "") + '">';
            h += '<div class="color-inner-row">';
            for (var i = 0; i < c.length; i++) 0 !== i && i % a.opts.colorsStep === 0 && (h += "<br>"), h += "REMOVE" != c[i] ? '<span class="fr-command fr-select-color" style="background: ' + c[i] + ';" data-cmd="' + b + 'Color" data-param1="' + c[i] + '"></span>' : a.opts.isIE ? '<span class="fr-command fr-select-color" data-cmd="' + b + 'Color" data-param1="REMOVE" title="' + a.language.translate("Clear Formatting") + '"><i class="fa fa-eraser"></i></span>' : '<span style="visibility: hidden;" class="fr-command fr-select-color" data-cmd="' + b + 'Color" data-param1="REMOVE" title="' + a.language.translate("Clear Formatting") + '"><i class="fa fa-eraser"></i></span>';
            return h += '<div class="sp-palette-button-container sp-cf"><button type="button" class="sp-palette-toggle fr-command" data-cmd="' + f + '">less</button></div>', h += "</div>", h += '<div class="sp-picker-container"><div class="sp-top sp-cf"><div class="sp-fill"></div><div class="sp-top-inner"><div class="sp-color fr-command" data-cmd="' + e + '" style="background-color: rgb(255, 0, 0);"><div class="sp-sat"><div class="sp-val"><div class="sp-dragger" style="display: none;"></div></div></div></div><div class="sp-clear sp-clear-display fr-command" data-cmd="' + d + '" title="Clear Color Selection"></div><div class="sp-hue"><div class="sp-slider" style="display: none;"></div></div></div><div class="sp-alpha"><div class="sp-alpha-inner"><div class="sp-alpha-handle" style="display: none;"></div></div></div></div><div class="sp-input-container sp-cf"><input style="display:none;" class="sp-input" type="text" spellcheck="false" placeholder=""></div><div class="sp-initial sp-thumb sp-cf"></div><div class="sp-button-container sp-cf"><a class="sp-cancel fr-command" data-cmd="cancelAndCloseColor" href="javascript:void(0)">cancel</a><button type="button" class="sp-choose fr-command" data-cmd="' + g + '">choose</button></div></div>', h += "</div>"
        }

        function g(b) {
            var c = a.popups.get("colors.picker")
                , d = $(a.selection.element())
                , e = $(a.selection.element())
                , f = d.hasClass("ssb-theme-btn");
            f ? a.opts.button = d : (f = d.parent().hasClass("ssb-theme-btn"), f && (a.opts.button = d.parent())), a.opts.isButton = f;
            var h, g = "";
            for ("background" == b ? (h = "background-color", g = a.opts.selectedElement.bg || d.css(h)) : (h = "color", g = a.opts.selectedElement.color || d.css(h)), a.opts.isButton && (g = a.opts.button.css(h)), c.find(".fr-" + b + "-color .fr-select-color").removeClass("fr-selected-color"), a.opts.isButton && (g = a.opts.button.css(h), setTimeout(function () {
                    p(h, g)
                }, 0)); d.get(0) != a.$el.get(0) && !a.opts.selectedElement.color && !a.opts.isButton;) {
                if ("transparent" != d.css("color") && "rgba(0, 0, 0, 0)" != d.css("color")) {
                    a.opts.selectedElement.color = d.css("color");
                    var i = "";
                    i = "background" == b ? a.opts.selectedElement.bg : a.opts.selectedElement.color, c.find(".fr-" + b + '-color .fr-select-color[data-param1="' + a.helpers.RGBToHex(i) + '"]').addClass("fr-selected-color");
                    break
                }
                d = d.parent()
            }
            for (var d = e; d.get(0) != a.$el.get(0) && !a.opts.selectedElement.bg && !a.opts.isButton;) {
                if ("transparent" != d.css("background-color") && "rgba(0, 0, 0, 0)" != d.css("background-color")) {
                    a.opts.selectedElement.bg = d.css("background-color");
                    var i = "";
                    i = "background" == b ? a.opts.selectedElement.bg : a.opts.selectedElement.color, c.find(".fr-" + b + '-color .fr-select-color[data-param1="' + a.helpers.RGBToHex(i) + '"]').addClass("fr-selected-color");
                    break
                }
                d = d.parent()
            }
            if (!a.opts.isButton) {
                var i = "";
                i = "background" == b ? a.opts.selectedElement.bg : a.opts.selectedElement.color, setTimeout(function () {
                    p(h, i)
                }, 0)
            }
        }

        function h() {
            var b = $(a.selection.element());
            if (a.opts.isButton) a.opts.defaultColors.background.color = a.opts.button.css("background-color"), a.opts.defaultColors.text.color = a.opts.button.css("color");
            else {
                for (; b.get(0) != a.$el.get(0) && ("transparent" == b.css("background-color") || "rgba(0, 0, 0, 0)" == b.css("background-color"));) b = b.parent();
                a.opts.defaultColors.text.color = b.css("color"), a.opts.defaultColors.background.color = b.css("background-color")
            }
        }

        function i(a, b) {
            a.hasClass("fr-selected-tab") || (a.siblings().removeClass("fr-selected-tab"), a.addClass("fr-selected-tab"), a.parents(".fr-popup").find(".fr-color-set").removeClass("fr-selected-set"), a.parents(".fr-popup").find(".fr-color-set.fr-" + b + "-color").addClass("fr-selected-set"), g(b))
        }

        function j(b, c) {
            var d = a.popups.get("colors.picker");
            if ("REMOVE" != b) {
                d.find("input.sp-input").val(b);
                var e = a.helpers.RGBToHex(b);
                e || a.helpers.RGBToHex("#" + b) && (e = a.helpers.RGBToHex("#" + b), b = "#" + b), a.opts.isButton ? a.opts.button.css("background-color", b) : ($(a.$el).find("span") && $(a.$el).find("span").length && $(a.$el).find("span").removeClass("ssb-bg-color-inline-block"), a.format.applyStyle("background-color", b), $(a.$el).find("span").filter(function () {
                    var a = $(this).css("background-color");
                    return "transparent" != a && "rgba(0, 0, 0, 0)" != a
                }).addClass("ssb-bg-color-inline-block")), a.opts.isButton && a.events.trigger("bgColorChange", [b]), a.opts.selectedElement.bg = b, $(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color"), $(".fr-command.fr-select-color[data-cmd='backgroundColor'][data-param1='" + e + "']").addClass("fr-selected-color")
            }
            else d.find("input.sp-input").val(""), a.opts.isButton ? a.opts.button.css("background-color", "") : a.opts.isIE ? $(a.selection.element()).css("background-color", "") : a.format.removeStyle("background-color"), $(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color"), a.opts.isButton && a.events.trigger("bgColorChange", []), setTimeout(function () {
                a.events.trigger("contentChanged")
            });
            c && p("background-color", b)
        }

        function k(b, c) {
            var d = a.popups.get("colors.picker");
            if ("REMOVE" != b) {
                d.find("input.sp-input").val(b);
                var e = a.helpers.RGBToHex(b);
                e || a.helpers.RGBToHex("#" + b) && (e = a.helpers.RGBToHex("#" + b), b = "#" + b), a.opts.isButton ? $(a.selection.element()).css("color", b) : a.format.applyStyle("color", b), a.opts.selectedElement.color = b, a.opts.isButton && a.events.trigger("txtColorChange", [b]), setTimeout(function () {}), $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color"), $(".fr-command.fr-select-color[data-cmd='textColor'][data-param1='" + e + "']").addClass("fr-selected-color")
            }
            else a.opts.isButton ? a.opts.button.css("color", "") : a.opts.isIE ? $(a.selection.element()).css("color", "") : a.format.removeStyle("color"), $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color"), a.opts.isButton && a.events.trigger("bgColorChange", []), d.find("input.sp-input").val(""), setTimeout(function () {
                a.events.trigger("contentChanged")
            });
            c && p("color", b)
        }

        function l(b, c) {
            var d = a.popups.get("colors.picker");
            d.find("input.sp-input").val(""), "text" === b ? (a.opts.selectedElement.bg = "", $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color"), a.opts.isButton ? a.opts.button.css("color", "") : a.format.removeStyle("color"), a.opts.isButton && a.events.trigger("txtColorChange", []), setTimeout(function () {
                a.events.trigger("contentChanged"), m()
            })) : ($(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color"), a.opts.selectedElement.color = "", a.opts.isButton ? a.opts.button.css("background-color", "") : a.format.removeStyle("background-color"), a.opts.isButton && a.events.trigger("bgColorChange", []), setTimeout(function () {
                a.events.trigger("contentChanged"), m()
            }))
        }

        function m(b) {
            b && (j(a.opts.defaultColors.background.color || "REMOVE"), k(a.opts.defaultColors.text.color || "REMOVE")), c()
        }

        function n(b) {
            var d = a.popups.get("colors.picker")
                , e = "text" === b ? d.find(".fr-color-set.sp-container.fr-text-color") : d.find(".fr-color-set.sp-container.fr-background-color")
                , f = e.find(".sp-input")
                , g = f.val();
            a.selection.restore(), "text" === b ? k(g || "REMOVE") : j(g || "REMOVE"), c()
        }

        function o(b) {
            var c = a.popups.get("colors.picker")
                , d = "text" === b ? c.find(".fr-color-set.sp-container.fr-text-color") : $(".fr-color-set.sp-container.fr-background-color")
                , e = d.find(".sp-picker-container")
                , f = d.find(".sp-palette-toggle");
            e.toggle();
            var g = e.is(":visible");
            g ? (f.text("less"), d.removeClass("no-spectrum")) : (f.text("more"), d.addClass("no-spectrum"))
        }

        function p(b, c) {
            function H() {
                (o <= 0 || n <= 0 || t <= 0) && K(), B = !0, e.addClass(y), z = null
            }

            function I() {
                B = !1, e.removeClass(y)
            }

            function J() {
                L(b)
            }

            function K() {
                O()
            }

            function L(b, c) {
                if (O(), !A) {
                    var d = tinycolor.fromRatio({
                        h: C
                        , s: 1
                        , v: 1
                    });
                    i.css("background-color", d.toHexString());
                    var e = M();
                    if (e) {
                        var f = e.toHexString()
                            , g = e.toRgbString();
                        c || ("color" === b ? k(g) : j(g));
                        var h = e.toRgb();
                        h.a = 0;
                        var l = tinycolor(h).toRgbString()
                            , m = "linear-gradient(left, " + l + ", " + f + ")";
                        a.opts.isIE ? x.css("filter", tinycolor(l).toFilter({
                            gradientType: 1
                        }, f)) : (x.css("background", "-webkit-" + m), x.css("background", "-moz-" + m), x.css("background", "-ms-" + m), x.css("background", "linear-gradient(to right, " + l + ", " + f + ")"))
                    }
                }
            }

            function M(a) {
                return tinycolor.fromRatio({
                    h: C
                    , s: D
                    , v: E
                    , a: Math.round(100 * F) / 100
                }, {
                    format: "rgb"
                })
            }

            function N(a, c) {
                if (tinycolor.equals(a, M())) return void L(b, c);
                var d, e;
                a ? (A = !1, d = tinycolor(a), e = d.toHsv(), C = e.h % 360 / 360, D = e.s, E = e.v, F = e.a) : A = !0, L(b, c)
            }

            function O() {
                var a = D
                    , b = E;
                if (A) h.hide(), g.hide(), f.hide();
                else {
                    h.show(), g.show(), f.show();
                    var c = a * n
                        , d = o - b * o;
                    c = Math.max(-p, Math.min(n - p, c - p)), d = Math.max(-p, Math.min(o - p, d - p)), f.css({
                        top: d + "px"
                        , left: c + "px"
                    });
                    var e = F * v;
                    h.css({
                        left: e - w / 2 + "px"
                    });
                    var i = C * t;
                    g.css({
                        top: i - u + "px"
                    })
                }
            }
            var d = a.popups.get("colors.picker");
            d.find("input:focus").blur();
            var e = "color" === b ? d.find(".fr-color-set.sp-container.fr-text-color") : d.find(".fr-color-set.sp-container.fr-background-color")
                , f = e.find(".sp-dragger")
                , g = e.find(".sp-slider")
                , h = e.find(".sp-alpha-handle")
                , i = e.find(".sp-color")
                , l = e.find(".sp-hue")
                , m = e.find(".sp-alpha")
                , n = i.width()
                , o = i.height()
                , p = f.height()
                , t = (l.width(), l.height())
                , u = g.height()
                , v = m.width()
                , w = h.width()
                , x = e.find(".sp-alpha-inner")
                , y = "sp-dragging"
                , z = null
                , A = !0
                , B = !1
                , C = 0
                , D = 0
                , E = 0
                , F = 1
                , G = e.find(".sp-input");
            r(G, b), s(m, function (a, b, c) {
                F = a / v, A = !1, c.shiftKey && (F = Math.round(10 * F) / 10), J()
            }, H, I), s(l, function (a, b) {
                C = parseFloat(b / t), A = !1, J()
            }, H, I), s(i, function (a, b, c) {
                D = parseFloat(a / n), E = parseFloat((o - b) / o), A = !1, J()
            }, H, I), c ? (N(c, !0), J()) : (A = !0, J())
        }

        function q() {
            var b = a.link.get();
            b ? a.link.back() : (a.popups.hide("colors.picker"), a.toolbar.showInline())
        }

        function r(b, d) {
            $(b).off("keypress").on("keypress", function (e) {
                if (13 == e.which) {
                    var f = $(b).val();
                    a.selection.restore(), "color" === d ? k(f, !0) : j(f, !0), c()
                }
            }), $(b).off("focus").on("focus", function (b) {
                a.selection.save()
            })
        }

        function s(b, c, d, e) {
            function m(a) {
                a.stopPropagation && a.stopPropagation(), a.preventDefault && a.preventDefault(), a.returnValue = !1
            }

            function n(d) {
                if (a.events.disableBlur(), g) {
                    if (a.opts.isIE && f.documentMode < 9 && !d.button) return p();
                    var e = d.originalEvent && d.originalEvent.touches && d.originalEvent.touches[0]
                        , l = e && e.pageX || d.pageX
                        , n = e && e.pageY || d.pageY
                        , o = Math.max(0, Math.min(l - h.left, j))
                        , q = Math.max(0, Math.min(n - h.top, i));
                    k && m(d), c.apply(b, [o, q, d])
                }
            }

            function o(c) {
                var e = c.which ? 3 == c.which : 2 == c.button;
                if (!e && !g && d.apply(b, arguments) !== !1) {
                    g = !0, i = $(b).height(), j = $(b).width(), h = $(b).offset(), $(f).bind(l), $(f.body).addClass("sp-dragging"), n(c);
                    var k = a.popups.get("colors.picker");
                    k.find("input").addClass("disabled"), m(c)
                }
            }

            function p() {
                if (g) {
                    var c = a.popups.get("colors.picker");
                    c.find("input").removeClass("disabled"), $(f).unbind(l), $(f.body).removeClass("sp-dragging"), setTimeout(function () {
                        e.apply(b, arguments)
                    }, 0)
                }
                g = !1
            }
            c = c || function () {}, d = d || function () {}, e = e || function () {};
            var f = document
                , g = !1
                , h = {}
                , i = 0
                , j = 0
                , k = "ontouchstart" in window
                , l = {};
            l.selectstart = m, l.dragstart = m, l["touchmove mousemove"] = n, l["touchend mouseup"] = p, $(b).off("touchstart mousedown").on("touchstart mousedown", o), $(b).off("touchend mouseup mouseleave").on("touchend mouseup", p), $(f).bind("click", p)
        }
        return {
            showColorsPopup: b
            , hideColorsPopup: c
            , changeSet: i
            , background: j
            , text: k
            , back: q
            , removeColor: l
            , chooseColorPicker: n
            , closeColorPicker: m
            , initializeSpectrum: p
            , toggleSpectrum: o
        }
    }, a.FE.DefineIcon("colors", {
        NAME: "tint"
    }), a.FE.RegisterCommand("color", {
        title: "Colors"
        , undo: !1
        , focus: !0
        , refreshOnCallback: !1
        , popup: !0
        , callback: function () {
            this.popups.isVisible("colors.picker") ? (this.$el.find(".fr-marker") && (this.events.disableBlur(), this.selection.restore()), this.popups.hide("colors.picker")) : this.colors.showColorsPopup()
        }
        , plugin: "colors"
    }), a.FE.RegisterCommand("textColor", {
        undo: !0
        , callback: function (a, b) {
            this.events.disableBlur(), this.selection.restore(), this.colors.text(b, !0);
            var selection = $(this.selection.element());
            if(selection[0].tagName!="A"){
                selection.find('a.btn').css("color",b);
            }
        }
    }), a.FE.RegisterCommand("backgroundColor", {
        undo: !0
        , callback: function (a, b) {
            this.events.disableBlur(), this.selection.restore(), this.colors.background(b, !0)
        }
    }), a.FE.RegisterCommand("colorChangeSet", {
        undo: !1
        , focus: !1
        , callback: function (a, b) {
            var c = this.popups.get("colors.picker").find('.fr-command[data-cmd="' + a + '"][data-param1="' + b + '"]');
            this.colors.changeSet(c, b)
        }
    }), a.FE.RegisterCommand("clearTextColor", {
        undo: !1
        , focus: !1
        , callback: function (a, b) {
            this.popups.get("colors.picker").find('.fr-command[data-cmd="' + a + '"][data-param1="' + b + '"]');
            this.colors.removeColor("text", b)
        }
    }), a.FE.RegisterCommand("clearBackgroundColor", {
        undo: !1
        , focus: !1
        , callback: function (a, b) {
            this.popups.get("colors.picker").find('.fr-command[data-cmd="' + a + '"][data-param1="' + b + '"]');
            this.colors.removeColor("background", b)
        }
    }), a.FE.RegisterCommand("chooseTextColor", {
        undo: !1
        , focus: !1
        , callback: function (a, b) {
            this.colors.chooseColorPicker("text")
        }
    }), a.FE.RegisterCommand("chooseBGColor", {
        undo: !1
        , focus: !1
        , callback: function (a, b) {
            this.colors.chooseColorPicker("background")
        }
    }), a.FE.RegisterCommand("cancelAndCloseColor", {
        undo: !1
        , focus: !1
        , callback: function (a, b) {
            this.colors.closeColorPicker(!0)
        }
    }), a.FE.RegisterCommand("textColorSpectrum", {
        undo: !0
        , focus: !1
        , callback: function (a) {
            this.colors.initializeSpectrum("text", !0)
        }
    }), a.FE.RegisterCommand("bgColorSpectrum", {
        undo: !0
        , focus: !1
        , callback: function (a) {
            this.colors.initializeSpectrum("background", !0)
        }
    }), a.FE.RegisterCommand("toggleTextSpectrum", {
        undo: !1
        , focus: !1
        , callback: function (a) {
            this.colors.toggleSpectrum("text")
        }
    }), a.FE.RegisterCommand("toggleBgSpectrum", {
        undo: !1
        , focus: !1
        , callback: function (a) {
            this.colors.toggleSpectrum("background")
        }
    }), a.FE.DefineIcon("colorsBack", {
        NAME: "arrow-left"
    }), a.FE.RegisterCommand("colorsBack", {
        title: "Back"
        , undo: !1
        , focus: !1
        , back: !0
        , refreshAfterCallback: !1
        , callback: function () {
            this.colors.back()
        }
    })
});
