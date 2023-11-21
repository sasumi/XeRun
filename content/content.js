const HOST_ATTR_KEY = 'data-host';

/**
 * localStorage 中存储跳转的数据，格式如： {type:'AppAdmin'|'UserH5', appId: '', userId:'', url: ''}
 * @type {string}
 */
const SUPER_JUMP_KEY = 'SUPER_JUMP_URL';

//patch host to html
document.body.parentNode.setAttribute(HOST_ATTR_KEY, location.host);

(async () => {
	const {
		renderTextResult,
		COMMON_OPTIONS,
		inCommonOption,
		getCommonOptionSetting,
		getChromeStorageSync,
		setBackgroundLocalStorage,
		getAndRemoveBackgroundLocalStorage,
		buildUserH5Entry,
		buildCommunityPCLink,
		buildAppAdminEntry
	} = await import(chrome.runtime.getURL('common/common.js'));

	const {
		patchCss,
		hide,
		closest,
		decodeBase64,
		createHtml,
		domContained,
		jumpTo,
		layDomInView,
		unescapeHtml,
		http2s,
		openInIframe,
		patchUrl
	} = await import(chrome.runtime.getURL('common/function.js'));

	let TARGET_WINDOW_ID_SESS_KEY = 'TARGET_WINDOW_ID_SESS_KEY';
	const getTargetWindowId = () => {
		let winId = sessionStorage.getItem(TARGET_WINDOW_ID_SESS_KEY);
		winId = parseInt(winId);
		return winId || null;
	};

	const setTargetWindowId = (winId) => {
		sessionStorage.setItem(TARGET_WINDOW_ID_SESS_KEY, winId);
	}

	const setChromeCookies = (params)=>{
		const expirationDate = (parseInt(new Date().getTime() / 1000, 10) + 86400);
		for(let k in params){
			chrome.runtime.sendMessage({
				action: 'setCookie',
				param: {
					url: window.location.href,
					name: k,
					value: params[k],
					path: '/',
					expirationDate: expirationDate
				},
				windowId: null
			}, function(msg){
				console.log(msg);
			});
		}
	}

	const openNewWindowBackground = (targetWinId = null, href) => {
		return new Promise(resolve => {
			chrome.runtime.sendMessage({
				action: 'openNewWindowBackground',
				url: href,
				windowId: targetWinId
			}, function(tagWinId){
				resolve(tagWinId);
			});
		});
	}


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
		'txdoc.removeWatermark': `
			html[${HOST_ATTR_KEY}="doc.weixin.qq.com"] .wecom-watermark-bg-wrapper {
				display:none !important;
			}`
	};

	patchCss(`html {filter:none !important;}`);

	const toggleCss = (id, stateOn) => {
		if(!CSS_MAP[id]){
			return;
		}
		let style = document.getElementById(id);
		if(!style){
			style = patchCss(CSS_MAP[id], id);
		}
		style.setAttribute('type', stateOn ? 'text/css' : 'text');
	}

	//init read config in storage
	for(let groupTitle in COMMON_OPTIONS){
		COMMON_OPTIONS[groupTitle].forEach(({title, key, defaultValue}) => {
			getChromeStorageSync(key, defaultValue).then(value => {
				inCommonOption(key) && toggleCss(key, value);
			});
		});
	}

	//是否启用快速导航
	let quickNavStateOn = false;

	//listen storage change event
	chrome.storage.onChanged.addListener((allChanges, namespace) => {
		console.log('chrome.storage.sync changed', allChanges);
		for(let key in allChanges){
			if(key === 'coding.quickNav'){
				quickNavStateOn = allChanges[key].newValue;
				toggleQuickNavEntry(quickNavStateOn);
			}
			inCommonOption(key) && toggleCss(key, allChanges[key].newValue);
		}
	});

	let mutationObserver = new MutationObserver(function(mutationRecords) {
		mutationRecords.forEach(rec=>{
			setTimeout(() => {
				if(!checkNavFit()){
					hideQuickNavEntry();
				}else{
					getCommonOptionSetting('coding.quickNav').then(ok => {
						quickNavStateOn = ok;
						toggleQuickNavEntry(quickNavStateOn)
					});
				}
			}, 100);
		});
	});
	mutationObserver.observe(document.body, {childList: true, attributes: false, subtree: true});

	/**
	 * 由于新版本的edge会把返回的json格式化，需要做额外检测。
	 */
	const readJSON = () => {
		let jsonStr = '';
		if(document.body.getAttribute('data-code-mirror')){
			jsonStr = document.querySelector('div[hidden=true]').innerHTML;
		}else{
			jsonStr = document.body.innerText.replace(/\n/g, '');
		}
		return JSON.parse(jsonStr);
	}

	const checkNavFit = () => {
		return document.querySelector('td div[class*="table-title-"][class*="current-"]');
	}

	const navToNext = (toPrevious = false) => {
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
	const toggleQuickNavEntry = (turnOn) => {
		if(!entryDom){
			entryDom = document.createElement('div');
			entryDom.style.display = 'none';
			entryDom.className = 'xe-run-quick-nav';
			entryDom.innerHTML = '<span id="xe-run-quick-nav-prev" title="方向键：&larr;">上一条</span><span id="xe-run-quick-nav-next" title="方向键：&rarr;">下一条</span>';
			document.body.appendChild(entryDom);
			entryDom.querySelector('#xe-run-quick-nav-prev').addEventListener('click', e => {
				navToNext(true);
			});
			entryDom.querySelector('#xe-run-quick-nav-next').addEventListener('click', e => {
				navToNext(false);
			});
		}
		if(turnOn && checkNavFit()){
			entryDom.style.display = '';
		}else{
			hideQuickNavEntry();
		}
	};

	const hideQuickNavEntry = () => {
		if(entryDom){
			entryDom.style.display = 'none';
		}
	}

	if(location.host === 'xiaoe.coding.net'){
		document.body.addEventListener('keyup', e => {
			if(!quickNavStateOn){
				return;
			}
			console.log('coding nav key up');
			if(e.target.matches('input') || e.target.matches('textarea')){
				return;
			}
			if(e.key === 'ArrowLeft'){
				navToNext(true);
			}else if(e.key === 'ArrowRight'){
				navToNext(false);
			}
		});
		//init reading
		getCommonOptionSetting('coding.quickNav').then(ok => {
			quickNavStateOn = ok;
			toggleQuickNavEntry(quickNavStateOn)
		});
	}

	if(location.host === 'xiaoe.coding.net' || location.host === 'www.tapd.cn' || location.host.indexOf('xiaoe-tech.com') > 0){
		let panel = null;
		patchCss(`
			.xe-run-panel {
			    --color: #333;
			    --back-color: #fff;
			    --font-size:14px;
				font-family:微软雅黑, sans-serif; word-break:break-all; position:absolute; z-index:9999; padding:10px; background-color:white; box-shadow:1px 1px 40px #b3b3b3; width:350px;  font-size:13px;}
			.xe-run-panel:hover {}
			.xe-run-panel .info-list {display:block; margin:0 0 0.5em 0; padding:0; max-height:240px; overflow-y:auto;}
			.xe-run-panel .info-list li {list-style:none; margin:0; padding:0;}
			.xe-run-panel .btn {display: inline-block;height: 32px;line-height: 1;box-sizing: border-box;font-size: var(--font-size);vertical-align: middle;padding: 0.5em 1em;border: 1px solid #aaa;background-color: #eee;box-shadow: 1px 1px 5px #ccc;margin: 0.2em;cursor: pointer;text-decoration: none;color:var(--color);}
			.xe-run-panel .btn:hover {background-color: #fff;}
			.xe-run-panel .btn-danger,
			.xe-run-panel .btn-danger:hover{background-color:#ffd7b8; border-color:#ff9c4f; color:#ff7204;}
			.xe-run-panel .btn-danger:hover {background-color: #fff;}

			.xe-run-panel .btn-h5-system,
			.xe-run-panel .btn-h5-system:hover {background-color:#4b8bff; border-color:#286be5; color:#fff;}
			.xe-run-panel .btn-h5-system:hover {background-color: #fff; color:#286be5}

			#xe-run-panel-close {position:absolute; border-radius:50%; box-shadow:1px 1px 10px #ccc; --size:30px; background-color:white; color:gray; cursor:pointer; top:calc(var(--size) / 2 * -1); right:calc(var(--size) / 2 * -1); z-index:1; width:var(--size); height:var(--size); box-sizing:border-box; font-size:18px;  overflow:hidden; text-align:center; }
			#xe-run-panel-close:hover {color:black;}
		`, 'xe-run-panel');

		chrome.storage.onChanged.addListener((allChanges, namespace) => {
			for(let key in allChanges){
				if(key === 'common.contentResolve'){
					if(!allChanges[key].newValue){
						hide(panel);
					}
				}
			}
		});

		document.addEventListener('mousedown', e => {
			if(panel && domContained(panel, e.target)){
				return;
			}
			hide(panel);
		});

		document.addEventListener('mouseup', e => {
			if(panel && domContained(panel, e.target)){
				return;
			}
			hide(panel);
			setTimeout(() => {
				getCommonOptionSetting('common.contentResolve').then(ok => {
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
						panel.addEventListener('click', e => {
							if(e.target.id === 'xe-run-panel-close'){
								hide(panel);
							}
						});
						document.body.addEventListener('keyup', e => {
							if(e.key === 'Escape'){
								hide(panel);
							}
						});
					}
					panel.innerHTML = html + '<span id="xe-run-panel-close" title="关闭(ESC)">&times;</span>';
					panel.style.left = e.clientX + 10 + 'px';
					panel.style.top = e.clientY + 10 + 'px';
					panel.style.visibility = 'hidden';
					panel.style.display = '';
					layDomInView(panel, {
						top: e.clientY,
						left: e.clientX
					});
					panel.style.visibility = 'visible';
				});
			}, 10);
		});
	}

	//登录H5链接
	if(location.href.indexOf('https://super.xiaoe-tech.com/new/ops_tool/app_create_token') >= 0){
		let obj = readJSON();
		let search = new URLSearchParams(location.search);
		let jumpParam = search.get('jumpParam');
		let jumpData = jumpParam ? JSON.parse(decodeBase64(jumpParam)) : {};
		if(obj.code === 3){
			jumpParam && setBackgroundLocalStorage(SUPER_JUMP_KEY, jumpParam);
			createHtml('<div style="text-align:center; padding:1em; font-size:18px; color:red">请先登录O端客服工具</div>');
			location.href = 'https://o-oauth.xiaoe-tech.com/login_page';
		}
		if(obj.code === 0 && obj.data.howtodo){
			let ko_token = obj.data.token.value;
			let ko_user_id = obj.data.user.id;
			let ko_app_id = obj.data.user.app_id;
			let cosplay_url = http2s(obj.data.howtodo.onekeycosplay);
			let countdown_sec = 5000;
			let timer = null;
			let div = document.createElement('div');
			let html = `<hr/>
				<p style="font-size:2rem; padding:2rem 1rem;">
					1.请打开开发者工具(F12)，切换到设备模拟模式 <br><br>
					2.访问链接 <a href="${cosplay_url}">${cosplay_url}</a> <br><br> 
					<input type="button" value="停止(${(countdown_sec / 1000).toFixed(0)}s)" id="xe-run-countdown" style="font-size:2rem;">
				</p>`;
			if(jumpData.type === 'PCComm'){
				let link = buildCommunityPCLink(ko_app_id);
				html = `<hr/>
					<div>在打开并登录圈子PC版本 (${link}) ，复制以下命令在控制台中执行即可：</div>
					<div>
<textarea style="display:block; min-height:200px; width:100%; box-sizing:border-box; color:green; padding:0.5em; margin:1em 0;">
function sc(cookieName, cookieValue, expiryDate) {
  var d = new Date();
  d.setTime(d.getTime() + (86400*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + "; " + expires + "; path=/";
}
sc('pc_token_${ko_app_id}', '${ko_token}');
sc('user_id_${ko_app_id}', '${ko_app_id}');
sc('app_id', '${ko_app_id}');
</textarea>
</div>
<input type="button" value="停止(${(countdown_sec / 1000).toFixed(0)}s)" id="xe-run-countdown" style="font-size:2rem;">
`;
			}

			div.innerHTML = html;
			document.body.appendChild(div);

			let cdBtn = document.getElementById('xe-run-countdown');
			cdBtn.addEventListener('click', e => {
				if(timer){
					clearTimeout(timer);
				}
			});
			const countDown = (tm) => {
				if(tm > 0){
					tm -= 100;
					cdBtn.value = `停止(${(tm / 1000).toFixed(2)}s)`;
					timer = setTimeout(() => {
						countDown(tm)
					}, 100);
					return;
				}
				console.log('jumpData', jumpData);
				if(jumpData && jumpData.url){
					//附加上需要登录的token 参数，并打开需要跳转的窗口
					console.log('open cosplay in iframe', cosplay_url);
					openInIframe(cosplay_url, () => {console.log('cosplayURL加载完成（未必触发）');});
					setTimeout(() => {
						let jumpUrl = patchUrl(jumpData.url, {
							ko_token: ko_token,
							ko_user_id: ko_user_id,
							ko_app_id: ko_app_id
						});
						console.log('jump to jumpUrl', jumpUrl);
						document.location.href = jumpUrl;
					}, 1000);
					return;
				}
				document.location.href = cosplay_url;
			};
			countDown(countdown_sec);
		}
	}

	//圈子主页登录
	if(location.href.indexOf('https://quanzi.xiaoe-tech.com') >= 0 &&
		// location.href.indexOf('feed_list') >0 &&
		location.href.indexOf('ko_token=') > 0){
		let urlParam = new URLSearchParams(location.search);
		let app_id = urlParam.get('ko_app_id');
		let user_id = urlParam.get('ko_user_id');
		let token = urlParam.get('ko_token');
		let com_id = urlParam.get('ko_com_id');
		setChromeCookies({
			[`pc_token_${app_id}`]: token,
			[`user_id_${app_id}`]: app_id,
			app_id: app_id
		});
		if(com_id){
			setChromeCookies({activity_id: `${app_id}-${com_id}`});
		}
	}

	//登录B端管理台
	if(location.href.indexOf('https://super.xiaoe-tech.com/new/saveLoginLog') >= 0){
		let obj = readJSON();
		let search = new URLSearchParams(location.search);
		let jumpParam = search.get('jumpParam');
		jumpParam && setBackgroundLocalStorage(SUPER_JUMP_KEY, jumpParam);
		if(obj.code === 3){
			createHtml(`
				<div style="text-align:center; padding:1em; font-size:18px; color:red">请先登录O端客服工具</div>
				<center><a href="https://o-oauth.xiaoe-tech.com/login_page">立即登录</a></center>
			`);
			setTimeout(() => {
				location.href = 'https://o-oauth.xiaoe-tech.com/login_page';
			}, 500);
		}
		if(obj.code === 0){
			location.href = unescapeHtml(obj.data.redirect_to); //成功，跳转到指定链接（携带鉴权信息）
		}
	}

	//内部管理系统首页
	if(location.href === 'https://super.xiaoe-tech.com/new' ||
		location.href === 'https://super.xiaoe-tech.com/new#guider_page' ||
		location.href === 'https://super.xiaoe-tech.com/new#/guider_page'){
		getAndRemoveBackgroundLocalStorage(SUPER_JUMP_KEY).then(jumpParam => {
			console.log(jumpParam);
			if(jumpParam){
				//后续补充patch
				let jumpData = JSON.parse(decodeBase64(jumpParam));
				console.log(jumpData, jumpParam);
				switch(jumpData.type){
					case 'AppAdmin':
						let appAdminForm = createHtml(buildAppAdminEntry(jumpData.appId, '跳转中', jumpData.url));
						appAdminForm.removeAttribute('target');
						appAdminForm.submit();
						return;

					case 'UserH5':
						let H5Form = createHtml(buildUserH5Entry(jumpData.appId, jumpData.userId, jumpData.url));
						H5Form.removeAttribute('target');
						H5Form.submit();
						return;

					case 'url':
						location.href = jumpData.url;
						return;

					default:
						throw "Type Error";
				}
			}
		});
	}

	//B端管理台页面，需要处理跳转到指定页面逻辑
	if(location.origin === 'https://admin.xiaoe-tech.com'){
		getAndRemoveBackgroundLocalStorage(SUPER_JUMP_KEY).then(jumpParam => {
			if(jumpParam){
				let jumpData = JSON.parse(decodeBase64(jumpParam));
				if(jumpData.url){
					jumpTo(jumpData.url);
				}
			}
		});
	}

	//new window option
	let MID_BTN_NEW_WIN_ENABLED = false;
	let LINK_CLICK_NEW_WIN_ENABLED = false;
	getCommonOptionSetting('common.MidBtnNewWin').then(ok => {
		MID_BTN_NEW_WIN_ENABLED = ok;
	});
	getCommonOptionSetting('common.LinkClickNewWin').then(ok => {
		LINK_CLICK_NEW_WIN_ENABLED = ok;
	});
	chrome.storage.onChanged.addListener((allChanges, namespace) => {
		for(let key in allChanges){
			if(key === 'common.MidBtnNewWin'){
				MID_BTN_NEW_WIN_ENABLED = allChanges[key].newValue;
			}
			if(key === 'common.LinkClickNewWin'){
				LINK_CLICK_NEW_WIN_ENABLED = allChanges[key].newValue;
			}
			inCommonOption(key) && toggleCss(key, allChanges[key].newValue);
		}
	});

	document.body.addEventListener('click', e => {
		try{
			if(!LINK_CLICK_NEW_WIN_ENABLED || e.target.nodeName !== 'A' || !e.target.href || !e.target.href.length || e.target.href.indexOf('blob:') === 0){
				return;
			}
			let href = e.target.href;
			let link = document.createElement('a');
			link.href = href;
			if(link.hostname === document.location.hostname){
				console.log('同一个host不开新窗口');
				return;
			}
			let targetWinId = getTargetWindowId();
			console.log('start do open win', href, targetWinId);
			openNewWindowBackground(targetWinId, href).then(tId => {
				console.log('open win success', tId);
				setTargetWindowId(tId);
			});
			e.preventDefault();
			return false;
		}catch(err){
			console.error(err);
			return true;
		}
	});

	document.body.addEventListener('auxclick', e => {
		if(!MID_BTN_NEW_WIN_ENABLED || e.target.nodeName !== 'A' || !e.target.href || !e.target.href.length || e.target.href.indexOf('blob:') === 0){
			return;
		}
		if(e.button !== 1){
			console.log('不是鼠标中键', e);
			return;
		}
		let href = e.target.href;
		let targetWinId = getTargetWindowId();
		console.log('start do open win', href, targetWinId);
		openNewWindowBackground(targetWinId, href).then(tId => {
			console.log('open win succ', tId);
			setTargetWindowId(tId);
		});
		e.preventDefault();
		return false;
	});
})();
