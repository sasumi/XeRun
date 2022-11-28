import {
	escapeHtml,
	fireEvent,
	hide,
	listenEvent,
	show
} from "../common/common.js";

let rotateBtn = document.querySelector('#rotate-btn');
let rotateMap = ['left', 'top', 'bottom'];
const INDENT_COLOR_MAP = {
	0: '#ffa6a6',
	4: '#ff8585',
	6: '#ff4747',
	10: '#f00',
	16: '#d70000',
	20: '#a90000',
	24: '#8f0404',
	30: 'black'
};

const indentDepthColor = (depth)=>{
	let color = '#950101';
	for(let d in INDENT_COLOR_MAP){
		if(depth > d){
			color = INDENT_COLOR_MAP[d];
		} else {
			break;
		}
	}
	return color;
};

const visualizationCode = (srcTxt, contentBlock = '■', whitespaceBlock = '■', indentBlock = '■', tabSize = 8)=>{
	let lines = srcTxt.split(/\n/mg);
	let spaceBlock = '+';
	let ln = 0;

	let lineHtml = '';
	for(let i in lines){
		lineHtml += `<td class="line-num">${parseInt(i, 10)+1}</td>`;
	}

	let topHtml = `<table class="table-top"><tbody><tr>${lineHtml}</tr><tr>`;
	let leftHtml = '<table class="table-left"><tbody>';
	let bottomHtml = '<table class="table-bottom"><tbody><tr>';
	let bottomLnHtml = '';

	lines.forEach(line => {
		let indentHtml = '';
		let contentHtml = line.replace(/\S/g, contentBlock)
			.replace(/\t/mg, spaceBlock.repeat(tabSize))
			.replace(/\s/mg, spaceBlock)
			.replace(new RegExp('^['+spaceBlock+']+', 'g'), ms=>{
				indentHtml = `<span class="indentHtml" style="color:${indentDepthColor(ms.length)}">${indentBlock.repeat(ms.length)}</span>`;
				return '';
			})
			.replace(new RegExp('['+spaceBlock+']+', 'g'), ms=>{
				return `<span class="whitespace">${whitespaceBlock.repeat(ms.length)}</span>`;
			});
		ln++;

		leftHtml+= `<tr>
				<td class="line-num">${ln}</td>
				<td class="line-content">${indentHtml}${contentHtml}</td>
			</tr>`;
		topHtml += `<td class="line-content">${indentHtml}${contentHtml}</td>`;
		bottomHtml += `<td class="line-content">${contentHtml}${indentHtml}</td>`;
		bottomLnHtml += `<td class="line-num">${ln}</td>`;
	});

	bottomHtml += `</tr><tr>${bottomLnHtml}</tr></tbody></table>`;
	topHtml += '</tr></tbody></table>';
	console.log(topHtml);
	leftHtml += '</tbody></table>';
	return leftHtml+topHtml+bottomHtml;
};

let exportBtn = document.querySelector('#export-img-btn');
let txtDom = document.querySelector('.sec-input textarea');
let previewDom = document.querySelector('#preview');
txtDom.addEventListener('input', e=>{
	let txt = txtDom.value;
	previewDom.innerHTML = visualizationCode(txt);
});

let txt = txtDom.value;
previewDom.innerHTML = visualizationCode(txt);

exportBtn.addEventListener('click', e=>{
	
});

rotateBtn.addEventListener('click', e=>{
	let dir = previewDom.getAttribute('data-rotate');
	let idx = rotateMap.indexOf(dir);
	idx = (rotateMap.length - 1) > idx ? (idx+1) : 0;
	previewDom.setAttribute('data-rotate', rotateMap[idx]);
});