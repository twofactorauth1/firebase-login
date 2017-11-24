! function(o) {
    "function" == typeof define && define.amd ? define(["jquery"], o) : "object" == typeof module && module.exports ? module.exports = function(t, e) {
        return void 0 === e && (e = "undefined" != typeof window ? require("jquery") : require("jquery")(t)), o(e), e
    } : o(jQuery)
}(function(o) {
    "use strict";
    o.extend(o.FE.POPUP_TEMPLATES, {
        "colors.picker": "[_BUTTONS_][_TEXT_COLORS_][_BACKGROUND_COLORS_]"
    }), o.extend(o.FE.DEFAULTS, {
        colorsText: ["#61BD6D", "#1ABC9C", "#54ACD2", "#2C82C9", "#9365B8", "#475577", "#CCCCCC", "#41A85F", "#00A885", "#3D8EB9", "#2969B0", "#553982", "#28324E", "#000000", "#F7DA64", "#FBA026", "#EB6B56", "#E25041", "#A38F84", "#EFEFEF", "#FFFFFF", "#FAC51C", "#F37934", "#D14841", "#B8312F", "#7C706B", "#D1D5D8", "REMOVE"],
        colorsBackground: ["#61BD6D", "#1ABC9C", "#54ACD2", "#2C82C9", "#9365B8", "#475577", "#CCCCCC", "#41A85F", "#00A885", "#3D8EB9", "#2969B0", "#553982", "#28324E", "#000000", "#F7DA64", "#FBA026", "#EB6B56", "#E25041", "#A38F84", "#EFEFEF", "#FFFFFF", "#FAC51C", "#F37934", "#D14841", "#B8312F", "#7C706B", "#D1D5D8", "REMOVE"],
        colorsStep: 7,
        colorsDefaultTab: "text",
        colorsButtons: ["colorsBack", "|", "-"],
        defaultColors: {
            background: {
                init: !1,
                color: ""
            },
            text: {
                init: !1,
                color: ""
            }
        },
        isIE: document.documentMode || /Edge/.test(navigator.userAgent),
        isButton: !1,
        selectedElement: {
            color: "",
            bg: ""
        }
    }), o.FE.PLUGINS.colors = function(o) {
        function t() {
            o.opts.selectedElement.bg = "", o.opts.selectedElement.color = "", o.popups.hide("colors.picker")
        }

        function e() {
            var t = '<div class="fr-buttons fr-colors-buttons">';
            o.opts.toolbarInline && o.opts.colorsButtons.length > 0 && (t += o.button.buildList(o.opts.colorsButtons));
            var e = {
                buttons: t += s() + "</div>",
                text_colors: r("text"),
                background_colors: r("background")
            };
            return o.popups.create("colors.picker", e)
        }

        function s() {
            var t = '<div class="fr-colors-tabs">';
            return t += '<span class="fr-colors-tab ' + ("background" == o.opts.colorsDefaultTab ? "" : "fr-selected-tab ") + 'fr-command" data-param1="text" data-cmd="colorChangeSet" title="' + o.language.translate("Text") + '">' + o.language.translate("Text") + "</span>", (t += '<span class="fr-colors-tab ' + ("background" == o.opts.colorsDefaultTab ? "fr-selected-tab " : "") + 'fr-command" data-param1="background" data-cmd="colorChangeSet" title="' + o.language.translate("Background") + '">' + o.language.translate("Background") + "</span>") + "</div>"
        }

        function r(t) {
            var e = "text" == t ? o.opts.colorsText : o.opts.colorsBackground,
                s = "text" == t ? "clearTextColor" : "clearBackgroundColor",
                r = "text" == t ? "textColorSpectrum" : "bgColorSpectrum",
                c = "text" == t ? "toggleTextSpectrum" : "toggleBgSpectrum",
                n = "text" == t ? "chooseTextColor" : "chooseBGColor",
                l = '<div class="sp-container sp-light sp-alpha-enabled sp-clear-enabled sp-initial-disabled fr-color-set fr-' + t + "-color" + (o.opts.colorsDefaultTab == t || "text" != o.opts.colorsDefaultTab && "background" != o.opts.colorsDefaultTab && "text" == t ? " fr-selected-set" : "") + '">';
            l += '<div class="color-inner-row">';
            for (var a = 0; a < e.length; a++) 0 !== a && a % o.opts.colorsStep == 0 && (l += "<br>"), l += "REMOVE" != e[a] ? '<span class="fr-command fr-select-color" style="background: ' + e[a] + ';" data-cmd="' + t + 'Color" data-param1="' + e[a] + '"></span>' : o.opts.isIE ? '<span class="fr-command fr-select-color" data-cmd="' + t + 'Color" data-param1="REMOVE" title="' + o.language.translate("Clear Formatting") + '"><i class="fa fa-eraser"></i></span>' : '<span style="visibility: hidden;" class="fr-command fr-select-color" data-cmd="' + t + 'Color" data-param1="REMOVE" title="' + o.language.translate("Clear Formatting") + '"><i class="fa fa-eraser"></i></span>';
            return l += '<div class="sp-palette-button-container sp-cf"><button type="button" class="sp-palette-toggle fr-command" data-cmd="' + c + '">less</button></div>', l += "</div>", l += '<div class="sp-picker-container"><div class="sp-top sp-cf"><div class="sp-fill"></div><div class="sp-top-inner"><div class="sp-color fr-command" data-cmd="' + r + '" style="background-color: rgb(255, 0, 0);"><div class="sp-sat"><div class="sp-val"><div class="sp-dragger" style="display: none;"></div></div></div></div><div class="sp-clear sp-clear-display fr-command" data-cmd="' + s + '" title="Clear Color Selection"></div><div class="sp-hue"><div class="sp-slider" style="display: none;"></div></div></div><div class="sp-alpha"><div class="sp-alpha-inner"><div class="sp-alpha-handle" style="display: none;"></div></div></div></div><div class="sp-input-container sp-cf"><input style="display:none;" class="sp-input" type="text" spellcheck="false" placeholder=""></div><div class="sp-initial sp-thumb sp-cf"></div><div class="sp-button-container sp-cf"><a class="sp-cancel fr-command" data-cmd="cancelAndCloseColor" href="javascript:void(0)">cancel</a><button type="button" class="sp-choose fr-command" data-cmd="' + n + '">choose</button></div></div>', l += "</div>"
        }

        function c(t) {
            var e = o.popups.get("colors.picker"),
                s = $(o.selection.element()),
                r = $(o.selection.element()),
                c = s.hasClass("ssb-theme-btn");
            c ? o.opts.button = s : (c = s.parent().hasClass("ssb-theme-btn")) && (o.opts.button = s.parent()), o.opts.isButton = c;
            var n, l = "";
            for ("background" == t ? (n = "background-color", l = o.opts.selectedElement.bg || s.css(n)) : (n = "color", l = o.opts.selectedElement.color || s.css(n)), o.opts.isButton && (l = o.opts.button.css(n)), e.find(".fr-" + t + "-color .fr-select-color").removeClass("fr-selected-color"), o.opts.isButton && (l = o.opts.button.css(n), setTimeout(function() {
                    d(n, l)
                }, 0)); s.get(0) != o.$el.get(0) && !o.opts.selectedElement.color && !o.opts.isButton;) {
                if ("transparent" != s.css("color") && "rgba(0, 0, 0, 0)" != s.css("color")) {
                    o.opts.selectedElement.color = s.css("color");
                    a = "";
                    a = "background" == t ? o.opts.selectedElement.bg : o.opts.selectedElement.color, e.find(".fr-" + t + '-color .fr-select-color[data-param1="' + o.helpers.RGBToHex(a) + '"]').addClass("fr-selected-color");
                    break
                }
                s = s.parent()
            }
            for (s = r; s.get(0) != o.$el.get(0) && !o.opts.selectedElement.bg && !o.opts.isButton;) {
                if ("transparent" != s.css("background-color") && "rgba(0, 0, 0, 0)" != s.css("background-color")) {
                    o.opts.selectedElement.bg = s.css("background-color");
                    a = "";
                    a = "background" == t ? o.opts.selectedElement.bg : o.opts.selectedElement.color, e.find(".fr-" + t + '-color .fr-select-color[data-param1="' + o.helpers.RGBToHex(a) + '"]').addClass("fr-selected-color");
                    break
                }
                s = s.parent()
            }
            if (!o.opts.isButton) {
                var a = "";
                a = "background" == t ? o.opts.selectedElement.bg : o.opts.selectedElement.color, setTimeout(function() {
                    d(n, a)
                }, 0)
            }
        }

        function n() {
            var t = $(o.selection.element());
            if (o.opts.isButton) o.opts.defaultColors.background.color = o.opts.button.css("background-color"), o.opts.defaultColors.text.color = o.opts.button.css("color");
            else {
                for (; t.get(0) != o.$el.get(0) && ("transparent" == t.css("background-color") || "rgba(0, 0, 0, 0)" == t.css("background-color"));) t = t.parent();
                o.opts.defaultColors.text.color = t.css("color"), o.opts.defaultColors.background.color = t.css("background-color")
            }
        }

        function l(t, e) {
            var s = o.popups.get("colors.picker");
            if ("REMOVE" != t) {
                s.find("input.sp-input").val(t);
                var r = o.helpers.RGBToHex(t);
                r || o.helpers.RGBToHex("#" + t) && (r = o.helpers.RGBToHex("#" + t), t = "#" + t), o.opts.isButton ? o.opts.button.css("background-color", t) : ($(o.$el).find("span") && $(o.$el).find("span").length && $(o.$el).find("span").removeClass("ssb-bg-color-inline-block"), o.format.applyStyle("background-color", t), $(o.$el).find("span").filter(function() {
                    var o = $(this).css("background-color");
                    return "transparent" != o && "rgba(0, 0, 0, 0)" != o
                }).addClass("ssb-bg-color-inline-block")), o.opts.isButton && o.events.trigger("bgColorChange", [t]), o.opts.selectedElement.bg = t, $(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color"), $(".fr-command.fr-select-color[data-cmd='backgroundColor'][data-param1='" + r + "']").addClass("fr-selected-color")
            } else s.find("input.sp-input").val(""), o.opts.isButton ? o.opts.button.css("background-color", "") : o.opts.isIE ? $(o.selection.element()).css("background-color", "") : o.format.removeStyle("background-color"), $(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color"), o.opts.isButton && o.events.trigger("bgColorChange", []), setTimeout(function() {
                o.events.trigger("contentChanged")
            });
            e && d("background-color", t)
        }

        function a(t, e) {
            var s = o.popups.get("colors.picker");
            if ("REMOVE" != t) {
                s.find("input.sp-input").val(t);
                var r = o.helpers.RGBToHex(t);
                r || o.helpers.RGBToHex("#" + t) && (r = o.helpers.RGBToHex("#" + t), t = "#" + t), o.opts.isButton ? $(o.selection.element()).css("color", t) : o.format.applyStyle("color", t), o.opts.selectedElement.color = t, o.opts.isButton && o.events.trigger("txtColorChange", [t]), setTimeout(function() {}), $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color"), $(".fr-command.fr-select-color[data-cmd='textColor'][data-param1='" + r + "']").addClass("fr-selected-color")
            } else o.opts.isButton ? o.opts.button.css("color", "") : o.opts.isIE ? $(o.selection.element()).css("color", "") : o.format.removeStyle("color"), $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color"), o.opts.isButton && o.events.trigger("bgColorChange", []), s.find("input.sp-input").val(""), setTimeout(function() {
                o.events.trigger("contentChanged")
            });
            e && d("color", t)
        }

        function i(e) {
            e && (l(o.opts.defaultColors.background.color || "REMOVE"), a(o.opts.defaultColors.text.color || "REMOVE")), t()
        }

        function d(t, e) {
            function s() {
                (0 >= B || 0 >= x || 0 >= $) && n(), w = !0, m.addClass(D), A = null
            }

            function r() {
                w = !1, m.removeClass(D)
            }

            function c() {
                i(t)
            }

            function n() {
                f()
            }

            function i(t, e) {
                if (f(), !M) {
                    var s = tinycolor.fromRatio({
                        h: O,
                        s: 1,
                        v: 1
                    });
                    v.css("background-color", s.toHexString());
                    var r = d();
                    if (r) {
                        var c = r.toHexString(),
                            n = r.toRgbString();
                        e || ("color" === t ? a(n) : l(n));
                        var i = r.toRgb();
                        i.a = 0;
                        var p = tinycolor(i).toRgbString(),
                            u = "linear-gradient(left, " + p + ", " + c + ")";
                        o.opts.isIE ? S.css("filter", tinycolor(p).toFilter({
                            gradientType: 1
                        }, c)) : (S.css("background", "-webkit-" + u), S.css("background", "-moz-" + u), S.css("background", "-ms-" + u), S.css("background", "linear-gradient(to right, " + p + ", " + c + ")"))
                    }
                }
            }

            function d(o) {
                return tinycolor.fromRatio({
                    h: O,
                    s: P,
                    v: H,
                    a: Math.round(100 * V) / 100
                }, {
                    format: "rgb"
                })
            }

            function f() {
                var o = P,
                    t = H;
                if (M) C.hide(), h.hide(), b.hide();
                else {
                    C.show(), h.show(), b.show();
                    var e = o * x,
                        s = B - t * B;
                    e = Math.max(-F, Math.min(x - F, e - F)), s = Math.max(-F, Math.min(B - F, s - F)), b.css({
                        top: s + "px",
                        left: e + "px"
                    });
                    var r = V * T;
                    C.css({
                        left: r - R / 2 + "px"
                    });
                    var c = O * $;
                    h.css({
                        top: c - y + "px"
                    })
                }
            }
            var g = o.popups.get("colors.picker");
            g.find("input:focus").blur();
            var m = "color" === t ? g.find(".fr-color-set.sp-container.fr-text-color") : g.find(".fr-color-set.sp-container.fr-background-color"),
                b = m.find(".sp-dragger"),
                h = m.find(".sp-slider"),
                C = m.find(".sp-alpha-handle"),
                v = m.find(".sp-color"),
                k = m.find(".sp-hue"),
                E = m.find(".sp-alpha"),
                x = v.width(),
                B = v.height(),
                F = b.height(),
                $ = (k.width(), k.height()),
                y = h.height(),
                T = E.width(),
                R = C.width(),
                S = m.find(".sp-alpha-inner"),
                D = "sp-dragging",
                A = null,
                M = !0,
                w = !1,
                O = 0,
                P = 0,
                H = 0,
                V = 1,
                G = o;
            p(m.find(".sp-input"), t), u(E, function(o, t, e) {
                V = o / T, M = !1, e.shiftKey && (V = Math.round(10 * V) / 10), c(), setTimeout(function() {
                    G.events.trigger("contentChanged")
                })
            }, s, r), u(k, function(o, t) {
                O = parseFloat(t / $), M = !1, c(), setTimeout(function() {
                    G.events.trigger("contentChanged")
                })
            }, s, r), u(v, function(o, t, e) {
                P = parseFloat(o / x), H = parseFloat((B - t) / B), M = !1, c(), setTimeout(function() {
                    G.events.trigger("contentChanged")
                })
            }, s, r), e ? (function(o, e) {
                if (tinycolor.equals(o, d())) i(t, e);
                else {
                    var s, r;
                    o ? (M = !1, s = tinycolor(o), r = s.toHsv(), O = r.h % 360 / 360, P = r.s, H = r.v, V = r.a) : M = !0, i(t, e)
                }
            }(e, !0), c()) : (M = !0, c())
        }

        function p(e, s) {
            $(e).off("keypress").on("keypress", function(r) {
                if (13 == r.which) {
                    var c = $(e).val();
                    o.selection.restore(), "color" === s ? a(c, !0) : l(c, !0), t()
                }
            }), $(e).off("focus").on("focus", function(t) {
                o.selection.save()
            })
        }

        function u(t, e, s, r) {
            function c(o) {
                o.stopPropagation && o.stopPropagation(), o.preventDefault && o.preventDefault(), o.returnValue = !1
            }

            function n(s) {
                if (o.events.disableBlur(), i) {
                    if (o.opts.isIE && a.documentMode < 9 && !s.button) return l();
                    var r = s.originalEvent && s.originalEvent.touches && s.originalEvent.touches[0],
                        n = r && r.pageX || s.pageX,
                        g = r && r.pageY || s.pageY,
                        m = Math.max(0, Math.min(n - d.left, u)),
                        b = Math.max(0, Math.min(g - d.top, p));
                    f && c(s), e.apply(t, [m, b, s])
                }
            }

            function l() {
                i && (o.popups.get("colors.picker").find("input").removeClass("disabled"), $(a).unbind(g), $(a.body).removeClass("sp-dragging"), setTimeout(function() {
                    r.apply(t, arguments)
                }, 0)), i = !1
            }
            e = e || function() {}, s = s || function() {}, r = r || function() {};
            var a = document,
                i = !1,
                d = {},
                p = 0,
                u = 0,
                f = "ontouchstart" in window,
                g = {};
            g.selectstart = c, g.dragstart = c, g["touchmove mousemove"] = n, g["touchend mouseup"] = l, $(t).off("touchstart mousedown").on("touchstart mousedown", function(e) {
                (e.which ? 3 == e.which : 2 == e.button) || i || !1 === s.apply(t, arguments) || (i = !0, p = $(t).height(), u = $(t).width(), d = $(t).offset(), $(a).bind(g), $(a.body).addClass("sp-dragging"), n(e), o.popups.get("colors.picker").find("input").addClass("disabled"), c(e))
            }), $(t).off("touchend mouseup mouseleave").on("touchend mouseup", l), $(a).bind("click", l)
        }
        return {
            showColorsPopup: function() {
                var t = o.$tb.find('.fr-command[data-cmd="color"]');
                o.opts.selectedElement.bg = "", o.opts.selectedElement.color = "";
                var s = o.popups.get("colors.picker");
                if (s || (s = e()), !s.hasClass("fr-active")) {
                    o.popups.setContainer("colors.picker", o.$tb), c(s.find(".fr-selected-tab").attr("data-param1"));
                    var r = t.offset().left + t.outerWidth() / 2,
                        l = t.offset().top + (o.opts.toolbarBottom ? 10 : t.outerHeight() - 10);
                    o.popups.show("colors.picker", r, l, t.outerHeight()), o.opts.isIE ? ($(".fr-popup").find(".sp-input").hide(), $(".fr-popup").find(".sp-palette-toggle").hide(), $(".fr-popup").find(".sp-picker-container").hide()) : $(".sp-input").show(), n()
                }
            },
            hideColorsPopup: t,
            changeSet: function(o, t) {
                o.hasClass("fr-selected-tab") || (o.siblings().removeClass("fr-selected-tab"), o.addClass("fr-selected-tab"), o.parents(".fr-popup").find(".fr-color-set").removeClass("fr-selected-set"), o.parents(".fr-popup").find(".fr-color-set.fr-" + t + "-color").addClass("fr-selected-set"), c(t))
            },
            background: l,
            text: a,
            back: function() {
                o.link.get() ? o.link.back() : (o.popups.hide("colors.picker"), o.toolbar.showInline())
            },
            removeColor: function(t, e) {
                o.popups.get("colors.picker").find("input.sp-input").val(""), "text" === t ? (o.opts.selectedElement.bg = "", $(".fr-command.fr-select-color[data-cmd='textColor']").removeClass("fr-selected-color"), o.opts.isButton ? o.opts.button.css("color", "") : o.format.removeStyle("color"), o.opts.isButton && o.events.trigger("txtColorChange", []), setTimeout(function() {
                    o.events.trigger("contentChanged"), i()
                })) : ($(".fr-command.fr-select-color[data-cmd='backgroundColor']").removeClass("fr-selected-color"), o.opts.selectedElement.color = "", o.opts.isButton ? o.opts.button.css("background-color", "") : o.format.removeStyle("background-color"), o.opts.isButton && o.events.trigger("bgColorChange", []), setTimeout(function() {
                    o.events.trigger("contentChanged"), i()
                }))
            },
            chooseColorPicker: function(e) {
                var s = o.popups.get("colors.picker"),
                    r = ("text" === e ? s.find(".fr-color-set.sp-container.fr-text-color") : s.find(".fr-color-set.sp-container.fr-background-color")).find(".sp-input").val();
                o.selection.restore(), "text" === e ? a(r || "REMOVE") : l(r || "REMOVE"), t()
            },
            closeColorPicker: i,
            initializeSpectrum: d,
            toggleSpectrum: function(t) {
                var e = o.popups.get("colors.picker"),
                    s = "text" === t ? e.find(".fr-color-set.sp-container.fr-text-color") : $(".fr-color-set.sp-container.fr-background-color"),
                    r = s.find(".sp-picker-container"),
                    c = s.find(".sp-palette-toggle");
                r.toggle(), r.is(":visible") ? (c.text("less"), s.removeClass("no-spectrum")) : (c.text("more"), s.addClass("no-spectrum"))
            }
        }
    }, o.FE.DefineIcon("colors", {
        NAME: "tint"
    }), o.FE.RegisterCommand("color", {
        title: "Colors",
        undo: !1,
        focus: !0,
        refreshOnCallback: !1,
        popup: !0,
        callback: function() {
            this.popups.isVisible("colors.picker") ? (this.$el.find(".fr-marker") && (this.events.disableBlur(), this.selection.restore()), this.popups.hide("colors.picker")) : this.colors.showColorsPopup()
        },
        plugin: "colors"
    }), o.FE.RegisterCommand("textColor", {
        undo: !0,
        callback: function(o, t) {
            this.events.disableBlur(), this.selection.restore(), this.colors.text(t, !0);
            var e = $(this.selection.element());
            "A" != e[0].tagName ? e.find("a.btn").css("color", t) : e.is("span") ? e.find("span").css("color", t) : (this.format.apply("span"), e.find("span").css("color", t))
        }
    }), o.FE.RegisterCommand("backgroundColor", {
        undo: !0,
        callback: function(o, t) {
            this.events.disableBlur(), this.selection.restore(), this.colors.background(t, !0)
        }
    }), o.FE.RegisterCommand("colorChangeSet", {
        undo: !1,
        focus: !1,
        callback: function(o, t) {
            var e = this.popups.get("colors.picker").find('.fr-command[data-cmd="' + o + '"][data-param1="' + t + '"]');
            this.colors.changeSet(e, t)
        }
    }), o.FE.RegisterCommand("clearTextColor", {
        undo: !1,
        focus: !1,
        callback: function(o, t) {
            this.popups.get("colors.picker").find('.fr-command[data-cmd="' + o + '"][data-param1="' + t + '"]'), this.colors.removeColor("text", t)
        }
    }), o.FE.RegisterCommand("clearBackgroundColor", {
        undo: !1,
        focus: !1,
        callback: function(o, t) {
            this.popups.get("colors.picker").find('.fr-command[data-cmd="' + o + '"][data-param1="' + t + '"]'), this.colors.removeColor("background", t)
        }
    }), o.FE.RegisterCommand("chooseTextColor", {
        undo: !1,
        focus: !1,
        callback: function(o, t) {
            this.colors.chooseColorPicker("text")
        }
    }), o.FE.RegisterCommand("chooseBGColor", {
        undo: !1,
        focus: !1,
        callback: function(o, t) {
            this.colors.chooseColorPicker("background")
        }
    }), o.FE.RegisterCommand("cancelAndCloseColor", {
        undo: !1,
        focus: !1,
        callback: function(o, t) {
            this.colors.closeColorPicker(!0)
        }
    }), o.FE.RegisterCommand("textColorSpectrum", {
        undo: !0,
        focus: !1,
        callback: function(o) {
            this.colors.initializeSpectrum("text", !0)
        }
    }), o.FE.RegisterCommand("bgColorSpectrum", {
        undo: !0,
        focus: !1,
        callback: function(o) {
            this.colors.initializeSpectrum("background", !0)
        }
    }), o.FE.RegisterCommand("toggleTextSpectrum", {
        undo: !1,
        focus: !1,
        callback: function(o) {
            this.colors.toggleSpectrum("text")
        }
    }), o.FE.RegisterCommand("toggleBgSpectrum", {
        undo: !1,
        focus: !1,
        callback: function(o) {
            this.colors.toggleSpectrum("background")
        }
    }), o.FE.DefineIcon("colorsBack", {
        NAME: "arrow-left"
    }), o.FE.RegisterCommand("colorsBack", {
        title: "Back",
        undo: !1,
        focus: !1,
        back: !0,
        refreshAfterCallback: !1,
        callback: function() {
            this.colors.back()
        }
    })
});