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

  if(typeof ARTWORKS!=='undefined'){
    ARTWORKS.tiadora=[{
      src:'assets/tiadora-manor-final.webp?v=20260914-tiadora-final2',
      alt:'Tiadora, dunkelhaarig und schwarz gekleidet, auf der Treppe eines dunklen Herrenhauses mit versiegeltem Brief.',
      title:'Tiadora',
      caption:'Thorns Botin in ihrem eigenen Element: schwarzer Hofstaat, ein Siegel und die Gewissheit, dass sie den Raum bereits beherrscht.'
    }];
  }

  if(typeof route==='function'){
    setTimeout(function(){try{route();}catch(e){console.error(e);}},0);
  }
}catch(e){console.error(e);}
})();
