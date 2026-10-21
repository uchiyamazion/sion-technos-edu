/* 全教材ページ共通：本文中の専門用語を用語集とひも付け、タップで意味を表示する。
   data/glossary.json を読み込み、各ページで用語ごとに最初の1か所だけに下線を付ける。 */
(function(){
  var p = location.pathname;
  if (/\/(glossary|admin)\//.test(p)) return;

  var css = '.gl-term{border-bottom:1px dotted #5eead4;cursor:help;text-decoration:none;color:inherit}.gl-term:hover{background:rgba(94,234,212,.14)}'
  + '.gl-pop{position:absolute;z-index:950;max-width:340px;background:rgba(14,24,42,.98);color:#e8f0fb;border:1px solid rgba(94,234,212,.5);border-radius:14px;padding:14px 16px;box-shadow:0 10px 32px rgba(0,0,0,.45);font:400 13px/1.8 "Noto Sans JP",sans-serif}'
  + '.gl-pop .gl-h{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 8px;margin-bottom:4px}.gl-pop b{font:700 15px/1.4 "Zen Kaku Gothic New","Noto Sans JP",sans-serif}.gl-pop small{color:#9db0c9;font-size:11.5px}'
  + '.gl-pop .gl-c{font:500 10.5px/1 "JetBrains Mono",monospace;padding:2px 8px;border-radius:100px;border:1px solid rgba(255,255,255,.2);color:#9db0c9}'
  + '.gl-pop a{display:inline-block;margin-top:8px;color:#5eead4;font-weight:700;text-decoration:none}.gl-pop a:hover{text-decoration:underline}'
  + '@media(max-width:640px){.gl-pop{position:fixed;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));max-width:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var SKIP = 'script,style,noscript,textarea,input,select,option,button,a,svg,h1,h2,h3,h4,h5,h6,mark,.gl-term,.gl-pop,'
           + '.acc-title,.sion-acc-title,.info-title,.panel-title,.ttitle,.ph-name,.quiz-q,.quiz-options,.quiz-card .panel-title,[data-no-gloss]';
  var map = {}, re = null, used = {}, busy = false, timer = null;

  function build(list){
    var keys = [];
    list.forEach(function(it){
      if (!it.term || it.term.length < 2) return;
      var vs = [it.term], n = it.term.normalize('NFKC');
      if (n !== it.term) vs.push(n);
      vs.forEach(function(v){ if (!map[v]) { map[v] = it; keys.push(v); } });
    });
    keys.sort(function(a,b){ return b.length - a.length; });
    re = new RegExp(keys.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }).join('|'), 'g');
  }

  function scan(root){
    if (!re) return;
    busy = true;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        if (!n.nodeValue || n.nodeValue.length < 2) return NodeFilter.FILTER_REJECT;
        var el = n.parentElement;
        if (!el || el.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      var text = node.nodeValue, last = 0, frag = null, m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        var it = map[m[0]];
        if (!it || used[it.term]) continue;
        used[it.term] = 1;
        if (!frag) frag = document.createDocumentFragment();
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var sp = document.createElement('span');
        sp.className = 'gl-term'; sp.textContent = m[0];
        sp.setAttribute('data-gl', it.term); sp.tabIndex = 0; sp.setAttribute('role','button');
        frag.appendChild(sp);
        last = m.index + m[0].length;
      }
      if (frag) {
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
    });
    busy = false;
  }

  var pop = null;
  function closePop(){ if (pop) { pop.remove(); pop = null; } }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function open(el){
    var it = map[el.getAttribute('data-gl')]; if (!it) return;
    closePop();
    pop = document.createElement('div'); pop.className = 'gl-pop';
    pop.innerHTML = '<div class="gl-h"><b>'+esc(it.term)+'</b>'+(it.yomi?'<small>'+esc(it.yomi)+'</small>':'')+'<span class="gl-c">'+esc(it.cat)+'</span></div>'
      + '<div>'+esc(it.desc)+'</div><a href="../glossary/index.html?q='+encodeURIComponent(it.term)+'">用語集で見る →</a>';
    document.body.appendChild(pop);
    if (!window.matchMedia('(max-width:640px)').matches) {
      var r = el.getBoundingClientRect(), pw = pop.offsetWidth;
      var left = Math.max(10, Math.min(r.left + window.pageXOffset, window.pageXOffset + document.documentElement.clientWidth - pw - 10));
      pop.style.left = left + 'px';
      pop.style.top = (r.bottom + window.pageYOffset + 8) + 'px';
    }
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('.gl-term');
    if (t) { e.preventDefault(); open(t); return; }
    if (!e.target.closest || !e.target.closest('.gl-pop')) closePop();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closePop();
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('gl-term')) { e.preventDefault(); open(e.target); }
  });

  function schedule(){
    if (busy) return;
    clearTimeout(timer);
    timer = setTimeout(function(){ scan(document.body); }, 250);
  }
  function start(list){
    build(list);
    scan(document.body);
    new MutationObserver(function(ms){ if (ms.some(function(m){ var t = m.target.nodeType === 1 ? m.target : m.target.parentElement; return t && !t.closest('svg,.gl-pop'); })) schedule(); }).observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  function init(){
    fetch('../data/glossary.json').then(function(r){ return r.json(); }).then(start).catch(function(){});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
