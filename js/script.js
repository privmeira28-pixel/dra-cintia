(function(){
  var doc=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  // topo e barra de progresso
  var top=document.getElementById('top'), bar=document.querySelector('.progress');
  function onScroll(){
    var y=window.scrollY, h=doc.scrollHeight-innerHeight;
    top.classList.toggle('scrolled',y>40);
    bar.style.setProperty('--p',h>0?y/h:0);
  }
  addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  // menu do celular
  var burger=document.getElementById('burger'), nav=document.getElementById('nav');
  function setMenu(open){
    nav.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open);
    burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    document.body.style.overflow=open?'hidden':'';
  }
  burger.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});

  // contadores
  function count(el){
    var end=+el.dataset.count, t0=null;
    if(reduce){el.textContent=end;return}
    requestAnimationFrame(function step(t){
      if(t0===null)t0=t;
      var p=Math.min((t-t0)/1400,1);
      el.textContent=Math.round(end*(1-Math.pow(1-p,3)));
      if(p<1)requestAnimationFrame(step);
    });
  }

  // elementos aparecem ao rolar, em sequência dentro do mesmo grupo
  var els=document.querySelectorAll('.reveal');
  els.forEach(function(e){
    var sib=[].filter.call(e.parentElement.children,function(c){return c.classList.contains('reveal')});
    e.style.setProperty('--d',(sib.indexOf(e)*0.09)+'s');
  });
  function show(e){
    e.classList.add('in');
    e.querySelectorAll('[data-count]').forEach(count);
  }
  if(reduce||!('IntersectionObserver' in window)){
    els.forEach(show);
  }else{
    var io=new IntersectionObserver(function(en){
      en.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target)}});
    },{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){io.observe(e)});
  }

  // destaca no menu a seção visível
  var links={};
  nav.querySelectorAll('a[href^="#"]').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var so=new IntersectionObserver(function(en){
      en.forEach(function(x){var a=links[x.target.id]; if(a) a.classList.toggle('active',x.isIntersecting)});
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).forEach(function(id){var s=document.getElementById(id); if(s) so.observe(s)});
  }

  // cards: inclinação 3D e brilho seguindo o mouse
  if(!reduce&&matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.tilt').forEach(function(c){
      c.addEventListener('mousemove',function(e){
        var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        c.style.transform='perspective(800px) rotateX('+((0.5-y)*7)+'deg) rotateY('+((x-0.5)*9)+'deg) translateY(-6px)';
        c.style.setProperty('--mx',x*100+'%'); c.style.setProperty('--my',y*100+'%');
      });
      c.addEventListener('mouseleave',function(){c.style.transform=''});
    });
  }

  // FAQ: uma resposta aberta por vez
  var ds=document.querySelectorAll('.faq details');
  ds.forEach(function(d){d.addEventListener('toggle',function(){
    if(d.open) ds.forEach(function(o){if(o!==d) o.open=false});
  })});

  var yr=document.getElementById('year'); if(yr) yr.textContent=new Date().getFullYear();
})();
