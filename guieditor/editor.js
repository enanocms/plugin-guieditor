attachHook('editor_gui_toolbar', 'guied_insert_toolbar(ta_wrapper, response.toolbar_templates);');

function guied_insert_toolbar(ta_wrapper, toolbar_templates)
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
	
	var buttons = ['bold*', 'italic*', 'underline*', '|', 'intlink', 'extlink', 'image'];
	
	// Button: Bold
	var i;
	var hide_label = false;
	for ( i = 0; i < buttons.length; i++ )
	{
		if ( buttons[i] == '|' )
		{
			label.assign_vars({
					TITLE: '<img alt="|" src="' + scriptPath + '/plugins/guieditor/icons/separator.png" />'
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
					IMAGE: cdnPath + '/plugins/guieditor/icons/' + buttons[i] + '.png',
					FLAGS: 'href="#" onclick="guied_act(\'' + buttons[i] + '\'); return false;"'
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
	ta_wrapper.appendChild(wrapperdiv);
}

function guied_act(action)
{
	var textarea = document.getElementById('ajaxEditArea');
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
					div.innerHTML += '<h3>' + $lang.get('guied_intlink_title') + '</h3>';
					div.innerHTML += '<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_intlink_lbl_page') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_intlink_page" class="autofill page" style="width: 100%;" /><br /> \
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
								</tr>';
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
								</tr>';
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
					div.innerHTML += '<table border="0" cellspacing="5" cellpadding="0" style="width: 100%;"> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_image_lbl_image') + ' \
									</td> \
									<td valign="top"> \
										<img id="guied_image_preview" src="' + cdnPath + '/images/spacer.gif" style="display: block;" /> \
										<input type="text" id="guied_image_file" class="autofill guied_image" style="width: 100%;" onblur="guied_refresh_image();" /><br /> \
										<small>' + $lang.get('guied_image_af_hint') + '</small> \
										<div id="guied_upload_body" style="padding: 4px 0;"> \
										<a class="abutton icon abutton_green" style="background-image: url(' + scriptPath + '/plugins/guieditor/icons/add.png);" href="#" onclick="guied_image_show_uploader(); return false;">' + $lang.get('guied_image_btn_upload') + '</a> \
										</div> \
									</td> \
								</tr> \
								<tr> \
									<td valign="top" style="white-space: nowrap;"> \
									' + $lang.get('guied_image_lbl_caption') + ' \
									</td> \
									<td valign="top"> \
										<input type="text" id="guied_image_caption" style="width: 100%;" /> \
									</td> \
								</tr>';
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
		
	}
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
	$('#guied_image_preview').attr('src', makeUrlNS('Special', 'DownloadFile/' + $('#guied_image_file').val(), 'preview&width=200&height=400')).css('margin-bottom', '5px');
}

function guied_image_finish()
{
	// yeah... working on this.
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
