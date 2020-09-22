(function(){
	const INSPECT_CLS = 'html-caption-inspection';
	let moving = false;
	let inspecting = false;
	let last_inspection = null;
	let last_move_offset = {};
	let $body = $('body');
	let $html = $body.parent();
	let $preview_dom = null;
	let $trigger = $('<div id="html-capture-trigger" class="html-capture-trigger-active"></div>').appendTo($body);
	$trigger.css('background-image', "url(" + chrome.runtime.getURL('assert/img/icon.png') + ")");
	$trigger.mousedown((e) => {
		moving = true;
		last_move_offset = {
			x: e.clientX,
			y: e.clientY,
			left: $trigger.offset().left,
			top: $trigger.offset().top,
		};
	});
	$trigger.dblclick(()=>{
		if(inspecting){
			exitInspect();
		} else {
			inspecting = true;
		}
	});

	$html.mouseup(() => {
		moving = false;
	});
	$html.mousemove((e) => {
		if(moving){
			let offset_x = e.clientX - last_move_offset.x;
			let offset_y = e.clientY - last_move_offset.y;
			$trigger.css({
				left: last_move_offset.left + offset_x + 'px',
				top: last_move_offset.top + offset_y + 'px'
			});
		}
		if(inspecting){
			console.log('start inspect');
			last_inspection && last_inspection.classList.remove(INSPECT_CLS);
			e.target.classList.add(INSPECT_CLS);
			last_inspection = e.target;
		}
	});
	$html.keydown(e=>{
		if(e.keyCode === 27){
			exitInspect();
		}
	});

	$html.click((e)=>{
		if(inspecting && e.target !== $trigger[0] && !$.contains($trigger[0], e.target)){
			exitInspect();
			console.log('converting image', e.target);
			domtoimage.toPng(e.target).then(dataUrl=>{
				showPreview(dataUrl);
			});
		}
	});

	const showPreview = (dataUrl)=>{
		if(!$preview_dom){
			let html = `<div id="html-capture-preview">
							<span id="html-capture-preview-close">&times;</span>
							<span id="html-capture-img-wrap"><img/></span>
							<div id="html-capture-buttons">
								<span id="html-capture-preview-download">下载</span>
								<span id="html-capture-preview-copy">复制</span>
							</div>
						</div>`;
			$preview_dom = $(html).appendTo($body);
			$preview_dom.find('#html-capture-preview-close').click(()=>{
				$preview_dom.hide();
			});
			$preview_dom.find('#html-capture-preview-copy').click(()=>{
				copyImage($preview_dom.find('img'));
			});
			$preview_dom.find('#html-capture-preview-download').click(()=>{
				download(dataUrl);
			});
			$preview_dom.find('img').on('load', ()=>{
				console.log('onload');
			});
			$preview_dom.find('img').on('error', ()=>{});
		}
		$preview_dom.show().find('img').attr('src', dataUrl);
	};

	const download = (dataUrl)=>{
		console.log('start download image');
		var link = document.createElement('a');
		link.download = 'capture.png';
		link.href = dataUrl;
		link.click();
	};

	const copyImage = ($img)=>{
		$img.attr("contenteditable", true);
		SelectText($img.get(0));
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
		$img.removeAttr("contenteditable");
		alert("image copied!");
	};

	const SelectText = (element)=>{
		var doc = document;
		if (doc.body.createTextRange) {
			var range = document.body.createTextRange();
			range.moveToElementText(element);
			range.select();
		} else if (window.getSelection) {
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(element);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	};

	const exitInspect = ()=>{
		console.log('exitInspect');
		inspecting = false;
		if(last_inspection){
			last_inspection.classList.remove(INSPECT_CLS);
			last_inspection = null;
		}
	};
})();