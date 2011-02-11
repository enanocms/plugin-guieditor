attachHook('editor_gui_toolbar', 'guied_insert_toolbar(ta_wrapper, textarea, response.toolbar_templates);');

function guied_insert_toolbar(ta_wrapper, textarea, toolbar_templates)
{
	// Init toolbar
	var toolbar = '';
	var head = new templateParser(toolbar_templates.toolbar_start);
	var button = new templateParser(toolbar_templates.toolbar_button);
	var label = new templateParser(toolbar_templates.toolbar_label);
	var tail = new templateParser(toolbar_templates.toolbar_end);
	
	button.assign_bool({
			show_title: true
		});
	
	toolbar += head.run();
	
	var buttons = ['heading', '|', 'bold*', 'italic*', 'underline*', '|', 'intlink', 'extlink', 'image*', 'table*', '|', 'ulist*', 'olist*', '|', 'signature'];
	// if new images are to be added, run sprite.sh under icons/ and update this array
	var spritelist = ['add', 'bold', 'extlink', 'image', 'intlink', 'italic', 'olist', 'signature', 'table', 'ulist', 'underline', 'separator'];
	
	// Button: Bold
	var i;
	var hide_label = false;
	for ( i = 0; i < buttons.length; i++ )
	{
		if ( buttons[i] == '|' )
		{
			label.assign_vars({
					TITLE: gen_sprite_html(cdnPath + '/plugins/guieditor/icons/sprite.png', 8, 16, 0, (spritelist.length - 1) * 16),
				});
			toolbar += label.run();
		}
		else if ( buttons[i] == 'heading' )
		{
			var options = [];
			options.push('<option value="0">' + $lang.get('guied_lbl_heading') + '...</option>');
			for ( var j = 1; j <= 6; j++ )
			{
				options.push('<option value="' + j + '">' + $lang.get('guied_lbl_heading') + ' '+j+'</option>');
			}
			options = implode('', options);
			label.assign_vars({
					TITLE: '<select class="guied_dropdown" onchange="guied_register_heading(this);">' + options + '</select>'
				});
			toolbar += label.run();
		}
		else
		{
			if ( buttons[i].charAt(buttons[i].length - 1) == '*' )
			{
				hide_label = true;
				buttons[i] = buttons[i].substr(0, buttons[i].length - 1);
				button.assign_bool({ show_title: false });
			}
			button.assign_vars({
					TITLE: $lang.get('guied_btn_' + buttons[i]),
					// FIXME: indexOf is error prone here
					SPRITE: gen_sprite_html(cdnPath + '/plugins/guieditor/icons/sprite.png', 16, 16, 0, spritelist.indexOf(buttons[i]) * 16),
					FLAGS: 'href="#" onclick="guied_act(\'' + buttons[i] + '\', this); return false;"'
				});
			toolbar += button.run();
			if ( hide_label )
			{
				button.assign_bool({ show_title: true });
				hide_label = false;
			}
		}
	}
	
	// End of toolbar
	toolbar += tail.run();
	
	var wrapperdiv = document.createElement('div');
	wrapperdiv.innerHTML = toolbar;
	wrapperdiv.className = 'guieditor hide-with-mce';
	wrapperdiv.target_ta = textarea;
	ta_wrapper.appendChild(wrapperdiv);
}

