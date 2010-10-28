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
	$template->add_header_js('<style type="text/css">
			select.guied_dropdown {
				font-size: 10px;
				padding: 0;
				border: 1px solid #aaaaff;
				background-color: white;
				color: #202020;
			}
		</style><script type="text/javascript" src="' . scriptPath . '/plugins/guieditor/editor.js"></script>');
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
			if ( $result['namespace'] != 'File' || !preg_match('/\.(png|jpeg|jpg|gif)$/i', $result['page_id']) )
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
				btn_table: 'Table',
				btn_ulist: 'Bulleted list',
				btn_olist: 'Numbered list',
				
				sample_heading: 'Heading',
				sample_bold: 'Bold text',
				sample_italic: 'Italic text',
				sample_underline: 'Underlined text',
				// translators: translating this may be easier if you understand wiki-table syntax
				sample_table: '|-\n! Column header 1\n! Column header 2\n|-\n| Row 1, column 1\n| Row 1, column 2\n|-\n| Row 2, column 1\n| Row 2, column 2',
				sample_ulist: '\n* Bulleted list\n** Sub-level\n*** Deeper indent\n* Back to one indent',
				sample_olist: '\n# Numbered list\n## Sub-level\n### Deeper indent\n# Back to one indent',
				
				lbl_heading: 'Heading',
				
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
				image_lbl_resize: 'Resize image:',
				image_checkbox_resize: 'Resize',
				image_lbl_dimensions: 'Dimensions:',
				image_resize_or: 'Or',
				image_resize_lbl_default: 'Use default preview size',
				image_msg_preserve_aspect: 'The image\'s aspect ratio will be preserved.',
				image_lbl_mode: 'Display mode:',
				image_lbl_framed: 'Framed',
				image_lbl_inline: 'Inline',
				image_lbl_raw: 'Raw',
				image_mode_hint_framed: 'Display the image off to the left or right in a frame.',
				image_mode_hint_inline: 'Display the image in the middle of the paragraph.',
				image_mode_hint_raw: 'Display just the image without linking to the file page - useful for putting images into links.',
				image_framed_lbl_side: 'Display on:',
				image_framed_left: 'Left side',
				image_framed_right: 'Right side',
				image_lbl_alttext: 'Alternate text:',
				image_raw_msg_noopt: 'No additional options for raw image display.',
				
				btn_insert: 'Insert'
			}
		}
	}
}
</code>
**!*/
