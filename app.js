import {convert,tone,initialCapital,displayCharacter} from './core.js';
import {mandarinTone} from './mandarin.js';
const $=id=>document.getElementById(id); let items=[];
function el(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
function update(){
 $('result-name').textContent=[0,1].map(group=>items.filter(i=>i.group===group).map(i=>displayCharacter(i)).join('')).filter(Boolean).join(' ');
 $('pinyin').replaceChildren();
 const groups=[0,1].map(group=>items.filter(i=>i.group===group)).filter(g=>g.length);
 groups.forEach((group,g)=>{
  if(g)$('pinyin').append(document.createTextNode(' / '));
  group.forEach((item,index)=>{
   if(index)$('pinyin').append(document.createTextNode(' '));
   if(!item.options.length){$('pinyin').append(el('span',`${item.char}〔未対応〕`));return;}
   const choice=item.selected||{variant:0,reading:0};
   const pronunciation=tone(item.options[choice.variant].readings[choice.reading].numbered);
   const span=el('span',index===0?initialCapital(pronunciation):pronunciation,item.selected?'':'pending-pinyin');
   if(!item.selected)span.title='仮の読みです。下の候補から選択してください。';
   $('pinyin').append(span);
  });
 });
 $('mandarin-help').hidden=!items.some(i=>i.options.length>1||i.options.some(v=>v.readings.length>1));
 const pending=items.filter(i=>i.options.length&&!i.selected), unknown=items.filter(i=>!i.options.length).length;
 const polyphones=pending.some(i=>new Set(i.options.flatMap(v=>v.readings.map(r=>r.numbered))).size>1);
 const variants=pending.some(i=>i.options.length>1);
 $('status').textContent=[polyphones?'赤字になっている読みは多音字です。意味を参考に選択してください。意味が未収録の候補は辞書で確認してください。':'',variants?'字体に複数の候補がある文字も赤字で表示しています。下の候補から選択してください。':'',unknown?`${unknown}文字は未対応です。`:''].filter(Boolean).join(' ');
}

function render(){
 $('cards').replaceChildren();
 items.forEach((item,index)=>{
  const card=el('article',undefined,'card');
  const isPolyphone=new Set(item.options.flatMap(v=>v.readings.map(r=>r.numbered))).size>1;
  const head=el('div',undefined,'card-head');head.append(el('h3',item.char),el('span',!item.options.length?'未対応':item.selected?'選択済み':'選択が必要',item.selected?'badge selected':'badge'));card.append(head);
  if(item.options.some(v=>v.readings.some(r=>r.sourceUrls))){const refs=el('details');refs.append(el('summary','読みの出典'));for(const url of [...new Set(item.options.flatMap(v=>v.readings.flatMap(r=>r.sourceUrls||[])))]){const link=el('a',url.includes('cuhk')?'香港中文大学：粵語審音配詞字庫':url.includes('sheik')?'CantoDict':'読みの参考資料');link.href=url;link.target='_blank';link.rel='noreferrer';refs.append(link,el('br'));}card.append(refs);}
  if(!item.options.length){card.append(el('p','この辞書では広東語の読みを確認できません。','unsupported'));}
  else{
   if(item.options.length>1)card.append(el('p','広東語の字体に複数の候補があります。表記と意味を見て選んでください。','hint'));
   item.options.forEach((variant,v)=>{
    const block=el('div',undefined,'variant');
    if(item.options.length>1)block.append(el('p',`字体候補：${variant.traditional}`,'hint'));
    const multi=item.options.length>1||variant.readings.length>1;
    variant.readings.forEach((reading,r)=>{
     const choice=el(multi?'label':'div',undefined,'choice');
     if(multi){const radio=el('input');radio.type='radio';radio.name=`char-${index}`;radio.checked=item.selected?.variant===v&&item.selected?.reading===r;radio.setAttribute('aria-label',`${item.char}：${tone(reading.numbered)}、${reading.meaning}`);radio.addEventListener('change',()=>{item.selected={variant:v,reading:r};update();head.lastChild.textContent='選択済み';head.lastChild.className='badge selected';});choice.append(radio);}
     const desc=el('div');desc.append(el('strong',tone(reading.numbered),'reading'));
     if(isPolyphone){
      if(reading.mandarinReferences?.length)desc.append(el('p',`普通話（参考）：${reading.mandarinReferences.map(mandarinTone).join(' / ')}`,'hint'));
      desc.append(el('p',reading.meaning));
      if(reading.translationMethod?.startsWith('Google Translate'))desc.append(el('small','自動翻訳'));
      if(reading.meaningLanguage==='ja'){const source=el('details');source.append(el('summary','英語の原文'),el('p',reading.source.join(' / ')));desc.append(source);}
     }
     const examples=reading.source.flatMap(s=>[...s.matchAll(/([\u3400-\u9fff]+)\[([^\]]+)\]/g)].map(m=>m[1]));
     if(isPolyphone&&examples.length)desc.append(el('small',`辞書の参照・用例：${[...new Set(examples)].slice(0,3).join('・')}`));
     choice.append(desc);block.append(choice);
    });card.append(block);
   });
  }$('cards').append(card);
 });update();
}
$('name-form').addEventListener('submit',event=>{
 event.preventDefault();const surname=$('surname').value,given=$('given').value;
 if(!surname.trim()&&!given.trim()){$('error').textContent='姓または名を入力してください。';$('surname').focus();return;}
 $('error').textContent='';items=convert(surname,given);$('result').hidden=false;$('empty').hidden=true;render();
});
document.querySelectorAll('[data-sample]').forEach(button=>button.addEventListener('click',()=>{const [surname,given]=button.dataset.sample.split(',');$('surname').value=surname;$('given').value=given;$('name-form').requestSubmit();}));
