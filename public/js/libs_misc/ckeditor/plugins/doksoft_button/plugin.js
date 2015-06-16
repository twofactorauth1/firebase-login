CKEDITOR.plugins.add("doksoft_button", {
	icons : "doksoft_button",
	init : function(b) {
		if (false) {
			b.ui.addButton("doksoft_button", {
				command : "doksoft_button",
				icon : this.path + "icons/doksoft_button.png"
			});
		}
		currentData = {};
		var c = function() {
			var f = b.getSelection(), d = f.getRanges(), g;
			var e = f.getSelectedElement();

			if (e && (e.is("a"))) {
				return e;
			}
			 else {
				if (d.length > 0) {
					if (CKEDITOR.env.webkit) {
						d[0].shrink(CKEDITOR.NODE_ELEMENT);
					}
					if (CKEDITOR.version.charAt(0) == "4") {( e = b.elementPath(d[0].getCommonAncestor(true)).contains("a", 1));
					} else {
						e = CKEDITOR.plugins.link.getSelectedLink(b);
					}
				}
			}
			if (e && (e.is("a"))) {
				return e;
			}
			return false;
		};
		var a = function(e) {
			var d = {
				style : "",
				text : "Download",
				"link" : "http://"
			};
			d.style = e.getAttribute("style");
			d.link = e.getAttribute("href");
			d.text = e.getHtml();
			return d;
		};
		
		var bindClick = function(instance)
		{
			var spans = $(instance.element.$).find("a");
			for (var Z = 0; Z < spans.length; Z++) {
			if(!spans[Z].hasAttribute('id'))
			{
				spans[Z].onclick = function() {
			   		var sel = instance.getSelection();
			   		sel.selectElement(sel.getStartElement());				
			   	 	instance.openDialog("doksoft_button");
			   };
			}	
			   
			}
		};
		CKEDITOR.dialog.add("doksoft_button", function(e) {
			var d = 450;
			return {
				title : "doksoft_button",
				minWidth : 500,
				minHeight : d,
				resizable : false,
				contents : [{
					id : "tab1",
					label : "Options",
					expand : true,
					padding : 0,
					elements : [{
						type : "html",
						id : "previewHtml",
						html : '<iframe src="' + e.plugins.doksoft_button.path + "dialog/doksoft_button.html" + '" style="width: 100%; height: ' + d + 'px" hidefocus="true" frameborder="0" ' + 'id="doksoft_button_options"></iframe>',
					}]
				}, {
					id : "tab2",
					label : "Gallery",
					elements : [{
						id : "elementId1",
						type : "html",
						html : '<iframe src="' + e.plugins.doksoft_button.path + "dialog/doksoft_button_gallery.html" + '" style="width: 100%; height: ' + d + 'px" hidefocus="true" frameborder="0" ' + 'id="doksoft_button_gallery"></iframe>',
					}]
				}],
				buttons : [CKEDITOR.dialog.okButton, CKEDITOR.dialog.cancelButton],
				onShow : function() {
					window.currentDialog = this;
					var sel = this.getParentEditor().getSelection().getStartElement();
					var h = false;
					if(sel && sel.is("a"))
					{
						h = sel;
					}
					else{
						h = false;
					}
					
					if (h) {
						this.parts.title.$.innerHTML = "Edit Button";
						currentData = a(h);
					} else {
						this.parts.title.$.innerHTML = "Insert Button";
						currentData = {
							style : (e.config.doksoft_default_style ? e.config.doksoft_default_style : "-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fbb450', endColorstr='#f89306',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:17px;font-weight:normal;padding:6px 11px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;"),
							link : (e.config.doksoft_default_link ? e.config.doksoft_default_link : "http://"),
							text : (e.config.doksoft_default_text ? e.config.doksoft_default_text : "Download"),
						};
					}
					window["doksoft_restore"] && window["doksoft_restore"](currentData);
					var g = document.getElementsByClassName("cke_dialog_tab_disabled");
					for (var f = g.length - 1; f >= 0; f--) {
						var k = g[f];
						var j = new RegExp("(\\s|^)cke_dialog_tab_disabled(\\s|$)");
						k.className = k.className.replace(j, " ");
					}
				},
				onOk : function() {
					var sel = this.getParentEditor().getSelection().getStartElement();
					var f = false;
					if(sel && sel.is("a"))
					{
						f = sel;
					}
					else{
						f = false;
					}
					//var f = c();
					if (!f) {
						e.insertHtml(getResultButton());
					} else {
						var g = CKEDITOR.dom.element.createFromHtml(getResultButton());
						g.replace(f);
					}
					bindClick(this.getParentEditor());
				},
			};
		});
		b.addCommand("doksoft_button", new CKEDITOR.dialogCommand("doksoft_button"));
		b.ui.addButton("doksoft_button", {
			title : "doksoft_button",
			command : "doksoft_button",
		});
		
		b.on("instanceReady", function(ev) {				
				
			});
		b.on("contentDom", function() {
			bindClick(b);
		});
		if (b.addMenuItems) {
			b.addMenuItems({
				doksoft_button : {
					label : "Edit Button",
					command : "doksoft_button",
					group : "table",
					order : 5
				},
			});
		}
		if (b.contextMenu) {
			b.contextMenu.addListener(function(d) {
				if (d && (d.is("a"))) {
					return {
						doksoft_button : CKEDITOR.TRISTATE_ON
					};
				}
			});
		}
	}
}); 