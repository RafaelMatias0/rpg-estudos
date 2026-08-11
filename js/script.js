const STORAGE_KEY = 'jornada-rpg-state-v2';
const XP_PER_MINUTE = 2;

const SEASONS = [
  {id:1, region:'Floresta da Serpente de Código', icon:'🌲', theme:'Python', icon2:'🐍',
   desc:'Domine a linguagem que tudo enreda.', xpTarget:1200,
   equip:{slot:'weapon', icon:'🗡️', name:'Lâmina da Serpente'},
   boss:{title:'O Guardião de Escamas de Código', desc:'Projeto final: construir do zero, sem ajuda de IA, um Sistema Financeiro Pessoal rodando em terminal (cadastro de receitas/despesas, categorias, saldo e histórico).'},
   defaultQuests:[
     {title:'Fundamentos de Python', obj:'Estudar variáveis, tipos e estruturas de controle por 30 minutos.', reward:50},
     {title:'Funções e módulos', obj:'Praticar funções e organização em módulos por 40 minutos.', reward:60},
     {title:'Python para análise de dados', obj:'Estudar 30 minutos de Python para análise de dados (listas, dicionários, pandas básico).', reward:50},
     {title:'Manipulação de arquivos', obj:'Praticar leitura e escrita de arquivos (CSV/JSON) por 30 minutos.', reward:50},
   ]},
  {id:2, region:'Arquivos Submersos', icon:'🏛️', theme:'SQL + PostgreSQL', icon2:'🗄️',
   desc:'Desvende os salões de dados eternos.', xpTarget:1000,
   equip:{slot:'offhand', icon:'🛡️', name:'Escudo das Tabelas'},
   boss:{title:'O Arquivista Selado', desc:'Projeto final: modelar e implementar o banco de dados relacional completo do sistema financeiro, com consultas complexas, joins e procedures, sem ajuda de IA.'},
   defaultQuests:[
     {title:'Fundamentos de SQL', obj:'Estudar SELECT, WHERE, JOIN por 30 minutos.', reward:50},
     {title:'Modelagem de dados', obj:'Praticar modelagem relacional e normalização por 40 minutos.', reward:60},
     {title:'PostgreSQL na prática', obj:'Configurar e usar PostgreSQL localmente por 30 minutos.', reward:50},
   ]},
  {id:3, region:'Fortaleza dos Engenhos', icon:'⚙️', theme:'Backend', icon2:'🔧',
   desc:'Erga muralhas que sustentam reinos.', xpTarget:1400,
   equip:{slot:'armor', icon:'🥋', name:'Armadura do Engenho'},
   boss:{title:'O Colosso de Engrenagens', desc:'Projeto final: construir a API REST completa do sistema financeiro, com autenticação e endpoints CRUD, sem ajuda de IA.'},
   defaultQuests:[
     {title:'Fundamentos de APIs REST', obj:'Estudar conceitos de API REST por 30 minutos.', reward:50},
     {title:'Framework backend', obj:'Praticar rotas e models com FastAPI/Flask por 40 minutos.', reward:60},
     {title:'Autenticação', obj:'Estudar autenticação JWT por 30 minutos.', reward:50},
   ]},
  {id:4, region:'Montanhas dos Fragmentos', icon:'⛰️', theme:'Engenharia de Dados', icon2:'📊',
   desc:'Forje ordem a partir do caos.', xpTarget:1000,
   equip:{slot:'tool', icon:'🔨', name:'Martelo dos Fragmentos'},
   boss:{title:'O Titã de Dados Fragmentados', desc:'Projeto final: construir um pipeline de ETL que processa e transforma os dados do sistema financeiro, sem ajuda de IA.'},
   defaultQuests:[
     {title:'Fundamentos de ETL', obj:'Estudar conceitos de extração, transformação e carga por 30 minutos.', reward:50},
     {title:'Pandas avançado', obj:'Praticar limpeza e transformação de dados por 40 minutos.', reward:60},
   ]},
  {id:5, region:'Reino Suspenso das Nuvens', icon:'☁️', theme:'Cloud', icon2:'🌩️',
   desc:'Ascenda além da terra firme.', xpTarget:900,
   equip:{slot:'cape', icon:'🧣', name:'Manto das Nuvens'},
   boss:{title:'O Tecelão de Tempestades', desc:'Projeto final: fazer o deploy completo do sistema em um provedor de nuvem, com pipeline de CI/CD, sem ajuda de IA.'},
   defaultQuests:[
     {title:'Fundamentos de Cloud', obj:'Estudar conceitos de nuvem (IaaS/PaaS) por 30 minutos.', reward:50},
     {title:'Containers', obj:'Praticar Docker por 40 minutos.', reward:60},
   ]},
  {id:6, region:'Castelo do Julgamento Final', icon:'🏰', theme:'Entrevistas', icon2:'👑',
   desc:'Prove seu valor perante os grandes mestres.', xpTarget:800,
   equip:{slot:'crown', icon:'👑', name:'Coroa do Mestre Completo'},
   boss:{title:'Os Grandes Mestres do Julgamento', desc:'Projeto final: resolver um conjunto de problemas de entrevista técnica e simular entrevistas completas, sem ajuda de IA.'},
   defaultQuests:[
     {title:'Estruturas de dados', obj:'Revisar estruturas de dados por 40 minutos.', reward:60},
     {title:'Simulado de entrevista', obj:'Fazer uma simulação de entrevista técnica.', reward:100},
   ]},
];

