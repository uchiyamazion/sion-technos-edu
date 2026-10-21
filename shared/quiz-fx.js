/* クイズの演出：正解でお祝いエフェクト、不正解はやさしく揺れる。
   SionQuiz（.sion-quiz-opt）と冷凍サイクル独自のクイズ（.quiz-opt）の両方に対応。 */
(function(){
  if (window.__sionQuizFx) return; window.__sionQuizFx = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#5eead4','#38bdf8','#fb923c','#fde68a','#f472b6','#a78bfa'];
  var PRAISE = ['正解！','ナイス！','その通り！','さすが！','バッチリ！'];
  var streak = 0, answered = 0, okCount = 0;

  function layer(){
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1000;overflow:hidden';
    document.body.appendChild(d);
    return d;
  }
  function burst(x, y, n, power){
    if (reduce) return;
    var l = layer();
    for (var i = 0; i < n; i++){
      var p = document.createElement('div');
      var s = 6 + Math.random() * 6, round = Math.random() < .4;
      p.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;width:'+s+'px;height:'+(round?s:s*1.6)+'px;border-radius:'+(round?'50%':'2px')+';background:'+COLORS[i % COLORS.length];
      l.appendChild(p);
      var ang = (-90 + (Math.random() - .5) * 150) * Math.PI / 180, v = power * (.5 + Math.random() * .7);
      var dx = Math.cos(ang) * v, dy = Math.sin(ang) * v;
      if (p.animate) p.animate([
        {transform:'translate(0,0) rotate(0deg)', opacity:1},
        {transform:'translate('+dx+'px,'+dy+'px) rotate('+(Math.random()*360)+'deg)', opacity:1, offset:.45},
        {transform:'translate('+(dx*1.15)+'px,'+(dy+power*.9)+'px) rotate('+(Math.random()*720)+'deg)', opacity:0}
      ], {duration: 800 + Math.random() * 500, easing:'cubic-bezier(.2,.7,.3,1)', fill:'forwards'});
    }
    setTimeout(function(){ l.remove(); }, 1500);
  }
  function pill(x, y, text){
    var l = layer(), t = document.createElement('div');
    t.textContent = text;
    t.style.cssText = 'position:absolute;left:'+x+'px;top:'+y+'px;transform:translate(-50%,0);padding:8px 18px;border-radius:100px;font:900 15px/1 "Zen Kaku Gothic New","Noto Sans JP",sans-serif;color:#04201c;background:linear-gradient(120deg,#5eead4,#a7f3d0);box-shadow:0 6px 22px rgba(94,234,212,.5);white-space:nowrap';
    l.appendChild(t);
    if (t.animate && !reduce) t.animate([
      {transform:'translate(-50%,6px) scale(.8)', opacity:0},
      {transform:'translate(-50%,-14px) scale(1.05)', opacity:1, offset:.25},
      {transform:'translate(-50%,-44px) scale(1)', opacity:0}
    ], {duration:1300, easing:'ease-out', fill:'forwards'});
    setTimeout(function(){ l.remove(); }, 1400);
  }
  function pop(btn){
    if (!btn.animate || reduce) return;
    btn.animate([
      {transform:'scale(1)', boxShadow:'0 0 0 0 rgba(94,234,212,.55)'},
      {transform:'scale(1.035)', boxShadow:'0 0 0 10px rgba(94,234,212,0)', offset:.5},
      {transform:'scale(1)', boxShadow:'0 0 0 0 rgba(94,234,212,0)'}
    ], {duration:520, easing:'ease-out'});
  }
  function shake(btn){
    if (!btn.animate || reduce) return;
    btn.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(6px)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}], {duration:360});
  }

  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.sion-quiz-opt, .quiz-opt');
    if (!btn || !btn.parentElement) return;
    var sibs = btn.parentElement.children;
    for (var i = 0; i < sibs.length; i++) if (sibs[i].dataset && sibs[i].dataset.fx) return;   // 回答済み
    btn.dataset.fx = '1';
    var ok = btn.classList.contains('correct'), bad = btn.classList.contains('wrong');
    if (!ok && !bad) { btn.dataset.fx = ''; return; }
    var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    answered++;
    if (ok){
      okCount++; streak++;
      pop(btn);
      burst(Math.min(cx, window.innerWidth - 40), cy, streak >= 3 ? 46 : 30, streak >= 3 ? 190 : 140);
      pill(cx, r.top - 6, streak >= 3 ? streak + '連続正解！' : PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      if (navigator.vibrate) { try { navigator.vibrate(30); } catch(_){} }
    } else {
      streak = 0;
      shake(btn);
    }
  }, false);

  // 結果画面：全問正解なら大きなお祝い。もう一度挑戦したらカウントをリセット
  function watchResult(){
    var res = document.getElementById('quiz-result');
    if (!res) return;
    new MutationObserver(function(){
      if (res.classList.contains('show')){
        if (answered > 0 && okCount === answered){
          var w = window.innerWidth, h = window.innerHeight;
          burst(w * .25, h * .6, 40, 260); burst(w * .75, h * .6, 40, 260); burst(w * .5, h * .5, 60, 300);
        }
      } else { answered = 0; okCount = 0; streak = 0; }
    }).observe(res, {attributes:true, attributeFilter:['class']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchResult); else watchResult();
})();
