$.FroalaEditor.DefineIcon('insertButton', { NAME: 'plus'})
var toolbarbuttons = [
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'fontFamily',
        'fontSize',
        '|',
        'color',
        'emoticons',        
        'paragraphStyle',
        '|',
        'paragraphFormat',
        'align',
        'formatOL',
        'formatUL',
        'outdent',
        'indent',
        '-',
        'insertLink',
        'insertButton',
        'insertImage',
        'insertVideo',
        'insertFile',
        'insertTable',
        '|',
        'insertHR',
        'undo',
        'redo',
        'clearFormatting',
        'selectAll'
    ];
$.FroalaEditor.RegisterCommand('insertButton', {
    title: 'Insert Button',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback: function () {
        this.html.insert('<a class="btn btn-primary ssb-button">Button Text</a>');
        this.undo.saveStep();
    }
});


$.FroalaEditor.config = {
     enter: $.FroalaEditor.ENTER_BR,
     toolbarInline: true,
     toolbarVisibleWithoutSelection: true,
     toolbarButtons: toolbarbuttons,
     toolbarButtonsMD: toolbarbuttons,
     toolbarButtonsSM: toolbarbuttons,
     toolbarButtonsXS: toolbarbuttons,
     imageStyles: {
        'img-rounded': 'Rounded Square',
        'img-thumbnail': 'Square with Border',
        'img-circle': 'Circle'
     },
     linkStyles:{
        'fr-green': 'Green',
        'fr-strong': 'Thick'
     },
     fontFamily:{"Arial,Helvetica,sans-serif":"Arial","Georgia,serif":"Georgia",
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
