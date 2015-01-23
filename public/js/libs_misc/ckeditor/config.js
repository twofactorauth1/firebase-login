/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
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

	// The default plugins included in the basic setup define some buttons that
	// are not needed in a basic editor. They are removed here.
	config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Underline,Strike,Subscript,Superscript,Image,maximize,resize,Format,Indent,HorizontalRule,Outdent,Blockquote,lineheight';

	// Dialog windows are also simplified.
	config.removeDialogTabs = '';

	config.allowedContent = true;
	config.extraAllowedContent = true;
	config.disableAutoInline = true;
	
	// // ALLOW <i></i>
	// config.protectedSource.push( /<span[\s\S]*?\>/g ); //allows beginning <i> tag
	// config.protectedSource.push( /<\/span[\s\S]*?\>/g ); //allows ending </i> tag

	config.extraPlugins = 'doksoft_button,lineheight,mediamanager,sharedspace,image2';

	config.filebrowserBrowseUrl = '';

	CKEDITOR.dtd.$removeEmpty['i'] = false;
	CKEDITOR.dtd.$removeEmpty['span'] = false;
	CKEDITOR.dtd.$editable.span = true;
	CKEDITOR.dtd.$editable.a = true;
	CKEDITOR.dtd.$editable.img = true;
};
