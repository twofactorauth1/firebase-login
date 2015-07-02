/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	config.title = false;
	// Define changes to default configuration here.
	// For complete reference see:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	// The toolbar groups arrangement, optimized for a single toolbar row.
	config.toolbarGroups = [
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'forms' },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi'] },
		{ name: 'links', groups: [ 'Link', 'Unlink', 'Anchor' ] },
		{ name: 'insert' },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'tools' },
		{ name: 'others'},
		{ name: 'about' }
	];

	// config.font_names = 'GoogleWebFonts;' + config.font_names;
	// ckeditor-gwf-plugin

	// The default plugins included in the basic setup define some buttons that
	// are not needed in a basic editor. They are removed here.
	config.removeButtons = 'PasteText,Cut,Copy,Paste,Underline,Strike,Subscript,Superscript,Image,maximize,resize,Format,Indent,HorizontalRule,Outdent,Blockquote,BGColor','fontawesome';

	// Dialog windows are also simplified.
	config.removeDialogTabs = '';

	config.forcePasteAsPlainText = true;

	config.allowedContent = true;
	config.extraAllowedContent = true;
	config.disableAutoInline = true;
	config.autoParagraph = false;
	config.enterMode = CKEDITOR.ENTER_BR;
	config.shiftEnterMode = CKEDITOR.ENTER_P;
	//config.line_height="1em;1.1em;1.2em;1.3em;1.4em;1.5em;1.6em;1.7em;1.8em;1.9em;2.0em" ;

	// // ALLOW <i></i>
	// config.protectedSource.push( /<span[\s\S]*?\>/g ); //allows beginning <i> tag
	// config.protectedSource.push( /<\/span[\s\S]*?\>/g ); //allows ending </i> tag

	config.extraPlugins = 'panel,floatpanel,dialogadvtab,contextmenu,colordialog,colorbutton,pastetext,doksoft_button,mediamanager,sharedspace,image2,tooltip,lineheight,doksoft_font_awesome,table,tabletools,quicktable';

	config.filebrowserBrowseUrl = '';

	// CKEDITOR.dtd.$removeEmpty['i'] = false;
	// CKEDITOR.dtd.$removeEmpty['span'] = false;
	// CKEDITOR.dtd.$editable.span = true;
	// CKEDITOR.dtd.$editable.a = true;
	// CKEDITOR.dtd.$editable.img = true;
};
