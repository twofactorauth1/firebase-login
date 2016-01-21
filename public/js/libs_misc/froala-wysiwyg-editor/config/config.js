$.FroalaEditor.DefineIcon('insertButton', { NAME: 'plus'})

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
     toolbarButtons: [
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'fontFamily',
        'fontSize',
        '|',
        'color',
        'emoticons',
        'inlineStyle',
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
    ],
     imageStyles: {
        'img-rounded': 'Rounded Square',
        'img-thumbnail': 'Square with Border',
        'img-circle': 'Circle'
     },
     linkStyles:{
        'fr-green': 'Green',
        'fr-strong': 'Thick'
     },
     imageInsertButtons: ['imageBack', 'imageByURL', 'mediaManager'],
     // initOnClick: true,
     // editInPopup: true,
     // spellcheck: true,
     // toolbarSticky: false

}
