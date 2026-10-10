export function mandarinTone(value){
 return value.replace(/([a-zü:]+)([1-5])/g,(_,raw,n)=>{
  let s=raw.replace(/u:/g,'ü'),i=s.indexOf('a');
  if(i<0)i=s.indexOf('e'); if(i<0&&s.includes('ou'))i=s.indexOf('o');
  if(i<0){for(let j=s.length-1;j>=0;j--)if('iouü'.includes(s[j])){i=j;break;}}
  if(n==='5')return s;
  const marks={a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù',ü:'ǖǘǚǜ'};
  return i>=0?s.slice(0,i)+marks[s[i]][Number(n)-1]+s.slice(i+1):s;
 });
}
