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
                //get the td instead
                var buttonWrapperEl = t.getParents().filter(function(ckEl) {
                	return ckEl.$.className.indexOf('ckeditor-button-wrap') !== -1;
                })[0];
                var button = buttonWrapperEl.find('.myButton');
                var link = buttonWrapperEl.find('a');
                
                if (button.$[0]) {
                    o.style = button.$[0].getAttribute('style');
                    o.link = link.$[0].getAttribute('href')
                    o.text = button.$[0].innerText;
                }
                
                console.log('o: ');
                console.log(o);
                return o;
            },
            e = function(t) {
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
                    
                    var buttonWrapperEl = e.getParents().filter(function(ckEl) {
                    	return ckEl.$.className.indexOf('ckeditor-button-wrap') !== -1;
                    })[0];

                    n = e && buttonWrapperEl !== undefined ? e : !1;
                    
                    if (n) { 
                    	this.parts.title.$.innerHTML = "Edit Button";
                    	currentData = o(n);
                    } else {
                    	console.log('insert button called');
                    	this.parts.title.$.innerHTML = "Insert Button";
                    	currentData = {
	                        style: t.config.doksoft_default_style ? t.config.doksoft_default_style : "-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;" +
                                                                                                     "-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;" +
                                                                                                     "box-shadow: 0px 1px 0px 0px #ffe0b5;" +
                                                                                                     "background-color:#fbb450;" +
                                                                                                     "-moz-border-radius:7px;" +
                                                                                                     "-webkit-border-radius:7px;" +
                                                                                                     "border-radius:7px;" +
                                                                                                     "border:1px solid #c97e1c;" +
                                                                                                     "display:inline-block;" +
                                                                                                     "color:#ffffff;" +
                                                                                                     "font-family:trebuchet ms;" +
                                                                                                     "font-size:17px;" +
                                                                                                     "font-weight:normal;" +
                                                                                                     "padding:6px 11px;" +
                                                                                                     "text-decoration:none;" +
                                                                                                     "text-shadow:0px 1px 0px #8f7f24;",
	                        link: t.config.doksoft_default_link ? t.config.doksoft_default_link : "http://",
	                        text: t.config.doksoft_default_text ? t.config.doksoft_default_text : "Download"
						};
						console.log('set current data to:');
						console.log(currentData);
                    }

                    window.doksoft_restore && window.doksoft_restore(currentData);

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
                        var i = CKEDITOR.dom.element.createFromHtml(getResultButton());
                        var buttonWrapperEl = n.getParents().filter(function(ckEl) {
	                    	return ckEl.$.className.indexOf('ckeditor-button-wrap') !== -1;
	                    })[0];
                        i.replace(buttonWrapperEl);
                    } else {
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
