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
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'tools' },
		{ name: 'others' },
		{ name: 'about' }
	];

		// The default plugins included in the basic setup define some buttons that
	// are not needed in a basic editor. They are removed here.
	config.removeButtons = 'Cut,Copy,Paste,Undo,Redo,Underline,Strike,Subscript,Superscript';

	// Dialog windows are also simplified.
	config.removeDialogTabs = '';

	config.allowedContent = true;
	config.extraAllowedContent = true;


	// ALLOW <i></i>
	config.protectedSource.push( /<i[\s\S]*?\>/g ); //allows beginning <i> tag
	config.protectedSource.push( /<\/i[\s\S]*?\>/g ); //allows ending </i> tag

	config.extraPlugins = 'doksoft_button,doksoft_font_awesome,image2,mediamanager,widget,lineutils,clipboard';

	// Dialog windows are also simplified.
	config.removeDialogTabs = 'link:advanced';
};

// allow i tags to be empty (for font awesome)
	CKEDITOR.dtd.$removeEmpty['i'] = false;
	CKEDITOR.dtd.$editable.span = true;
	CKEDITOR.dtd.$editable.a = true;
	CKEDITOR.dtd.$editable.img = true;
