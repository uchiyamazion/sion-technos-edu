/* 全教材ページ共通：スクロールすると左下に「教材一覧へ戻る」ボタンを表示する */
(function(){
  var css = '.sion-fab-back{position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:900;display:inline-flex;align-items:center;gap:6px;padding:11px 18px;border-radius:100px;font:700 13px/1 "Zen Kaku Gothic New","Noto Sans JP",sans-serif;color:#e8f0fb;text-decoration:none;background:rgba(14,24,42,.82);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(94,234,212,.45);box-shadow:0 6px 24px rgba(0,0,0,.35);opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .25s ease,transform .25s ease,border-color .2s ease}.sion-fab-back.show{opacity:1;transform:none;pointer-events:auto}.sion-fab-back:hover{border-color:#5eead4}@media(prefers-reduced-motion:reduce){.sion-fab-back{transition:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var a = document.createElement('a');
  a.className = 'sion-fab-back';
  a.href = '../index.html';
  a.textContent = '← 教材一覧';
  a.setAttribute('aria-label', '教材一覧に戻る');
  document.body.appendChild(a);
  function onScroll(){ a.classList.toggle('show', (window.pageYOffset || document.documentElement.scrollTop) > 240); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
