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
    var tmpIconSet = ["adjust", "anchor", "archive", "arrows", "arrows-h", "arrows-v", "asterisk", "ban", "bar-chart-o", "barcode", "bars", "beer", "bell", "bell-o", "bolt", "bomb", "book", "bookmark", "bookmark-o", "briefcase", "bug", "building", "building-o", "bullhorn", "bullseye", "calendar", "calendar-o", "camera", "camera-retro", "car", "caret-square-o-down", "caret-square-o-left", "caret-square-o-right", "caret-square-o-up", "certificate", "check", "check-circle", "check-circle-o", "check-square", "check-square-o", "child", "circle", "circle-o", "circle-o-notch", "circle-thin", "clock-o", "cloud", "cloud-download", "cloud-upload", "code", "code-fork", "coffee", "cog", "cogs", "comment", "comment-o", "comments", "comments-o", "compass", "credit-card", "crop", "crosshairs", "cube", "cubes", "cutlery", "database", "desktop", "dot-circle-o", "download", "ellipsis-h", "ellipsis-v", "envelope", "envelope-o", "envelope-square", "eraser", "exchange", "exclamation", "exclamation-circle", "exclamation-triangle", "external-link", "external-link-square", "eye", "eye-slash", "fax", "female", "fighter-jet", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-pdf-o", "file-powerpoint-o", "file-video-o", "file-word-o", "film", "filter", "fire", "fire-extinguisher", "flag", "flag-checkered", "flag-o", "flask", "folder", "folder-o", "folder-open", "folder-open-o", "frown-o", "gamepad", "gavel", "gift", "glass", "globe", "graduation-cap", "hdd-o", "headphones", "heart", "heart-o", "history", "home", "inbox", "info", "info-circle", "key", "keyboard-o", "language", "laptop", "leaf", "lemon-o", "level-down", "level-up", "life-ring", "lightbulb-o", "location-arrow", "lock", "magic", "magnet", "male", "map-marker", "meh-o", "microphone", "microphone-slash", "minus", "minus-circle", "minus-square", "minus-square-o", "mobile", "money", "moon-o", "music", "paper-plane", "paper-plane-o", "paw", "pencil", "pencil-square", "pencil-square-o", "phone", "phone-square", "picture-o", "plane", "plus", "plus-circle", "plus-square", "plus-square-o", "power-off", "print", "puzzle-piece", "qrcode", "question", "question-circle", "quote-left", "quote-right", "random", "recycle", "refresh", "reply", "reply-all", "retweet", "road", "rocket", "rss", "rss-square", "search", "search-minus", "search-plus", "share", "share-alt", "share-alt-square", "share-square", "share-square-o", "shield", "shopping-cart", "sign-in", "sign-out", "signal", "sitemap", "sliders", "smile-o", "sort", "sort-alpha-asc", "sort-alpha-desc", "sort-amount-asc", "sort-amount-desc", "sort-asc", "sort-desc", "sort-numeric-asc", "sort-numeric-desc", "space-shuttle", "spinner", "spoon", "square", "square-o", "star", "star-half", "star-half-o", "star-o", "suitcase", "sun-o", "tablet", "tachometer", "tag", "tags", "tasks", "taxi", "terminal", "thumb-tack", "thumbs-down", "thumbs-o-down", "thumbs-o-up", "thumbs-up", "ticket", "times", "times-circle", "times-circle-o", "tint", "trash-o", "tree", "trophy", "truck", "umbrella", "university", "unlock", "unlock-alt", "upload", "user", "users", "video-camera", "volume-down", "volume-off", "volume-up", "wheelchair", "wrench", "file", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-o", "file-pdf-o", "file-powerpoint-o", "file-text", "file-text-o", "file-video-o", "file-word-o", "circle-o-notch", "btc", "eur", "gbp", "inr", "jpy", "krw", "rub", "try", "usd", "align-center", "align-justify", "align-left", "align-right", "bold", "chain-broken", "clipboard", "columns", "eraser", "files-o", "floppy-o", "font", "header", "indent", "italic", "link", "list", "list-alt", "list-ol", "list-ul", "outdent", "paperclip", "paragraph", "repeat", "scissors", "strikethrough", "subscript", "superscript", "table", "text-height", "text-width", "th", "th-large", "th-list", "underline", "undo", "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up", "angle-down", "angle-left", "angle-right", "angle-up", "arrow-circle-down", "arrow-circle-left", "arrow-circle-o-down", "arrow-circle-o-left", "arrow-circle-o-right", "arrow-circle-o-up", "arrow-circle-right", "arrow-circle-up", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "arrows-alt", "caret-down", "caret-left", "caret-right", "caret-up", "chevron-circle-down", "chevron-circle-left", "chevron-circle-right", "chevron-circle-up", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "hand-o-down", "hand-o-left", "hand-o-right", "hand-o-up", "long-arrow-down", "long-arrow-left", "long-arrow-right", "long-arrow-up", "backward", "compress", "eject", "expand", "fast-backward", "fast-forward", "forward", "pause", "play", "play-circle", "play-circle-o", "step-backward", "step-forward", "stop", "youtube-play", "adn", "android", "apple", "behance", "behance-square", "bitbucket", "bitbucket-square", "btc", "codepen", "css3", "delicious", "deviantart", "digg", "dribbble", "dropbox", "drupal", "empire", "facebook", "facebook-square", "flickr", "foursquare", "git", "git-square", "github", "github-alt", "github-square", "gittip", "google", "google-plus", "google-plus-square", "hacker-news", "html5", "instagram", "joomla", "jsfiddle", "linkedin", "linkedin-square", "linux", "maxcdn", "openid", "pagelines", "pied-piper", "pied-piper-alt", "pinterest", "pinterest-square", "qq", "rebel", "reddit", "reddit-square", "renren", "share-alt", "share-alt-square", "skype", "slack", "soundcloud", "spotify", "stack-exchange", "stack-overflow", "steam", "steam-square", "stumbleupon", "stumbleupon-circle", "tencent-weibo", "trello", "tumblr", "tumblr-square", "twitter", "twitter-square", "vimeo-square", "vine", "vk", "weibo", "weixin", "windows", "wordpress", "xing", "xing-square", "yahoo", "youtube", "youtube-square", "ambulance", "h-square", "hospital-o", "medkit", "stethoscope", "user-md"];
    var iconSet = [];
    var selectedIcon = null;
    var selectedColor = null;
    var selectedFontSize = null;

    tmpIconSet.forEach(function(icon, index) {
        iconSet.push({
            code: icon,
            desc: icon
        });
    });
    a.extend(a.FroalaEditor.POPUP_TEMPLATES, {
        fontAwesomeIcons: "[_BUTTONS_][_FONTAWESOMEICONS_]"
    }), a.extend(a.FroalaEditor.DEFAULTS, {
        fontAwesomeIconsStep: 8,
        fontAwesomeIconsSet: iconSet,
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
            for (var a = '<div style="text-align: center; max-height: 400px; overflow-y: scroll; overflow-x: hidden">', c = 0; c < b.opts.fontAwesomeIconsSet.length; c++) 0 !== c && c % b.opts.fontAwesomeIconsStep === 0 && (a += "<br>"), a += '<span class="fr-command fr-fontAwesomeIcon fr-emoticon" data-cmd="insertFontAwesomeIcon" title="' + b.language.translate(b.opts.fontAwesomeIconsSet[c].desc) + '" data-param1="' + b.opts.fontAwesomeIconsSet[c].code + '">' + "<span class='fa fa-" + b.opts.fontAwesomeIconsSet[c].code + "'></span>" + "</span>";
            return b.opts.fontAwesomeIconsUseImage && (a), a += "</div>"
        }

        function g(d) {
            selectedIcon = d;
            var is_safari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
            if(is_safari){
                b.html.insert('<span class="fr-fontAwesomeIcon fr-emoticon">' + "<span class='fa fa-" + d + "'>&nbsp;</span>" + "</span>" + a.FroalaEditor.MARKERS, true);    
            }
            else{
                b.html.insert('<span class="fr-fontAwesomeIcon fr-emoticon">' + "&nbsp;<span class='fa fa-" + d + "'>&nbsp;</span>" + "</span>" + a.FroalaEditor.MARKERS, true);
            }
            
        }

        function h() {
            b.popups.hide("fontAwesomeIcons"), b.toolbar.showInline()
        }

        function getSelectionParentElement() {
            //return window.getSelection().anchorNode.parentElement TODO: checking in XOS if not working enable this
            var parentEl = null,
                sel;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    parentEl = sel.getRangeAt(0).commonAncestorContainer;
                    if (parentEl.nodeType != 1) {
                        parentEl = parentEl.parentNode;
                    }
                }
            } else if ((sel = document.selection) && sel.type != "Control") {
                parentEl = sel.createRange().parentElement();
            }
            return parentEl;
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
            }), b.events.on('commands.before', function(cmd, param1, param2) { 
                debugger
                if (cmd == 'fontSize') {
                    selectedFontSize = param1;
                }

                if (cmd == 'textColor') {
                    selectedColor = param1;
                }

                var isAwesomeIcon = $(getSelectionParentElement()).parent().hasClass('fr-fontAwesomeIcon');
                console.log('awesome icon plugin : command.before>>', isAwesomeIcon, selectedColor, selectedFontSize);

                if (isAwesomeIcon) {
                    if (selectedFontSize && selectedColor) {
                        $(getSelectionParentElement()).parents('.fr-fontAwesomeIcon').detach();
                        b.html.insert('<span class="fr-fontAwesomeIcon fr-emoticon">' + "<span style='color:" + selectedColor + "; font-size: " + selectedFontSize + "px' class='fa fa-" + selectedIcon + "'>&nbsp;</span>" + "</span>" + a.FroalaEditor.MARKERS, true);
                    } else if (selectedFontSize) {
                        $(getSelectionParentElement()).parents('.fr-fontAwesomeIcon').detach();
                        b.html.insert('<span class="fr-fontAwesomeIcon fr-emoticon">' + "<span style='font-size: " + selectedFontSize + "px' class='fa fa-" + selectedIcon + "'>&nbsp;</span>" + "</span>" + a.FroalaEditor.MARKERS, true);
                    } else if (selectedColor) {
                        $(getSelectionParentElement()).parents('.fr-fontAwesomeIcon').detach();
                        b.html.insert('<span class="fr-fontAwesomeIcon fr-emoticon">' + "<span style='color:" + selectedColor + "' class='fa fa-" + selectedIcon + "'>&nbsp;</span>" + "</span>" + a.FroalaEditor.MARKERS, true);
                    }
                }
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
