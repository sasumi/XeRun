import {escapeAttr, escapeHtml} from "../common/function.js";
import {openSupperAdminLink} from "../common/common.js";

let ctnDom = document.querySelector('.content');

let html = '';
let options = {
	'客户服务':[
		{name: '浏览器诊断', link: 'https://lancet.xiaoe-tools.com/', icon:'iconfont icon-browser'},
		{name:'权益查询', type:'super', link:'https://super.xiaoe-tech.com/new#/tools/source_right_manage-copy', icon:'iconfont icon-interests'},
		{name:'AI知识库', type:'super', link:'https://ebot.xiaoeknow.com/#/e_bot/knowledge_base/97', icon:'iconfont icon-knowledge'},
		{name:'B端店铺登录', type:'super', link:'https://super.xiaoe-tech.com/new#/manageStore-copy', icon:'iconfont icon-manager-system'},
		{name:'C端登录态', type:'super', link:'https://super.xiaoe-tech.com/new#/tools/get_login_status-copy', icon:'iconfont icon-anonymous'},
	],
	'数据检索':[
		{name:'鹅眼', type:'super', link:'https://super.xiaoe-tech.com/new#/tools/source_right_manage-copy', icon:'iconfont icon-chart'},
		{name:'数据门户', type:'super', link:'https://bi.xiaoeknow.com/easy/market/quick/redirect_page', icon:'iconfont icon-chart'}
	],
	'技术工具':[
		{name:'日志查询', link:'https://log.xiaoe-tools.com/', icon:'iconfont icon-log'},
	]
}

for(let cap in options){
	html += `<div class="tool-cap">${cap}</div>`;
	options[cap].forEach(tool=>{
		let {type, name, link, icon} = tool;
		html += `<a class="tool" href="${escapeAttr(link)}" target="_blank" data-type="${type||''}">
	<i class="${icon}"></i>
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