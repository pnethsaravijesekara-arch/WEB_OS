export const escapeHTML=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const errorText=(err:unknown)=>err instanceof Error?err.message:'The operation failed.';
export function ask(title:string,details:string,options:{value?:string;choices?:[string,string][];action?:string;danger?:boolean}={}):Promise<string|null>{
  const dialog=document.createElement('dialog');dialog.className='system-dialog';dialog.setAttribute('aria-label',title);
  dialog.innerHTML='<form method="dialog"><h2></h2><p></p><div class="dialog-field"></div><footer><button type="button" class="cancel">Cancel</button><button class="commit"></button></footer></form>';
  dialog.querySelector('h2')!.textContent=title;dialog.querySelector('p')!.textContent=details;
  let field:HTMLInputElement|HTMLSelectElement|undefined;
  if(options.choices){const s=document.createElement('select');for(const [v,n] of options.choices)s.add(new Option(n,v));field=s;}
  else if(options.value!==undefined){const i=document.createElement('input');i.value=options.value;i.required=true;field=i;}
  if(field){field.setAttribute('aria-label',title);dialog.querySelector('.dialog-field')!.append(field);}
  const commit=dialog.querySelector<HTMLButtonElement>('.commit')!;commit.textContent=options.action??'Save';commit.classList.toggle('danger',!!options.danger);
  document.body.append(dialog);dialog.showModal();(field??dialog.querySelector<HTMLButtonElement>('.cancel'))?.focus();if(field instanceof HTMLInputElement)field.select();
  return new Promise(resolve=>{
    dialog.querySelector('.cancel')!.addEventListener('click',()=>dialog.close());
    dialog.querySelector('form')!.onsubmit=e=>{e.preventDefault();dialog.close('ok');};
    dialog.onclose=()=>{dialog.remove();resolve(dialog.returnValue==='ok'?field?.value??'ok':null);};
  });
}
