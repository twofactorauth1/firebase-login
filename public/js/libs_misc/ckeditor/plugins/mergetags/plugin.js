CKEDITOR.plugins.add('mergetags', {
  init: function (editor) {
    //  array of strings to choose from that'll be inserted into the editor
    var strings = [];
    strings.push(['@@FAQ::displayList()@@', 'FAQs', 'First']);
    strings.push(['@@Glossary::displayList()@@', 'Glossary', 'Last']);
    strings.push(['@@CareerCourse::displayList()@@', 'Career Courses', 'Date']);
    strings.push(['@@CareerProfile::displayList()@@', 'Career Profiles', 'Career Profiles']);

    // add the menu to the editor
    editor.ui.addRichCombo('strinsert', {
      label: 'Insert Merge Tag',
      title: 'Insert Merge Tag',
      voiceLabel: 'Insert Merge Tag',
      className: 'cke_format',
      multiSelect: false,
      panel: {
        css: [editor.config.contentsCss, CKEDITOR.skin.getPath('editor')],
        voiceLabel: editor.lang.panelVoiceLabel
      },

      init: function () {
        this.startGroup("Insert Merge Tag");
        for (var i in strings) {
          this.add(strings[i][0], strings[i][1], strings[i][2]);
        }
      },

      onClick: function (value) {
        editor.focus();
        editor.fire('saveSnapshot');
        editor.insertHtml(value);
        editor.fire('saveSnapshot');
      }
    });
  }
});
