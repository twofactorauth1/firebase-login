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
            code: "1f600",
            desc: "Grinning face"
        }, {
            code: "1f601",
            desc: "Grinning face with smiling eyes"
        }, {
            code: "1f602",
            desc: "Face with tears of joy"
        }, {
            code: "1f603",
            desc: "Smiling face with open mouth"
        }, {
            code: "1f604",
            desc: "Smiling face with open mouth and smiling eyes"
        }, {
            code: "1f605",
            desc: "Smiling face with open mouth and cold sweat"
        }, {
            code: "1f606",
            desc: "Smiling face with open mouth and tightly-closed eyes"
        }, {
            code: "1f607",
            desc: "Smiling face with halo"
        }, {
            code: "1f608",
            desc: "Smiling face with horns"
        }, {
            code: "1f609",
            desc: "Winking face"
        }, {
            code: "1f60a",
            desc: "Smiling face with smiling eyes"
        }, {
            code: "1f60b",
            desc: "Face savoring delicious food"
        }, {
            code: "1f60c",
            desc: "Relieved face"
        }, {
            code: "1f60d",
            desc: "Smiling face with heart-shaped eyes"
        }, {
            code: "1f60e",
            desc: "Smiling face with sunglasses"
        }, {
            code: "1f60f",
            desc: "Smirking face"
        }, {
            code: "1f610",
            desc: "Neutral face"
        }, {
            code: "1f611",
            desc: "Expressionless face"
        }, {
            code: "1f612",
            desc: "Unamused face"
        }, {
            code: "1f613",
            desc: "Face with cold sweat"
        }, {
            code: "1f614",
            desc: "Pensive face"
        }, {
            code: "1f615",
            desc: "Confused face"
        }, {
            code: "1f616",
            desc: "Confounded face"
        }, {
            code: "1f617",
            desc: "Kissing face"
        }, {
            code: "1f618",
            desc: "Face throwing a kiss"
        }, {
            code: "1f619",
            desc: "Kissing face with smiling eyes"
        }, {
            code: "1f61a",
            desc: "Kissing face with closed eyes"
        }, {
            code: "1f61b",
            desc: "Face with stuck out tongue"
        }, {
            code: "1f61c",
            desc: "Face with stuck out tongue and winking eye"
        }, {
            code: "1f61d",
            desc: "Face with stuck out tongue and tightly-closed eyes"
        }, {
            code: "1f61e",
            desc: "Disappointed face"
        }, {
            code: "1f61f",
            desc: "Worried face"
        }, {
            code: "1f620",
            desc: "Angry face"
        }, {
            code: "1f621",
            desc: "Pouting face"
        }, {
            code: "1f622",
            desc: "Crying face"
        }, {
            code: "1f623",
            desc: "Persevering face"
        }, {
            code: "1f624",
            desc: "Face with look of triumph"
        }, {
            code: "1f625",
            desc: "Disappointed but relieved face"
        }, {
            code: "1f626",
            desc: "Frowning face with open mouth"
        }, {
            code: "1f627",
            desc: "Anguished face"
        }, {
            code: "1f628",
            desc: "Fearful face"
        }, {
            code: "1f629",
            desc: "Weary face"
        }, {
            code: "1f62a",
            desc: "Sleepy face"
        }, {
            code: "1f62b",
            desc: "Tired face"
        }, {
            code: "1f62c",
            desc: "Grimacing face"
        }, {
            code: "1f62d",
            desc: "Loudly crying face"
        }, {
            code: "1f62e",
            desc: "Face with open mouth"
        }, {
            code: "1f62f",
            desc: "Hushed face"
        }, {
            code: "1f630",
            desc: "Face with open mouth and cold sweat"
        }, {
            code: "1f631",
            desc: "Face screaming in fear"
        }, {
            code: "1f632",
            desc: "Astonished face"
        }, {
            code: "1f633",
            desc: "Flushed face"
        }, {
            code: "1f634",
            desc: "Sleeping face"
        }, {
            code: "1f635",
            desc: "Dizzy face"
        }, {
            code: "1f636",
            desc: "Face without mouth"
        }, {
            code: "1f637",
            desc: "Face with medical mask"
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
            for (var a = '<div style="text-align: center">', c = 0; c < b.opts.fontAwesomeIconsSet.length; c++) 0 !== c && c % b.opts.fontAwesomeIconsStep === 0 && (a += "<br>"), a += '<span class="fr-command fr-fontAwesomeIcon" data-cmd="insertFontAwesomeIcon" title="' + b.language.translate(b.opts.fontAwesomeIconsSet[c].desc) + '" data-param1="' + b.opts.fontAwesomeIconsSet[c].code + '">' + (b.opts.fontAwesomeIconsUseImage ? '<img src="https://cdnjs.cloudflare.com/ajax/libs/emojione/2.0.1/assets/svg/' + b.opts.fontAwesomeIconsSet[c].code + '.svg"/>' : "&#x" + b.opts.fontAwesomeIconsSet[c].code + ";") + "</span>";
            return b.opts.fontAwesomeIconsUseImage && (a += '<p style="font-size: 12px; text-align: center; padding: 0 5px;">Emoji free by <a href="http://emojione.com/" target="_blank" rel="nofollow">Emoji One</a></p>'), a += "</div>"
        }

        function g(c, d) {
            b.html.insert('<span class="fr-fontAwesomeIcon' + (d ? " fr-fontAwesomeIcon-img" : "") + '"' + (d ? ' style="background: url(' + d + ')"' : "") + ">" + (d ? "&nbsp;" : c) + "</span>" + a.FroalaEditor.MARKERS, !0)
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
        NAME: "flag-o"
    }), a.FroalaEditor.RegisterCommand("fontAwesomeIcons", {
        title: "Font Awesome Icons",
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
            this.fontAwesomeIcons.insert("&#x" + b + ";", this.opts.fontAwesomeIconsUseImage ? "https://cdnjs.cloudflare.com/ajax/libs/emojione/2.0.1/assets/svg/" + b + ".svg" : null), this.fontAwesomeIcons.hideFontAwesomeIconsPopup()
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
