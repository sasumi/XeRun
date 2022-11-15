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

//闯关打卡
const resolveBreakThroughClock = txt => {
    // https://appnhv5pqzm8966.h5.xiaoeknow.com/xiaoe_clock/breakthrough_clock/ac_6355631302cb6_f20vYUuS#/breakthroughClock
};

textDom.addEventListener('input', e => {
    let txt = textDom.value;
    resultDom.innerHTML = renderTextResult(txt);
    if (!inputFromStorage) {
        setChromeStorageSync(storageKey, txt);
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