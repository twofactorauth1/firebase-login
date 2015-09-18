/* Button for use in email templates only */

CKEDITOR.plugins.add("doksoft_button_email", {
    icons: "doksoft_button",
    init: function(t) {
        currentData = {};
        var o = function(t) {
                var o = {
                    style: "",
                    text: "Download",
                    link: "http://"
                };
                console.log('setting style info from obj t:')
                console.log(t);
                console.log('---')
                console.log('style=',t.getAttribute("style"))
                console.log('href=',t.getAttribute("href"))
                console.log('t.getHtml()=',t.getHtml())
                return o.style = t.getAttribute("style"), o.link = t.getAttribute("href"), o.text = t.getHtml(), o
            },
            e = function(t) {
            	debugger;
                var o = $(t.element.$).find("div.ckeditor-button-wrap");
                if (o.length > 0) {
                    for (var e = 0; e < o.length; e++) {
                    	 o[e].hasAttribute("id") || (o[e].onclick = function() {
	                        var o = t.getSelection();
	                        var link = t.getSelection().getStartElement()
	                        var buttonWrapperEl = link.getParents().filter(function(ckEl) {
	                        	return ckEl.$.className.indexOf('ckeditor-button-wrap') !== -1;
	                        })[0];
	                        o.selectElement(buttonWrapperEl);
	                        t.openDialog("doksoft_button_email");
	                    })
                    }
                }
            };
        CKEDITOR.dialog.add("doksoft_button_email", function(t) {
            var n = 450;
            return {
                title: "doksoft_button_email",
                minWidth: 500,
                minHeight: n,
                resizable: !1,
                contents: [{
                    id: "tab1",
                    label: "Options",
                    expand: !0,
                    padding: 0,
                    elements: [{
                        type: "html",
                        id: "previewHtml",
                        html: '<iframe src="' + t.plugins.doksoft_button_email.path + 'dialog/doksoft_button.html" style="width: 100%; height: ' + n + 'px" hidefocus="true" frameborder="0" id="doksoft_button_options"></iframe>'
                    }]
                }, {
                    id: "tab2",
                    label: "Gallery",
                    elements: [{
                        id: "elementId1",
                        type: "html",
                        html: '<iframe src="' + t.plugins.doksoft_button_email.path + 'dialog/doksoft_button_gallery.html" style="width: 100%; height: ' + n + 'px" hidefocus="true" frameborder="0" id="doksoft_button_gallery"></iframe>'
                    }]
                }],
                buttons: [CKEDITOR.dialog.okButton, CKEDITOR.dialog.cancelButton],
                onShow: function() {
                    window.currentDialog = this;
                    var e = this.getParentEditor().getSelection().getStartElement(),
                        n = !1;
                        debugger;
                    n = e && e.is("div.ckeditor-button-wrap") ? e : !1, n ? (this.parts.title.$.innerHTML = "Edit Button", currentData = o(n)) : (this.parts.title.$.innerHTML = "Insert Button", currentData = {
                        style: t.config.doksoft_default_style ? t.config.doksoft_default_style : "-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fbb450', endColorstr='#f89306',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:17px;font-weight:normal;padding:6px 11px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;",
                        link: t.config.doksoft_default_link ? t.config.doksoft_default_link : "http://",
                        text: t.config.doksoft_default_text ? t.config.doksoft_default_text : "Download"
                    }), window.doksoft_restore && window.doksoft_restore(currentData);
                    for (var i = document.getElementsByClassName("cke_dialog_tab_disabled"), a = i.length - 1; a >= 0; a--) {
                        var d = i[a],
                            r = new RegExp("(\\s|^)cke_dialog_tab_disabled(\\s|$)");
                        d.className = d.className.replace(r, " ")
                    }
                },
                onOk: function() {
                    var o = this.getParentEditor().getSelection().getStartElement(),
                        n = !1;
                    if (n = o && o.is("a") ? o : !1) {
                    	debugger;
                        var i = CKEDITOR.dom.element.createFromHtml(getResultButton());
                        i.replace(n)
                    } else {
                    	debugger;
                    	t.insertHtml(getResultButton());
                    }
                    e(this.getParentEditor())
                }
            }
        }), t.addCommand("doksoft_button_email", new CKEDITOR.dialogCommand("doksoft_button_email")), t.ui.addButton("doksoft_button_email", {
            title: "Add Button",
            command: "doksoft_button_email"
        }), t.on("instanceReady", function() {
            e(t)
        }), t.addMenuItems && t.addMenuItems({
            doksoft_button_email: {
                label: "Edit Button",
                command: "doksoft_button_email",
                group: "table",
                order: 5
            }
        }), t.contextMenu && t.contextMenu.addListener(function(t) {
            return t && t.is("div.ckeditor-button-wrap") ? {
                doksoft_button_email: CKEDITOR.TRISTATE_ON
            } : void 0
        })
    }
});
