import {dictionary} from './data.js';
const initials={z:'zh',c:'ch',j:'y'};
const finals={aa:'aa',aai:'aai',aau:'aau',aam:'aam',aan:'aan',aang:'aang',aap:'aap',aat:'aat',aak:'aak',oe:'ö',oeng:'öng',oek:'ök',eoi:'öü',eon:'ön',eot:'öt',yu:'ü',yun:'ün',yut:'üt'};
const allowed=new Set('aa aai aau aam aan aang aap aat aak ai au am an ang ap at ak e ei eng ek oe oeng oek eoi eon eot o oi on ong ot ok ou i iu im in ip it ing ik u ui un ut ung uk yu yun yut'.split(' '));
export function tone(value){
 const m=/^(.*)([1-6])$/.exec(value);if(!m)return null;
 const body=m[1];if(body==='m'||body==='ng')return body+m[2];
 const onset=/^(gw|kw|ng|[bpmfdtnlgkhwzcjs])/.exec(body)?.[0]||'';
 const final=body.slice(onset.length);if(!allowed.has(final))return null;
 return (initials[onset]||onset)+(finals[final]||final)+m[2];
}
export function convert(surname,given){
 return [surname,given].flatMap((part,group)=>Array.from(part.trim().replace(/\s/g,'')).map(char=>{
  const candidates=dictionary[char]||[];
  // Preserve an existing traditional character before considering conversions.
  const exact=candidates.filter(v=>v.traditional===char);
  const options=exact.length?exact:candidates;
  return {char,group,options,selected:options.length===1&&options[0].readings.length===1?{variant:0,reading:0}:null};
 }));
}
export function summary(items){
 return [0,1].map(group=>items.filter(i=>i.group===group).map(i=>{
  if(!i.options.length)return `${i.char}〔未対応〕`;
  const choice=i.selected||{variant:0,reading:0};
  return tone(i.options[choice.variant].readings[choice.reading].numbered);
 }).join(' ')).filter(Boolean).join(' / ');
}

export function initialCapital(value){return value.charAt(0).toUpperCase()+value.slice(1);}

export function displayCharacter(item){
 if(!item.options.length)return item.char;
 if(!item.selected&&item.options.length>1)return item.char;
 return item.options[item.selected?.variant??0].traditional;
}
