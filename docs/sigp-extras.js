/* SIGP prototype — (1) simulated DGPN pre-report intake, (2) tamper-evident audit chain.
   Entirely fictional data. No real DGPN integration: the inbox below is a SIMULATION. */
(function(){
  var SAMPLES=[
    {ref:'PS-DEMO-0001',title:'Escroquerie en ligne — fausse vente (exercice)',incident:'Paiement mobile sans livraison',location:'Dakar',person:'Déclarant fictif A',anonymous:false},
    {ref:'PS-DEMO-0002',title:'Usurpation de compte de réseau social (exercice)',incident:'Compte copié, demandes d’argent aux proches',location:'Thiès',person:'Déclarant fictif B',anonymous:false},
    {ref:'PS-DEMO-0003',title:'Vol de téléphone — signalement sans identité (exercice)',incident:'Téléphone disparu dans un transport en commun',location:'Pikine',person:'',anonymous:true}
  ];
  function h(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  /* ---------- 1. Pre-report inbox ---------- */
  function openInbox(){
    if(typeof roles==='undefined'||!roles[role]||!roles[role].create){return deny()}
    db.preImported=db.preImported||[];
    var rows=SAMPLES.map(function(s){
      var done=db.preImported.indexOf(s.ref)>-1;
      return '<div class="timeline"><b>'+h(s.ref)+'</b> — '+h(s.title)+'<p>'+h(s.incident)+' · '+h(s.location)+(s.anonymous?' · sans identité':'')+'</p>'+
        '<button data-pre="'+h(s.ref)+'" '+(done?'disabled':'')+'>'+(done?'Déjà importé':'Importer comme dossier à valider')+'</button></div>';
    }).join('');
    show('<h2>Pré-signalements en ligne</h2><p class="muted">SIMULATION : exemples fictifs de pré-signalements reçus d’une plateforme nationale. Aucune connexion réelle. Un pré-signalement n’est pas une plainte : l’agent doit valider et formaliser.</p>'+rows+'<p><button onclick="closeModal()">Fermer</button></p>');
    $('#modal').querySelectorAll('[data-pre]').forEach(function(b){b.onclick=function(){importPre(b.dataset.pre)}});
  }
  function importPre(ref){
    var s=SAMPLES.filter(function(x){return x.ref===ref})[0]; if(!s)return;
    db.preImported=db.preImported||[]; if(db.preImported.indexOf(ref)>-1)return;
    var unit=filingRegion(), n=db.cases.length+30001;
    var c={id:'SN-2026-'+unit+'-'+n,unit:unit,title:s.title,incident:s.incident,location:s.location,person:s.person,anonymous:s.anonymous,
      category:'Qualification à confirmer',status:'Brouillon',priority:'Normale',date:new Date().toISOString().slice(0,10),
      description:'Pré-signalement fictif importé pour la démonstration (réf. '+s.ref+'). À valider par un agent avant toute suite.',
      agent:'',notes:[],history:[],tasks:[],evidenceRegister:[],reviewEvents:[],creator:'accueil-démo',
      recordType:'Pré-signalement en ligne — à valider',classificationStatus:'Présélection non validée',sourceRef:s.ref};
    var st=filingStation(); if(st)c.station=st;
    if(currentUser&&currentUser.institution)c.institution=currentUser.institution;
    db.cases.push(c); db.preImported.push(ref);
    save('Import du pré-signalement '+s.ref,c.id);
    closeModal(); render(); if(typeof detail==='function')detail(c.id);
  }

  /* ---------- 2. Hash-chained audit log ---------- */
  var canHash=!!(window.crypto&&crypto.subtle&&window.TextEncoder);
  function sha(str){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
  function payload(prev,a){return JSON.stringify([prev,a.date,a.action,a.ref,a.userId,a.userName,a.profile,a.station||null])}
  var sealing=Promise.resolve();
  function seal(){
    if(!canHash)return;
    sealing=sealing.then(function(){
      var list=db.audit, prev='GENESIS', p=Promise.resolve(), changed=false;
      for(var i=list.length-1;i>=0;i--){(function(a,pv){
        p=p.then(function(){ if(a.hash){prev=a.hash;return} return sha(payload(prev,a)).then(function(x){a.hash=x;prev=x;changed=true}) });
      })(list[i])}
      return p.then(function(){ if(changed)localStorage.setItem('sigp-demo-v3',JSON.stringify(db)) });
    }).catch(function(){});
    return sealing;
  }
  function verify(){
    var list=db.audit, prev='GENESIS', p=Promise.resolve(), bad=-1, unsealed=0;
    for(var i=list.length-1;i>=0;i--){(function(a,idx){
      p=p.then(function(){
        if(!a.hash){unsealed++;return}
        return sha(payload(prev,a)).then(function(x){ if(x!==a.hash&&bad<0)bad=idx; prev=a.hash });
      });
    })(list[i],i)}
    return p.then(function(){return {total:list.length,bad:bad,unsealed:unsealed}});
  }
  function panel(){
    var sec=document.querySelector('#app section.panel'); if(!sec||document.getElementById('chainbox'))return;
    var box=document.createElement('div'); box.id='chainbox'; box.className='panel';
    box.innerHTML='<b>Intégrité du journal</b><p class="muted">Chaque action est liée à la précédente par une empreinte SHA-256 : toute modification d’une entrée casse la chaîne. Dans ce prototype la chaîne est calculée dans le navigateur ; en production elle serait signée et ancrée côté serveur.</p><button id="chainbtn">Vérifier l’intégrité</button> <span id="chainres" role="status"></span>';
    sec.parentNode.insertBefore(box,sec);
    document.getElementById('chainbtn').onclick=function(){
      var out=document.getElementById('chainres'); out.textContent='Vérification…';
      if(!canHash){out.textContent='Non disponible dans ce navigateur (contexte non sécurisé).';return}
      seal().then(verify).then(function(r){
        out.textContent=r.bad<0?('✔ Chaîne intacte ('+r.total+' entrées).'):('✘ Rupture détectée à l’entrée n° '+(r.total-r.bad)+' (de la plus ancienne) : le journal a été modifié.');
        out.style.color=r.bad<0?'#1b6b3a':'#a11';
      });
    };
  }

  /* ---------- hooks ---------- */
  var baseSave=save; save=function(){baseSave.apply(this,arguments); seal()};
  var baseRender=render;
  render=function(){
    baseRender();
    var nav=document.getElementById('nav');
    if(nav&&!nav.querySelector('[data-extra=pre]')&&typeof roles!=='undefined'&&roles[role]&&roles[role].create){
      var b=document.createElement('button'); b.textContent='Pré-signalements'; b.dataset.extra='pre'; b.onclick=openInbox; nav.appendChild(b);
    }
    if(view==='Journal d’activité')panel();
  };
  seal();
})();
