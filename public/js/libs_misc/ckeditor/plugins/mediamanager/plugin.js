/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * Basic sample plugin inserting current date and time into the CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_intro
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'mediamanager', {

	// Register the icons. They must match command names.
	icons: 'mediamanager',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {

		// Define the editor command that inserts a timestamp.
		editor.addCommand( 'insertTimestamp', {

			// Define the function that will be fired when the command is executed.
			exec: function( editor ) {
				console.log('click media btn');
				clickandInsertImageButton(editor);
			}
		});

		// Create the toolbar button that executes the above command.
		editor.ui.addButton( 'MediaManager', {
			label: 'Media Manager',
			command: 'insertTimestamp',
			toolbar: 'insert'
		});
	}
});
