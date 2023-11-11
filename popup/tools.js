import {escapeAttr, escapeHtml} from "../common/function.js";
import {openSupperAdminLink} from "../common/common.js";

let ctnDom = document.querySelector('.content');

let html = '';
let options = {
	'客户服务':[
		{name: '浏览器诊断', link: 'https://lancet.xiaoe-tools.com/', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/3797de0ff52ea17dd93bc7ae37c36a65.%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7.png'},
		{name:'权益查询', type:'super', link:'https://super.xiaoe-tech.com/new#/tools/source_right_manage-copy', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/13d3a4de973fa475e5f11e82a002e35a.%E5%B9%B3%E5%8F%B0%E5%B7%A5%E5%85%B7.png'},
		{name:'AI知识库', type:'super', link:'https://ebot.xiaoeknow.com/#/e_bot/knowledge_base/97', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/3a4a27930c5729a9d996baa89a68a24b.222.png'},
		{name:'B端店铺登录', type:'super', link:'https://super.xiaoe-tech.com/new#/manageStore-copy', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/13d3a4de973fa475e5f11e82a002e35a.%E5%B9%B3%E5%8F%B0%E5%B7%A5%E5%85%B7.png'},
		{name:'C端登录态', type:'super', link:'https://super.xiaoe-tech.com/new#/tools/get_login_status-copy', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/cf7e70b0520ab31a60e464c79b572971.1.png'},
	],
	'数据检索':[
		{name:'鹅眼', type:'super', link:'https://super.xiaoe-tech.com/new#/tools/source_right_manage-copy', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/9e697c997ccbe67da98f7c6727b0e673.Frame%402x.png'},
		{name:'数据门户', type:'super', link:'https://bi.xiaoeknow.com/easy/market/quick/redirect_page', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/39db4621c9a482dfb4a9e7e869fa1142.%E7%BB%8F%E8%90%A5%E5%88%86%E6%9E%90.png'}
	],
	'技术工具':[
		{name:'日志查询', link:'https://super.xiaoe-tech.com/new#/tools/get_login_status-copy', icon:'http://wechatapppro-1252524126.file.myqcloud.com/1252524126/images/cf7e70b0520ab31a60e464c79b572971.1.png'},
	]
}

for(let cap in options){
	html += `<div class="tool-cap">${cap}</div>`;
	options[cap].forEach(tool=>{
		let {type, name, link, icon} = tool;
		html += `<a class="tool" href="${escapeAttr(link)}" target="_blank" data-type="${type||''}">
	<img src="${escapeAttr(icon)}" alt="">
	<span class="n">${escapeHtml(name)}</span>
</a>`;
	});
}

ctnDom.innerHTML = `<div class="tools">${html}</div>`;
ctnDom.querySelectorAll('a[data-type="super"]').forEach(a => {
	a.addEventListener('click', e => {
		e.preventDefault();
		openSupperAdminLink(a.href);
		return false;
	})
})