const LEVEL_TITLES = [
  {min:1, max:5, title:'Aventureiro Iniciante'},
  {min:6, max:10, title:'Aventureiro Experiente'},
  {min:11, max:20, title:'Guerreiro do Código'},
  {min:21, max:30, title:'Especialista Arcano'},
  {min:31, max:999, title:'Mestre da Jornada'},
];

function seasonQuests(seasonId){
  const s = SEASONS.find(s=>s.id===seasonId);
  return s.defaultQuests.map((q,i)=>({id:`s${seasonId}q${i}`, title:q.title, obj:q.obj, reward:q.reward, done:false}));
}

function defaultState(){
  return {
    name:'Aprendiz',
    level:1, xp:0, xpToNext:100,
    streak:0, lastStudyDate:null, minutesToday:0, todayDateForMinutes:null,
    currentSeason:1,
    seasonXP:0,
    unlockedEquip:[],
    bossBeaten:{},
    quests: seasonQuests(1),
  };
}

let state = defaultState();
let timer = {running:false, accumulated:0, startTimestamp:null, intervalId:null};
let bossConfirmPending = false;

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      state = JSON.parse(raw);
      const label = document.getElementById('lastSavedLabel');
      if(label) label.textContent = new Date().toLocaleTimeString('pt-BR');
    }
  }catch(e){ /* sem estado salvo ainda, ou localStorage indisponível */ }
  checkDailyReset();
  render();
}
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const label = document.getElementById('lastSavedLabel');
    if(label) label.textContent = new Date().toLocaleTimeString('pt-BR');
  }
  catch(e){ console.error('Falha ao salvar', e); showToast('⚠ Não foi possível salvar o progresso agora.'); }
}

function exportProgress(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jornada-rpg-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportado!');
}

function importProgress(file){
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const parsed = JSON.parse(e.target.result);
      if(typeof parsed.level !== 'number' || !Array.isArray(parsed.quests)){
        showToast('Arquivo inválido — não parece um backup da Jornada.');
        return;
      }
      state = parsed;
      checkDailyReset();
      render();
      saveState();
      showToast('Progresso restaurado com sucesso!');
    }catch(err){
      showToast('Não foi possível ler esse arquivo.');
    }
  };
  reader.readAsText(file);
}

function todayStr(){ return new Date().toISOString().slice(0,10); }

function checkDailyReset(){
  const today = todayStr();
  if(state.todayDateForMinutes !== today){
    state.minutesToday = 0;
    state.todayDateForMinutes = today;
  }
}

function registerStudyActivity(){
  const today = todayStr();
  if(state.lastStudyDate === today) return;
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  state.streak = (state.lastStudyDate === yesterday) ? state.streak+1 : 1;
  state.lastStudyDate = today;
}

function levelTitle(level){ return (LEVEL_TITLES.find(t => level>=t.min && level<=t.max) || LEVEL_TITLES[0]).title; }
function xpNeeded(level){ return 100 + (level-1)*40; }
function currentSeasonObj(){ return SEASONS.find(s=>s.id===state.currentSeason) || SEASONS[0]; }

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2400);
}