function guied_act(action, obj)
{
	var textarea = guied_self(obj).target_ta;
	if ( !textarea )
	{
		console.error('Could not get textarea');
		console.debug(obj, guied_self(obj));
		return null;
	}
	var af_class = typeof(autofill_schemas.floodlight) == 'object' ? 'guied_floodlight' : 'page';
	switch(action)
	{
		case 'bold':
			guied_insert_wikitext_tag(textarea, "'''", "'''", $lang.get('guied_sample_bold'));
			break;
		case 'italic':
			guied_insert_wikitext_tag(textarea, "''", "''", $lang.get('guied_sample_italic'));
			break;
		case 'underline':
			guied_insert_wikitext_tag(textarea, "__", "__", $lang.get('guied_sample_underline'));
			break;
		case 'intlink':
			load_component('autofill');
			var selection = guied_get_selection(textarea);
			var il_mp = miniPrompt(function(div)
				{
					console.debug(div.parentNode);
					
					div.innerHTML += '<h3>' + $lang.get('guied_intlink_title') + '</h3>';
					div.innerHTML += '<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_intlink_lbl_page') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_intlink_page" class="autofill ' + af_class + '" style="width: 100%;" /><br /> \
										<small>' + $lang.get('guied_intlink_af_hint') + '</small> \
									</td> \
								</tr> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_intlink_lbl_text') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_intlink_text" style="width: 100%;" /><br /> \
										<small>' + $lang.get('guied_intlink_text_hint') + '</small> \
									</td> \
								</tr> \
							</table>';
					div.innerHTML += '<p style="text-align: right;"> \
									<a class="abutton abutton_blue" onclick="guied_intlink_finish(this); return false;" href="#">' + $lang.get('guied_btn_insert') + '</a> \
									<a class="abutton abutton_red" onclick="miniPromptDestroy(this); return false;" href="#">' + $lang.get('etc_cancel') + '</a> \
								</p>';
				});
			
			// This fixes autofill
			il_mp.style.zIndex = getHighestZ() + 1;
			
			autofill_init_element(document.getElementById('guied_intlink_page'), {});
			document.getElementById('guied_intlink_page').focus();
			$('#guied_intlink_text').val(selection);
			
			break;
		case 'extlink':
			load_component('autofill');
			var selection = guied_get_selection(textarea);
			var il_mp = miniPrompt(function(div)
				{
					div.innerHTML += '<h3>' + $lang.get('guied_extlink_title') + '</h3>';
					div.innerHTML += '<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_extlink_lbl_link') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_extlink_link" style="width: 100%;" /><br /> \
										<small>' + $lang.get('guied_extlink_link_hint') + '</small> \
									</td> \
								</tr> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_extlink_lbl_text') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_extlink_text" style="width: 100%;" /><br /> \
										<small>' + $lang.get('guied_extlink_text_hint') + '</small> \
									</td> \
								</tr> \
							</table>';
					div.innerHTML += '<p style="text-align: right;"> \
									<a class="abutton abutton_blue" onclick="guied_extlink_finish(this); return false;" href="#">' + $lang.get('guied_btn_insert') + '</a> \
									<a class="abutton abutton_red" onclick="miniPromptDestroy(this); return false;" href="#">' + $lang.get('etc_cancel') + '</a> \
								</p>';
				});
			
			document.getElementById('guied_extlink_link').focus();
			$('#guied_extlink_text').val(selection);
			
			break;
		case 'image':
			// Fuck yeah.
			load_component('autofill');
			var selection = guied_get_selection(textarea);
			var il_mp = miniPrompt(function(div)
				{
					div.innerHTML += '<h3>' + $lang.get('guied_image_title') + '</h3>';
					// Yes, I know what you're thinking. Probably something along the lines of "holy fuck, this is a long ass string."
					// I'll move all these tools over to templates at some point in time
					div.innerHTML += '<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_image_lbl_image') + ' \
									</td> \
									<td valign="top"> \
										<img id="guied_image_preview" src="' + cdnPath + '/images/spacer.gif" style="display: block;" onerror="this.style.display = \'none\';" /> \
										<input type="text" id="guied_image_file" class="autofill guied_image" style="width: 100%;" onblur="guied_refresh_image();" /><br /> \
										<small>' + $lang.get('guied_image_af_hint') + '</small> \
										<div id="guied_upload_body" style="padding: 4px 0;"> \
										<a class="abutton icon abutton_green" style="background-image: url(' + scriptPath + '/plugins/guieditor/icons/add.png);" href="#" onclick="guied_image_show_uploader(); return false;">' + $lang.get('guied_image_btn_upload') + '</a> \
										</div> \
									</td> \
								</tr> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
										' + $lang.get('guied_image_lbl_resize') + ' \
									</td> \
									<td valign="top"> \
										<label> \
											<input type="checkbox" id="guied_image_resize" onclick="$(\'#guied_image_resizer\').toggle(\'blind\');" /> \
											' + $lang.get('guied_image_checkbox_resize') + ' \
										</label> \
										<div id="guied_image_resizer" style="display: none;"> \
											' + $lang.get('guied_image_lbl_dimensions') + ' \
											<input type="text" id="guied_image_size_x" size="5" /> x \
											<input type="text" id="guied_image_size_y" size="5" /> \
											<br /> \
											&nbsp;&nbsp;&nbsp; \
												' + $lang.get('guied_image_resize_or') + ' \
												<label><input type="checkbox" id="guied_image_resize_default" onclick="guied_image_toggle_default();" /> \
												' + $lang.get('guied_image_resize_lbl_default') + '</label><br /> \
											<small> \
												' + $lang.get('guied_image_msg_preserve_aspect') + ' \
											</small> \
										</div> \
									</td> \
								</tr> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
										' + $lang.get('guied_image_lbl_mode') + ' \
									</td> \
									<td valign="top"> \
										<form> \
										<label> \
											<input class="guied_image_mode_radio" onclick="guied_image_set_mode(this.value);" type="radio" name="mode" value="framed" checked="checked" /> \
											' + $lang.get('guied_image_lbl_framed') + ' \
										</label> \
										<label> \
											<input class="guied_image_mode_radio" onclick="guied_image_set_mode(this.value);" type="radio" name="mode" value="inline" /> \
											' + $lang.get('guied_image_lbl_inline') + ' \
										</label> \
										<label> \
											<input class="guied_image_mode_radio" onclick="guied_image_set_mode(this.value);" type="radio" name="mode" value="raw" /> \
											' + $lang.get('guied_image_lbl_raw') + ' \
										</label><br /> \
										</form> \
										<small id="guied_mode_hint">' + $lang.get('guied_image_mode_hint_framed') + '</small> \
									</td> \
								</tr> \
							</table> \
							<div class="guied_image_mode framed"> \
								<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_image_framed_lbl_side') + ' \
									</td> \
									<td valign="top"> \
										<form> \
										<label> \
											<input class="guied_image_side" type="radio" name="side" value="left" checked="checked" /> \
											' + $lang.get('guied_image_framed_left') + ' \
										</label> \
										<label> \
											<input class="guied_image_side" type="radio" name="side" value="right" /> \
											' + $lang.get('guied_image_framed_right') + ' \
										</label> \
										</form> \
									</td> \
								</tr> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
										' + $lang.get('guied_image_lbl_caption') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_image_caption" style="width: 100%;" /> \
									</td> \
								</tr> \
								</table> \
							</div> \
							<div class="guied_image_mode inline" style="display: none;"> \
								<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
										' + $lang.get('guied_image_lbl_alttext') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_image_alttext" style="width: 100%;" /> \
									</td> \
								</tr> \
								</table> \
							</div> \
							<div class="guied_image_mode raw" style="display: none;"> \
								' + $lang.get('guied_image_raw_msg_noopt') + ' \
							</div>';
					div.innerHTML += '<p style="text-align: right;"> \
									<a class="abutton abutton_blue" onclick="guied_image_finish(this); return false;" href="#">' + $lang.get('guied_btn_insert') + '</a> \
									<a class="abutton abutton_red" onclick="miniPromptDestroy(this); return false;" href="#">' + $lang.get('etc_cancel') + '</a> \
								</p>';
				});
			
			// This fixes autofill
			il_mp.style.zIndex = getHighestZ() + 1;
			
			autofill_init_element(document.getElementById('guied_image_file'), {});
			document.getElementById('guied_image_file').focus();
			$('#guied_image_caption').val(selection);
			
			break;
		case 'table':
			guied_insert_wikitext_tag(textarea, "{| styled\n", "\n|}", $lang.get('guied_sample_table'));
			break;
		case 'ulist':
			guied_replace_selection(textarea, $lang.get('guied_sample_ulist'));
			break;
		case 'olist':
			guied_replace_selection(textarea, $lang.get('guied_sample_olist'));
			break;
		case 'signature':
			guied_replace_selection(textarea, '~~~~');
			break;
	}
}

