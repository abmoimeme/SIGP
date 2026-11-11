/* SIGP prototype — optional shared storage via Firebase Realtime Database (REST, no SDK).
   Fictional data only. Falls back silently to browser-only storage if the database is unreachable.
   Add ?local=1 to the URL to disable sync. Last write wins (demo-grade, no authentication). */
(function(){
  var DB='https://sigp-6a6c8-default-rtdb.firebaseio.com/sigp-demo/state.json';
  var KEY='sigp-demo-v3', STAMP='sigp-sync-stamp', GUARD='sigp-sync-reloaded';
  if(/[?&]local=1/.test(location.search)) return;
  var ready=false, timer=null, orig=Storage.prototype.setItem;
  function push(){
    if(!ready) return;
    clearTimeout(timer);
    timer=setTimeout(function(){
      var raw=localStorage.getItem(KEY); if(!raw) return;
      var stamp=Date.now();
      fetch(DB,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({updated:stamp,db:raw})})
        .then(function(r){ if(r.ok) orig.call(localStorage,STAMP,String(stamp)); })
        .catch(function(){});
    },1500);
  }
  Storage.prototype.setItem=function(k,v){
    orig.apply(this,arguments);
    if(this===localStorage && k===KEY) push();
  };
  var ctl=new AbortController(), to=setTimeout(function(){ctl.abort()},5000);
  fetch(DB,{signal:ctl.signal}).then(function(r){return r.ok?r.json():null}).then(function(remote){
    clearTimeout(to);
    var local=Number(localStorage.getItem(STAMP)||0);
    if(remote && remote.db && remote.updated>local && !sessionStorage.getItem(GUARD)){
      orig.call(localStorage,KEY,remote.db);
      orig.call(localStorage,STAMP,String(remote.updated));
      sessionStorage.setItem(GUARD,'1');
      location.reload(); return;
    }
    sessionStorage.removeItem(GUARD);
    ready=true;
    if(!remote) push();
  }).catch(function(){ ready=false; });
})();