function gainXP(amount, {isStudy=false}={}){
  state.xp += amount;
  state.seasonXP += amount;
  if(isStudy) registerStudyActivity();
  let leveledUp = false;
  while(state.xp >= state.xpToNext){
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = xpNeeded(state.level);
    leveledUp = true;
  }
  showToast(leveledUp ? `⬆ Nível ${state.level} alcançado! +${amount} XP` : `+${amount} XP`);
  render();
  saveState();
}

function completeQuest(id){
  const q = state.quests.find(q=>q.id===id);
  if(!q || q.done) return;
  q.done = true;
  gainXP(q.reward, {isStudy:true});
}

function openQuestForm(){
  document.getElementById('newQuestForm').style.display = 'block';
  document.getElementById('newQuestTitle').focus();
}
function closeQuestForm(){
  document.getElementById('newQuestForm').style.display = 'none';
  document.getElementById('newQuestTitle').value = '';
  document.getElementById('newQuestObj').value = '';
  document.getElementById('newQuestXP').value = '50';
}
function saveNewQuest(){
  const title = document.getElementById('newQuestTitle').value.trim();
  const obj = document.getElementById('newQuestObj').value.trim();
  const reward = parseInt(document.getElementById('newQuestXP').value) || 50;
  if(!title){
    showToast('Dê um nome para a quest antes de salvar.');
    return;
  }
  state.quests.push({id:'q'+Date.now(), title, obj, reward, done:false});
  closeQuestForm();
  render();
  saveState();
  showToast('Nova quest adicionada ao quadro!');
}

function beatBoss(){
  const season = currentSeasonObj();
  if(state.bossBeaten[season.id]) return;
  state.bossBeaten[season.id] = true;
  if(!state.unlockedEquip.includes(season.id)) state.unlockedEquip.push(season.id);
  gainXP(300, {isStudy:true});
  const next = SEASONS.find(s=>s.id===season.id+1);
  if(next){
    state.currentSeason = next.id;
    state.seasonXP = 0;
    state.quests = seasonQuests(next.id);
    showToast(`🏆 Boss derrotado! Bem-vindo(a) a ${next.region}`);
  } else {
    showToast('🏆 Jornada completa! Você alcançou o fim da campanha.');
  }
  render();
  saveState();
}

/* --- Timer de estudo ---
   Baseado em timestamp real (não em contagem de "ticks"), para não perder tempo
   quando a aba fica em segundo plano ou minimizada (o navegador pode pausar/atrasar
   o setInterval, mas não altera o relógio do sistema). O estado do timer também é
   salvo no localStorage a cada mudança, então mesmo que a página seja recarregada
   sem querer, o tempo já decorrido é recuperado. */
const TIMER_KEY = 'jornada-rpg-timer-v1';