function guied_register_heading(select)
{
	var textarea = guied_self(select).target_ta;
	var n = Number($(select).val());
	if ( n < 1 || n > 6 )
		return;
	$(select).val('0');
	var tag = '';
	for ( var i = 0; i < n; i++ )
		tag += '=';
	
	guied_insert_wikitext_tag(textarea, tag + ' ', ' ' + tag, $lang.get('guied_sample_heading'));
}

function guied_intlink_finish(insertbtn)
{
	var page = $('#guied_intlink_page').val();
	var text = $('#guied_intlink_text').val();
	var tag = text == '' ? '[[' + page + ']]' : '[[' + page + '|' + text + ']]'; 
	guied_replace_selection(document.getElementById('ajaxEditArea'), tag);
	
	miniPromptDestroy(insertbtn);
}

function guied_extlink_finish(insertbtn)
{
	var link = $('#guied_extlink_link').val();
	var text = $('#guied_extlink_text').val();
	var tag = text == '' ? '[' + link + ']' : '[' + link + ' ' + text + ']'; 
	guied_replace_selection(document.getElementById('ajaxEditArea'), tag);
	
	miniPromptDestroy(insertbtn);
}

var guied_upl_oldhtml = '';
function guied_image_show_uploader()
{
	var div = document.getElementById('guied_upload_body');
	guied_upl_oldhtml = $(div).html();
	$(div).html('<form action="' + makeUrlNS('Special', 'UploadFile') + '" target="uploadwin" onsubmit="return guied_upload_popup();" method="post" enctype="multipart/form-data">' +
				'<p><input type="file" style="width: 100%;" name="data" id="guied_upload_file" /></p>' +
				'<input type="hidden" value="" name="rename" />' +
				'<input type="hidden" value="" name="comments" />' +
				'<p><input type="submit" name="doit" value="' + $lang.get('upload_btn_upload') + '"></p>' +
			'</form>');
}


