/* =========================================================
   SION TECHNOS EDUCATION ― shared components (vanilla JS)
   アコーディオンの開閉、レベル別クイズの進行・採点・結果表示など、
   複数の教材で共通して使うロジックをまとめたもの。
   使い方は各教材の index.html 内のコメントを参照。
   ========================================================= */

/* ---------- Accordion ---------- */
function sionToggleAcc(id){
  const item = document.getElementById(id);
  if(!item) return;
  item.classList.toggle('open');
  const chevron = item.querySelector('.sion-acc-chevron');
  if(chevron) chevron.textContent = item.classList.contains('open') ? '−' : '+';
}

/* ---------- Quiz Engine ----------
   使い方:
   1. HTML側に以下のIDを持つ要素を用意する
      #quiz-level-bar (任意) / #quiz-body / #quiz-question / #quiz-options
      #quiz-explain / #quiz-progress / #quiz-next
      #quiz-result / #result-score / #result-msg / #result-sub / #result-breakdown
   2. new SionQuiz({ levels: {beginner:[...], intermediate:[...], advanced:[...]},
                      levelMeta: {beginner:{label:'初級'}, ...},
                      resultMessages: (correct,total)=>({msg,sub}) })
   3. quiz.start('beginner')
   各問題オブジェクトの形式:
   { q:'問題文', options:['選択肢1','選択肢2',...], correct:0, explain:'解説文' }
   ========================================================= */
class SionQuiz{
  constructor(opts){
    this.levels = opts.levels;                 // {beginner:[...], intermediate:[...], advanced:[...]}
    this.levelMeta = opts.levelMeta || {};
    this.resultMessages = opts.resultMessages || SionQuiz.defaultResultMessages;
    this.currentLevel = null;
    this.quizData = [];
    this.quizIndex = 0;
    this.userAnswers = [];
    this.quizAnswered = false;
  }

  static defaultResultMessages(correct, total){
    if(correct === total){
      return {msg:'満点です！内容をよく理解できています。', sub:'この調子で他のレベルにも挑戦してみましょう。'};
    } else if(correct >= total/2){
      return {msg:'あと少し！基本はよく理解できています。', sub:'間違えた問題の解説をもう一度読んで、要点を確認してみましょう。'};
    }
    return {msg:'もう一度、解説を読み直してみましょう。', sub:'上の図やアコーディオンの解説を見ながら、順番に理解を積み上げていきましょう。'};
  }

  start(level){
    this.currentLevel = level;
    this.quizData = this.levels[level] || [];
    this.quizIndex = 0;
    this.userAnswers = new Array(this.quizData.length).fill(null);

    document.querySelectorAll('.sion-level-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.level === level);
    });
    this.render();
  }

  render(){
    const body = document.getElementById('quiz-body');
    const result = document.getElementById('quiz-result');
    if(body) body.style.display = '';
    if(result) result.classList.remove('show');

    const item = this.quizData[this.quizIndex];
    if(!item) return;

    const qEl = document.getElementById('quiz-question');
    if(qEl) qEl.textContent = `Q${this.quizIndex+1}. ${item.q}`;

    const progEl = document.getElementById('quiz-progress');
    if(progEl) progEl.textContent = `${this.quizIndex+1} / ${this.quizData.length}`;

    const optsWrap = document.getElementById('quiz-options');
    this.quizAnswered = false;
    if(optsWrap){
      optsWrap.innerHTML = '';
      item.options.forEach((opt, idx)=>{
        const btn = document.createElement('button');
        btn.className = 'sion-quiz-opt';
        btn.textContent = opt;
        btn.onclick = ()=>this.answer(idx);
        optsWrap.appendChild(btn);
      });
    }

    const explainEl = document.getElementById('quiz-explain');
    if(explainEl) explainEl.classList.remove('show');

    const nextBtn = document.getElementById('quiz-next');
    if(nextBtn){
      nextBtn.classList.remove('show');
      nextBtn.textContent = this.quizIndex === this.quizData.length-1 ? '結果を見る →' : '次の問題へ →';
      nextBtn.onclick = ()=>this.handleNext();
    }
  }

  answer(idx){
    if(this.quizAnswered) return;
    this.quizAnswered = true;
    this.userAnswers[this.quizIndex] = idx;
    const item = this.quizData[this.quizIndex];

    const opts = document.querySelectorAll('#quiz-options .sion-quiz-opt');
    opts.forEach((btn,i)=>{
      if(i === item.correct) btn.classList.add('correct');
      else if(i === idx) btn.classList.add('wrong');
    });

    const explainEl = document.getElementById('quiz-explain');
    if(explainEl){
      explainEl.textContent = item.explain;
      explainEl.classList.add('show');
    }
    const nextBtn = document.getElementById('quiz-next');
    if(nextBtn) nextBtn.classList.add('show');
  }

  handleNext(){
    if(this.quizIndex < this.quizData.length-1){
      this.quizIndex++;
      this.render();
    } else {
      this.showResults();
    }
  }

  showResults(){
    const body = document.getElementById('quiz-body');
    const result = document.getElementById('quiz-result');
    if(body) body.style.display = 'none';
    if(result) result.classList.add('show');

    const correctCount = this.userAnswers.reduce((acc,ans,i)=> acc + (ans === this.quizData[i].correct ? 1 : 0), 0);
    const total = this.quizData.length;

    const scoreEl = document.getElementById('result-score');
    if(scoreEl) scoreEl.innerHTML = `${correctCount}<span>/${total}</span>`;

    const {msg, sub} = this.resultMessages(correctCount, total);
    const msgEl = document.getElementById('result-msg');
    if(msgEl) msgEl.textContent = msg;
    const subEl = document.getElementById('result-sub');
    if(subEl) subEl.textContent = sub;

    const breakdown = document.getElementById('result-breakdown');
    if(breakdown){
      breakdown.innerHTML = '';
      this.quizData.forEach((item,i)=>{
        const chip = document.createElement('span');
        const isOk = this.userAnswers[i] === item.correct;
        chip.className = 'sion-result-chip ' + (isOk ? 'ok' : 'ng');
        chip.textContent = `Q${i+1} ${isOk ? '正解' : '不正解'}`;
        breakdown.appendChild(chip);
      });
    }
  }

  restart(){
    this.start(this.currentLevel);
  }
}
