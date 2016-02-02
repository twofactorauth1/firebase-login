! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    a.extend(a.FroalaEditor.POPUP_TEMPLATES, {
        "iconButtons": "[_BUTTONS_][_ICONS_]"
    }), a.extend(a.FroalaEditor.DEFAULTS, {
        icons: ["adjust", "anchor", "archive", "arrows", "arrows-h", "arrows-v", "asterisk", "ban", "bar-chart-o", "barcode", "bars", "beer", "bell", "bell-o", "bolt", "bomb", "book", "bookmark", "bookmark-o", "briefcase", "bug", "building", "building-o", "bullhorn", "bullseye", "calendar", "calendar-o", "camera", "camera-retro", "car", "caret-square-o-down", "caret-square-o-left", "caret-square-o-right", "caret-square-o-up", "certificate", "check", "check-circle", "check-circle-o", "check-square", "check-square-o", "child", "circle", "circle-o", "circle-o-notch", "circle-thin", "clock-o", "cloud", "cloud-download", "cloud-upload", "code", "code-fork", "coffee", "cog", "cogs", "comment", "comment-o", "comments", "comments-o", "compass", "credit-card", "crop", "crosshairs", "cube", "cubes", "cutlery", "database", "desktop", "dot-circle-o", "download", "ellipsis-h", "ellipsis-v", "envelope", "envelope-o", "envelope-square", "eraser", "exchange", "exclamation", "exclamation-circle", "exclamation-triangle", "external-link", "external-link-square", "eye", "eye-slash", "fax", "female", "fighter-jet", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-pdf-o", "file-powerpoint-o", "file-video-o", "file-word-o", "film", "filter", "fire", "fire-extinguisher", "flag", "flag-checkered", "flag-o", "flask", "folder", "folder-o", "folder-open", "folder-open-o", "frown-o", "gamepad", "gavel", "gift", "glass", "globe", "graduation-cap", "hdd-o", "headphones", "heart", "heart-o", "history", "home", "inbox", "info", "info-circle", "key", "keyboard-o", "language", "laptop", "leaf", "lemon-o", "level-down", "level-up", "life-ring", "lightbulb-o", "location-arrow", "lock", "magic", "magnet", "male", "map-marker", "meh-o", "microphone", "microphone-slash", "minus", "minus-circle", "minus-square", "minus-square-o", "mobile", "money", "moon-o", "music", "paper-plane", "paper-plane-o", "paw", "pencil", "pencil-square", "pencil-square-o", "phone", "phone-square", "picture-o", "plane", "plus", "plus-circle", "plus-square", "plus-square-o", "power-off", "print", "puzzle-piece", "qrcode", "question", "question-circle", "quote-left", "quote-right", "random", "recycle", "refresh", "reply", "reply-all", "retweet", "road", "rocket", "rss", "rss-square", "search", "search-minus", "search-plus", "share", "share-alt", "share-alt-square", "share-square", "share-square-o", "shield", "shopping-cart", "sign-in", "sign-out", "signal", "sitemap", "sliders", "smile-o", "sort", "sort-alpha-asc", "sort-alpha-desc", "sort-amount-asc", "sort-amount-desc", "sort-asc", "sort-desc", "sort-numeric-asc", "sort-numeric-desc", "space-shuttle", "spinner", "spoon", "square", "square-o", "star", "star-half", "star-half-o", "star-o", "suitcase", "sun-o", "tablet", "tachometer", "tag", "tags", "tasks", "taxi", "terminal", "thumb-tack", "thumbs-down", "thumbs-o-down", "thumbs-o-up", "thumbs-up", "ticket", "times", "times-circle", "times-circle-o", "tint", "trash-o", "tree", "trophy", "truck", "umbrella", "university", "unlock", "unlock-alt", "upload", "user", "users", "video-camera", "volume-down", "volume-off", "volume-up", "wheelchair", "wrench", "file", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-o", "file-pdf-o", "file-powerpoint-o", "file-text", "file-text-o", "file-video-o", "file-word-o", "circle-o-notch", "btc", "eur", "gbp", "inr", "jpy", "krw", "rub", "try", "usd", "align-center", "align-justify", "align-left", "align-right", "bold", "chain-broken", "clipboard", "columns", "eraser", "files-o", "floppy-o", "font", "header", "indent", "italic", "link", "list", "list-alt", "list-ol", "list-ul", "outdent", "paperclip", "paragraph", "repeat", "scissors", "strikethrough", "subscript", "superscript", "table", "text-height", "text-width", "th", "th-large", "th-list", "underline", "undo", "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up", "angle-down", "angle-left", "angle-right", "angle-up", "arrow-circle-down", "arrow-circle-left", "arrow-circle-o-down", "arrow-circle-o-left", "arrow-circle-o-right", "arrow-circle-o-up", "arrow-circle-right", "arrow-circle-up", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "arrows-alt", "caret-down", "caret-left", "caret-right", "caret-up", "chevron-circle-down", "chevron-circle-left", "chevron-circle-right", "chevron-circle-up", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "hand-o-down", "hand-o-left", "hand-o-right", "hand-o-up", "long-arrow-down", "long-arrow-left", "long-arrow-right", "long-arrow-up", "backward", "compress", "eject", "expand", "fast-backward", "fast-forward", "forward", "pause", "play", "play-circle", "play-circle-o", "step-backward", "step-forward", "stop", "youtube-play", "adn", "android", "apple", "behance", "behance-square", "bitbucket", "bitbucket-square", "btc", "codepen", "css3", "delicious", "deviantart", "digg", "dribbble", "dropbox", "drupal", "empire", "facebook", "facebook-square", "flickr", "foursquare", "git", "git-square", "github", "github-alt", "github-square", "gittip", "google", "google-plus", "google-plus-square", "hacker-news", "html5", "instagram", "joomla", "jsfiddle", "linkedin", "linkedin-square", "linux", "maxcdn", "openid", "pagelines", "pied-piper", "pied-piper-alt", "pinterest", "pinterest-square", "qq", "rebel", "reddit", "reddit-square", "renren", "share-alt", "share-alt-square", "skype", "slack", "soundcloud", "spotify", "stack-exchange", "stack-overflow", "steam", "steam-square", "stumbleupon", "stumbleupon-circle", "tencent-weibo", "trello", "tumblr", "tumblr-square", "twitter", "twitter-square", "vimeo-square", "vine", "vk", "weibo", "weixin", "windows", "wordpress", "xing", "xing-square", "yahoo", "youtube", "youtube-square", "ambulance", "h-square", "hospital-o", "medkit", "stethoscope", "user-md"],        
        iconButtons: ["insertIconBack", "|", "-"]
    }), a.FroalaEditor.PLUGINS.insertIcon = function(b) {
        function c() {
            var a = b.$tb.find('.fr-command[data-cmd="insertIcon"]'),
                c = b.popups.get("iconButtons");
            if (c || (c = e()), !c.hasClass("fr-active")) {
                b.popups.setContainer("iconButtons", b.$tb);
                var d = a.offset().left + a.outerWidth() / 2,
                    f = a.offset().top + (b.opts.toolbarBottom ? 10 : a.outerHeight() - 10);
                b.popups.get("iconButtons").addClass("icon-popup");
                if($("#componentloader").offset){
                    screenLeft = $("#componentloader").offset().left;                 
                    d = screenLeft;
                }
                b.popups.show("iconButtons", d, f, a.outerHeight())
            }
        }

        function d() {
            b.popups.hide("iconButtons")
        }

        function e() {
            var a = '<div class="fr-buttons fr-icon-buttons">';
            b.opts.toolbarInline && b.opts.iconButtons.length > 0 && (a += b.button.buildList(b.opts.iconButtons)), a + "</div>";
            var c = {
                    buttons: a,
                    icons: g("icons")
                },
                d = b.popups.create("iconButtons", c);
            return d
        }
        function g(a) {
          for (var c = b.opts.icons, d = '<div class="fr-icon-set fr-icon fr-selected-set>"', e = 0; e < c.length; e++) d += '<span class="fr-command fa fa-' + c[e] + '" data-cmd="iconChangeSet" data-param1="' + c[e] + '"></span>'; 
            return d + "</div>"
        }

        function l() {
            b.popups.hide("iconButtons"), b.toolbar.showInline()
        }

        function m() {}
        return {
            _init: m,
            showIconsPopup: c,
            changeSet: i,
            back: l
        }
    }, a.FroalaEditor.DefineIcon("insertIcon", {
        NAME: "flag"
    }), a.FroalaEditor.RegisterCommand("insertIcon", {
        title: "Insert Icon",
        undo: !1,
        focus: !0,
        refreshOnCallback: !1,
        popup: !0,
        callback: function() {
            this.popups.isVisible("iconButtons") ? (this.$el.find(".fr-marker") && (this.events.disableBlur(), this.selection.restore()), this.popups.hide("iconButtons")) : this.insertIcon.showIconsPopup()
        },
        plugin: "insertIcon"
    }), a.FroalaEditor.RegisterCommand("iconChangeSet", {
        undo: !1,
        focus: !1,
        callback: function(a, b) {
          var iconHTML = '<i class="fa fa-' + b +'"></i>';
          this.html.insert(iconHTML);
          this.popups.hide("iconButtons");
        }
    }), a.FroalaEditor.DefineIcon("insertIconBack", {
        NAME: "arrow-left"
    }), a.FroalaEditor.RegisterCommand("insertIconBack", {
        title: "Back",
        undo: !1,
        focus: !1,
        back: !0,
        refreshAfterCallback: !1,
        callback: function() {
            this.insertIcon.back();
        }
    })
});