function formatTime(totalSeconds){
  const h = String(Math.floor(totalSeconds/3600)).padStart(2,'0');
  const m = String(Math.floor((totalSeconds%3600)/60)).padStart(2,'0');
  const s = String(totalSeconds%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function currentElapsedSeconds(){
  const running = timer.running ? (Date.now() - timer.startTimestamp)/1000 : 0;
  return Math.floor(timer.accumulated + running);
}

function saveTimerState(){
  try{
    localStorage.setItem(TIMER_KEY, JSON.stringify({
      running: timer.running,
      accumulated: timer.accumulated,
      startTimestamp: timer.startTimestamp,
    }));
  }catch(e){ /* silencioso */ }
}

function clearTimerState(){
  try{ localStorage.removeItem(TIMER_KEY); }catch(e){ /* silencioso */ }
}

function restoreTimerState(){
  try{
    const raw = localStorage.getItem(TIMER_KEY);
    if(!raw) return;
    const saved = JSON.parse(raw);
    if(saved.running){
      timer.accumulated = saved.accumulated;
      timer.startTimestamp = saved.startTimestamp;
      timer.running = true;
      timer.intervalId = setInterval(tickTimer, 1000);
      document.getElementById('timerStartBtn').disabled = true;
      document.getElementById('timerPauseBtn').disabled = false;
      document.getElementById('timerStopBtn').disabled = false;
      showToast('⏳ Sessão de estudo recuperada — o tempo continuou contando.');
    } else if(saved.accumulated > 0){
      timer.accumulated = saved.accumulated;
      document.getElementById('timerPauseBtn').disabled = true;
      document.getElementById('timerStopBtn').disabled = false;
    }
    document.getElementById('timerDisplay').textContent = formatTime(currentElapsedSeconds());
  }catch(e){ /* sem sessão salva */ }
}

function tickTimer(){
  document.getElementById('timerDisplay').textContent = formatTime(currentElapsedSeconds());
}

function startTimer(){
  timer.running = true;
  timer.startTimestamp = Date.now();
  timer.intervalId = setInterval(tickTimer, 1000);
  document.getElementById('timerStartBtn').disabled = true;
  document.getElementById('timerPauseBtn').disabled = false;
  document.getElementById('timerStopBtn').disabled = false;
  saveTimerState();
}
function pauseTimer(){
  timer.accumulated += (Date.now() - timer.startTimestamp)/1000;
  timer.running = false;
  clearInterval(timer.intervalId);
  document.getElementById('timerStartBtn').disabled = false;
  document.getElementById('timerPauseBtn').disabled = true;
  document.getElementById('timerDisplay').textContent = formatTime(currentElapsedSeconds());
  saveTimerState();
}
function stopTimer(){
  const totalSeconds = currentElapsedSeconds();
  clearInterval(timer.intervalId);
  const minutes = Math.floor(totalSeconds/60);
  if(minutes < 1){
    showToast('Estude por pelo menos 1 minuto para ganhar XP.');
  } else {
    const earned = minutes * XP_PER_MINUTE;
    state.minutesToday += minutes;
    gainXP(earned, {isStudy:true});
  }
  timer.accumulated = 0;
  timer.running = false;
  timer.startTimestamp = null;
  document.getElementById('timerDisplay').textContent = formatTime(0);
  document.getElementById('timerStartBtn').disabled = false;
  document.getElementById('timerPauseBtn').disabled = true;
  document.getElementById('timerStopBtn').disabled = true;
  clearTimerState();
  renderStudy();
  saveState();
}

/* Ajuste manual — rede de segurança para quando o cronômetro falhar por
   qualquer motivo e o usuário já sabe quanto tempo estudou. */
function openManualTimeForm(){
  document.getElementById('manualTimeForm').style.display = 'block';
}
function closeManualTimeForm(){
  document.getElementById('manualTimeForm').style.display = 'none';
  document.getElementById('manualHours').value = '0';
  document.getElementById('manualMinutes').value = '0';
}
function applyManualTime(){
  const hours = parseInt(document.getElementById('manualHours').value) || 0;
  const minutes = parseInt(document.getElementById('manualMinutes').value) || 0;
  const totalMinutes = hours*60 + minutes;
  if(totalMinutes < 1){
    showToast('Informe pelo menos 1 minuto.');
    return;
  }
  if(timer.running){
    timer.accumulated += (Date.now() - timer.startTimestamp)/1000;
    timer.startTimestamp = Date.now();
  }
  timer.accumulated += totalMinutes*60;
  document.getElementById('timerDisplay').textContent = formatTime(currentElapsedSeconds());
  document.getElementById('timerStopBtn').disabled = false;
  saveTimerState();
  closeManualTimeForm();
  showToast(`Adicionado(s) ${totalMinutes} minuto(s) ao cronômetro.`);
}

/* --- Personagem ilustrado (mais detalhado que silhueta) --- */
function charSVG(){
  const hasWeapon = state.unlockedEquip.includes(1);
  const hasShield = state.unlockedEquip.includes(2);
  const hasArmor = state.unlockedEquip.includes(3);
  const hasTool = state.unlockedEquip.includes(4);
  const hasCape = state.unlockedEquip.includes(5);
  const hasCrown = state.unlockedEquip.includes(6);

  // Faixa de nível: 0=1-5, 1=6-10, 2=11-20, 3=21-30, 4=30+
  const tierIndex = Math.max(0, LEVEL_TITLES.findIndex(t => state.level>=t.min && state.level<=t.max));
  const tierPalette = ['#3f6e4e', '#3a7a5a', '#2f7078', '#4a4a8a', '#6a3f8a'];
  const tierShade   = ['#2c4d38', '#285940', '#1f4f56', '#333366', '#4a2c60'];
  const tunicColor = hasArmor ? '#7d8a99' : tierPalette[tierIndex];
  const tunicShade = hasArmor ? '#5f6c7a' : tierShade[tierIndex];
  const eyeColor = tierIndex>=4 ? '#e8c368' : '#2b2013';
  const auraOpacity = tierIndex>=3 ? (tierIndex>=4 ? 0.30 : 0.16) : 0;

  return `
  <defs>
    <radialGradient id="glow" cx="50%" cy="25%" r="55%">
      <stop offset="0%" stop-color="#e8c368" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#e8c368" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0c79a"/>
      <stop offset="100%" stop-color="#dba872"/>
    </linearGradient>
  </defs>
  <circle cx="70" cy="70" r="46" fill="url(#glow)"/>
  ${auraOpacity>0 ? `<circle cx="70" cy="120" r="72" fill="none" stroke="#9a7de0" stroke-width="3" opacity="${auraOpacity}"/>` : ''}
  <ellipse cx="70" cy="205" rx="40" ry="7" fill="#000" opacity="0.35"/>

  ${hasCape ? '<path d="M42 90 Q6 130 24 195 L52 182 Q40 135 50 95 Z" fill="#4a5fa0"/><path d="M42 90 Q6 130 24 195 L52 182 Q40 135 50 95 Z" fill="#000" opacity="0.12"/>' : ''}

  <!-- pernas -->
  <rect x="55" y="150" width="12" height="42" rx="4" fill="#4a3826"/>
  <rect x="73" y="150" width="12" height="42" rx="4" fill="#4a3826"/>
  <rect x="52" y="186" width="18" height="10" rx="3" fill="#2b2013"/>
  <rect x="70" y="186" width="18" height="10" rx="3" fill="#2b2013"/>

  <!-- tronco / tunica -->
  <path d="M48 100 Q70 88 92 100 L96 158 Q70 168 44 158 Z" fill="${tunicColor}"/>
  <path d="M48 100 Q70 88 92 100 L96 112 Q70 122 44 112 Z" fill="${tunicShade}"/>
  <rect x="62" y="132" width="16" height="8" rx="2" fill="#8a6b2c"/>

  <!-- braços -->
  <path d="M46 104 Q30 118 32 148 L44 150 Q46 122 54 106 Z" fill="${tunicColor}"/>
  <path d="M94 104 Q110 118 108 148 L96 150 Q94 122 86 106 Z" fill="${tunicColor}"/>
  <circle cx="33" cy="150" r="7" fill="url(#skin)"/>
  <circle cx="107" cy="150" r="7" fill="url(#skin)"/>

  ${tierIndex>=1 ? '<rect x="27" y="141" width="12" height="8" rx="2" fill="#6b4a2c"/><rect x="101" y="141" width="12" height="8" rx="2" fill="#6b4a2c"/>' : ''}
  ${tierIndex>=2 ? '<circle cx="46" cy="103" r="8" fill="#8a6b2c"/><circle cx="94" cy="103" r="8" fill="#8a6b2c"/>' : ''}

  <!-- cabeça -->
  <circle cx="70" cy="62" r="26" fill="url(#skin)"/>
  <path d="M44 58 Q70 24 96 58 Q98 40 70 32 Q42 40 44 58 Z" fill="#5b3d26"/>
  <path d="M50 48 Q70 40 90 48" stroke="#3d2818" stroke-width="3" fill="none" opacity="0.5"/>
  <circle cx="61" cy="64" r="2.6" fill="${eyeColor}"/>
  <circle cx="79" cy="64" r="2.6" fill="${eyeColor}"/>
  <path d="M62 76 Q70 81 78 76" stroke="#7a4a30" stroke-width="2.4" fill="none" stroke-linecap="round"/>

  ${hasCrown ? '<path d="M48 34 L54 18 L62 30 L70 12 L78 30 L86 18 L92 34 Z" fill="#e8c368" stroke="#a3812f" stroke-width="1.5"/><circle cx="70" cy="16" r="3" fill="#b3493d"/>' : ''}

  <!-- cinto -->
  <rect x="48" y="138" width="44" height="9" rx="2" fill="#5c4128"/>
  <circle cx="70" cy="142" r="4" fill="${tierIndex>=3 ? '#9a7de0' : '#c9a24a'}"/>

  ${hasShield ? '<path d="M20 108 L42 102 L42 140 L20 152 Q14 128 20 108 Z" fill="#3f7a5c" stroke="#264d3a" stroke-width="2"/><path d="M31 112 v30 M22 122 h18" stroke="#264d3a" stroke-width="2"/>' : ''}

  ${hasTool ? '<rect x="98" y="60" width="6" height="46" fill="#6b5225" transform="rotate(24 101 83)"/><rect x="92" y="52" width="20" height="14" rx="2" fill="#8a8a8a" stroke="#4a4a4a" transform="rotate(24 101 83)"/>' : ''}

  ${hasWeapon ? '<rect x="100" y="40" width="7" height="86" fill="#c9d2d8" stroke="#333" stroke-width="1" transform="rotate(20 103 83)"/><rect x="95" y="118" width="17" height="9" fill="#7a5a3a" transform="rotate(20 103 83)"/><path d="M103 40 l4 -8 l4 8 Z" fill="#3f7a5c" transform="rotate(20 103 83)"/>' : ''}
  `;
}

function renderCharacter(){
  const svgInner = charSVG();
  document.getElementById('charSvg').innerHTML = svgInner;
  document.getElementById('charSvg2').innerHTML = svgInner;
  const title = levelTitle(state.level);
  document.getElementById('charName').textContent = state.name;
  document.getElementById('charTitle').textContent = title;
  document.getElementById('charName2').textContent = state.name;
  document.getElementById('charTitle2').textContent = title;
  document.getElementById('charEvoDesc').textContent = `Nível ${state.level} — ${title}`;
}

function renderHome(){
  document.getElementById('levelBadge').textContent = state.level;
  document.getElementById('levelBadge2').textContent = state.level;
  const pct = Math.min(100, Math.round((state.xp/state.xpToNext)*100));
  document.getElementById('xpBar').style.width = pct+'%';
  document.getElementById('xpBar2').style.width = pct+'%';
  document.getElementById('xpText').textContent = `${state.xp} / ${state.xpToNext} XP`;
  document.getElementById('xpText2').textContent = `${state.xp} / ${state.xpToNext} XP`;
  document.getElementById('streakVal').textContent = state.streak;

  const season = currentSeasonObj();
  document.getElementById('seasonName').textContent = `${season.icon2} ${season.theme}`;
  document.getElementById('seasonDesc').textContent = season.desc;
  const seasonPct = Math.min(100, Math.round((state.seasonXP/season.xpTarget)*100));
  document.getElementById('seasonProgress').style.width = seasonPct+'%';
  const remaining = Math.max(0, season.xpTarget - state.seasonXP);
  document.getElementById('seasonProgressText').textContent =
    remaining>0 ? `${state.seasonXP} / ${season.xpTarget} XP — faltam ${remaining} XP para desafiar o Boss`
                : `Meta de XP atingida — o Boss "${season.boss.title}" está desbloqueado!`;

  const nextQuest = state.quests.find(q=>!q.done);
  document.getElementById('currentQuestTitle').textContent = nextQuest ? nextQuest.title : 'Todas as quests da temporada concluídas!';
  document.getElementById('currentQuestObj').textContent = nextQuest ? nextQuest.obj : 'Volte ao Mapa para encarar o Boss quando estiver pronto.';
}

function renderMap(){
  const wrap = document.getElementById('mapWrap');
  wrap.innerHTML = '';
  SEASONS.forEach((s, idx) => {
    const status = s.id < state.currentSeason ? 'done' : (s.id === state.currentSeason ? 'current' : 'locked');
    const badge = status==='done' ? 'Conquistada' : status==='current' ? 'Em curso' : 'Bloqueada';
    const div = document.createElement('div');
    div.className = `region ${status}`;
    div.innerHTML = `
      <div class="icon">${s.icon}</div>
      <div class="info">
        <h4>${s.region}</h4>
        <div class="sub">${status==='locked' ? '???' : s.theme+' — '+s.desc}</div>
      </div>
      <div class="badge">${badge}</div>`;
    wrap.appendChild(div);
    if(idx < SEASONS.length-1){
      const c = document.createElement('div');
      c.className = 'connector';
      wrap.appendChild(c);
    }
  });

  const season = currentSeasonObj();
  const beaten = !!state.bossBeaten[season.id];
  const unlocked = state.seasonXP >= season.xpTarget;
  const bossPanel = document.getElementById('bossPanel');
  bossPanel.innerHTML = `
    <div class="boss-card ${beaten?'beaten':''}">
      <div class="eyebrow">${beaten ? 'Boss derrotado' : 'Boss da Temporada'}</div>
      <h3>${season.icon2} ${season.boss.title}</h3>
      <p>${season.boss.desc}</p>
      ${beaten
        ? `<span class="locked-note">Você já provou seu valor nesta temporada.</span>`
        : unlocked
          ? (bossConfirmPending
              ? `<p style="font-size:0.85rem;color:var(--parchment);">Confirma que concluiu, sozinho e sem ajuda de IA, o projeto acima?</p>
                 <div style="display:flex;gap:10px;"><button class="btn danger" id="beatBossYesBtn">Sim, derrotei o Boss</button><button class="btn secondary" id="beatBossNoBtn">Ainda não</button></div>`
              : `<button class="btn danger" id="beatBossBtn">Marcar Boss como Derrotado</button>`)
          : `<span class="locked-note">Acumule ${season.xpTarget} XP na temporada para desbloquear o desafio (faltam ${Math.max(0,season.xpTarget-state.seasonXP)} XP).</span>`}
    </div>`;
  const btn = document.getElementById('beatBossBtn');
  if(btn) btn.addEventListener('click', ()=>{ bossConfirmPending = true; renderMap(); });
  const yesBtn = document.getElementById('beatBossYesBtn');
  if(yesBtn) yesBtn.addEventListener('click', ()=>{ bossConfirmPending = false; beatBoss(); });
  const noBtn = document.getElementById('beatBossNoBtn');
  if(noBtn) noBtn.addEventListener('click', ()=>{ bossConfirmPending = false; renderMap(); });
}

function renderQuests(){
  const season = currentSeasonObj();
  document.getElementById('questSeasonLabel').textContent = `${season.icon2} ${season.theme}`;
  const list = document.getElementById('questList');
  list.innerHTML = '';
  state.quests.forEach(q=>{
    const div = document.createElement('div');
    div.className = 'quest' + (q.done ? ' done' : '');
    div.innerHTML = `
      <div class="quest-icon">📖</div>
      <div class="quest-body">
        <h4>${q.title}</h4>
        <div class="obj">${q.obj}</div>
      </div>
      <div class="quest-reward">+${q.reward} XP</div>
      <button class="quest-check" data-id="${q.id}">${q.done ? '✓' : ''}</button>`;
    list.appendChild(div);
  });
  list.querySelectorAll('.quest-check').forEach(btn=>{
    btn.addEventListener('click', ()=>completeQuest(btn.dataset.id));
  });
}

function renderEquip(){
  const grid = document.getElementById('equipGrid');
  grid.innerHTML = '';
  SEASONS.forEach(s=>{
    const unlocked = state.unlockedEquip.includes(s.id);
    const div = document.createElement('div');
    div.className = 'equip-slot';
    div.style.opacity = unlocked ? '1' : '0.35';
    div.innerHTML = `
      <div class="icon">${s.equip.icon}</div>
      <div class="label">${s.equip.slot}</div>
      <div class="name">${unlocked ? s.equip.name : '???'}</div>`;
    grid.appendChild(div);
  });
}

function renderStudy(){
  document.getElementById('minutesToday').textContent = state.minutesToday;
  document.getElementById('rateLabel').textContent = XP_PER_MINUTE;
}

function render(){
  renderCharacter();
  renderHome();
  renderMap();
  renderQuests();
  renderEquip();
  renderStudy();
}

document.querySelectorAll('nav.tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.app > section').forEach(s=>s.style.display='none');
    document.getElementById('tab-'+btn.dataset.tab).style.display='block';
  });
});

document.getElementById('addQuestBtn').addEventListener('click', openQuestForm);
document.getElementById('saveQuestBtn').addEventListener('click', saveNewQuest);
document.getElementById('cancelQuestBtn').addEventListener('click', closeQuestForm);
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importBtn').addEventListener('click', ()=>document.getElementById('importFile').click());
document.getElementById('importFile').addEventListener('change', (e)=>{
  if(e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('timerStartBtn').addEventListener('click', startTimer);
document.getElementById('timerPauseBtn').addEventListener('click', pauseTimer);
document.getElementById('timerStopBtn').addEventListener('click', stopTimer);
document.getElementById('manualTimeBtn').addEventListener('click', openManualTimeForm);
document.getElementById('applyManualTimeBtn').addEventListener('click', applyManualTime);
document.getElementById('cancelManualTimeBtn').addEventListener('click', closeManualTimeForm);

// Ao voltar para a aba, atualiza o mostrador imediatamente com o tempo real
// decorrido (o cálculo é sempre por timestamp, então nada se perde).
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState === 'visible' && timer.running){
    document.getElementById('timerDisplay').textContent = formatTime(currentElapsedSeconds());
  }
});

loadState();
restoreTimerState();