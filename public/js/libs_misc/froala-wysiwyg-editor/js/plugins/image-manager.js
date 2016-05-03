/*!
 * froala_editor v2.1.0 (https://www.froala.com/wysiwyg-editor)
 * License https://froala.com/wysiwyg-editor/terms
 * Copyright 2014-2016 Froala Labs
 */

! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    a.extend(a.FroalaEditor.POPUP_TEMPLATES, {
        "image.insert": "[_BUTTONS_][_UPLOAD_LAYER_][_BY_URL_LAYER_][_BY_MEDIA_LAYER_][_PROGRESS_BAR_]",
        "image.edit": "[_BUTTONS_]",
        "image.alt": "[_BUTTONS_][_ALT_LAYER_]",
        "image.size": "[_BUTTONS_][_SIZE_LAYER_]"
    }), a.extend(a.FroalaEditor.DEFAULTS, {
        imageInsertButtons: ["imageBack", "|", "imageUpload", "imageByURL"],
        imageEditButtons: ["imageReplace", "imageAlign", "imageRemove", "|", "imageLink", "linkOpen", "linkEdit", "linkRemove", "-", "imageDisplay", "imageStyle", "imageAlt", "imageSize"],
        imageAltButtons: ["imageBack", "|"],
        imageSizeButtons: ["imageBack", "|"],
        imageUploadURL: "http://i.froala.com/upload",
        imageUploadParam: "file",
        imageUploadParams: {},
        imageUploadToS3: !1,
        imageUploadMethod: "POST",
        imageMaxSize: 10485760,
        imageAllowedTypes: ["jpeg", "jpg", "png", "gif", "svg+xml"],
        imageResize: !0,
        imageResizeWithPercent: !1,
        imageMove: !0,
        imageDefaultWidth: 300,
        imageDefaultAlign: "center",
        imageDefaultDisplay: "block",
        imageStyles: {
            "fr-rounded": "Rounded",
            "fr-bordered": "Bordered"
        },
        imageMultipleStyles: !0,
        imageTextNear: !0,
        imagePaste: !0
    }), a.FroalaEditor.PLUGINS.image = function(b) {
        function c() {
            var a = b.popups.get("image.insert"),
                c = a.find(".fr-image-by-url-layer input");
            c.val(""), ia && c.val(ia.attr("src")), c.trigger("change")
        }

        function d() {
            var a = b.$tb.find('.fr-command[data-cmd="insertImage"]'),
                c = b.popups.get("image.insert");
            if (c || (c = F()), r(), !c.hasClass("fr-active"))
                if (b.popups.refresh("image.insert"), b.popups.setContainer("image.insert", b.$tb), a.is(":visible")) {
                    var d = a.offset().left + a.outerWidth() / 2,
                        e = a.offset().top + (b.opts.toolbarBottom ? 10 : a.outerHeight() - 10);
                    b.popups.show("image.insert", d, e, a.outerHeight())
                } else b.position.forSelection(c), b.popups.show("image.insert")
        }

        function e() {
            var c = b.popups.get("image.edit");
            c || (c = p()), b.popups.setContainer("image.edit", a(b.opts.scrollableContainer)), b.popups.refresh("image.edit");
            var d = ia.offset().left + ia.outerWidth() / 2,
                e = ia.offset().top + ia.outerHeight();
            b.popups.show("image.edit", d, e, ia.outerHeight())
        }

        function f() {
            r()
        }

        function g(a) {
            if (!a.hasClass("fr-dii") && !a.hasClass("fr-dib")) {
                var c = a.css("float");
                a.css("float", "none"), "block" == a.css("display") ? (a.css("float", c), 0 === parseInt(a.css("margin-left"), 10) && (a.attr("style") || "").indexOf("margin-right: auto") >= 0 ? a.addClass("fr-fil") : 0 === parseInt(a.css("margin-right"), 10) && (a.attr("style") || "").indexOf("margin-left: auto") >= 0 && a.addClass("fr-fir"), a.addClass("fr-dib")) : (a.css("float", c), "left" == a.css("float") ? a.addClass("fr-fil") : "right" == a.css("float") && a.addClass("fr-fir"), a.addClass("fr-dii")), a.css("margin", ""), a.css("float", ""), a.css("display", ""), a.css("z-index", ""), a.css("position", ""), a.css("overflow", ""), a.css("vertical-align", "")
            }
            a.attr("width") && (a.css("width", a.width()), a.removeAttr("width")), b.opts.imageTextNear || a.removeClass("fr-dii").addClass("fr-dib")
        }

        function h() {
            for (var c = "IMG" == b.$el.get(0).tagName ? [b.$el.get(0)] : b.$el.get(0).querySelectorAll("img"), d = 0; d < c.length; d++) g(a(c[d])), b.opts.iframe && a(c[d]).on("load", b.size.syncIframe)
        }

        function i() {
            var c, d = Array.prototype.slice.call(b.$el.get(0).querySelectorAll("img")),
                e = [];
            for (c = 0; c < d.length; c++) e.push(d[c].getAttribute("src"));
            if (ua)
                for (c = 0; c < ua.length; c++) e.indexOf(ua[c].getAttribute("src")) < 0 && b.events.trigger("image.removed", [a(ua[c])]);
            ua = d
        }

        function j() {
            ja || R();
            var a = b.$wp ? b.$wp.scrollTop() - (b.$wp.offset().top + 1) : -1,
                c = b.$wp ? b.$wp.scrollLeft() - (b.$wp.offset().left + 1) : -1;
            b.$wp && (c -= b.helpers.getPX(b.$wp.css("border-left-width"))), ja.css("top", b.opts.iframe ? ia.offset().top - 1 : ia.offset().top + a).css("left", b.opts.iframe ? ia.offset().left - 1 : ia.offset().left + c).css("width", ia.outerWidth()).css("height", ia.outerHeight()).addClass("fr-active")
        }

        function k(a) {
            return '<div class="fr-handler fr-h' + a + '"></div>'
        }

        function l(c) {
            return c.preventDefault(), c.stopPropagation(), b.$el.find("img.fr-error").left ? !1 : (ka = a(this), ka.data("start-x", c.pageX || c.originalEvent.touches[0].pageX), ka.data("start-width", ia.width()), la.show(), void b.popups.hideAll())
        }

        function m(c) {
            if (ka && ia) {
                if (c.preventDefault(), b.$el.find("img.fr-error").left) return !1;
                var d = c.pageX || (c.originalEvent.touches ? c.originalEvent.touches[0].pageX : null);
                if (!d) return !1;
                var e = ka.data("start-x"),
                    f = d - e,
                    g = ka.data("start-width");
                if ((ka.hasClass("fr-hnw") || ka.hasClass("fr-hsw")) && (f = 0 - f), b.opts.imageResizeWithPercent) {
                    var h = ia.parentsUntil(b.$el, b.html.blockTagsQuery()).get(0);
                    ia.css("width", ((g + f) / a(h).outerWidth() * 100).toFixed(2) + "%")
                } else ia.css("width", g + f);
                ia.css("height", "").removeAttr("height"), j(), b.events.trigger("image.resize", [ga()])
            }
        }

        function n(a) {
            if (ka && ia) {
                if (a && a.stopPropagation(), b.$el.find("img.fr-error").left) return !1;
                ka = null, la.hide(), j(), e(), b.undo.saveStep(), b.events.trigger("image.resizeEnd", [ga()])
            }
        }

        function o(a, c) {
            b.edit.on(), ia && ia.addClass("fr-error"), t(b.language.translate("Something went wrong. Please try again.")), b.events.trigger("image.error", [{
                code: a,
                message: ta[a]
            }, c])
        }

        function p() {
            var a = "";
            b.opts.imageEditButtons.length > 1 && (a += '<div class="fr-buttons">', a += b.button.buildList(b.opts.imageEditButtons), a += "</div>");
            var c = {
                    buttons: a
                },
                d = b.popups.create("image.edit", c);
            return b.$wp && (b.$wp.on("scroll.image-edit", function() {
                ia && b.popups.isVisible("image.edit") && e()
            }), b.events.on("destroy", function() {
                b.$wp.off("scroll.image-edit")
            })), d
        }

        function q() {
            var a = b.popups.get("image.insert");
            a && (a.find(".fr-layer.fr-active").removeClass("fr-active").addClass("fr-pactive"), a.find(".fr-image-progress-bar-layer").addClass("fr-active"), a.find(".fr-buttons").hide(), s("Uploading", 0))
        }

        function r(a) {
            var c = b.popups.get("image.insert");
            c && (c.find(".fr-layer.fr-pactive").addClass("fr-active").removeClass("fr-pactive"), c.find(".fr-image-progress-bar-layer").removeClass("fr-active"), c.find(".fr-buttons").show(), (a || b.$el.find("img.fr-error").length) && (b.events.focus(), b.$el.find("img.fr-error").remove(), b.undo.saveStep(), b.undo.run(), b.undo.dropRedo()))
        }

        function s(a, c) {
            var d = b.popups.get("image.insert");
            if (d) {
                var e = d.find(".fr-image-progress-bar-layer");
                e.find("h3").text(a + (c ? " " + c + "%" : "")), e.removeClass("fr-error"), c ? (e.find("div").removeClass("fr-indeterminate"), e.find("div > span").css("width", c + "%")) : e.find("div").addClass("fr-indeterminate")
            }
        }

        function t(a) {
            var c = b.popups.get("image.insert"),
                d = c.find(".fr-image-progress-bar-layer");
            d.addClass("fr-error"), d.find("h3").text(a)
        }

        function u() {
            var a = b.popups.get("image.insert"),
                c = a.find(".fr-image-by-url-layer input");
            c.val().length > 0 && (q(), s("Loading image"), v(b.helpers.sanitizeURL(c.val()), !0, [], ia), c.val(""), c.blur())
        }

        function v(c, d, e, f, g) {
            b.edit.off(), s("Loading image");
            var h = new Image;
            h.onload = function() {
                var d, h;
                if (f) {
                    var i = f.data("fr-old-src");
                    b.$wp ? (d = f.clone().removeData("fr-old-src"), i && f.attr("src", i), f.removeClass("fr-uploading"), f.replaceWith(d), d.off("load")) : d = f;
                    for (var j = d.get(0).attributes, k = 0; k < j.length; k++) {
                        var l = j[k];
                        0 === l.nodeName.indexOf("data-") && d.removeAttr(l.nodeName)
                    }
                    if ("undefined" != typeof e)
                        for (h in e) "link" != h && d.attr("data-" + h, e[h]);
                    d.on("load", function() {
                        b.popups.hide("image.insert"), d.removeClass("fr-uploading"), d.next().is("br") && d.next().remove(), d.trigger("click").trigger("touchend"), b.events.trigger("image.loaded", [d])
                    }), d.attr("src", c), b.edit.on(), b.undo.saveStep(), b.events.trigger(i ? "image.replaced" : "image.inserted", [d, g])
                } else {
                    var m = "";
                    if ("undefined" != typeof e)
                        for (h in e) "link" != h && (m += " data-" + h + '="' + e[h] + '"');
                    var n = b.opts.imageDefaultWidth;
                    n && "auto" != n && ("" + n).indexOf("px") < 0 && ("" + n).indexOf("%") < 0 && (n += "px"), d = a('<img class="fr-di' + b.opts.imageDefaultDisplay[0] + ("center" != b.opts.imageDefaultAlign ? " fr-fi" + b.opts.imageDefaultAlign[0] : "") + '" src="' + c + '"' + m + (n ? ' style="width: ' + n + ';"' : "") + ">"), d.on("load", function() {
                        d.next().is("br") && d.next().remove(), d.trigger("click").trigger("touchend"), b.events.trigger("image.loaded", [d])
                    }), b.edit.on(), b.events.focus(!0), b.selection.restore(), b.selection.isCollapsed() || b.selection.remove(), b.markers.insert();
                    var o = b.$el.find(".fr-marker");
                    o.replaceWith(d), b.selection.clear(), b.undo.saveStep(), b.events.trigger("image.inserted", [d, g])
                }
            }, h.onerror = function() {
                o(ma)
            }, h.src = c
        }

        function w(c) {
            try {
                if (b.events.trigger("image.uploaded", [c], !0) === !1) return b.edit.on(), !1;
                var d = a.parseJSON(c);
                return d.link ? d : (o(na, c), !1)
            } catch (e) {
                return o(pa, c), !1
            }
        }

        function x(c) {
            try {
                var d = a(c).find("Location").text(),
                    e = a(c).find("Key").text();
                return b.events.trigger("image.uploadedToS3", [d, e, c], !0) === !1 ? (b.edit.on(), !1) : d
            } catch (f) {
                return o(pa, c), !1
            }
        }

        function y(a) {
            s("Loading image");
            var c = this.status,
                d = this.response,
                e = this.responseXML,
                f = this.responseText;
            try {
                if (b.opts.imageUploadToS3)
                    if (201 == c) {
                        var g = x(e);
                        g && v(g, !1, [], a, d || e)
                    } else o(pa, d || e);
                else if (c >= 200 && 300 > c) {
                    var h = w(f);
                    h && v(h.link, !1, h, a, d || f)
                } else o(oa, d || f)
            } catch (i) {
                o(pa, d || f)
            }
        }

        function z() {
            o(pa, this.response || this.responseText || this.responseXML)
        }

        function A(a) {
            if (a.lengthComputable) {
                var b = a.loaded / a.total * 100 | 0;
                s("Uploading", b)
            }
        }

        function B(c, d, f) {
            var g, h = new FileReader;
            h.addEventListener("load", function() {
                for (var f = atob(h.result.split(",")[1]), i = [], k = 0; k < f.length; k++) i.push(f.charCodeAt(k));
                var l = window.URL.createObjectURL(new Blob([new Uint8Array(i)], {
                    type: "image/jpeg"
                }));
                if (ia) g = ia;
                else {
                    var m = b.opts.imageDefaultWidth;
                    m && "auto" != m && ("" + m).indexOf("px") < 0 && ("" + m).indexOf("%") < 0 && (m += "px"), g = a('<img class="fr-uploading fr-di' + b.opts.imageDefaultDisplay[0] + ("center" != b.opts.imageDefaultAlign ? " fr-fi" + b.opts.imageDefaultAlign[0] : "") + '" src="' + l + '"' + (m ? ' style="width: ' + m + ';"' : "") + ">")
                }
                if (g.on("load", function() {
                        g.next().is("br") && g.next().remove(), b.placeholder.refresh(), g.trigger("click").trigger("touchend"), j(), e(), ea(), q(), b.edit.off(), c.onload = function() {
                            y.call(c, g)
                        }, c.onerror = z, c.upload.onprogress = A, c.send(d)
                    }), ia) b.edit.on(), b.undo.saveStep(), ia.data("fr-old-src", ia.attr("src")), ia.attr("src", l), g.addClass("fr-uploading");
                else {
                    b.edit.on(), b.events.focus(!0), b.selection.restore(), b.undo.saveStep(), b.selection.isCollapsed() || b.selection.remove(), b.markers.insert();
                    var n = b.$el.find(".fr-marker");
                    n.replaceWith(g), b.selection.clear()
                }
            }, !1), h.readAsDataURL(f)
        }

        function C(a) {
            if (b.events.trigger("image.beforeUpload", [a]) === !1) return !1;
            if ("undefined" != typeof a && a.length > 0) {
                var c = a[0];
                if (c.size > b.opts.imageMaxSize) return o(qa), !1;
                if (b.opts.imageAllowedTypes.indexOf(c.type.replace(/image\//g, "")) < 0) return o(ra), !1;
                var d;
                if (b.drag_support.formdata && (d = b.drag_support.formdata ? new FormData : null), d) {
                    var e;
                    if (b.opts.imageUploadToS3 !== !1) {
                        d.append("key", b.opts.imageUploadToS3.keyStart + (new Date).getTime() + "-" + (c.name || "untitled")), d.append("success_action_status", "201"), d.append("X-Requested-With", "xhr"), d.append("Content-Type", c.type);
                        for (e in b.opts.imageUploadToS3.params) d.append(e, b.opts.imageUploadToS3.params[e])
                    }
                    for (e in b.opts.imageUploadParams) d.append(e, b.opts.imageUploadParams[e]);
                    d.append(b.opts.imageUploadParam, c);
                    var f = b.opts.imageUploadURL;
                    b.opts.imageUploadToS3 && (f = "/api/1.0/assets/");
                    var g = b.core.getXHR(f, b.opts.imageUploadMethod);
                    g.withCredentials = false;
                    B(g, d, c)
                }
            }
        }

        function D(b) {
            b.on("dragover dragenter", ".fr-image-upload-layer", function() {
                return a(this).addClass("fr-drop"), !1
            }), b.on("dragleave dragend", ".fr-image-upload-layer", function() {
                return a(this).removeClass("fr-drop"), !1
            }), b.on("drop", ".fr-image-upload-layer", function(b) {
                b.preventDefault(), b.stopPropagation(), a(this).removeClass("fr-drop");
                var c = b.originalEvent.dataTransfer;
                c && c.files && C(c.files)
            }), b.on("change", '.fr-image-upload-layer input[type="file"]', function() {
                this.files && C(this.files), a(this).val(""), a(this).blur()
            })
        }

        function E() {
            b.$el.on(b._mousedown, "IMG" == b.$el.get(0).tagName ? null : "img", function(c) {
                b.selection.clear(), b.browser.msie && (b.events.disableBlur(), b.$el.attr("contenteditable", !1)), b.opts.imageMove || c.preventDefault(), c.stopPropagation(), b.opts.imageMove && (b.opts.toolbarInline && b.toolbar.hide(), a(this).addClass("fr-img-move"))
            }), b.$el.on(b._mouseup, "IMG" == b.$el.get(0).tagName ? null : "img", function(c) {
                c.stopPropagation(), b.browser.msie && (b.$el.attr("contenteditable", !0), b.events.enableBlur()), a(this).removeClass("fr-img-move")
            });
            var c = function(a) {
                    var c = b.$document && b.$document.find("img.fr-img-move").get(0);
                    return c ? (b.browser.msie && a.preventDefault(), "undefined" != typeof b.browser.msie || "undefined" != typeof b.browser.edge) : void a.preventDefault()
                },
                d = function(a) {
                    a.preventDefault()
                };
            b.events.on("dragenter", d, !0), b.events.on("dragover", c, !0), b.events.on("drop", function(c) {
                for (var d, e, f = 0; f < a.FroalaEditor.INSTANCES.length; f++)
                    if (d = a.FroalaEditor.INSTANCES[f].$el.find("img.fr-img-move").get(0)) {
                        e = a.FroalaEditor.INSTANCES[f];
                        break
                    }
                if (d) {
                    c.preventDefault(), c.stopPropagation();
                    var g = b.markers.insertAtPoint(c.originalEvent);
                    if (g === !1) return !1;
                    Y(!0), e != b && e.image && (e.image.exitEdit(!0), e.popups.hide("image.edit"));
                    var h, i;
                    "A" == d.parentNode.tagName && 0 === d.parentNode.textContent.length ? (i = a(d.parentNode), h = a(d.parentNode).clone(), h.find("img").removeClass("fr-img-move").on("load", X)) : (i = a(d), h = a(d).clone(), h.removeClass("fr-img-move").on("load", X));
                    var j = b.$el.find(".fr-marker");
                    return j.replaceWith(h), i.remove(), b.undo.saveStep(), !1
                }
                Y(!0), b.popups.hideAll();
                var k = c.originalEvent.dataTransfer;
                if (k && k.files && k.files.length && (d = k.files[0], d && d.type && b.opts.imageAllowedTypes.indexOf(d.type.replace(/image\//g, "")) >= 0)) {
                    b.markers.remove(), b.markers.insertAtPoint(c.originalEvent), b.$el.find(".fr-marker").replaceWith(a.FroalaEditor.MARKERS), b.popups.hideAll();
                    var l = b.popups.get("image.insert");
                    return l || (l = F()), b.popups.setContainer("image.insert", a(b.opts.scrollableContainer)), b.popups.show("image.insert", c.originalEvent.pageX, c.originalEvent.pageY), q(), C(k.files), c.preventDefault(), c.stopPropagation(), !1
                }
            }, !0), b.events.on("document.drop", function(a) {
                b.$el.find("img.fr-img-move").length && (a.preventDefault(), a.stopPropagation(), b.$el.find("img.fr-img-move").removeClass("fr-img-move"))
            }), b.events.on("mousedown", Z), b.events.on("window.mousedown", Z), b.events.on("window.touchmove", $), b.events.on("mouseup", Y), b.events.on("window.mouseup", Y), b.events.on("commands.mousedown", function(a) {
                a.parents(".fr-toolbar").length > 0 && Y()
            }), b.events.on("image.hideResizer", function() {
                Y(!0)
            }), b.events.on("commands.undo", function() {
                Y(!0)
            }), b.events.on("commands.redo", function() {
                Y(!0)
            }), b.events.on("destroy", function() {
                b.$el.off(b._mouseup, "img")
            }, !0)
        }

        function F() {
            var a, d = "";
            b.opts.imageInsertButtons.length > 1 && (d = '<div class="fr-buttons">' + b.button.buildList(b.opts.imageInsertButtons) + "</div>");
            var e = b.opts.imageInsertButtons.indexOf("imageUpload"),
                g = b.opts.imageInsertButtons.indexOf("imageByURL"),
                ss = b.opts.imageInsertButtons.indexOf("mediaManager"),
                h = "";

            e >= 0 && (a = " fr-active", g >= 0 && e > g && (a = ""), h = '<div class="fr-image-upload-layer' + a + ' fr-layer" id="fr-image-upload-layer-' + b.id + '"><strong>' + b.language.translate("Drop image") + "</strong><br>(" + b.language.translate("or click") + ')<div class="fr-form"><input type="file" accept="image/*" tabIndex="-1"></div></div>');
            var hh = "";
            ss >= 0 && (a = " fr-active", ss >= 0 && (a = ""), hh = '<div data-cmd="insertMedia" class="fr-image-upload-media-layer' + a + ' fr-layer" id="fr-image-upload-media-layer-' + b.id + '"><button type="button" class="fr-command fr-submit" data-cmd="insertMedia"><i class="ti-upload"></i><span>Media Manager</span></button></div>');
            var i = "";
            g >= 0 && (a = " fr-active", e >= 0 && g > e && (a = ""), i = '<div class="fr-image-by-url-layer' + a + ' fr-layer" id="fr-image-by-url-layer-' + b.id + '"><div class="fr-input-line"><input type="text" placeholder="http://" tabIndex="1"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="imageInsertByURL" tabIndex="2">' + b.language.translate("Insert") + "</button></div></div>");

            var j = '<div class="fr-image-progress-bar-layer fr-layer"><h3 class="fr-message">Uploading</h3><div class="fr-loader"><span class="fr-progress"></span></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-back" data-cmd="imageDismissError" tabIndex="2">OK</button></div></div>',
                k = {
                    buttons: d,
                    upload_layer: h,
                    by_url_layer: i,
                    by_media_layer: hh,
                    progress_bar: j
                },
                l = b.popups.create("image.insert", k);
            return b.popups.onRefresh("image.insert", c), b.popups.onHide("image.insert", f), b.$wp && b.$wp.on("scroll.image-insert", function() {
                ia && b.popups.isVisible("image.insert") && ea()
            }), b.events.on("destroy", function() {
                b.$wp && b.$wp.off("scroll.image-insert"), l.off("dragover dragenter", ".fr-image-upload-layer"), l.off("dragleave dragend", ".fr-image-upload-layer"), l.off("drop", ".fr-image-upload-layer"), l.off("change", '.fr-image-upload-layer input[type="file"]')
            }), D(l), l
        }

        function G() {
            if (ia) {
                var a = b.popups.get("image.alt");
                a.find("input").val(ia.attr("alt") || "").trigger("change")
            }
        }

        function H() {
            var c = b.popups.get("image.alt");
            c || (c = I()), r(), b.popups.refresh("image.alt"), b.popups.setContainer("image.alt", a(b.opts.scrollableContainer));
            var d = ia.offset().left + ia.width() / 2,
                e = ia.offset().top + ia.height();
            b.popups.show("image.alt", d, e, ia.outerHeight())
        }

        function I() {
            var a = "";
            a = '<div class="fr-buttons">' + b.button.buildList(b.opts.imageAltButtons) + "</div>";
            var c = "";
            c = '<div class="fr-image-alt-layer fr-layer fr-active" id="fr-image-alt-layer-' + b.id + '"><div class="fr-input-line"><input type="text" placeholder="' + b.language.translate("Alternate Text") + '" tabIndex="1"></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="imageSetAlt" tabIndex="2">' + b.language.translate("Update") + "</button></div></div>";
            var d = {
                    buttons: a,
                    alt_layer: c
                },
                e = b.popups.create("image.alt", d);
            return b.popups.onRefresh("image.alt", G), b.$wp && (b.$wp.on("scroll.image-alt", function() {
                ia && b.popups.isVisible("image.alt") && H()
            }), b.events.on("destroy", function() {
                b.$wp.off("scroll.image-alt")
            })), e
        }

        function J(a) {
            if (ia) {
                var c = b.popups.get("image.alt");
                ia.attr("alt", a || c.find("input").val() || ""), c.find("input").blur(), setTimeout(function() {
                    ia.trigger("click").trigger("touchend")
                }, b.helpers.isAndroid() ? 50 : 0)
            }
        }

        function K() {
            if (ia) {
                var a = b.popups.get("image.size");
                a.find('input[name="width"]').val(ia.get(0).style.width).trigger("change"), a.find('input[name="height"]').val(ia.get(0).style.height).trigger("change")
            }
        }

        function L() {
            var c = b.popups.get("image.size");
            c || (c = M()), r(), b.popups.refresh("image.size"), b.popups.setContainer("image.size", a(b.opts.scrollableContainer));
            var d = ia.offset().left + ia.width() / 2,
                e = ia.offset().top + ia.height();
            b.popups.show("image.size", d, e, ia.outerHeight())
        }

        function M() {
            var a = "";
            a = '<div class="fr-buttons">' + b.button.buildList(b.opts.imageSizeButtons) + "</div>";
            var c = "";
            c = '<div class="fr-image-size-layer fr-layer fr-active" id="fr-image-size-layer-' + b.id + '"><div class="fr-image-group"><div class="fr-input-line"><input type="text" name="width" placeholder="' + b.language.translate("Width") + '" tabIndex="1"></div><div class="fr-input-line"><input type="text" name="height" placeholder="' + b.language.translate("Height") + '" tabIndex="1"></div></div><div class="fr-action-buttons"><button type="button" class="fr-command fr-submit" data-cmd="imageSetSize" tabIndex="2">' + b.language.translate("Update") + "</button></div></div>";
            var d = {
                    buttons: a,
                    size_layer: c
                },
                e = b.popups.create("image.size", d);
            return b.popups.onRefresh("image.size", K), b.$wp && (b.$wp.on("scroll.image-size", function() {
                ia && b.popups.isVisible("image.size") && L()
            }), b.events.on("destroy", function() {
                b.$wp.off("scroll.image-size")
            })), e
        }

        function N(a, c) {
            if (ia) {
                var d = b.popups.get("image.size");
                ia.css("width", a || d.find('input[name="width"]').val()), ia.css("height", c || d.find('input[name="height"]').val()), d.find("input").blur(), setTimeout(function() {
                    ia.trigger("click").trigger("touchend")
                }, b.helpers.isAndroid() ? 50 : 0)
            }
        }

        function O(a) {
            var c, d, e = b.popups.get("image.insert");
            if (ia || b.opts.toolbarInline) ia && (d = ia.offset().top + ia.outerHeight());
            else {
                var f = b.$tb.find('.fr-command[data-cmd="insertImage"]');
                c = f.offset().left + f.outerWidth() / 2, d = f.offset().top + (b.opts.toolbarBottom ? 10 : f.outerHeight() - 10)
            }!ia && b.opts.toolbarInline && (d = e.offset().top - b.helpers.getPX(e.css("margin-top")), e.hasClass("fr-above") && (d += e.outerHeight())), e.find(".fr-layer").removeClass("fr-active"), e.find(".fr-" + a + "-layer").addClass("fr-active"), b.popups.show("image.insert", c, d, ia ? ia.outerHeight() : 0)
        }

        function P(a) {
            var c = b.popups.get("image.insert");
            c.find(".fr-image-upload-layer").hasClass("fr-active") && a.addClass("fr-active")
        }

        function Q(a) {
            var c = b.popups.get("image.insert");
            c.find(".fr-image-by-url-layer").hasClass("fr-active") && a.addClass("fr-active")
        }

        function AA(a) {
            var c = b.popups.get("image.insert");
            c.find(".fr-image-upload-media-layer").hasClass("fr-active") && a.addClass("fr-active")
        }

        function R() {
            if (ja = a('<div class="fr-image-resizer"></div>'), (b.$wp || a(b.opts.scrollableContainer)).append(ja), ja.on("mousedown", function(a) {
                    a.stopPropagation()
                }), a(b.original_window).on("resize.image" + b.id, function() {
                    b.helpers.isMobile() || Y(!0)
                }), b.events.on("destroy", function() {
                    ja.html("").removeData().remove(), a(b.original_window).off("resize.image" + b.id)
                }, !0), b.opts.imageResize) {
                ja.append(k("nw") + k("ne") + k("sw") + k("se"));
                var c = ja.get(0).ownerDocument;
                ja.on(b._mousedown + ".imgresize" + b.id, ".fr-handler", l), a(c).on(b._mousemove + ".imgresize" + b.id, m), a(c.defaultView || c.parentWindow).on(b._mouseup + ".imgresize" + b.id, n), la = a('<div class="fr-image-overlay"></div>'), a(c).find("body").append(la), la.on("mouseleave", n), b.events.on("destroy", function() {
                    ja.off(b._mousedown + ".imgresize" + b.id), a(c).off(b._mousemove + ".imgresize" + b.id), a(c.defaultView || c.parentWindow).off(b._mouseup + ".imgresize" + b.id), la.off("mouseleave").remove()
                }, !0)
            }
        }

        function S(c) {
            c = c || ia, c && b.events.trigger("image.beforeRemove", [c]) !== !1 && (b.popups.hideAll(), Y(!0), c.get(0) == b.$el.get(0) ? c.removeAttr("src") : ("A" == c.get(0).parentNode.tagName ? (b.selection.setBefore(c.get(0).parentNode) || b.selection.setAfter(c.get(0).parentNode), a(c.get(0).parentNode).remove()) : (b.selection.setBefore(c.get(0)) || b.selection.setAfter(c.get(0)), c.remove()), b.selection.restore(), b.html.fillEmptyBlocks(!0)), b.undo.saveStep())
        }

        function T() {
            E(), b.$el.on(b.helpers.isMobile() && !b.helpers.isWindowsPhone() ? "touchend" : "click", "IMG" == b.$el.get(0).tagName ? null : "img", X), b.helpers.isMobile() && (b.$el.on("touchstart", "IMG" == b.$el.get(0).tagName ? null : "img", function() {
                va = !1
            }), b.$el.on("touchmove", function() {
                va = !0
            })), b.events.on("window.keydown", function(c) {
                var d = c.which;
                return !ia || d != a.FroalaEditor.KEYCODE.BACKSPACE && d != a.FroalaEditor.KEYCODE.DELETE ? ia && d == a.FroalaEditor.KEYCODE.ESC ? (Y(!0), c.preventDefault(), !1) : ia && !b.keys.ctrlKey(c) ? (c.preventDefault(), !1) : void 0 : (c.preventDefault(), S(), !1)
            }, !0), a(b.original_window).on("keydown." + b.id, function(b) {
                var c = b.which;
                return ia && c == a.FroalaEditor.KEYCODE.BACKSPACE ? (b.preventDefault(), !1) : void 0
            }), b.events.on("paste.before", V), b.events.on("paste.beforeCleanup", W), b.events.on("paste.after", U), b.events.on("html.set", h), h(), b.events.on("html.get", function(a) {
                return a = a.replace(/<(img)((?:[\w\W]*?))class="([\w\W]*?)(fr-uploading|fr-error)([\w\W]*?)"((?:[\w\W]*?))>/g, "")
            }), b.opts.iframe && b.events.on("image.loaded", b.size.syncIframe), b.$wp && (i(), b.events.on("contentChanged", i)), a(b.original_window).on("orientationchange.image." + b.id, function() {
                setTimeout(function() {
                    var a = ga();
                    a && a.trigger("click").trigger("touchend")
                }, 0)
            }), b.events.on("destroy", function() {
                b.$el.off("click touchstart touchend touchmove", "img"), b.$el.off("load", "img.fr-img-dirty"), b.$el.off("error", "img.fr-img-dirty"), a(b.original_window).off("orientationchange.image." + b.id), a(b.original_window).off("keydown." + b.id)
            }, !0), b.events.on("node.remove", function(a) {
                return "IMG" == a.get(0).tagName ? (S(a), !1) : void 0
            })
        }

        function U() {
            b.opts.imagePaste ? b.$el.find("img[data-fr-image-pasted]").each(function(c, d) {
                if (0 === d.src.indexOf("data:")) {
                    if (b.events.trigger("image.beforePasteUpload", [d]) === !1) return !1;
                    var f = b.opts.imageDefaultWidth;
                    "auto" != f && (f += b.opts.imageResizeWithPercent ? "%" : "px"), a(d).css("width", f), a(d).addClass("fr-dib"), ia = a(d), j(), e(), ea(), q(), b.edit.off();
                    for (var g = atob(a(d).attr("src").split(",")[1]), h = [], i = 0; i < g.length; i++) h.push(g.charCodeAt(i));
                    var k = new Blob([new Uint8Array(h)], {
                        type: "image/jpeg"
                    });
                    C([k]), a(d).removeAttr("data-fr-image-pasted")
                } else 0 !== d.src.indexOf("http") ? (b.selection.save(), a(d).remove(), b.selection.restore()) : a(d).removeAttr("data-fr-image-pasted")
            }) : b.$el.find("img[data-fr-image-pasted]").remove()
        }

        function V(a) {
            if (a && a.clipboardData && a.clipboardData.items && a.clipboardData.items[0]) {
                var c = a.clipboardData.items[0].getAsFile();
                if (c) {
                    var d = new FileReader;
                    return d.onload = function(a) {
                        var c = a.target.result,
                            d = b.opts.imageDefaultWidth;
                        d && "auto" != d && ("" + d).indexOf("px") < 0 && ("" + d).indexOf("%") < 0 && (d += "px"), b.html.insert('<img data-fr-image-pasted="true" class="fr-di' + b.opts.imageDefaultDisplay[0] + ("center" != b.opts.imageDefaultAlign ? " fr-fi" + b.opts.imageDefaultAlign[0] : "") + '" src="' + c + '"' + (d ? ' style="width: ' + d + ';"' : "") + ">"), b.events.trigger("paste.after")
                    }, d.readAsDataURL(c), !1
                }
            }
        }

        function W(a) {
            return a = a.replace(/<img /gi, '<img data-fr-image-pasted="true" ')
        }

        function X(c) {
            if (c && "touchend" == c.type && va) return !0;
            if (b.edit.isDisabled()) return c.stopPropagation(), c.preventDefault(), !1;
            b.toolbar.disable(), c.preventDefault(), b.helpers.isMobile() && (b.events.disableBlur(), b.$el.blur(), b.events.enableBlur()), b.opts.iframe && b.size.syncIframe(), ia = a(this), j(), e(), b.selection.clear(), b.button.bulkRefresh(), b.events.trigger("video.hideResizer");
            for (var d = 0; d < a.FroalaEditor.INSTANCES.length; d++) a.FroalaEditor.INSTANCES[d] != b && a.FroalaEditor.INSTANCES[d].events.trigger("image.hideResizer");
            b.helpers.isIOS() && setTimeout(e, 100)
        }

        function Y(a) {
            a === !0 && (wa = !0), ia && wa && (b.toolbar.enable(), ja.removeClass("fr-active"), b.popups.hide("image.edit"), ia = null), wa = !1
        }

        function Z() {
            wa = !0
        }

        function $() {
            wa = !1
        }

        function _(a) {
            ia.removeClass("fr-fir fr-fil"), "left" == a ? ia.addClass("fr-fil") : "right" == a && ia.addClass("fr-fir"), j(), e()
        }

        function aa(a) {
            ia && (ia.hasClass("fr-fil") ? a.find("> i").attr("class", "fa fa-align-left") : ia.hasClass("fr-fir") ? a.find("> i").attr("class", "fa fa-align-right") : a.find("> i").attr("class", "fa fa-align-justify"))
        }

        function ba(a, b) {
            if (ia) {
                var c = "justify";
                ia.hasClass("fr-fil") ? c = "left" : ia.hasClass("fr-fir") && (c = "right"), b.find('.fr-command[data-param1="' + c + '"]').addClass("fr-active")
            }
        }

        function ca(a) {
            ia.removeClass("fr-dii fr-dib"), "inline" == a ? ia.addClass("fr-dii") : "block" == a && ia.addClass("fr-dib"), j(), e()
        }

        function da(a, b) {
            var c = "block";
            ia.hasClass("fr-dii") && (c = "inline"), b.find('.fr-command[data-param1="' + c + '"]').addClass("fr-active")
        }

        function ea() {
            var c = b.popups.get("image.insert");
            c || (c = F()), b.popups.isVisible("image.insert") || (r(), b.popups.refresh("image.insert"), b.popups.setContainer("image.insert", a(b.opts.scrollableContainer)));
            var d = ia.offset().left + ia.width() / 2,
                e = ia.offset().top + ia.height();
            b.popups.show("image.insert", d, e, ia.outerHeight())
        }

        function fa() {
            ia ? ia.trigger("click").trigger("touchend") : (b.events.disableBlur(), b.selection.restore(), b.events.enableBlur(), b.popups.hide("image.insert"), b.toolbar.showInline())
        }

        function ga() {
            return ia
        }

        function ha(a) {
            if (!ia) return !1;
            if (!b.opts.imageMultipleStyles) {
                var c = Object.keys(b.opts.imageStyles);
                c.splice(c.indexOf(a), 1), ia.removeClass(c.join(" "))
            }
            ia.toggleClass(a), ia.trigger("click").trigger("touchend")
        }
        var ia, ja, ka, la, ma = 1,
            na = 2,
            oa = 3,
            pa = 4,
            qa = 5,
            ra = 6,
            sa = 7,
            ta = {};
        ta[ma] = "Image cannot be loaded from the passed link.", ta[na] = "No link in upload response.", ta[oa] = "Error during file upload.", ta[pa] = "Parsing response failed.", ta[qa] = "File is too large.", ta[ra] = "Image file type is invalid.", ta[sa] = "Files can be uploaded only to same domain in IE 8 and IE 9.";
        var ua, va, wa = !1;
        return {
            _init: T,
            showInsertPopup: d,
            showLayer: O,
            refreshUploadButton: P,
            refreshByURLButton: Q,
            refreshByMedia: AA,
            upload: C,
            insertByURL: u,
            align: _,
            refreshAlign: aa,
            refreshAlignOnShow: ba,
            display: ca,
            refreshDisplayOnShow: da,
            replace: ea,
            back: fa,
            get: ga,
            insert: v,
            showProgressBar: q,
            remove: S,
            hideProgressBar: r,
            applyStyle: ha,
            showAltPopup: H,
            showSizePopup: L,
            setAlt: J,
            setSize: N,
            exitEdit: Y
        }
    }, a.FroalaEditor.DefineIcon("insertImage", {
        NAME: "image"
    }), a.FroalaEditor.RegisterShortcut(80, "insertImage"), a.FroalaEditor.RegisterCommand("insertImage", {
        title: "Insert Image",
        undo: !1,
        focus: !0,
        refershAfterCallback: !1,
        popup: !0,
        callback: function() {
            this.popups.isVisible("image.insert") ? (this.$el.find(".fr-marker") && (this.events.disableBlur(), this.selection.restore()), this.popups.hide("image.insert")) : this.image.showInsertPopup()
            this.image.showLayer("image-upload-media");
        },
        plugin: "image"
    }), a.FroalaEditor.DefineIcon("imageUpload", {
        NAME: "upload"
    }), a.FroalaEditor.RegisterCommand("imageUpload", {
        title: "Upload Image",
        undo: !1,
        focus: !1,
        callback: function() {
            this.image.showLayer("image-upload")
        },
        refresh: function(a) {
            this.image.refreshUploadButton(a)
        }
    }), a.FroalaEditor.DefineIcon("imageByURL", {
        NAME: "link"
    }), a.FroalaEditor.RegisterCommand("imageByURL", {
        title: "By URL",
        undo: !1,
        focus: !1,
        callback: function() {
            this.image.showLayer("image-by-url")
        },
        refresh: function(a) {
            this.image.refreshByURLButton(a)
        }
    }), a.FroalaEditor.RegisterCommand("imageInsertByURL", {
        title: "Insert Image",
        undo: !0,
        refreshAfterCallback: !1,
        callback: function() {
            this.image.insertByURL()
        },
        refresh: function(a) {
            var b = this.image.get();
            b ? a.text("Replace") : a.text(this.language.translate("Insert"))
        }
    }), a.FroalaEditor.RegisterCommand("insertMedia", {
        title: "Insert Image",
        undo: !0,
        callback: function() {
            this.$el.find(".fr-marker") && (this.events.disableBlur(), this.selection.restore());
            clickandInsertImageButton(this);
        }
    }), a.FroalaEditor.DefineIcon("imageDisplay", {
        NAME: "star"
    }), a.FroalaEditor.RegisterCommand("imageDisplay", {
        title: "Display",
        type: "dropdown",
        options: {
            inline: "Inline",
            block: "Break Text"
        },
        callback: function(a, b) {
            this.image.display(b)
        },
        refresh: function(a) {
            this.opts.imageTextNear || a.addClass("fr-hidden")
        },
        refreshOnShow: function(a, b) {
            this.image.refreshDisplayOnShow(a, b)
        }
    }), a.FroalaEditor.DefineIcon("imageAlign", {
        NAME: "align-center"
    }), a.FroalaEditor.RegisterCommand("imageAlign", {
        type: "dropdown",
        title: "Align",
        options: {
            left: "Align Left",
            justify: "None",
            right: "Align Right"
        },
        html: function() {
            var b = '<ul class="fr-dropdown-list">',
                c = a.FroalaEditor.COMMANDS.imageAlign.options;
            for (var d in c) b += '<li><a class="fr-command fr-title" data-cmd="imageAlign" data-param1="' + d + '" title="' + this.language.translate(c[d]) + '"><i class="fa fa-align-' + d + '"></i></a></li>';
            return b += "</ul>"
        },
        callback: function(a, b) {
            this.image.align(b)
        },
        refresh: function(a) {
            this.image.refreshAlign(a)
        },
        refreshOnShow: function(a, b) {
            this.image.refreshAlignOnShow(a, b)
        }
    }), a.FroalaEditor.DefineIcon("imageReplace", {
        NAME: "exchange"
    }), a.FroalaEditor.RegisterCommand("imageReplace", {
        title: "Replace",
        undo: !1,
        focus: !1,
        refreshAfterCallback: !1,
        callback: function() {
            this.image.replace()
        }
    }), a.FroalaEditor.DefineIcon("imageRemove", {
        NAME: "trash"
    }), a.FroalaEditor.RegisterCommand("imageRemove", {
        title: "Remove",
        callback: function() {
            this.image.remove()
        }
    }), a.FroalaEditor.DefineIcon("imageBack", {
        NAME: "arrow-left"
    }), a.FroalaEditor.RegisterCommand("imageBack", {
        title: "Back",
        undo: !1,
        focus: !1,
        back: !0,
        callback: function() {
            this.image.back()
        },
        refresh: function(a) {
            var b = this.image.get();
            b || this.opts.toolbarInline ? (a.removeClass("fr-hidden"), a.next(".fr-separator").removeClass("fr-hidden")) : (a.addClass("fr-hidden"), a.next(".fr-separator").addClass("fr-hidden"))
        }
    }), a.FroalaEditor.RegisterCommand("imageDismissError", {
        title: "OK",
        undo: !1,
        callback: function() {
            this.image.hideProgressBar(!0)
        }
    }), a.FroalaEditor.DefineIcon("imageStyle", {
        NAME: "magic"
    }), a.FroalaEditor.RegisterCommand("imageStyle", {
        title: "Style",
        type: "dropdown",
        html: function() {
            var a = '<ul class="fr-dropdown-list">',
                b = this.opts.imageStyles;
            for (var c in b) a += '<li><a class="fr-command" data-cmd="imageStyle" data-param1="' + c + '">' + this.language.translate(b[c]) + "</a></li>";
            return a += "</ul>"
        },
        callback: function(a, b) {
            this.image.applyStyle(b)
        },
        refreshOnShow: function(b, c) {
            var d = this.image.get();
            d && c.find(".fr-command").each(function() {
                var b = a(this).data("param1");
                a(this).toggleClass("fr-active", d.hasClass(b))
            })
        }
    }), a.FroalaEditor.DefineIcon("imageAlt", {
        NAME: "info"
    }), a.FroalaEditor.RegisterCommand("imageAlt", {
        undo: !1,
        focus: !1,
        title: "Alternate Text",
        callback: function() {
            this.image.showAltPopup()
        }
    }), a.FroalaEditor.RegisterCommand("imageSetAlt", {
        undo: !0,
        focus: !1,
        title: "Update",
        refreshAfterCallback: !1,
        callback: function() {
            this.image.setAlt()
        }
    }), a.FroalaEditor.DefineIcon("imageSize", {
        NAME: "arrows-alt"
    }), a.FroalaEditor.RegisterCommand("imageSize", {
        undo: !1,
        focus: !1,
        title: "Change Size",
        callback: function() {
            this.image.showSizePopup()
        }
    }), a.FroalaEditor.RegisterCommand("imageSetSize", {
        undo: !0,
        focus: !1,
        callback: function() {
            this.image.setSize()
        }
    })
});
