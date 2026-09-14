(function(){
'use strict';
try{
  adultUnlocked=true;

  function ungate(){
    if(document.body) document.body.classList.remove('first-age-gate');
  }
  ungate();
  try{
    new MutationObserver(ungate).observe(document.body,{attributes:true,attributeFilter:['class']});
  }catch(e){}

  const tiadoraParts=[1,2,3,4,5,6].map(n=>'assets/tiadora-inline-'+n+'.b64?v=20260914-tiadora-final');
  Promise.all(tiadoraParts.map(src=>fetch(src,{cache:'no-store'}).then(r=>{
    if(!r.ok) throw new Error('Tiadora artwork: '+src+' returned '+r.status);
    return r.text();
  }))).then(parts=>{
    if(typeof ARTWORKS!=='undefined'){
      ARTWORKS.tiadora=[{
        src:'data:image/webp;base64,'+parts.join('').replace(/\s+/g,''),
        alt:'Tiadora, dunkelhaarig und schwarz gekleidet, auf der Treppe eines dunklen Herrenhauses mit versiegeltem Brief.',
        title:'Tiadora',
        caption:'Thorns Botin in ihrem eigenen Element: schwarzer Hofstaat, ein Siegel und die Gewissheit, dass sie den Raum bereits beherrscht.'
      }];
    }
    if(typeof route==='function') route();
  }).catch(err=>console.error(err));

  if(typeof route==='function'){
    setTimeout(function(){try{route();}catch(e){console.error(e);}},0);
  }
}catch(e){console.error(e);}
})();
