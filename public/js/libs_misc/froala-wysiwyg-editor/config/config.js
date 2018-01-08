/**
 * Froala Config Settings
 * @param {string} type - optional, one of undefined|ssbBlog|ssbEmail
 * - if type is undefined then default config is returned
 * - $.FroalaEditor.build() returns cached config if called again with same type
 */

$.FroalaEditor.config = null;
$.FroalaEditor.build = _.memoize(function(type) {

    var toolbarbuttons = [
            'bold',
            'italic',
            'underline',
            'strikeThrough',
            'fontFamily',
            'fontWeight',
            'letterSpacingControl',
            'fontSize',
            'color',
            // 'emoticons',
            'paragraphStyle',
            'paragraphFormat',
            'align',
            'formatOL',
            'formatUL',
            'outdent',
            'indent',
            'insertLink',
            'insertButton',
            'insertImage',
            'insertVideo',
            'insertFile',
            'insertTable',
            'fontAwesomeIcons',
            'clearFormatting',
            'selectAll',
            'undo',
            'redo'
        ];

    var toolbarButtonsWithSeparators = [
            'bold',
            'italic',
            'underline',
            'strikeThrough',
            'fontFamily',
            'fontWeight',
            'letterSpacingControl',
            'fontSize',
            'color',
            'paragraphStyle',
            '-',
            'paragraphFormat',
            'align',
            'formatOL',
            'formatUL',
            'outdent',
            'indent',
            'insertLink',
            'insertButton',
            '-',
            'insertImage',
            'insertVideo',
            'insertFile',
            'insertTable',
            'fontAwesomeIcons',
            'clearFormatting',
            'selectAll',
            'undo',
            'redo'
        ];

    var spectrumColors = [
            ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
            ["#F47998", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
            ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
            ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
            ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
            ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
            ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
            ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
            ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6", "#9ACCCB", "#E8E7E7", "#000000", "#FFFFFF", "#50C7E8"],
            ["REMOVE"]
    ];

    var insertToolbarButton = function(buttonArray, newItem, beforeItem) {
        buttonArray.splice(_.findIndex($.FroalaEditor.config.toolbarButtons, function(item) {
            return item === beforeItem;
        }), 0, newItem);
    };

    $.FroalaEditor.config = {
        key: 'qENARBFSTb1G1QJg1RA==',
        enter: $.FroalaEditor.ENTER_BR,
        // enter: $.FroalaEditor.ENTER_DIV,
        toolbarBottom: false,
        toolbarInline: true,
        toolbarVisibleWithoutSelection: true,
        scrollableContainer: '#ssb-froala-scrollable-container',
        charCounterCount: false,
        // allowedEmptyTags: ['a'],
        toolbarButtons: toolbarbuttons,
        toolbarButtonsMD: toolbarButtonsWithSeparators,
        toolbarButtonsSM: toolbarButtonsWithSeparators,
        toolbarButtonsXS: toolbarButtonsWithSeparators,
        imageStyles: {
            'img-rounded': 'Rounded Square',
            'img-thumbnail': 'Square with Border',
            'img-circle': 'Circle',
            'img-full-width' : 'Full Width'
        },
        imageDefaultWidth: 'auto',
        linkStyles:{
            'ssb-theme-btn': 'SB Button',
            'btn': 'Button',
            // 'btn-default': 'Default Button',
            // 'btn-primary': 'Primary Button',
            // 'btn-success': 'Success Button',
            // 'btn-info': 'Info Button',
            // 'btn-warning': 'Warning Button',
            // 'btn-danger': 'Danger Button',
            'btn-link': 'Link Button',
        },
        linkText: true,
        fontFamily: {
            "'Arial',Helvetica,sans-serif": "Arial",
            "'Amatic SC', cursive": "Amatic SC",
            "'Berlin',sans-serif": "Berlin",
            "'Cinzel',serif": 'Cinzel',
            "Calibri,'Open Sans',sans-serif": "Calibri",
            "'Delius Swash Caps', cursive": 'Delius Swash Caps',
            "'Droid Serif',serif": 'Droid Serif',
            "'Georgia',serif": "Georgia",
            "'Helvetica Neue', Helvetica, Arial, sans-serif": "Helvetica Neue",
            "'Impact',Charcoal,sans-serif": "Impact",
            "'Indie Flower', cursive": 'Indie Flower',
            "'Itim', cursive": 'Itim',
            "'Lato',sans-serif": 'Lato',
            "'Lora',serif": 'Lora',
            "'Merriweather',serif": 'Merriweather',
            "'Montserrat',sans-serif": 'Montserrat',
            "'Neucha',cursive": 'Neucha',
            "'Nunito',sans-serif": 'Nunito',
            "'Open Sans Condensed',sans-serif": 'Open Sans Condensed',
            "'Open Sans',sans-serif": 'Open Sans',
            "'Oswald',sans-serif": 'Oswald',
            "'Pacifico',cursive" : 'Pacifico',
            "'Parisienne', cursive": 'Parisienne',
            "'Patrick Hand SC', cursive": 'Patrick Hand SC',
            "'Playfair Display',serif": 'Playfair Display',
            "'Petit Formal Script', cursive": 'Petit Formal Script',
            "'PT Sans',sans-serif": 'PT Sans',
            "'Quattrocento',serif": 'Quattrocento',
            "'Quicksand',sans-serif": 'Quicksand',
            "'Raleway',sans-serif": 'Raleway',
            "'Roboto Condensed',sans-serif": 'Roboto Condensed',
            "'Roboto Slab',serif": 'Roboto Slab',
            "'Roboto',sans-serif": 'Roboto',
            "'Satisfy', cursive": 'Satisfy',
            "'Schoolbell', cursive": 'Schoolbell',
            "'Shadows Into Light Two', cursive": 'Shadows Into Light Two',
            "'Source Sans Pro', sans-serif": 'Source Sans Pro',
            "'Tahoma',Geneva,sans-serif": "Tahoma",
            "'Times New Roman',Times,serif": "Times New Roman",
            "'Titillium Web', sans-serif": "Titillium Web",
            "'Trebuchet MS'":"Trebuchet MS",
            "'Ubuntu',sans-serif": 'Ubuntu',
            "'Verdana',Geneva,sans-serif": "Verdana"
        },
        //imageInsertButtons: ['imageBack', 'imageByURL', 'mediaManager'],
        linkEditButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontFamily', 'fontWeight','fontSize', 'color', 'linkOpen', 'linkStyle', 'linkEdit', 'linkRemove', 'deleteButton', 'linkRemoveBtn'],
        linkAutoPrefix: '',
        imageEditButtons: ["imageReplace", "imageAlign", "imageRemove", "imageLink", "linkOpen", "linkEdit", "linkRemove", "imageDisplay", "imageStyle", "imageAlt", "imageSize"],
        colorsText: [].concat.apply([], spectrumColors),
        colorsBackground: [].concat.apply([], spectrumColors),
        colorsStep: 10,
        paragraphFormat: {
            N: 'Normal',
            H1: 'Heading 1',
            H2: 'Heading 2',
            H3: 'Heading 3',
            H4: 'Heading 4',
            H5: 'Heading 5',
            H6: 'Heading 6',
            P: 'Paragraph',
            PRE: 'Code'
        },
        codeMirrorOptions: {
            indentWithTabs: true,
            lineNumbers: true,
            lineWrapping: false,
            mode: 'text/html',
            tabMode: 'indent',
            tabSize: 2
        },
        tableEditButtons: ['tableHeader', 'tableRemove', 'tableRows', 'tableColumns', 'tableStyle', 'tableCells', 'tableCellColors', 'tableCellVerticalAlign', 'tableCellHorizontalAlign', 'tableCellStyle', 'tableCellPadding', 'tableBorderWidth'],
        tableCellStyles: {
            'ssb-table-transparent-border': 'Clear Border',
            'ssb-table-black-border': 'Black Border',
            'ssb-table-white-border': 'White Border'
        },
        tableCellMultipleStyles: false,
        tableColors: [].concat.apply([], spectrumColors),
        tableColorsStep: 10,
        paragraphStyles: {
            'ssb-editor-style-line-height-normal' : 'Line Height Normal',
            'ssb-editor-style-line-height-small-1': 'Line Height Small 1',
            'ssb-editor-style-line-height-small-2': 'Line Height Small 2',
            'ssb-editor-style-line-height-1': 'Line Height 1',
            'ssb-editor-style-line-height-2': 'Line Height 2',
            'ssb-editor-style-line-height-3': 'Line Height 3',
            'ssb-editor-style-line-height-4': 'Line Height 4',
            'ssb-editor-style-line-height-5': 'Line Height 5',
        },
        videoUploadURL:  "/api/1.0/assets/editor/image/upload",
        imageUploadURL: "/api/1.0/assets/editor/image/upload",
        linkMultipleStyles: false,
        paragraphMultipleStyles: false,
        placeholderText: 'Type here',
        imageManagerScrollOffset: 0,
        dragImage: false,
        pastePlain: false,
        linkList: [
        {
          text: 'Google',
          href: 'http://google.com',
          target: '_blank',
          rel: 'nofollow'
        },
        {
          displayText: 'Facebook',
          text: 'Facebook',
          href: 'https://facebook.com',
          target: '_blank'
        }],
        VIDEO_EMBED_REGEX: /^\W*((<iframe.*)|(<embed.*))\W*/i,
        htmlAllowedEmptyTags: ["textarea","a","iframe","object","video","style","script",".fa",".fr-emoticon"],
        htmlAllowedTags: [".*"],
        htmlAllowedAttrs: [".*"]

    };

    if (type === 'ssbBlogEditor') { 
        insertToolbarButton($.FroalaEditor.config.toolbarButtons, 'quote', 'insertImage');
        insertToolbarButton($.FroalaEditor.config.toolbarButtonsMD, 'quote', 'insertImage');
        insertToolbarButton($.FroalaEditor.config.toolbarButtonsSM, 'quote', 'insertImage');
        insertToolbarButton($.FroalaEditor.config.toolbarButtonsXS, 'quote', 'insertImage');
    }

    if (type === 'ssbEmailEditor') {
        $.FroalaEditor.config.imageStyles= {
            'img-rounded': 'Rounded Square',
            'img-thumbnail': 'Square with Border',
            'img-circle': 'Circle'
        };
        var emailToolbarButtons = _.without(toolbarbuttons, 'fontAwesomeIcons', 'insertVideo','letterSpacingControl');
        _.extend($.FroalaEditor.config, {
            toolbarButtons: emailToolbarButtons,
            toolbarButtonsMD: emailToolbarButtons,
            toolbarButtonsSM: emailToolbarButtons,
            toolbarButtonsXS: emailToolbarButtons,
            placeholderText: 'Type your email here'
        });

    }

    if (type === 'broadcastMessageEditor') {
        $.FroalaEditor.config.imageStyles= {
            'img-rounded': 'Rounded Square',
            'img-thumbnail': 'Square with Border',
            'img-circle': 'Circle'
        };
        var messageToolbarButtons = [
            'bold',
            'italic',
            'underline',
            'strikeThrough',
            'fontSize',
            'color',
            'insertLink',
            'insertImage'
        ];
        _.extend($.FroalaEditor.config, {
            toolbarButtons: messageToolbarButtons,
            toolbarButtonsMD: messageToolbarButtons,
            toolbarButtonsSM: messageToolbarButtons,
            toolbarButtonsXS: messageToolbarButtons,
            placeholderText: 'Type your text here'
        });

    }

    console.debug('called $.FroalaEditor.build', type);

    return $.FroalaEditor.config;

});
