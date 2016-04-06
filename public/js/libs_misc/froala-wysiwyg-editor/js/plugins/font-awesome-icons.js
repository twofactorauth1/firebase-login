/*!
 * froala_editor v2.2.2 (https://www.froala.com/wysiwyg-editor)
 * License https://froala.com/wysiwyg-editor/terms/
 * Copyright 2014-2016 Froala Labs
 */
! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    a.extend(a.FroalaEditor.POPUP_TEMPLATES, {
        fontAwesomeIcons: "[_BUTTONS_][_FONTAWESOMEICONS_]"
    }), a.extend(a.FroalaEditor.DEFAULTS, {
        fontAwesomeIconsStep: 8,
        fontAwesomeIconsSet: [{
            code: "adjust",
            desc: "Adjust"
        }, {
            code: "anchor",
            desc: "Anchor"
        }],
        fontAwesomeIconsButtons: ["fontAwesomeIconsBack", "|"],
        fontAwesomeIconsUseImage: !0
    }), a.FroalaEditor.PLUGINS.fontAwesomeIcons = function(b) {
        function c() {
            var a = b.$tb.find('.fr-command[data-cmd="fontAwesomeIcons"]'),
                c = b.popups.get("fontAwesomeIcons");
            if (c || (c = e()), !c.hasClass("fr-active")) {
                b.popups.refresh("fontAwesomeIcons"), b.popups.setContainer("fontAwesomeIcons", b.$tb);
                var d = a.offset().left + a.outerWidth() / 2,
                    f = a.offset().top + (b.opts.toolbarBottom ? 10 : a.outerHeight() - 10);
                b.popups.show("fontAwesomeIcons", d, f, a.outerHeight())
            }
        }

        function d() {
            b.popups.hide("fontAwesomeIcons")
        }

        function e() {
            var a = "";
            b.opts.toolbarInline && b.opts.fontAwesomeIconsButtons.length > 0 && (a = '<div class="fr-buttons fr-fontAwesomeIcons-buttons">' + b.button.buildList(b.opts.fontAwesomeIconsButtons) + "</div>");
            var c = {
                    buttons: a,
                    fontAwesomeIcons: f()
                },
                d = b.popups.create("fontAwesomeIcons", c);
            return b.tooltip.bind(d, ".fr-fontAwesomeIcon"), d
        }

        function f() {
            for (var a = '<div style="text-align: center">', c = 0; c < b.opts.fontAwesomeIconsSet.length; c++) 0 !== c && c % b.opts.fontAwesomeIconsStep === 0 && (a += "<br>"), a += '<span class="fr-command fr-fontAwesomeIcon fr-emoticon" data-cmd="insertFontAwesomeIcon" title="' + b.language.translate(b.opts.fontAwesomeIconsSet[c].desc) + '" data-param1="' + b.opts.fontAwesomeIconsSet[c].code + '">' + "<span class='fa fa-" + b.opts.fontAwesomeIconsSet[c].code + "'></span>" + "</span>";
            return b.opts.fontAwesomeIconsUseImage && (a), a += "</div>"
        }

        function g(d) {
            b.html.insert('<span class="fr-fontAwesomeIcon fr-emoticon">' + "<span class='fa fa-" + d + "'>&nbsp;</span>" + "</span>" + a.FroalaEditor.MARKERS, !0)
        }

        function h() {
            b.popups.hide("fontAwesomeIcons"), b.toolbar.showInline()
        }

        function i() {
            b.events.on("html.get", function(c) {
                for (var d = 0; d < b.opts.fontAwesomeIconsSet.length; d++) {
                    var e = b.opts.fontAwesomeIconsSet[d],
                        f = a("<div>").html(e.code).text();
                    c = c.split(f).join(e.code)
                }
                return c
            });
            var c = function() {
                if (!b.selection.isCollapsed()) return !1;
                var c = b.selection.element(),
                    d = b.selection.endElement();
                if (a(c).hasClass("fr-fontAwesomeIcon")) return c;
                if (a(d).hasClass("fr-fontAwesomeIcon")) return d;
                var e = b.selection.ranges(0),
                    f = e.startContainer;
                if (f.nodeType == Node.ELEMENT_NODE && f.childNodes.length > 0 && e.startOffset > 0) {
                    var g = f.childNodes[e.startOffset - 1];
                    if (a(g).hasClass("fr-fontAwesomeIcon")) return g
                }
                return !1
            };
            b.events.on("keydown", function(d) {
                if (b.keys.isCharacter(d.which) && b.selection.inEditor()) {
                    var e = b.selection.ranges(0),
                        f = c();
                    f && (0 === e.startOffset ? a(f).before(a.FroalaEditor.MARKERS + a.FroalaEditor.INVISIBLE_SPACE) : a(f).after(a.FroalaEditor.INVISIBLE_SPACE + a.FroalaEditor.MARKERS), b.selection.restore())
                }
            }), b.events.on("keyup", function() {
                for (var c = b.$el.get(0).querySelectorAll(".fr-fontAwesomeIcon"), d = 0; d < c.length; d++) "undefined" != typeof c[d].textContent && 0 === c[d].textContent.replace(/\u200B/gi, "").length && a(c[d]).remove()
            })
        }
        return {
            _init: i,
            insert: g,
            showFontAwesomeIconsPopup: c,
            hideFontAwesomeIconsPopup: d,
            back: h
        }
    }, a.FroalaEditor.DefineIcon("fontAwesomeIcons", {
        NAME: "flag"
    }), a.FroalaEditor.RegisterCommand("fontAwesomeIcons", {
        title: "Insert Icon",
        undo: !1,
        focus: !0,
        refreshOnCallback: !1,
        popup: !0,
        callback: function() {
            this.popups.isVisible("fontAwesomeIcons") ? (this.$el.find(".fr-marker") && (this.events.disableBlur(), this.selection.restore()), this.popups.hide("fontAwesomeIcons")) : this.fontAwesomeIcons.showFontAwesomeIconsPopup()
        },
        plugin: "fontAwesomeIcons"
    }), a.FroalaEditor.RegisterCommand("insertFontAwesomeIcon", {
        callback: function(a, b) {
            this.fontAwesomeIcons.insert(b), this.fontAwesomeIcons.hideFontAwesomeIconsPopup()
        }
    }), a.FroalaEditor.DefineIcon("fontAwesomeIconsBack", {
        NAME: "arrow-left"
    }), a.FroalaEditor.RegisterCommand("fontAwesomeIconsBack", {
        title: "Back",
        undo: !1,
        focus: !1,
        back: !0,
        refreshAfterCallback: !1,
        callback: function() {
            this.fontAwesomeIcons.back()
        }
    })
});
