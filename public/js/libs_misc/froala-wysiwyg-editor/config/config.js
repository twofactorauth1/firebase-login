var toolbarbuttons = [
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'fontFamily',
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
        'undo',
        'redo',
        // 'clearFormatting',
        // 'selectAll'
    ];
var spectrumColors = [
              ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
              ["#f47998", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
              ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
              ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
              ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
              ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
              ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
              ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
              ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6", "#9ACCCB", "#E8E7E7", "#000000", "#FFFFFF", "#50c7e8"],
              ["REMOVE"]
            ];

$.FroalaEditor.config = {
     enter: $.FroalaEditor.ENTER_BR,
     // enter: $.FroalaEditor.ENTER_DIV,
     toolbarBottom: false,
     toolbarInline: true,
     toolbarVisibleWithoutSelection: true,
     scrollableContainer: '#ssb-froala-scrollable-container',
     toolbarButtons: toolbarbuttons,
     toolbarButtonsMD: toolbarbuttons,
     toolbarButtonsSM: toolbarbuttons,
     toolbarButtonsXS: toolbarbuttons,
     imageStyles: {
        'img-rounded': 'Rounded Square',
        'img-thumbnail': 'Square with Border',
        'img-circle': 'Circle'
     },
     imageDefaultWidth: 'auto',
     linkStyles:{
        'ssb-theme-btn': 'SB Button',
        'btn': 'Button',
        'btn-default': 'Default Button',
        'btn-primary': 'Primary Button',
        'btn-success': 'Success Button',
        'btn-info': 'Info Button',
        'btn-warning': 'Warning Button',
        'btn-danger': 'Danger Button',
        'btn-link': 'Link Button',
     },
     linkText: true,
     fontFamily: {
        "Helvetica Neue, Helvetica, Arial, sans-serif": "Helvetica Neue",
        "Arial,Helvetica,sans-serif":"Arial","Georgia,serif":"Georgia",
        "Impact,Charcoal,sans-serif":"Impact",
        "Tahoma,Geneva,sans-serif":"Tahoma",
        "'Times New Roman',Times,serif":"Times New Roman",
        "Verdana,Geneva,sans-serif":"Verdana",
        "Roboto,sans-serif": 'Roboto',
        "Oswald,sans-serif": 'Oswald',
        "Montserrat,sans-serif": 'Montserrat',
        "'Open Sans Condensed',sans-serif": 'Open Sans Condensed'
    },
    imageInsertButtons: ['imageBack', 'imageByURL', 'mediaManager'],
    linkEditButtons: ['linkOpen', 'linkStyle', 'linkEdit', 'linkRemove', 'deleteButton'],
    imageEditButtons: ["imageReplace", "imageAlign", "imageRemove", "|", "imageLink", "linkOpen", "linkEdit", "linkRemove", "imageDisplay", "imageStyle", "imageAlt", "imageSize"],
    colorsText: [].concat.apply([], spectrumColors),
    colorsBackground: [].concat.apply([], spectrumColors),
    colorsStep: 10,
    paragraphFormat: {
        N: 'Normal',
        H1: 'Heading 1',
        H2: 'Heading 2',
        H3: 'Heading 3',
        H4: 'Heading 4',
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
    tableEditButtons: ['tableHeader', 'tableRemove', 'tableRows', 'tableColumns', 'tableStyle', 'tableCells', 'tableCellBackground', 'tableCellVerticalAlign', 'tableCellHorizontalAlign', 'tableCellStyle'],
    tableCellStyles: {
        'ssb-table-transparent-border': 'Clear Border',
        'ssb-table-black-border': 'Black Border',
        'ssb-table-white-border': 'White Border'
    },
    tableColors: [].concat.apply([], spectrumColors),
    tableColorsStep: 10,
    paragraphStyles: {
        'ssb-editor-style-line-height-small-1': 'Line Height Small 1',
        'ssb-editor-style-line-height-small-2': 'Line Height Small 2',
        'ssb-editor-style-line-height-1': 'Line Height 1',
        'ssb-editor-style-line-height-2': 'Line Height 2',
        'ssb-editor-style-line-height-3': 'Line Height 3',
        'ssb-editor-style-line-height-4': 'Line Height 4',
        'ssb-editor-style-line-height-5': 'Line Height 5',
    }
    // imageUploadToS3: {
    //     bucket: 'indigenous-digital-assets',
    //     region: 's3',
    //     keyStart: 'account_6/',
    //     callback: function (url, key) {
    //       // The URL and Key returned from Amazon.
    //       console.log (url);
    //       console.log (key);
    //     },
    //     params: {
    //       acl: 'public-read', // ACL according to Amazon Documentation.
    //       AWSAccessKeyId: 'AKIAIF4QBTOMBZRWROGQ', // Access Key from Amazon.
    //       policy: '', // Policy string computed in the backend.
    //       signature: '', // Signature computed in the backend.
    //     }
    // },
    //  requestWithCORS: false
     // initOnClick: true,
     // editInPopup: true,
     // spellcheck: true,
     // toolbarSticky: false

}
