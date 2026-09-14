(function(){
'use strict';
try{
  adultUnlocked=true;
  try{
    sessionStorage.setItem('wotw-wiki-age18-v1','confirmed');
    localStorage.setItem('wotw-wiki-age18-first-v3','confirmed');
  }catch(e){}
  document.body.classList.remove('first-age-gate');

  if(typeof ARTWORKS!=='undefined'){
    ARTWORKS.tiadora=[{
      src:'assets/tiadora-manor.webp?v=20260914-tiadora2',
      alt:'Tiadora in schwarzer aristokratischer Kleidung auf der Treppe eines dunklen Herrenhauses mit versiegeltem Brief.',
      title:'Tiadora',
      caption:'Thorns Botin in ihrem eigenen Element: eine Treppe, ein Siegel und die Gewissheit, dass sie den Raum bereits beherrscht.'
    }];
  }

  if(typeof route==='function'){
    setTimeout(function(){try{route();}catch(e){console.error(e);}},0);
  }
}catch(e){console.error(e);}
})();
