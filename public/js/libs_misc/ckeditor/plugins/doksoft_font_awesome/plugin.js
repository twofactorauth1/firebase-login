(function() {
	var f = 0;
	var h = 16;
	var i = 512;
	var e = function(k, j) {
		if (k === undefined) {
			k = j;
		} else {
			if (k != j) {
				k = !j;
			}
		}
		return k;
	};
	var d = function(k, j) {
		if (k === undefined) {
			k = j;
		}
		return k;
	};
	var a = function(k, j) {
		if (k === undefined) {
			k = j;
		}
		return k;
	};
	var g;
	var b;
	if (f == 0) {
		g = ["adjust", "anchor", "archive", "arrows", "arrows-h", "arrows-v", "asterisk", "ban", "bar-chart-o", "barcode", "bars", "beer", "bell", "bell-o", "bolt", "bomb", "book", "bookmark", "bookmark-o", "briefcase", "bug", "building", "building-o", "bullhorn", "bullseye", "calendar", "calendar-o", "camera", "camera-retro", "car", "caret-square-o-down", "caret-square-o-left", "caret-square-o-right", "caret-square-o-up", "certificate", "check", "check-circle", "check-circle-o", "check-square", "check-square-o", "child", "circle", "circle-o", "circle-o-notch", "circle-thin", "clock-o", "cloud", "cloud-download", "cloud-upload", "code", "code-fork", "coffee", "cog", "cogs", "comment", "comment-o", "comments", "comments-o", "compass", "credit-card", "crop", "crosshairs", "cube", "cubes", "cutlery", "database", "desktop", "dot-circle-o", "download", "ellipsis-h", "ellipsis-v", "envelope", "envelope-o", "envelope-square", "eraser", "exchange", "exclamation", "exclamation-circle", "exclamation-triangle", "external-link", "external-link-square", "eye", "eye-slash", "fax", "female", "fighter-jet", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-pdf-o", "file-powerpoint-o", "file-video-o", "file-word-o", "film", "filter", "fire", "fire-extinguisher", "flag", "flag-checkered", "flag-o", "flask", "folder", "folder-o", "folder-open", "folder-open-o", "frown-o", "gamepad", "gavel", "gift", "glass", "globe", "graduation-cap", "hdd-o", "headphones", "heart", "heart-o", "history", "home", "inbox", "info", "info-circle", "key", "keyboard-o", "language", "laptop", "leaf", "lemon-o", "level-down", "level-up", "life-ring", "lightbulb-o", "location-arrow", "lock", "magic", "magnet", "male", "map-marker", "meh-o", "microphone", "microphone-slash", "minus", "minus-circle", "minus-square", "minus-square-o", "mobile", "money", "moon-o", "music", "paper-plane", "paper-plane-o", "paw", "pencil", "pencil-square", "pencil-square-o", "phone", "phone-square", "picture-o", "plane", "plus", "plus-circle", "plus-square", "plus-square-o", "power-off", "print", "puzzle-piece", "qrcode", "question", "question-circle", "quote-left", "quote-right", "random", "recycle", "refresh", "reply", "reply-all", "retweet", "road", "rocket", "rss", "rss-square", "search", "search-minus", "search-plus", "share", "share-alt", "share-alt-square", "share-square", "share-square-o", "shield", "shopping-cart", "sign-in", "sign-out", "signal", "sitemap", "sliders", "smile-o", "sort", "sort-alpha-asc", "sort-alpha-desc", "sort-amount-asc", "sort-amount-desc", "sort-asc", "sort-desc", "sort-numeric-asc", "sort-numeric-desc", "space-shuttle", "spinner", "spoon", "square", "square-o", "star", "star-half", "star-half-o", "star-o", "suitcase", "sun-o", "tablet", "tachometer", "tag", "tags", "tasks", "taxi", "terminal", "thumb-tack", "thumbs-down", "thumbs-o-down", "thumbs-o-up", "thumbs-up", "ticket", "times", "times-circle", "times-circle-o", "tint", "trash-o", "tree", "trophy", "truck", "umbrella", "university", "unlock", "unlock-alt", "upload", "user", "users", "video-camera", "volume-down", "volume-off", "volume-up", "wheelchair", "wrench", "file", "file-archive-o", "file-audio-o", "file-code-o", "file-excel-o", "file-image-o", "file-o", "file-pdf-o", "file-powerpoint-o", "file-text", "file-text-o", "file-video-o", "file-word-o", "circle-o-notch", "btc", "eur", "gbp", "inr", "jpy", "krw", "rub", "try", "usd", "align-center", "align-justify", "align-left", "align-right", "bold", "chain-broken", "clipboard", "columns", "eraser", "files-o", "floppy-o", "font", "header", "indent", "italic", "link", "list", "list-alt", "list-ol", "list-ul", "outdent", "paperclip", "paragraph", "repeat", "scissors", "strikethrough", "subscript", "superscript", "table", "text-height", "text-width", "th", "th-large", "th-list", "underline", "undo", "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up", "angle-down", "angle-left", "angle-right", "angle-up", "arrow-circle-down", "arrow-circle-left", "arrow-circle-o-down", "arrow-circle-o-left", "arrow-circle-o-right", "arrow-circle-o-up", "arrow-circle-right", "arrow-circle-up", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "arrows-alt", "caret-down", "caret-left", "caret-right", "caret-up", "chevron-circle-down", "chevron-circle-left", "chevron-circle-right", "chevron-circle-up", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "hand-o-down", "hand-o-left", "hand-o-right", "hand-o-up", "long-arrow-down", "long-arrow-left", "long-arrow-right", "long-arrow-up", "backward", "compress", "eject", "expand", "fast-backward", "fast-forward", "forward", "pause", "play", "play-circle", "play-circle-o", "step-backward", "step-forward", "stop", "youtube-play", "adn", "android", "apple", "behance", "behance-square", "bitbucket", "bitbucket-square", "btc", "codepen", "css3", "delicious", "deviantart", "digg", "dribbble", "dropbox", "drupal", "empire", "facebook", "facebook-square", "flickr", "foursquare", "git", "git-square", "github", "github-alt", "github-square", "gittip", "google", "google-plus", "google-plus-square", "hacker-news", "html5", "instagram", "joomla", "jsfiddle", "linkedin", "linkedin-square", "linux", "maxcdn", "openid", "pagelines", "pied-piper", "pied-piper-alt", "pinterest", "pinterest-square", "qq", "rebel", "reddit", "reddit-square", "renren", "share-alt", "share-alt-square", "skype", "slack", "soundcloud", "spotify", "stack-exchange", "stack-overflow", "steam", "steam-square", "stumbleupon", "stumbleupon-circle", "tencent-weibo", "trello", "tumblr", "tumblr-square", "twitter", "twitter-square", "vimeo-square", "vine", "vk", "weibo", "weixin", "windows", "wordpress", "xing", "xing-square", "yahoo", "youtube", "youtube-square", "ambulance", "h-square", "hospital-o", "medkit", "stethoscope", "user-md"];

		b = ["f042", "f13d", "f187", "f047", "f07e", "f07d", "f069", "f05e", "f080", "f02a", "f0c9", "f0fc", "f0f3", "f0a2", "f0e7", "f1e2", "f02d", "f02e", "f097", "f0b1", "f188", "f1ad", "f0f7", "f0a1", "f140", "f073", "f133", "f030", "f083", "f1b9", "f150", "f191", "f152", "f151", "f0a3", "f00c", "f058", "f05d", "f14a", "f046", "f1ae", "f111", "f10c", "f1ce", "f1db", "f017", "f0c2", "f0ed", "f0ee", "f121", "f126", "f0f4", "f013", "f085", "f075", "f0e5", "f086", "f0e6", "f14e", "f09d", "f125", "f05b", "f1b2", "f1b3", "f0f5", "f1c0", "f108", "f192", "f019", "f141", "f142", "f0e0", "f003", "f199", "f12d", "f0ec", "f12a", "f06a", "f071", "f08e", "f14c", "f06e", "f070", "f1ac", "f182", "f0fb", "f1c6", "f1c7", "f1c9", "f1c3", "f1c5", "f1c1", "f1c4", "f1c8", "f1c2", "f008", "f0b0", "f06d", "f134", "f024", "f11e", "f11d", "f0c3", "f07b", "f114", "f07c", "f115", "f119", "f11b", "f0e3", "f06b", "f000", "f0ac", "f19d", "f0a0", "f025", "f004", "f08a", "f1da", "f015", "f01c", "f129", "f05a", "f084", "f11c", "f1ab", "f109", "f06c", "f094", "f149", "f148", "f1cd", "f0eb", "f124", "f023", "f0d0", "f076", "f183", "f041", "f11a", "f130", "f131", "f068", "f056", "f146", "f147", "f10b", "f0d6", "f186", "f001", "f1d8", "f1d9", "f1b0", "f040", "f14b", "f044", "f095", "f098", "f03e", "f072", "f067", "f055", "f0fe", "f196", "f011", "f02f", "f12e", "f029", "f128", "f059", "f10d", "f10e", "f074", "f1b8", "f021", "f112", "f122", "f079", "f018", "f135", "f09e", "f143", "f002", "f010", "f00e", "f064", "f1e0", "f1e1", "f14d", "f045", "f132", "f07a", "f090", "f08b", "f012", "f0e8", "f1de", "f118", "f0dc", "f15d", "f15e", "f160", "f161", "f0de", "f0dd", "f162", "f163", "f197", "f110", "f1b1", "f0c8", "f096", "f005", "f089", "f123", "f006", "f0f2", "f185", "f10a", "f0e4", "f02b", "f02c", "f0ae", "f1ba", "f120", "f08d", "f165", "f088", "f087", "f164", "f145", "f00d", "f057", "f05c", "f043", "f014", "f1bb", "f091", "f0d1", "f0e9", "f19c", "f09c", "f13e", "f093", "f007", "f0c0", "f03d", "f027", "f026", "f028", "f193", "f0ad", "f15b", "f1c6", "f1c7", "f1c9", "f1c3", "f1c5", "f016", "f1c1", "f1c4", "f15c", "f0f6", "f1c8", "f1c2", "f1ce", "f15a", "f153", "f154", "f156", "f157", "f159", "f158", "f195", "f155", "f037", "f039", "f036", "f038", "f032", "f127", "f0ea", "f0db", "f12d", "f0c5", "f0c7", "f031", "f1dc", "f03c", "f033", "f0c1", "f03a", "f022", "f0cb", "f0ca", "f03b", "f0c6", "f1dd", "f01e", "f0c4", "f0cc", "f12c", "f12b", "f0ce", "f034", "f035", "f00a", "f009", "f00b", "f0cd", "f0e2", "f103", "f100", "f101", "f102", "f107", "f104", "f105", "f106", "f0ab", "f0a8", "f01a", "f190", "f18e", "f01b", "f0a9", "f0aa", "f063", "f060", "f061", "f062", "f0b2", "f0d7", "f0d9", "f0da", "f0d8", "f13a", "f137", "f138", "f139", "f078", "f053", "f054", "f077", "f0a7", "f0a5", "f0a4", "f0a6", "f175", "f177", "f178", "f176", "f04a", "f066", "f052", "f065", "f049", "f050", "f04e", "f04c", "f04b", "f144", "f01d", "f048", "f051", "f04d", "f16a", "f170", "f17b", "f179", "f1b4", "f1b5", "f171", "f172", "f15a", "f1cb", "f13c", "f1a5", "f1bd", "f1a6", "f17d", "f16b", "f1a9", "f1d1", "f09a", "f082", "f16e", "f180", "f1d3", "f1d2", "f09b", "f113", "f092", "f184", "f1a0", "f0d5", "f0d4", "f1d4", "f13b", "f16d", "f1aa", "f1cc", "f0e1", "f08c", "f17c", "f136", "f19b", "f18c", "f1a7", "f1a8", "f0d2", "f0d3", "f1d6", "f1d0", "f1a1", "f1a2", "f18b", "f1e0", "f1e1", "f17e", "f198", "f1be", "f1bc", "f18d", "f16c", "f1b6", "f1b7", "f1a4", "f1a3", "f1d5", "f181", "f173", "f174", "f099", "f081", "f194", "f1ca", "f189", "f18a", "f1d7", "f17a", "f19a", "f168", "f169", "f19e", "f167", "f166", "f0f9", "f0fd", "f0f8", "f0fa", "f0f1", "f0f0"];
	} else {
		if (f == 1) {
			g = ["asterisk", "plus", "euro", "minus", "cloud", "envelope", "pencil", "glass", "music", "search", "heart", "star", "star-empty", "user", "film", "th-large", "th", "th-list", "ok", "remove", "zoom-in", "zoom-out", "off", "signal", "cog", "trash", "home", "file", "time", "road", "download-alt", "download", "upload", "inbox", "play-circle", "repeat", "refresh", "list-alt", "lock", "flag", "headphones", "volume-off", "volume-down", "volume-up", "qrcode", "barcode", "tag", "tags", "book", "bookmark", "print", "camera", "font", "bold", "italic", "text-height", "text-width", "align-left", "align-center", "align-right", "align-justify", "list", "indent-left", "indent-right", "facetime-video", "picture", "map-marker", "adjust", "tint", "edit", "share", "check", "move", "step-backward", "fast-backward", "backward", "play", "pause", "stop", "forward", "fast-forward", "step-forward", "eject", "chevron-left", "chevron-right", "plus-sign", "minus-sign", "remove-sign", "ok-sign", "question-sign", "info-sign", "screenshot", "remove-circle", "ok-circle", "ban-circle", "arrow-left", "arrow-right", "arrow-up", "arrow-down", "share-alt", "resize-full", "resize-small", "exclamation-sign", "gift", "leaf", "fire", "eye-open", "eye-close", "warning-sign", "plane", "calendar", "random", "comment", "magnet", "chevron-up", "chevron-down", "retweet", "shopping-cart", "folder-close", "folder-open", "resize-vertical", "resize-horizontal", "hdd", "bullhorn", "bell", "certificate", "thumbs-up", "thumbs-down", "hand-right", "hand-left", "hand-up", "hand-down", "circle-arrow-right", "circle-arrow-left", "circle-arrow-up", "circle-arrow-down", "globe", "wrench", "tasks", "filter", "briefcase", "fullscreen", "dashboard", "paperclip", "heart-empty", "link", "phone", "pushpin", "usd", "gbp", "sort", "sort-by-alphabet", "sort-by-alphabet-alt", "sort-by-order", "sort-by-order-alt", "sort-by-attributes", "sort-by-attributes-alt", "unchecked", "expand", "collapse-down", "collapse-up", "log-in", "flash", "log-out", "new-window", "record", "save", "open", "saved", "import", "export", "send", "floppy-disk", "floppy-saved", "floppy-remove", "floppy-save", "floppy-open", "credit-card", "transfer", "cutlery", "header", "compressed", "earphone", "phone-alt", "tower", "stats", "sd-video", "hd-video", "subtitles", "sound-stereo", "sound-dolby", "sound-5-1", "sound-6-1", "sound-7-1", "copyright-mark", "registration-mark", "cloud-download", "cloud-upload", "tree-conifer", "tree-deciduous"];

			b = ["2a", "2b", "20ac", "2212", "2601", "2709", "270f", "e001", "e002", "e003", "e005", "e006", "e007", "e008", "e009", "e010", "e011", "e012", "e013", "e014", "e015", "e016", "e017", "e018", "e019", "e020", "e021", "e022", "e023", "e024", "e025", "e026", "e027", "e028", "e029", "e030", "e031", "e032", "e033", "e034", "e035", "e036", "e037", "e038", "e039", "e040", "e041", "e042", "e043", "e044", "e045", "e046", "e047", "e048", "e049", "e050", "e051", "e052", "e053", "e054", "e055", "e056", "e057", "e058", "e059", "e060", "e062", "e063", "e064", "e065", "e066", "e067", "e068", "e069", "e070", "e071", "e072", "e073", "e074", "e075", "e076", "e077", "e078", "e079", "e080", "e081", "e082", "e083", "e084", "e085", "e086", "e087", "e088", "e089", "e090", "e091", "e092", "e093", "e094", "e095", "e096", "e097", "e101", "e102", "e103", "e104", "e105", "e106", "e107", "e108", "e109", "e110", "e111", "e112", "e113", "e114", "e115", "e116", "e117", "e118", "e119", "e120", "e121", "e122", "e123", "e124", "e125", "e126", "e127", "e128", "e129", "e130", "e131", "e132", "e133", "e134", "e135", "e136", "e137", "e138", "e139", "e140", "e141", "e142", "e143", "e144", "e145", "e146", "e148", "e149", "e150", "e151", "e152", "e153", "e154", "e155", "e156", "e157", "e158", "e159", "e160", "e161", "e162", "e163", "e164", "e165", "e166", "e167", "e168", "e169", "e170", "e171", "e172", "e173", "e174", "e175", "e176", "e177", "e178", "e179", "e180", "e181", "e182", "e183", "e184", "e185", "e186", "e187", "e188", "e189", "e190", "e191", "e192", "e193", "e194", "e195", "e197", "e198", "e199", "e200"];
		}
	}
	CKEDITOR.plugins.add("doksoft_font_awesome", {
		lang : "en",
		icons : "doksoft_font_awesome",
		init : function(l) {
			var z = this.path;
			var w = function(K, M) {
				var H = K.getElementsByTagName("link");
				var L = false;
				for (var I = 0; I < H.length; I++) {
					if (H[I].href.indexOf(M) != -1) {
						L = true;
					}
				}
				if (!L) {
					var J = K.createElement("link");
					J.href = M;
					J.type = "text/css";
					J.rel = "stylesheet";
					K.head.appendChild(J);
				}
			};
			var n = function(I, H) {
				w(l.document.$, I);
				if (H) {
					w(document, I);
				}
			};
			var o = function(K, M) {
				var H = K.getElementsByTagName("script");
				var L = false;
				for (var J = 0; J < H.length; J++) {
					if (H[J].src.indexOf(M) != -1) {
						L = true;
					}
				}
				if (!L) {
					var I = K.createElement("script");
					I.src = M;
					I.type = "text/javascript";
					K.head.appendChild(I);
				}
			};
			var x = function(I, H) {
				o(l.document.$, I);
				if (H) {
					o(document, I);
				}
			};
			var selectedElement = null;
			var bindClick = function(instance)
			{
				selectedElement = null;
				var spans = $(instance.element.$).find("span.fa");
				for (var Z = 0; Z < spans.length; Z++) {
				   spans[Z].onclick = function() {
				   		var sel = instance.getSelection();
				   		sel.selectElement(sel.getStartElement());
				   		selectedElement = sel.getStartElement();						
				   	 	instance.openDialog("doksoft_font_awesome-" + instance.name);
				   };
				}
			}
			l.on("instanceReady", function(ev) {				
				
			});
			l.on("contentDom", function() {
				var H = l.document.$;					
				CKEDITOR.dtd.$removeEmpty["span"] = false;
				if (f == 0) {
					n("../../js/libs/font-awesome/css/font-awesome.min.css", true);
				}
				x(z + "jscolor/jscolor.js", true);
				bindClick(l);				
			});

			l.addCommand("doksoft_font_awesome-" + l.name, new CKEDITOR.dialogCommand("doksoft_font_awesome-" + l.name));
			l.ui.addButton("doksoft_font_awesome", {
				title : l.lang["doksoft_font_awesome"].title,
				icon : this.path + "icons/doksoft_font_awesome_4.png",
				command : "doksoft_font_awesome-" + l.name
			});
			if ( typeof l.lang["doksoft_font_awesome"]["doksoft_font_awesome"] != "undefined") {
				l.lang["doksoft_font_awesome"] = l.lang["doksoft_font_awesome"]["doksoft_font_awesome"];
			}
			if (false) {
				l.ui.addButton("doksoft_font_awesome", {
					command : "doksoft_font_awesome",
					icon : this.path + "icons/doksoft_font_awesome_4.png"
				});
			}
			if (f == 0) {
			}
			if (f == 1) {
			} else {
				if (f == 2) {
				}
			}
			var t = a(l.config["doksoft_font_awesome_images_generator_url"], CKEDITOR.basePath + CKEDITOR.plugins.basePath + "doksoft_font_awesome/fonts/gen.php");
			var C = e(l.config["doksoft_font_awesome_bitmap_allowed"], true);
			var A = e(l.config["doksoft_font_awesome_default_as_bitmap"], false);
			var D = d(l.config["doksoft_font_awesome_default_size"], 24);
			var j = e(l.config["doksoft_font_awesome_default_add_size_to_style"], true);
			var E = a(l.config["doksoft_font_awesome_default_color"], "#000000");
			var u = e(l.config["doksoft_font_awesome_default_add_color_to_style"], true);
			var s = function() {
				var I = "";
				for (var H = 0; H < g.length; H++) {
					var J = g[H];
					if (f == 0) {
						I += '<div class="doksoft_font_awesome-icon" style="text-align:center;display:inline-block;vertical-align:top;cursor:pointer">' + '<span class="doksoft_font_awesome-glyphicon fa fa-' + J + '" style="cursor:pointer"></span>' + '<span class="doksoft_font_awesome-title" style="font-size:14px;display:block;text-align:center;cursor:pointer;vertical-align: bottom">' + J + "</span>" + "</div>";
					} else {
						if (f == 1) {
							I += '<div class="doksoft_font_awesome-icon" style="text-align:center;display:inline-block;vertical-align:top;cursor:pointer">' + '<span class="doksoft_font_awesome-glyphicon glyphicon glyphicon-' + J + '" style="cursor:pointer"></span>' + '<span class="doksoft_font_awesome-title" style="font-size:14px;display:block;text-align:center;cursor:pointer;vertical-align: bottom">' + J + "</span>" + "</div>";
						}
					}
				}
				return I;
			};
			var y = function(M, L) {
				M = M.replace(/<br>/g, "");
				if (L == 0) {
					return M;
				}
				var I = "";
				var H = 0;
				while (M.length > 0) {
					var K = M.charAt(0);
					I += K;
					H++;
					if (H >= L && K == "-") {
						I += "<br>";
						H = 0;
					}
					M = M.substr(1);
				}
				if (I.indexOf("<br>") == -1) {
					var J = I.lastIndexOf("-");
					if (I.length - J >= L) {
						I = I.substr(0, J + 1) + "<br>" + I.substr(J + 1);
					}
				}
				return I;
			};
			var q = function(H) {
				if (H === "") {
					return false;
				}
				if (H === "inherit") {
					return false;
				}
				if (H === "transparent") {
					return false;
				}
				var I = document.createElement("img");
				I.style.color = "rgb(0, 0, 0)";
				I.style.color = H;
				if (I.style.color !== "rgb(0, 0, 0)") {
					return true;
				}
				I.style.color = "rgb(255, 255, 255)";
				I.style.color = H;
				return I.style.color !== "rgb(255, 255, 255)";
			};
			var m = "black";
			var v = function() {
				var H = document.getElementById("doksoft_font_awesome-color-" + l.name).value;

				if (q(H)) {
					var K = document.getElementsByClassName("doksoft_font_awesome-glyphicon");
					for (var I = 0; I < K.length; I++) {
						var J = K[I];
						J.style.color = H;
					}
					m = H;
				}
			};
			var k = 24;
			var B = function() {
				var R = parseInt(document.getElementById("doksoft_font_awesome-size-" + l.name).value);
				if (R != NaN) {
					if (R < h) {
						R = h;
					}
					if (R > i) {
						R = i;
					}
					var O = document.getElementsByClassName("doksoft_font_awesome-icon");
					for (var K = 0; K < O.length; K++) {
						var P = O[K];
						if (R < 24) {
							P.style.width = "150px";
							P.style.minWidth = "150px";
							P.style.height = R + "px";
							P.style.textAlign = "left";
							P.style.padding = "3px 10px";
							P.style.margin = "2px";
						} else {
							P.style.width = R + "px";
							P.style.minWidth = (R < 70 ? 70 : R) + "px";
							P.style.height = (R + 35) + "px";
							P.style.textAlign = "center";
							P.style.padding = (R <= 64 ? 5 : 10) + "px";
							P.style.margin = "2px";
						}
					}
					var J = document.getElementsByClassName("doksoft_font_awesome-glyphicon");
					for (var K = 0; K < J.length; K++) {
						var L = J[K];
						L.style.fontSize = R + "px";
					}
					var H = document.getElementsByClassName("doksoft_font_awesome-title");
					for (var K = 0; K < H.length; K++) {
						var N = H[K];
						if (R < 24 && k >= 24) {
							N.style.display = "initial";
							N.style.marginTop = "0";
							N.style.marginLeft = "10px";
							N.innerHTML = y(N.innerHTML, 0);
							N.style.fontSize = "14px";
							N.style.lineHeight = "16px";
						} else {
							if (R >= 24 && k < 24) {
								N.style.display = "block";
								N.style.marginTop = "10px";
								N.style.marginLeft = "0";
								N.innerHTML = y(N.innerHTML, 6);
								var I = N.innerHTML.match(/<br>/g);
								if (I != null) {
									c = I.length;
								} else {
									c = 0;
								}
								if (c >= 2) {
									N.style.fontSize = "10px";
									N.style.lineHeight = "10px";
								} else {
									if (c == 1) {
										N.style.fontSize = "14px";
										N.style.lineHeight = "14px";
									} else {
										N.style.fontSize = "14px";
										N.style.lineHeight = "16px";
									}
								}
							}
						}
					}
					var Q = document.getElementById("doksoft_font_awesome-zoom-in-" + l.name);
					if (R < i) {
						Q.style.cursor = "pointer";
						Q.style.filter = "";
						Q.style.opacity = "";
					} else {
						Q.style.cursor = "arrow";
						Q.style.filter = "alpha(opacity=25)";
						Q.style.opacity = "0.25";
					}
					var M = document.getElementById("doksoft_font_awesome-zoom-out-" + l.name);
					if (R > h) {
						M.style.cursor = "pointer";
						M.style.filter = "";
						M.style.opacity = "";
					} else {
						M.style.cursor = "arrow";
						M.style.filter = "alpha(opacity=25)";
						M.style.opacity = "0.25";
					}
					k = R;
				}
			};
			var G = null;
			var p = function() {
				var H = this;
				if (this.tagName.toLowerCase() != "div") {
					H = this.parentElement;
				}
				G = H;
				r();
			};
			var r = function() {
				var I = document.getElementsByClassName("doksoft_font_awesome-icon");
				for (var J = 0; J < I.length; J++) {
					var H = I[J];
					if (H == G) {
						H.style.outline = "1px solid #778CAF";
						H.style.backgroundColor = "rgba(194, 235, 255, 0.22)";
					} else {
						H.style.outline = "";
						H.style.backgroundColor = "";
					}
				}
			};
			var F = function() {
				var L = document.getElementById("doksoft_font_awesome-search-" + l.name).value.toLowerCase();
				var I = document.getElementsByClassName("doksoft_font_awesome-icon");
				for (var J = 0; J < I.length; J++) {
					var H = I[J];
					var K = y(H.getElementsByClassName("doksoft_font_awesome-title")[0].innerHTML, 0).trim();
					if (K.length == 0 || K.indexOf(L) != -1) {
						H.style.display = "inline-block";
					} else {
						H.style.display = "none";
						if (G == H) {
							H.style.outline = "";
							H.style.backgroundColor = "";
							G = null;
						}
					}
				}
			};
			
			
			CKEDITOR.dialog.add("doksoft_font_awesome-" + l.name, function(H) {
				return {
					title : "Insert icon",
					minWidth : 540,
					width : 540,
					minHeight : 400,
					height : 400,
					maxHeight : 400,
					resizable : false,
					onShow : function() {
						document.getElementById("doksoft_font_awesome-zoom-in-" + H.name).onclick = function() {
							var T = k;
							if (T < 20) {
								T += 2;
							} else {
								if (T < 36) {
									T += 4;
								} else {
									if (T < 64) {
										T += 12;
									} else {
										T += 24;
									}
								}
							}
							if (T > i) {
								T = i;
							}
							document.getElementById("doksoft_font_awesome-size-" + H.name).value = T;
							B();
						};
						document.getElementById("doksoft_font_awesome-zoom-out-" + H.name).onclick = function() {
							var T = k;
							if (T <= 20) {
								T -= 2;
							} else {
								if (T <= 36) {
									T -= 4;
								} else {
									if (T <= 64) {
										T -= 12;
									} else {
										T -= 24;
									}
								}
							}
							if (T < h) {
								T = h;
							}
							document.getElementById("doksoft_font_awesome-size-" + H.name).value = T;
							B();
						};
						var Q = document.getElementById("doksoft_font_awesome-size-" + H.name);
						var O = function() {
							B();
						};
						Q.onchange = O;
						Q.onkeyup = O;
						Q.onpaste = O;
						Q.oninput = O;
						jscolor.bind();
						var I = document.getElementById("doksoft_font_awesome-color-" + H.name);
						var S = function() {
							v();
						};
						I.onchange = S;
						I.onkeyup = S;
						I.onpaste = S;
						I.oninput = S;
						I.color.onImmediateChange = S();
						var M = document.getElementById("doksoft_font_awesome-search-" + H.name);
						var R = function() {
							F();
						};
						M.value = "";
						M.onchange = R;
						M.onkeyup = R;
						M.onpaste = R;
						M.oninput = R;
						var P = document.getElementsByClassName("doksoft_font_awesome-icon");
						for (var L = 0; L < P.length; L++) {
							var N = P[L];
							N.onclick = p;
							var K = N.getElementsByTagName("span");
							for (var J = 0; J < K.length; J++) {
								K[J].onclick = N.onclick;
							}
						}
						G = null;
						r();
						k = 23;
						B();
						v();
						F();
					},
					onOk : function() {
						if (G == null) {
							alert(H.lang["doksoft_font_awesome"].selectIcon);
							return false;
						}
						var Q = y(G.getElementsByClassName("doksoft_font_awesome-title")[0].innerHTML, 0);
						var I = "";
						var L = document.getElementById("doksoft_font_awesome-add-size-to-style-" + H.name).checked;
						var P = document.getElementById("doksoft_font_awesome-add-color-to-style-" + H.name).checked;
						var O = C && document.getElementById("doksoft_font_awesome-as-bitmap-" + H.name).checked;
						if (O) {
							var K = 0;
							for (var M = 0; M < g.length && K == 0; M++) {
								if (g[M] == Q) {
									K = b[M];
								}
							}
							var J = t + "?color=" + m.substr(1) + "&size=" + k + "&code=" + parseInt(K, 16);
							var N = H.document.createElement("img");
							N.setAttribute("src", J);
							N.setAttribute("alt", Q);
							H.insertElement(N);
							bindClick(l);

						} else {
							if (L || P) {
								I = ( L ? ("font-size:" + k + "px;") : "") + ( P ? ("color:" + m) : "");
							}
							if (f == 0) {							
								
								if(selectedElement && selectedElement.$.nodeName == "SPAN")
									var N = selectedElement;
								else
									var N = H.document.createElement("span");
								
								N.setAttribute("class", "fa fa-" + Q);
								N.setAttribute("style", I);
								if(selectedElement)
									H.updateElement(N)
								else										
									H.insertElement(N);
								bindClick(l);

							} else {
								if (f == 1) {
									
									if(selectedElement && selectedElement.$.nodeName == "SPAN")
										var N = selectedElement;
									else
										var N = H.document.createElement("span");
									//selectedElement = null;
									N.setAttribute("class", "glyphicon glyphicon-" + Q);
									N.setAttribute("style", I);
									H.insertElement(N);
									bindClick(l);
								}
							}
						}
						
						},
					contents : [{
						id : "tab1-" + H.name,
						label : "",
						title : "",
						expand : true,
						padding : 0,
						elements : [{
							id : "icons_doksoft_font_awesome-" + H.name,
							type : "html",
							html : '<style type="text/css">' + ".doksoft_font_awesome-icon:hover, .doksoft_font_awesome-icon:focus { outline: 1px solid #778CAF; background-color: rgba(194, 235, 255, 0.22); }" + "</style>" + '<table style="width:100%">' + "<tbody>" + '<tr style="height:30px">' + '<td style="width:50%">' + '<img src="' + CKEDITOR.basePath + CKEDITOR.plugins.basePath + 'doksoft_font_awesome/images/search.png" style="vertical-align:middle;margin-right:5px"/>' + '<input style="width:165px;font-size:14px;padding:2px;border:1px solid #AAA" id="doksoft_font_awesome-search-' + H.name + '"/>' + "</td>" + '<td style="width:115px">' + '<span style="font-size:14px">Size:</span>' + "</td>" + "<td>" + '<input style="width:40px;font-size:14px;padding:2px;border:1px solid #AAA;margin-left:5px" id="doksoft_font_awesome-size-' + H.name + '" value="' + D + '"/>' + '<img src="' + CKEDITOR.basePath + CKEDITOR.plugins.basePath + 'doksoft_font_awesome/images/zoom_out.png" style="vertical-align:middle;margin:0 5px;cursor:pointer" id="doksoft_font_awesome-zoom-out-' + H.name + '"/>' + '<img src="' + CKEDITOR.basePath + CKEDITOR.plugins.basePath + 'doksoft_font_awesome/images/zoom_in.png" style="vertical-align:middle;margin:0 5px;cursor:pointer" id="doksoft_font_awesome-zoom-in-' + H.name + '"/>' + "</td>" + '<td style="width:200px;padding-left:7px">' + "<label>" + '<input type="checkbox" id="doksoft_font_awesome-add-size-to-style-' + H.name + '" style="margin-right:4px" ' + ( j ? 'checked="checked"' : "") + ">" + "Add to style" + "</label>" + "</td>" + "</tr>" + "<tr>" + "<td>" + '<label style="font-size:14' + ( C ? "" : ";display:none") + '">' + '<input type="checkbox" id="doksoft_font_awesome-as-bitmap-' + H.name + '" style="margin:0 5px"' + ( A ? ' checked="checked"' : "") + ">" + "Insert as a bitmap" + "</label>" + "</td>" + "<td>" + '<span style="font-size:14px">Color:</span>' + "</td>" + "<td>" + '<input class="doksoft-icons-color-box" style="width:110px;font-size:14px;padding:2px;border:1px solid #AAA;margin-left:5px" id="doksoft_font_awesome-color-' + H.name + '" value="' + E + '"/>' + "</td>" + '<td style="padding-left:7px">' + "<label>" + '<input type="checkbox" id="doksoft_font_awesome-add-color-to-style-' + H.name + '" style="margin-right:4px" ' + ( u ? 'checked="checked"' : "") + ">" + "Add to style" + "</label>" + "</td>" + "</tr>" + "</tbody>" + "</table>" + '<div style="border-top: 1px solid #ccc;padding-top: 3px;margin-top: 10px;"></div>' + '<div style="width:100%;margin-top:10px;white-space:normal;max-height:370px;overflow-y:scroll;">' + s() + "</div>"
						}]
					}]
				};
			});
		}
	});
})(); 