function guied_upload_popup()
{
	window.open('about:blank', 'uploadwin', 'width=640,height=480,status=no,toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes');
	var filename = $('#guied_upload_file').val();
	if ( filename == "" )
		return false;
	filename = filename.split(/[\/\\\\]/);
	filename = filename[ filename.length - 1 ];
	// sneaky little trick to make onblur get called
	$('#guied_image_file').val(sanitize_page_id(filename)).focus();
	setTimeout('$("#guied_upload_body").html(guied_upl_oldhtml)', 100);
	return true;
}

function guied_refresh_image()
{
	$('#guied_image_preview').css('display', 'block').attr('src', makeUrlNS('Special', 'DownloadFile/' + $('#guied_image_file').val(), 'preview&width=200&height=400')).css('margin-bottom', '5px');
}

function guied_image_toggle_default()
{
	if ( $('#guied_image_resize_default:checked').length )
	{
		$('#guied_image_size_x, #guied_image_size_y').attr('disabled', 'disabled');
	}
	else
	{
		$('#guied_image_size_x, #guied_image_size_y').removeAttr('disabled');
	}
}

function guied_image_set_mode(val)
{
	$('#guied_mode_hint').text($lang.get('guied_image_mode_hint_' + val));
	$('.guied_image_mode').hide();
	$('.guied_image_mode.' + val).show();
}

function guied_image_finish(insertbtn)
{
	var attrs = [];
	var filename = $('#guied_image_file').val();
	attrs.push(':' + namespace_list.File + filename);
	if ( $('#guied_image_resize:checked').length )
	{
		if ( $('#guied_image_resize_default:checked').length )
			attrs.push('thumb');
		else
			attrs.push($('#guied_image_size_x').val() + 'x' + $('#guied_image_size_y'));
	}
	var caption = '';
	switch($('.guied_image_mode_radio:checked').val())
	{
		case 'framed':
			attrs.push($('.guied_image_side:checked').val());
			caption = $('#guied_image_caption').val();
			break;
		case 'inline':
			caption = $('#guied_image_alttext').val();
			break;
		case 'raw':
			attrs.push('raw');
	}
	if ( caption != '' )
		attrs.push(caption);
	
	var tag = '[[' + implode('|', attrs) + ']]';
	
	guied_replace_selection(document.getElementById('ajaxEditArea'), tag);
	miniPromptDestroy(insertbtn);
}

// Client detection from MediaWiki
var clientPC = navigator.userAgent.toLowerCase(); // Get client info
var is_gecko = ((clientPC.indexOf('gecko')!=-1) && (clientPC.indexOf('spoofer')==-1)
                && (clientPC.indexOf('khtml') == -1) && (clientPC.indexOf('netscape/7.0')==-1));

// Function adapted from MediaWiki/phpBB
function guied_insert_wikitext_tag(txtarea, tagOpen, tagClose, sampleText)
{
	// IE
	if (document.selection  && !is_gecko) {
		var theSelection = document.selection.createRange().text;
		if (!theSelection)
			theSelection=sampleText;
		txtarea.focus();
		if (theSelection.charAt(theSelection.length - 1) == " ") { // exclude ending space char, if any
			theSelection = theSelection.substring(0, theSelection.length - 1);
			document.selection.createRange().text = tagOpen + theSelection + tagClose + " ";
		} else {
			document.selection.createRange().text = tagOpen + theSelection + tagClose;
		}

	// Mozilla
	} else if(txtarea.selectionStart || txtarea.selectionStart == '0') {
		var replaced = false;
		var startPos = txtarea.selectionStart;
		var endPos = txtarea.selectionEnd;
		if (endPos-startPos)
			replaced = true;
		var scrollTop = txtarea.scrollTop;
		var myText = (txtarea.value).substring(startPos, endPos);
		if (!myText)
			myText=sampleText;
		if (myText.charAt(myText.length - 1) == " ") { // exclude ending space char, if any
			subst = tagOpen + myText.substring(0, (myText.length - 1)) + tagClose + " ";
		} else {
			subst = tagOpen + myText + tagClose;
		}
		txtarea.value = txtarea.value.substring(0, startPos) + subst +
			txtarea.value.substring(endPos, txtarea.value.length);
		txtarea.focus();
		//set new selection
		if (replaced) {
			var cPos = startPos+(tagOpen.length+myText.length+tagClose.length);
			txtarea.selectionStart = cPos;
			txtarea.selectionEnd = cPos;
		} else {
			txtarea.selectionStart = startPos+tagOpen.length;
			txtarea.selectionEnd = startPos+tagOpen.length+myText.length;
		}
		txtarea.scrollTop = scrollTop;

	// All other browsers get no toolbar.
	}
	// reposition cursor if possible
	if (txtarea.createTextRange)
		txtarea.caretPos = document.selection.createRange().duplicate();
}

