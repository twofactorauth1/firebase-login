$.FroalaEditor.DefineIcon('insertButton', { NAME: 'plus'})

$.FroalaEditor.RegisterCommand('insertButton', {
    title: 'Insert Button',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback: function () {
        this.html.insert('<button class="btn btn-primary">Button Text</button>');
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
        'fr-strong': 'Thick',
        'btn': 'Button'
     },
     imageInsertButtons: ['imageBack', 'imageByURL', 'mediaManager'],
     // initOnClick: true,
     // editInPopup: true,
     // spellcheck: true,
     // toolbarSticky: false

}
