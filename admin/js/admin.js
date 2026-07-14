// ════════════════════════════════════════════════
// メーカー別資料 管理画面 - admin.js
// data/makers.json を GitHub Contents API で直接読み書きする
// ════════════════════════════════════════════════

const REPO = 'uchiyamazion/sion-technos-edu';
const FILE_PATH = 'data/makers.json';
const BRANCH = 'main';

let makers = [];
let currentSha = null;
let newIdCounter = 0;

function getPat() { return document.getElementById('pat').value.trim(); }
function getEditor() { return document.getElementById('editorName').value.trim(); }

function setAuthStatus(msg, ok) {
  const el = document.getElementById('auth-status');
  el.textContent = msg;
  el.className = 'auth-status ' + (ok ? 'ok' : 'err');
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function esc(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : String(s);
  return div.innerHTML;
}

// ---- GitHub Contents API ----
async function ghGetFile() {
  const pat = getPat();
  if (!pat) { setAuthStatus('GitHub Personal Access Token を入力してください', false); throw new Error('no pat'); }
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`, {
    headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/vnd.github+json' }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub取得エラー (${res.status}): ${body.slice(0,150)}`);
  }
  const json = await res.json();
  currentSha = json.sha;
  const decoded = decodeURIComponent(escape(atob(json.content.replace(/\n/g, ''))));
  return JSON.parse(decoded);
}

