import {
    getChromeStorageSync,
    setChromeStorageSync,
    getPasteContent,
    renderTextResult
} from "./../common/common.js";

let textDom = document.querySelector('textarea');
let resultDom = document.querySelector('.result');
let storageKey = 'string';
let inputFromStorage = false;

textDom.addEventListener('input', e => {
    let txt = textDom.value;
    resultDom.innerHTML = renderTextResult(txt);
    if (!inputFromStorage) {
        setChromeStorageSync(storageKey, txt).then(()=>{});
    } else {
        inputFromStorage = false;
    }
});

console.log('focus');
textDom.focus();

let clipboardText = getPasteContent();
if(false && clipboardText.length > 12){
    textDom.value = clipboardText;
    let e = new Event('input');
    textDom.dispatchEvent(e);
}

if(textDom.value.length === 0){
    getChromeStorageSync(storageKey, '').then(txt=>{
        textDom.value = txt;
        inputFromStorage = true;
        let e = new Event('input');
        textDom.dispatchEvent(e);
        textDom.select();
    });
}