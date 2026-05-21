const STORAGE_KEY = 'notepad-content';
const STORAGE_TIME = 'notepad-saved-at';
const THEME_KEY = 'notepad-theme-dark';

const editor = document.getElementById('editor');
const status = document.getElementById('status');
const fileInput = document.getElementById('fileInput');
const newBtn = document.getElementById('newBtn');
const openBtn = document.getElementById('openBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadBtn = document.getElementById('downloadBtn');
const darkToggle = document.getElementById('darkToggle');

let saveTimer = null;

function formatTime(ts){
  if(!ts) return '—';
  const d = new Date(Number(ts));
  return d.toLocaleString();
}

function updateStatus(){
  const t = localStorage.getItem(STORAGE_TIME);
  if(editor.value !== localStorage.getItem(STORAGE_KEY)){
    status.textContent = '저장 상태: 변경됨';
  } else {
    status.textContent = '저장 상태: ' + (t ? formatTime(t) : '—');
  }
}

function save(){
  localStorage.setItem(STORAGE_KEY, editor.value);
  localStorage.setItem(STORAGE_TIME, Date.now());
  updateStatus();
}

function scheduleSave(){
  if(saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 800);
}

function load(){
  const v = localStorage.getItem(STORAGE_KEY) || '';
  editor.value = v;
  updateStatus();
}

function newNote(){
  if(editor.value.trim() && !confirm('새 문서를 만들면 현재 내용이 지워집니다. 계속할까요?')) return;
  editor.value = '';
  save();
}

function triggerOpen(){
  fileInput.value = null;
  fileInput.click();
}

fileInput.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    editor.value = reader.result;
    save();
  };
  reader.readAsText(f, 'utf-8');
});

function download(){
  const blob = new Blob([editor.value], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'note.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Keyboard shortcuts
window.addEventListener('keydown', e => {
  const mac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
  const cmd = mac ? e.metaKey : e.ctrlKey;
  if(cmd && e.key.toLowerCase() === 's'){
    e.preventDefault();
    save();
  }
  if(cmd && e.key.toLowerCase() === 'o'){
    e.preventDefault();
    triggerOpen();
  }
  if(cmd && e.key.toLowerCase() === 'n'){
    e.preventDefault();
    newNote();
  }
});

editor.addEventListener('input', () => {
  scheduleSave();
  updateStatus();
});

saveBtn.addEventListener('click', save);
openBtn.addEventListener('click', triggerOpen);
newBtn.addEventListener('click', newNote);
downloadBtn.addEventListener('click', download);

darkToggle.addEventListener('change', e => {
  document.body.classList.toggle('dark', e.target.checked);
  localStorage.setItem(THEME_KEY, e.target.checked ? '1' : '0');
});

function restoreTheme(){
  const t = localStorage.getItem(THEME_KEY) === '1';
  darkToggle.checked = t;
  document.body.classList.toggle('dark', t);
}

window.addEventListener('beforeunload', () => {
  save();
});

// init
restoreTheme();
load();

updateStatus();
