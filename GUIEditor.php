<?php
/**!info**
{
  "Plugin Name"  : "GUI Editor",
  "Plugin URI"   : "http://enanocms.org/plugin/guieditor",
  "Description"  : "Adds a toolbar to the editor interface, allowing point-and-click insertion of most formatting elements",
  "Author"       : "Dan Fuhry",
  "Version"      : "0.1",
  "Author URI"   : "http://enanocms.org/",
  "Version list" : ['0.1']
}
**!*/

$plugins->attachHook('compile_template', 'guied_attach_script();');

function guied_attach_script()
{
	global $template;
	$template->add_header_js('<script type="text/javascript" src="' . scriptPath . '/plugins/guieditor/editor.js"></script>');
}

//
// Image search autofill
//

$plugins->attachHook('autofill_json_request', 'guied_image_autofill($dataset);');

function guied_image_autofill(&$dataset)
{
	global $db, $session, $paths, $template, $plugins; // Common objects
	if ( $_GET['type'] == 'guied_image' )
	{
		$results = perform_search($_GET['userinput'], $warnings, false, $word_list);
		foreach ( $results as $i => $result )
		{
			if ( $result['namespace'] != 'File' )
				unset($results[$i]);
		}
		if ( count($results) > 5 )
		{
			$results = array_slice($results, 0, 5);
		}
		foreach ( $results as $result )
		{
			$dataset[] = array(
					0 => $result['page_id'],
					'title' => str_replace(array('<highlight>', '</highlight>'), array('<b>', '</b>'), $result['page_name']),
					'thumbnail' => makeUrlNS('Special', "DownloadFile/{$result['page_id']}", "preview&width=80&height=80"),
					'score' => $result['score'],
					'type' => isset($result['page_note']) ? $result['page_note'] : '',
					'size' => $result['page_length'],
				);
		}
	}
}

/**!language**
<code>
{
	eng: {
		categories: ['meta', 'guied'],
		strings: {
			meta: {
				guied: 'GUI Editor',
			},
			guied: {
				btn_bold: 'Bold',
				btn_italic: 'Italic',
				btn_underline: 'Underline',
				btn_intlink: 'Internal link',
				btn_extlink: 'External link',
				btn_image: 'Image',
				
				sample_bold: 'Bold text',
				sample_italic: 'Italic text',
				sample_underline: 'Underlined text',
				
				intlink_title: 'Insert internal link',
				intlink_lbl_page: 'Page:',
				intlink_lbl_text: 'Link text:',
				intlink_af_hint: 'Type a few letters to search.',
				intlink_text_hint: 'If left blank, the title of the page linked to will be displayed.',
				
				extlink_title: 'Insert external link',
				extlink_lbl_link: 'Link:',
				extlink_lbl_text: 'Link text: ',
				extlink_link_hint: 'Supported link types: http, https, irc, mailto, ftp',
				extlink_text_hint: 'If left blank, the link URL will be displayed.',
				
				image_title: 'Insert image',
				image_lbl_image: 'Image file:',
				image_btn_upload: 'Upload a file',
				image_lbl_caption: 'Caption:',
				image_af_hint: 'Type a few letters to search.',
				
				btn_insert: 'Insert'
			}
		}
	}
}
</code>
**!*/
