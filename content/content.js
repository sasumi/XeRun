const HOST_ATTR_KEY = 'data-host';
const STYLE_SWITCH = 'STYLE_SWITCH';

//patch host to html
document.body.parentNode.setAttribute(HOST_ATTR_KEY, location.host);

(async ()=>{
	const src = chrome.runtime.getURL('common/common.js');
	const {patchCss,
			hide,
			renderTextResult,
			parseQueryString,
			COMMON_OPTIONS,
			inCommonOption,
			closest,
			getCommonOptionSetting,
			getChromeStorageSync,
			createHtml,
			domContained,
			layDomInView} = await import(src);

	const CSS_MAP = {
		'coding.showFullContent': `
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] div[class*="content-wrapper"] div[class*="mask-"],
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] div[class*="content-wrapper"] div[class*="toggle-btn"] {display:none !important;}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] div[class*="content-wrapper"] div[class*="description-wrapper"] {max-height:inherit !important}
		`,
		'coding.imgAutoAdjust': `
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] div[class*="content-wrapper"] div[data-block-type=image] div[class*=container-] {height:auto !important; width:100% !important;}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] div[class*="content-wrapper"] div[data-block-type=image] div[class*=container-] img {height:auto; width:auto; max-height:500px;}
		`,
		'coding.removeWatermark': `
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] #wm-detail>div ,
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] #wm-spec>div {background:none !important;}
		`,
		'coding.quickNav': `
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav {position:fixed; top:5px; z-index:100000; display:flex; left:calc(50vw - 50px); width:180px; height:30px;}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav span {display:block; user-select:none; transition:all 0.1s linear; flex:1; cursor:pointer; background-color:#72727287; color:white; border-radius:15px; line-height:30px; text-align:center;}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav span:first-child:before,
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav span:last-child:after {margin:0 0 0 5px; content:""; display:inline-block; width:12px; height:12px; background-size:contain; background-repeat:no-repeat; background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAYAAAASVl2WAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHjalNDBDYMwEAXRmcriTkgqCSkhHZBKPyeQYxYkfLI0T7J3TdKAh/qhOCaZgTewqK8DAEiyAFOF3C5nyF5XyPHNEVn9vEPf+6CLP/XpVTwbc4/Vov7iuOpD3EADmjpXE60DAG0xQykqq3hPAAAAAElFTkSuQmCC)}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav span:first-child:before {margin:0 5px 0 0; transform:rotate(180deg)}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav span:hover {background-color:#00000087}
			html[${HOST_ATTR_KEY}="xiaoe.coding.net"] .xe-run-quick-nav span:first-child {margin-right:10px;}
		`,
		'xet.removeWatermark': `
			html[${HOST_ATTR_KEY}="admin.xiaoe-tech.com"] .__o_wm {
				display:none !important;
			}
		`,
		'txdoc.removeWatermark':`
			html[${HOST_ATTR_KEY}="doc.weixin.qq.com"] .wecom-watermark-bg-wrapper {
				display:none !important;
			}`
	};

	const toggleCss = (id, stateOn)=>{
		if(!CSS_MAP[id]){
			return;
		}
		let style = document.getElementById(id);
		if(!style){
			style = patchCss(CSS_MAP[id], id);
		}
		style.setAttribute('type', stateOn ? 'text/css': 'text');
	}

	//init read config in storage
	for(let groupTitle in COMMON_OPTIONS){
		COMMON_OPTIONS[groupTitle].forEach(({title, key, defaultValue})=>{
			getChromeStorageSync(key, defaultValue).then(value=>{
				inCommonOption(key) && toggleCss(key, value);
			});
		});
	}

	//是否启用快速导航
	let quickNavStateOn = false;

	//listen storage change event
	chrome.storage.onChanged.addListener((allChanges, namespace) => {
		console.log('chrome.storage.sync changed', allChanges);
		for (let key in allChanges) {
			if(key === 'coding.quickNav'){
				quickNavStateOn = allChanges[key].newValue;
				toggleQuickNavEntry(quickNavStateOn);
			}
			inCommonOption(key) && toggleCss(key, allChanges[key].newValue);
		}
	});

	document.body.addEventListener('DOMSubtreeModified', e=>{
		setTimeout(()=>{
			if(!checkNavFit()){
				hideQuickNavEntry();
			} else {
				getCommonOptionSetting('coding.quickNav').then(ok=>{quickNavStateOn = ok; toggleQuickNavEntry(quickNavStateOn)});
			}
		}, 100);
	});

	const checkNavFit = ()=>{
		return document.querySelector('td div[class*="table-title-"][class*="current-"]');
	}

	const navToNext = (toPrevious = false)=>{
		let currentItem = document.querySelector('td div[class*="table-title-"][class*="current-"]');
		if(currentItem){
			let tr = closest(currentItem, 'tr');
			let newTr = toPrevious ? tr.previousElementSibling : tr.nextElementSibling;
			if(!newTr){
				console.log('到尽头了');
				return;
			}
			let nextAnchor = newTr.querySelector('div[class*="table-title-"]');
			if(nextAnchor){
				nextAnchor.click();
				return;
			}
		}
		console.log('no action');
	};

	let entryDom = null;
	const toggleQuickNavEntry = (trunOn)=>{
		if(!entryDom){
			entryDom = document.createElement('div');
			entryDom.style.display = 'none';
			entryDom.className = 'xe-run-quick-nav';
			entryDom.innerHTML = '<span id="xe-run-quick-nav-prev" title="方向键：&larr;">上一条</span><span id="xe-run-quick-nav-next" title="方向键：&rarr;">下一条</span>';
			document.body.appendChild(entryDom);
			entryDom.querySelector('#xe-run-quick-nav-prev').addEventListener('click', e=>{navToNext(true);});
			entryDom.querySelector('#xe-run-quick-nav-next').addEventListener('click', e=>{navToNext(false);});
		}
		if(trunOn && checkNavFit()){
			entryDom.style.display = '';
		} else {
			hideQuickNavEntry();
		}
	};

	const hideQuickNavEntry = ()=>{
		if(entryDom){
			entryDom.style.display = 'none';
		}
	}

	if(location.host === 'xiaoe.coding.net'){
		document.body.addEventListener('keyup', e=>{
			if(!quickNavStateOn){
				return;
			}
			console.log('coding nav key up');
			if(e.target.matches('input') || e.target.matches('textarea')){
				return;
			}
			if(e.key === 'ArrowLeft'){
				navToNext(true);
			} else if(e.key === 'ArrowRight') {
				navToNext(false);
			}
		});
		//init reading
		getCommonOptionSetting('coding.quickNav').then(ok=>{quickNavStateOn = ok; toggleQuickNavEntry(quickNavStateOn)});
	}

	if(location.host === 'xiaoe.coding.net' || location.host === 'www.tapd.cn' || location.host.indexOf('xiaoe-tech.com') > 0){
		let panel = null;
		patchCss(`
			.xe-run-panel {
			    --color: #333;
			    --back-color: #fff;
			    --font-size:14px;
				font-family:微软雅黑, sans-serif; word-break:break-all; position:absolute; z-index:9999; padding:10px; background-color:white; box-shadow:1px 1px 40px #b3b3b3; width:350px; overflow-x:hidden; overflow-y:auto; font-size:13px;}
			.xe-run-panel:hover {}
			.xe-run-panel .info-list {display:block; margin:0 0 0.5em 0; padding:0; max-height:240px; overflow-y:auto;}
			.xe-run-panel .info-list li {list-style:none; margin:0; padding:0;}
			.xe-run-panel .btn {display: inline-block;height: 32px;line-height: 1;box-sizing: border-box;font-size: var(--font-size);vertical-align: middle;padding: 0.5em 1em;border: 1px solid #aaa;background-color: #eee;box-shadow: 1px 1px 5px #ccc;margin: 0.2em;cursor: pointer;text-decoration: none;color:var(--color);}
			.xe-run-panel .btn:hover {background-color: #fff;}
			.xe-run-panel .btn-danger, .btn-danger:hover{background-color:#ffd7b8; border-color:#ff9c4f; color:#ff7204;}
			.xe-run-panel .btn-danger:hover {background-color: #fff;}
			#xe-run-panel-close {position:absolute; color:gray; cursor:pointer; top:0; right:0; z-index:1; width:30px; height:30px; box-sizing:border-box; font-size:18px;  overflow:hidden; text-align:center; }
			#xe-run-panel-close:hover {color:black;}
		`, 'xe-run-panel');

		chrome.storage.onChanged.addListener((allChanges, namespace) => {
			for (let key in allChanges) {
				if(key === 'coding.contentResolve'){
					if(!allChanges[key].newValue){
						hide(panel);
					}
				}
			}
		});

		document.addEventListener('mousedown', e=>{
			if(panel && domContained(panel, e.target)){
				return;
			}
			hide(panel);
		});

		document.addEventListener('mouseup', e=>{
			console.log('mouse up');
			if(panel && domContained(panel, e.target)){
				return;
			}
			hide(panel);
			setTimeout(()=>{
				getCommonOptionSetting('coding.contentResolve').then(ok=>{
					if(!ok){
						return;
					}
					let selection = document.getSelection();
					let selected_text = selection.toString().trim();
					if(!selected_text.length){
						return;
					}
					let html = renderTextResult(selected_text, true);
					if(!html){
						hide(panel);
						return;
					}
					if(!panel){
						panel = document.createElement('div');
						document.body.appendChild(panel);
						panel.classList.add('xe-run-panel');
						panel.style.visibility = 'hidden';
						panel.style.left = '0px'; //avoid container show scrollbar in position calculation.
						panel.style.top = '0px';
						panel.style.display = 'none';
						panel.addEventListener('click', e=>{
							if(e.target.id === 'xe-run-panel-close'){
								hide(panel);
							}
						});
						document.body.addEventListener('keyup', e=>{
							if(e.key === 'Escape'){
								hide(panel);
							}
						});
					}
					console.log('show panel');
					panel.innerHTML = html + '<span id="xe-run-panel-close" title="关闭(ESC)">&times;</span>';
					panel.style.left = e.clientX + 10 + 'px';
					panel.style.top = e.clientY + 10 + 'px';
					panel.style.visibility = 'hidden';
					panel.style.display = '';
					layDomInView(panel, {top:e.clientY, left:e.clientX});
					panel.style.visibility = 'visible';
				});
			}, 10);
		});
	}

	//登录H5链接
	if(location.href.indexOf('https://super.xiaoe-tech.com/new/ops_tool/app_create_token') >= 0){
		let jsonStr = document.body.innerText;
		let obj = JSON.parse(jsonStr);
		let search = parseQueryString(location.search);
		let redirect_url = search?.redirect_url;
		if(obj.code === 3){
			createHtml('<div style="text-align:center; padding:1em; font-size:18px; color:red">请先登录O端客服工具</div>');
			location.href = 'https://o-oauth.xiaoe-tech.com/login_page';
		}
		if(obj.code === 0 && obj.data.howtodo){
			let tm = 5000;
			let timer = null;
			let html = `<hr/>
						1.请打开开发者工具(F12)，切换到设备模拟模式<br/>
						2.访问链接 <a href="${obj.data.howtodo.onekeycosplay}">${obj.data.howtodo.onekeycosplay}</a> <input type="button" value="停止(${(tm/1000).toFixed(0)}s)" id="xe-run-countdown">
			`;
			let div = document.createElement('div');
			div.innerHTML = html;
			document.body.appendChild(div);

			let iframe = document.getElementById('auth_iframe');
			let cdBtn = document.getElementById('xe-run-countdown');
			cdBtn.addEventListener('click', e=>{
				if(timer){
					clearTimeout(timer);
				}
			});
			const countDown = (tm)=>{
				if(tm>0){
					tm -= 100;
					cdBtn.value = `停止(${(tm/1000).toFixed(2)}s)`;
					timer = setTimeout(()=>{countDown(tm)}, 100);
				} else {
					let cosplayUrl = obj.data.howtodo.onekeycosplay;
					if(redirect_url){
						chrome.runtime.sendMessage({action:'openTabOnce', url:cosplayUrl}, function(response){
							document.location.href = redirect_url;
						});
					} else {
						document.location.href = cosplayUrl;
					}
				}
			};
			countDown(tm);
		}
	}

	//登录B端管理台
	if(location.href.indexOf('https://super.xiaoe-tech.com/new/saveLoginLog') >= 0){
		let jsonStr = document.body.innerText;
		let obj = JSON.parse(jsonStr);
		if(obj.code === 3){
			createHtml('<div style="text-align:center; padding:1em; font-size:18px; color:red">请先登录O端客服工具</div>');
			location.href = 'https://o-oauth.xiaoe-tech.com/login_page';
		}
		if(obj.code === 0 && obj.data.redirect_to){
			location.href = obj.data.redirect_to;
		}
	}
})();