function guied_replace_selection(txtarea, text)
{
	// IE
	if (document.selection  && !is_gecko) {
		txtarea.focus();
		document.selection.createRange().text = text;

	// Mozilla
	} else if(txtarea.selectionStart || txtarea.selectionStart == '0') {
		var replaced = false;
		var startPos = txtarea.selectionStart;
		var endPos = txtarea.selectionEnd;
		if (endPos-startPos)
			replaced = true;
		var scrollTop = txtarea.scrollTop;
		var myText = (txtarea.value).substring(startPos, endPos);
		if (!myText)
			myText = '';
		txtarea.value = txtarea.value.substring(0, startPos) + text +
			txtarea.value.substring(endPos, txtarea.value.length);
		txtarea.focus();
		//set new selection
		var cPos = startPos+text.length;
		txtarea.selectionStart = cPos;
		txtarea.selectionEnd = cPos;
		txtarea.scrollTop = scrollTop;

	}
	// reposition cursor if possible
	if (txtarea.createTextRange)
		txtarea.caretPos = document.selection.createRange().duplicate();
}

function guied_get_selection(txtarea, sampleText)
{
	if ( !sampleText )
		sampleText = '';
	
	// IE
	if (document.selection  && !is_gecko) {
		var theSelection = document.selection.createRange().text;
		if (!theSelection)
			theSelection=sampleText;
		return theSelection;

	// Mozilla
	} else if(txtarea.selectionStart || txtarea.selectionStart == '0') {
		var replaced = false;
		var startPos = txtarea.selectionStart;
		var endPos = txtarea.selectionEnd;
		if (endPos-startPos)
			replaced = true;
		var scrollTop = txtarea.scrollTop;
		var myText = (txtarea.value).substring(startPos, endPos);
		if (!myText)
			myText=sampleText;
		return myText;
	}
	return sampleText;
}

function guied_self(elem)
{
	while ( elem.tagName != 'BODY' )
	{
		elem = elem.parentNode;
		if ( $(elem).hasClass('guieditor') )
			return elem;
	}
	return null;
}

//
// Autofill schema for images
//

var autofill_schemas = autofill_schemas || {};
autofill_schemas.guied_image = {
	init: function(element, fillclass, params)
	{
		$(element).autocomplete(makeUrlNS('Special', 'Autofill', 'type=' + fillclass) + '&userinput=', {
				minChars: 3,
				formatItem: function(row, _, __)
				{
					var html = '<div style="float: left; margin-right: 4px;"><img alt="" src="' + row.thumbnail + '" /></div>';
					html += row.title;
					html += '<div style="clear: both;"></div>';
					return html;
				},
				showWhenNoResults: true,
				noResultsHTML: '<tr><td class="row1" style="font-size: smaller;">' + $lang.get('user_autofill_msg_no_suggestions') + '</td></tr>',
				onItemSelect: function(li)
				{
					// $('#guied_image_file').val(li.selectValue);
					guied_refresh_image();
				}
		});
	}
	
};

// This is only used if floodlight is available
autofill_schemas.guied_floodlight = {
  init: function(element, fillclass, params)
  {
    params = params || {};
    $(element).autocomplete(makeUrlNS('Special', 'Autofill', 'type=floodlight') + '&userinput=', {
        minChars: 3,
        formatItem: function(row, _, __)
        {
          var type = ( typeof(row.type) == 'string' ) ? row.type : '';
          var html = '<big>' + row.title + '</big> <small>' + type + '</small>';
          html += '<br /><small>' + $lang.get('floodlight_lbl_score') + row.score + '% | ' + row.size + '</small>';
          row[0] = row[0].replace(/^go:/, '');
          return html;
        },
        tableHeader: '<tr><th>' + $lang.get('floodlight_table_heading') + '</th></tr>',
        showWhenNoResults: true,
        onItemSelect: function(li)
        {
        	$(element).val(li.selectValue.replace(/^go:/, ''));
        },
        width: 180,
        noResultsHTML: '<tr><td class="row1" style="font-size: smaller;">' + $lang.get('floodlight_msg_no_results') + '</td></tr>',
    });
  }
};

