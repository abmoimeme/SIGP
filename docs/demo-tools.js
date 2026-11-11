/* SIGP prototype — fictional-data notice + demo reset. */
(function(){
  var DB='https://sigp-6a6c8-default-rtdb.firebaseio.com/sigp-demo/state.json';
  function ready(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f()}
  ready(function(){
    var bar=document.createElement('div');
    bar.setAttribute('role','note');
    bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#7a1f1f;color:#fff;font:600 12px/1.4 system-ui,sans-serif;padding:7px 12px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;text-align:center';
    var t=document.createElement('span');
    t.textContent='PROTOTYPE FICTIF — données de démonstration partagées. N’entrez aucun nom, numéro ni information réels.';
    var b=document.createElement('button');
    b.type='button';b.textContent='Réinitialiser la démo';
    b.style.cssText='background:#fff;color:#7a1f1f;border:0;border-radius:4px;padding:4px 10px;font:700 12px system-ui,sans-serif;cursor:pointer';
    b.onclick=function(){
      if(!confirm('Réinitialiser la démo ? Toutes les données saisies seront effacées pour tous les testeurs.'))return;
      b.disabled=true;b.textContent='Réinitialisation…';
      var done=function(){
        ['sigp-demo-v3','sigp-pins-v3','sigp-sync-stamp'].forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
        try{sessionStorage.clear()}catch(e){}
        location.reload();
      };
      if(/[?&]local=1/.test(location.search))return done();
      var c=new AbortController(),to=setTimeout(function(){c.abort()},5000);
      fetch(DB,{method:'DELETE',signal:c.signal}).catch(function(){}).then(function(){clearTimeout(to);done()});
    };
    bar.appendChild(t);bar.appendChild(b);document.body.appendChild(bar);
    document.body.style.paddingBottom='46px';
  });
})();
