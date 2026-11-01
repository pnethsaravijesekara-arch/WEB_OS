export interface Searchable { id:string; label:string; keywords?:string }
export function searchItems<T extends Searchable>(items:T[],query:string):T[]{
  const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if(!words.length)return items;
  return items.map((item,index)=>({item,index,text:`${item.label} ${item.keywords??''}`.toLocaleLowerCase()}))
    .filter(row=>words.every(word=>row.text.includes(word)))
    .sort((a,b)=>Number(b.item.label.toLocaleLowerCase().startsWith(words[0]))-Number(a.item.label.toLocaleLowerCase().startsWith(words[0]))||a.index-b.index).map(row=>row.item);
}