async function ghPutFile(data, message) {
  const pat = getPat();
  if (!pat) { throw new Error('GitHub Personal Access Token を入力してください'); }
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2) + '\n')));
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/vnd.github+json' },
    body: JSON.stringify({ message, content, sha: currentSha, branch: BRANCH })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub保存エラー (${res.status}): ${body.slice(0,200)}`);
  }
  const json = await res.json();
  currentSha = json.content.sha;
}

// ---- 初期読み込み ----
async function loadMakers() {
  const container = document.getElementById('maker-list');
  const pat = getPat();
  if (!pat) {
    container.innerHTML = '<div class="locked-note">上部にGitHub Personal Access Tokenを入力すると、メーカー一覧が読み込まれます。</div>';
    return;
  }
  container.innerHTML = '<div class="locked-note">読み込み中…</div>';
  try {
    makers = await ghGetFile();
    setAuthStatus(`接続OK：${makers.length}件のメーカー資料を読み込みました`, true);
    renderList();
  } catch (err) {
    setAuthStatus(err.message, false);
    container.innerHTML = `<div class="locked-note">読み込みに失敗しました：${esc(err.message)}</div>`;
  }
}

// ---- 一覧描画 ----
function renderList() {
  const container = document.getElementById('maker-list');
  if (!makers.length) {
    container.innerHTML = '<div class="locked-note">メーカー資料がまだありません。「＋ 新しいメーカーを追加」から作成してください。</div>';
    return;
  }
  container.innerHTML = '';
  makers.forEach((m, idx) => container.appendChild(buildMakerCard(m, idx)));
}

function buildMakerCard(m, idx) {
  const card = document.createElement('div');
  card.className = 'maker-card';
  card.dataset.idx = idx;

  const head = document.createElement('div');
  head.className = 'maker-card-head';
  head.innerHTML = `
    <div>
      <h3>${esc(m.company || '(新規メーカー)')}</h3>
      <div class="mh-sub">id: ${esc(m.id || '未設定')} ／ 更新: ${esc(m.updatedAt || '-')} ${esc(m.updatedBy ? '('+m.updatedBy+')' : '')}</div>
    </div>
    <span class="chev">▾</span>
  `;
  head.addEventListener('click', () => card.classList.toggle('open'));
  card.appendChild(head);

  const body = document.createElement('div');
  body.className = 'maker-card-body';
  body.innerHTML = buildBodyHtml(m);
  card.appendChild(body);

  // 基本フィールドのバインド
  bindField(body, '.f-id', m, 'id');
  bindField(body, '.f-company', m, 'company');
  bindField(body, '.f-eyebrow', m, 'eyebrow');
  bindField(body, '.f-accent', m, 'accent');
  bindField(body, '.f-overview', m, 'overview');

  renderSubitems(body, m, 'lineup', ['tag','name','desc']);
  renderSubitems(body, m, 'tech', ['name','desc']);
  renderSubitems(body, m, 'maintenance', null);

  body.querySelector('.add-lineup').addEventListener('click', () => {
    m.lineup = m.lineup || [];
    m.lineup.push({ tag:'', name:'', desc:'' });
    renderSubitems(body, m, 'lineup', ['tag','name','desc']);
  });
  body.querySelector('.add-tech').addEventListener('click', () => {
    m.tech = m.tech || [];
    m.tech.push({ name:'', desc:'' });
    renderSubitems(body, m, 'tech', ['name','desc']);
  });
  body.querySelector('.add-maint').addEventListener('click', () => {
    m.maintenance = m.maintenance || [];
    m.maintenance.push('');
    renderSubitems(body, m, 'maintenance', null);
  });

  body.querySelector('.btn-save').addEventListener('click', () => saveMaker(idx));
  body.querySelector('.btn-delete').addEventListener('click', () => deleteMaker(idx));

  return card;
}

function buildBodyHtml(m) {
  return `
    <div class="field">
      <label class="f-label">ID（半角英数、URLに使われます。例: panasonic）</label>
      <input type="text" class="f-id" value="${esc(m.id)}">
    </div>
    <div class="field">
      <label class="f-label">メーカー名</label>
      <input type="text" class="f-company" value="${esc(m.company)}">
    </div>
    <div class="field row2">
      <div>
        <label class="f-label">見出し英字（EYEBROW）</label>
        <input type="text" class="f-eyebrow" value="${esc(m.eyebrow)}">
      </div>
      <div>
        <label class="f-label">アクセントカラー</label>
        <input type="color" class="f-accent" value="${esc(m.accent || '#38bdf8')}">
      </div>
    </div>
    <div class="field">
      <label class="f-label">会社概要・特徴（概要文）</label>
      <textarea class="f-overview">${esc(m.overview)}</textarea>
    </div>

    <div class="section-label">主要ラインナップ</div>
    <div class="lineup-list"></div>
    <button type="button" class="add-btn add-lineup">＋ ラインナップを追加</button>

    <div class="section-label">独自技術・特徴</div>
    <div class="tech-list"></div>
    <button type="button" class="add-btn add-tech">＋ 技術・特徴を追加</button>

    <div class="section-label">現場で使うポイント</div>
    <div class="maint-list-admin"></div>
    <button type="button" class="add-btn add-maint">＋ ポイントを追加</button>

    <div class="btn-row">
      <button type="button" class="btn btn-delete">このメーカーを削除</button>
      <button type="button" class="btn btn-save">保存してGitHubへ反映</button>
    </div>
  `;
}

function bindField(body, selector, obj, key) {
  const el = body.querySelector(selector);
  el.addEventListener('input', () => { obj[key] = el.value; });
}

function renderSubitems(body, m, key, fields) {
  const listEl = body.querySelector(
    key === 'lineup' ? '.lineup-list' : key === 'tech' ? '.tech-list' : '.maint-list-admin'
  );
  const items = m[key] || [];
  listEl.innerHTML = '';

  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'subitem';

    if (fields) {
      // lineup or tech: オブジェクト配列
      let inner = '';
      if (key === 'lineup') {
        inner = `
          <div class="row2" style="margin-bottom:8px;">
            <input type="text" class="si-name" placeholder="モデル名" value="${esc(item.name)}">
            <input type="text" class="si-tag" placeholder="タグ" value="${esc(item.tag)}">
          </div>
          <textarea class="si-desc" placeholder="説明文">${esc(item.desc)}</textarea>
        `;
      } else {
        inner = `
          <input type="text" class="si-name" placeholder="技術名" style="margin-bottom:8px;" value="${esc(item.name)}">
          <textarea class="si-desc" placeholder="説明文">${esc(item.desc)}</textarea>
        `;
      }
      row.innerHTML = `<button type="button" class="rm">×</button>${inner}`;
      row.querySelector('.si-name').addEventListener('input', e => item.name = e.target.value);
      row.querySelector('.si-desc').addEventListener('input', e => item.desc = e.target.value);
      if (key === 'lineup') {
        row.querySelector('.si-tag').addEventListener('input', e => item.tag = e.target.value);
      }
    } else {
      // maintenance: 文字列配列
      row.innerHTML = `<button type="button" class="rm">×</button><textarea class="si-text" placeholder="現場でのポイント">${esc(item)}</textarea>`;
      row.querySelector('.si-text').addEventListener('input', e => { m.maintenance[i] = e.target.value; });
    }

    row.querySelector('.rm').addEventListener('click', () => {
      m[key].splice(i, 1);
      renderSubitems(body, m, key, fields);
    });

    listEl.appendChild(row);
  });
}

// ---- 保存・削除 ----
async function saveMaker(idx) {
  const editor = getEditor();
  if (!editor) { showToast('編集者名を入力してください'); return; }
  const m = makers[idx];
  if (!m.id || !m.company) { showToast('IDとメーカー名は必須です'); return; }

  // ID重複チェック
  const dup = makers.some((x, i) => i !== idx && x.id === m.id);
  if (dup) { showToast('同じIDのメーカーが既に存在します'); return; }

  m.updatedBy = editor;
  m.updatedAt = new Date().toISOString().slice(0, 10);

  try {
    await ghPutFile(makers, `メーカー資料更新: ${m.company} (by ${editor})`);
    showToast(`「${m.company}」を保存しました`);
    renderList();
  } catch (err) {
    showToast('保存エラー: ' + err.message);
  }
}

async function deleteMaker(idx) {
  const editor = getEditor();
  if (!editor) { showToast('編集者名を入力してください'); return; }
  const m = makers[idx];
  if (!confirm(`「${m.company || '(新規メーカー)'}」を削除します。よろしいですか？`)) return;

  const removed = makers.splice(idx, 1)[0];
  try {
    await ghPutFile(makers, `メーカー資料削除: ${removed.company || removed.id} (by ${editor})`);
    showToast(`「${removed.company || removed.id}」を削除しました`);
    renderList();
  } catch (err) {
    makers.splice(idx, 0, removed); // 失敗時は元に戻す
    showToast('削除エラー: ' + err.message);
  }
}

function addNewMaker() {
  newIdCounter++;
  makers.push({
    id: '', company: '', eyebrow: 'MANUFACTURER GUIDE',
    accent: '#38bdf8', overview: '',
    lineup: [], tech: [], maintenance: [],
    updatedBy: '', updatedAt: ''
  });
  renderList();
  // 新規カードを開いてスクロール
  const cards = document.querySelectorAll('.maker-card');
  const last = cards[cards.length - 1];
  last.classList.add('open');
  last.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pat').addEventListener('change', loadMakers);
  document.getElementById('add-maker-btn').addEventListener('click', addNewMaker);
});
