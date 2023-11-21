import {
	getChromeStorageSync,
	setChromeStorageSync,
	COMMON_OPTIONS
} from "./../common/common.js";
import {batchAddListener} from "../common/function.js";

let ctnDom = document.querySelector('.option-list');

for(let groupTitle in COMMON_OPTIONS){
	let optGrpDom = document.createElement('div');
	optGrpDom.className = 'option-group';
	let html = `<dt tabindex="0">${groupTitle}</dt>`;
	COMMON_OPTIONS[groupTitle].forEach(({title, key}) => {
		html += `<dd>${title} <span class="checkbox" tabindex="0" data-key="${key}"></span></dd>`;
	});
	optGrpDom.innerHTML = html;
	ctnDom.appendChild(optGrpDom);
}

document.querySelectorAll('.option-group dt').forEach(dt => {
	batchAddListener(dt, ['click', 'enter', 'space'], e => {
		dt.parentNode.classList.toggle('option-group-collapse');
	});
});

const CHECKED_CLASS = 'checkbox-checked';

const bindCheck = () => {
	let checks = document.querySelectorAll('.checkbox');
	checks.forEach(chk => {
		let key = chk.getAttribute('data-key');
		getChromeStorageSync(key).then(toChecked => {
			if(toChecked === undefined){
				toChecked = true;
				setChromeStorageSync(key, true).then(r => {}); //默认开启
			}
			chk.classList[!!toChecked ? 'add' : 'remove'](CHECKED_CLASS);
		});
		batchAddListener(chk, ['click', 'enter', 'space'], () => {
			let toChecked = !chk.classList.contains(CHECKED_CLASS);
			chk.classList.toggle(CHECKED_CLASS);
			setChromeStorageSync(key, toChecked).then(r => {});
		});
	});
};

setTimeout(bindCheck, 0);