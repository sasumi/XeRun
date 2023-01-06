export const patchCss = (cssStr, id = null) => {
	let style = document.createElement('style');
	style.appendChild(document.createTextNode(cssStr));
	if (id) {
		style.id = id;
	}
	style.type = "text/css";
	document.querySelector('head').appendChild(style);
	return style;
};

export const escapeHtml = str => {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/\n/g, '<br/>')
		.replace(/\s/g, '&nbsp;')
		.replace(/\t/g, '&nbsp;'.repeat(2));
}

/**
 * 反转义HTML
 * @param {String} str
 * @returns {string}
 */
export const unescapeHtml = (str) => {
	return String(str)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
};

export const hide = dom => {
	if (dom) {
		dom.style.display = 'none';
	}
}

export const closest = (dom, selector) => {
	let curDom = dom;
	while (curDom = curDom.parentNode) {
		if (curDom.matches(selector)) {
			return curDom;
		}
	}
	return null;
}

/**
 * 检测child节点是否在container节点列表里面
 * @param {HTMLElement|HTMLElement[]|String} contains
 * @param {Node} child
 * @param {Boolean} includeEqual 是否包括等于关系
 * @returns {boolean}
 */
export const domContained = (contains, child, includeEqual = false) => {
	if (typeof contains === 'string') {
		contains = document.querySelectorAll(contains);
	} else if (Array.isArray(contains)) {} else if (typeof contains === 'object') {
		contains = [contains];
	}
	for (let i = 0; i < contains.length; i++) {
		if ((includeEqual ? contains[i] === child : false) ||
			contains[i].compareDocumentPosition(child) & 16) {
			return true;
		}
	}
	return false;
};

export const show = dom => {
	dom.style.display = '';
}
export const layDomInView = (dom, dimension) => {
	let width = dom.offsetWidth;
	let height = dom.offsetHeight;
	let scrollLeft = document.body.scrollLeft;
	let scrollTop = document.body.scrollTop;
	let viewHeight = document.body.offsetHeight || document.body.parentNode.clientHeight;
	let viewWidth = document.body.offsetWidth || document.body.parentNode.clientWidth;

	let left = Math.min(scrollLeft + viewWidth - width, dimension.left);
	let top = Math.min(scrollTop + viewHeight - height, dimension.top);
	dom.style.top = top + 'px';
	dom.style.left = left + 'px';
}

/**
 * @param html
 * @param parent
 * @returns {Node[]|Node}
 */
export const createHtml = (html, parent = null) => {
	let fragment = document.createRange().createContextualFragment(html);
	parent = parent || document.body;
	let len = fragment.childNodes.length;
	parent.appendChild(fragment);
	if (len === 1) {
		return parent.childNodes[parent.childNodes.length - 1];
	}
	let ret = [];
	for (let i = 0; i < len; i++) {
		ret.push(parent.childNodes[parent.childNodes.length - len + i]);
	}
	return ret;
};


//将字符串转unicode编码
export const str2Unicode = (str) => {
	let unid = '\\u';
	for (let i = 0, len = str.length; i < len; i++) {
		if (i < len - 1) {
			unid += str.charCodeAt(i).toString(16) + '\\u';
		} else if (i === len - 1) {
			unid += str.charCodeAt(i).toString(16);
		}
	}
	return unid;
}

export const buildCookieCmd = cookies => {
	let cookieStr = '';
	cookies.forEach(cookie => {
		console.log(cookie);
		cookieStr += cookie.name + '=' + cookie.value + ';';
	});
	return cookieStr;
};

let events = {};
export const fireEvent = function (ev) {
	if (events[ev]) {
		let args = Array.from(arguments).slice(1);
		events[ev].forEach(payload => {
			payload.apply(null, args);
		});
	}
};

export const listenEvent = (ev, payload) => {
	if (!events[ev]) {
		events[ev] = [];
	}
	events[ev].push(payload);
};

export const batchAddListener = (dom, events, payload) => {
	events.forEach(event => {
		if (event === 'enter') {
			dom.addEventListener('keyup', e => {
				if (e.key === 'Enter') {
					payload(e);
				}
			});
		} else if (event === 'space') {
			dom.addEventListener('keyup', e => {
				if (e.code === 'Space') {
					payload(e);
				}
			});
		} else {
			dom.addEventListener(event, payload);
		}
	});
}

export const encodeBase64 = (txt) => {
	try {
		let d = btoa(txt);
		let str = encodeURI(d);
		return str && str !== txt ? str : null;
	} catch (e) {
		console.error('encode base64 fail');
	}
	return null;
};

export const decodeBase64 = (txt) => {
	try {
		let d = atob(txt);
		let str = decodeURI(d);
		return str && str !== txt ? str : null;
	} catch (e) {
		console.log('decode base64 fail');
	}
	return null;
};

export const cutTxt = (str, count) => {
	if (!count) {
		return str;
	}
	if (str.length > count) {
		return str.substring(0, count) + '...';
	}
	return str;
};


//将unicode编码转字符串
export const unicode2str = (unicode) => {
	let result = [];
	let strArr = unicode.split('\\u');
	for (let i = 0, len = strArr.length; i < len; i++) {
		if (strArr[i]) {
			result.push(String.fromCharCode(parseInt(strArr[i], 16)))
		}
	}
	return result.join('');
}

export const jumpTo = (url) => {
	let currentUrl = new URL(location.href);
	location.href = url;
	let targetUrl = new URL(url);
	if (targetUrl.protocol != currentUrl.protocol ||
		targetUrl.host != currentUrl.host ||
		targetUrl.pathname != currentUrl.pathname ||
		targetUrl.search != currentUrl.search) {
		return;
	}
	//only set hash, reload required
	location.reload();
}