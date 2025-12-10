// Initialize Hostinger API (will be created on page load)
var hostingerAPI;

// Multiplayer state
const multiplayerState = {
  isLoggedIn: false,
  currentLocation: 'world',
  otherPlayers: {},
  chatMessages: [],
  lastChatId: 0,
  updateInterval: null,
  chatUpdateInterval: null
};

// ------------------ BASIC STATE ------------------
const playerState = {
  name: 'Player',
  currency: 0,
  characterId: null,
  items: [],
  ownedPets: [],
  // inventory holds counts of consumables and caught fish
  inventory: {
    salmon: 0,
    trout: 0
  },
  totalMinutesStudied: 0,
  completedSessions: 0,
  petType: null,
  petHunger: 0,
  petFood: 0,
  x: 250,
  y: 250
};

const shopItems = [
  { id: 'pet_cat', name: 'Cat', price: 1, emoji: '🐱', category: 'pet', petType: 'cat', imgSrc: 'img/pet_cat.png' },
  { id: 'pet_dog', name: 'Dog', price: 1, emoji: '🐶', category: 'pet', petType: 'dog', imgSrc: 'img/pet_dog.png' },
  { id: 'pet_chicken', name: 'Chicken', price: 5, emoji: '🐔', category: 'pet', petType: 'chicken', imgSrc: 'img/chicken.png' },
  { id: 'pet_deer', name: 'Deer', price: 50, emoji: '🦌', category: 'pet', petType: 'deer', imgSrc: 'img/deer.png' },
  { id: 'pet_fox', name: 'Fox', price: 50, emoji: '🦊', category: 'pet', petType: 'fox', imgSrc: 'img/fox.png' },
  { id: 'pet_hamster', name: 'Hamster', price: 50, emoji: '�', category: 'pet', petType: 'hamster', imgSrc: 'img/hamster.png' },
  { id: 'pet_hedgehog', name: 'Hedgehog', price: 5, emoji: '🦔', category: 'pet', petType: 'hedgehog', imgSrc: 'img/hedgehog.png' },
  { id: 'pet_jellycat', name: 'Jellycat', price: 50, emoji: '🪼', category: 'pet', petType: 'jellycat', imgSrc: 'img/jellycat.png' },
  { id: 'pet_sloth', name: 'Sloth', price: 50, emoji: '🦥', category: 'pet', petType: 'sloth', imgSrc: 'img/sloth.png' },
  { id: 'pet_cloud', name: 'Cloud', price: 50, emoji: '☁️', category: 'pet', petType: 'cloud', imgSrc: 'img/cloud.png' },
  { id: 'pet_succulent', name: 'Succulent', price: 50, emoji: '🌵', category: 'pet', petType: 'succulent', imgSrc: 'img/succulent.png' },
  { id: 'pet_snack', name: 'Pet Snack', price: 1, emoji: '🍖', category: 'food' },
];

const CURRENCY_ICON = "🍄";
const heartImages = ['img/heart_low.png','img/heart_half.png','img/heart_full.png'];

// ------------------ DOM REFERENCES ------------------
const gameArea          = document.getElementById('gameArea');
const player            = document.getElementById('player');
const playerSprite      = document.getElementById('playerSprite');
const petContainer      = document.getElementById('petContainer');
const petSprite         = document.getElementById('petSprite');
const petHeart          = document.getElementById('petHeart');
const roomItemsLayer    = document.getElementById('roomItemsLayer');
const coinCountSpan     = document.getElementById('coinCount');
const currentUserLabel  = document.getElementById('currentUserLabel');
const onlineCountSpan   = document.getElementById('onlineCount');
const minutesInput      = document.getElementById('minutesInput');
const startBtn          = document.getElementById('startStudyBtn');
const stopBtn           = document.getElementById('stopStudyBtn');
const openShopBtn       = document.getElementById('openShopBtn');
const openInventoryBtn  = document.getElementById('openInventoryBtn');
const toggleViewBtn     = document.getElementById('toggleViewBtn');
const feedPetBtn        = document.getElementById('feedPetBtn');
const foodCountSpan     = document.getElementById('foodCount');
const studyOverlay      = document.getElementById('studyOverlay');
const stopStudyOverlayBtn = document.getElementById('stopStudyOverlayBtn');
const bubbleContainer   = document.getElementById('bubbleContainer');
const shopOverlay       = document.getElementById('shopOverlay');
const shopItemsContainer= document.getElementById('shopItemsContainer');
const shopCoinsDisplay  = document.getElementById('shopCoinsDisplay');
const closeShopBtn      = document.getElementById('closeShopBtn');
const characterOverlay  = document.getElementById('characterOverlay');
const loginOverlay      = document.getElementById('loginOverlay');
const usernameInput     = document.getElementById('usernameInput');
const loginBtn          = document.getElementById('loginBtn');
const fullscreenBtn     = document.getElementById('fullscreenBtn');
const zoomInBtn         = document.getElementById('zoomInBtn');
const zoomOutBtn        = document.getElementById('zoomOutBtn');
const otherPlayersLayer = document.getElementById('otherPlayersLayer');
const openChatBtn       = document.getElementById('openChatBtn');
const chatBox           = document.getElementById('chatBox');
const chatMessagesDiv   = document.getElementById('chatMessages');
const chatInput         = document.getElementById('chatInput');
const sendChatBtn       = document.getElementById('sendChatBtn');
const closeChatBtn      = document.getElementById('closeChatBtn');
// studyKeycapture, focusHint and related keypress-capture elements were removed from the UI

const pond1Btn          = document.getElementById("pond1-btn");
const pond2Btn          = document.getElementById("pond2-btn");
const worldImg          = document.getElementById("worldImage");

const fishingOverlay    = document.getElementById("fishingOverlay");
const fishingGif        = document.getElementById("fishingGif");
const catchMessage      = document.getElementById("catchMessage");

const tabNotification   = document.getElementById("tabNotification");
const tabKeypressCount  = document.getElementById("tabKeypressCount");
const closeTabNotification = document.getElementById("closeTabNotification");

const inventoryOverlay  = document.getElementById("inventoryOverlay");
const closeInventoryBtn = document.getElementById("closeInventoryBtn");
const ownedPetsContainer = document.getElementById("ownedPetsContainer");
const fishContainer     = document.getElementById("fishContainer");
const snacksContainer   = document.getElementById("snacksContainer");

// Music Player DOM references
const toggleMusicBtn    = document.getElementById("toggleMusicBtn");
const musicPlayer       = document.getElementById("musicPlayer");
const closeMusicBtn     = document.getElementById("closeMusicBtn");
const playPauseBtn      = document.getElementById("playPauseBtn");
const prevTrackBtn      = document.getElementById("prevTrackBtn");
const nextTrackBtn      = document.getElementById("nextTrackBtn");
const volumeSlider      = document.getElementById("volumeSlider");
const volumeLabel       = document.getElementById("volumeLabel");
const trackInfo         = document.getElementById("trackInfo");
const musicAudio        = document.getElementById("musicAudio");

// ------------------ MUSIC PLAYER ------------------
const musicPlaylist = [
  { name: "Cozy Jazz Cafe", url: "music/cozy-jazz-cafe-relaxing-podcast-r-background-music-202447.mp3" },
  { name: "Cozy Room Piano Jazz", url: "music/cozy-room-piano-jazz-lo-fi-259193.mp3" },
  { name: "Christmas Jazz", url: "music/the-christmas-jazz-436621.mp3" }
];

let currentTrackIndex = 0;
let isPlaying = false;

// ==================== TODO LIST ==================== 
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoItems = document.getElementById('todoItems');
const toggleTodoBtn = document.getElementById('toggleTodoBtn');
const todoList = document.getElementById('todoList');

let todos = [];

function loadTodos() {
  const stored = localStorage.getItem('studyshroom_todos');
  if (stored) {
    todos = JSON.parse(stored);
    renderTodos();
  }
}

function saveTodos() {
  localStorage.setItem('studyshroom_todos', JSON.stringify(todos));
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  
  const todo = {
    id: Date.now(),
    text: text,
    completed: false
  };
  
  todos.push(todo);
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
    
    // Award 5 mushrooms for completing task
    if (todo.completed) {
      playerState.currency += 5;
      updateHUD();
      hostingerAPI.savePlayer(playerState);
      
      // Show reward notification
      const todoEl = document.querySelector(`[data-todo-id="${id}"]`);
      if (todoEl) {
        const reward = document.createElement('div');
        reward.textContent = '+5 🍄';
        reward.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #8bc34a; font-weight: bold; animation: fadeOut 1.5s forwards;';
        todoEl.style.position = 'relative';
        todoEl.appendChild(reward);
        setTimeout(() => reward.remove(), 1500);
      }
    }
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function renderTodos() {
  todoItems.innerHTML = '';
  todos.forEach(todo => {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.setAttribute('data-todo-id', todo.id);
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.addEventListener('click', () => toggleTodo(todo.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    
    div.appendChild(checkbox);
    div.appendChild(text);
    div.appendChild(deleteBtn);
    todoItems.appendChild(div);
  });
}

// Toggle todo list collapse
toggleTodoBtn.addEventListener('click', () => {
  const isCollapsed = todoItems.style.display === 'none';
  todoItems.style.display = isCollapsed ? 'block' : 'none';
  document.querySelector('.todo-input-area').style.display = isCollapsed ? 'flex' : 'none';
  toggleTodoBtn.textContent = isCollapsed ? '−' : '+';
});

// Add todo on button click
addTodoBtn.addEventListener('click', addTodo);

// Add todo on Enter key
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});

// Initialize music player
function initMusicPlayer() {
  // Load saved volume preference
  const savedVolume = localStorage.getItem('studyshroom_music_volume');
  if (savedVolume !== null) {
    volumeSlider.value = savedVolume;
    musicAudio.volume = savedVolume / 100;
    volumeLabel.textContent = `${savedVolume}%`;
  } else {
    musicAudio.volume = 0.5;
  }

  // Toggle music player visibility
  toggleMusicBtn.addEventListener('click', () => {
    musicPlayer.style.display = musicPlayer.style.display === 'none' ? 'block' : 'none';
  });

  closeMusicBtn.addEventListener('click', () => {
    musicPlayer.style.display = 'none';
  });

  // Play/Pause
  playPauseBtn.addEventListener('click', togglePlayPause);

  // Previous track
  prevTrackBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length;
    loadTrack();
    if (isPlaying) musicAudio.play();
  });

  // Next track
  nextTrackBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    loadTrack();
    if (isPlaying) musicAudio.play();
  });

  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    musicAudio.volume = volume / 100;
    volumeLabel.textContent = `${volume}%`;
    localStorage.setItem('studyshroom_music_volume', volume);
  });

  // Auto-advance to next track when current track ends
  musicAudio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    loadTrack();
    musicAudio.play();
  });

  // Update UI when track is ready
  musicAudio.addEventListener('loadeddata', () => {
    updateTrackInfo();
  });
}

function loadTrack() {
  const track = musicPlaylist[currentTrackIndex];
  console.log('Loading track:', track.name, track.url);
  musicAudio.src = track.url;
  musicAudio.load(); // Force reload
  updateTrackInfo();
}

function togglePlayPause() {
  if (isPlaying) {
    musicAudio.pause();
    playPauseBtn.textContent = '▶️';
    isPlaying = false;
    console.log('Music paused');
  } else {
    if (!musicAudio.src) {
      loadTrack();
    }
    console.log('Attempting to play music...');
    console.log('Audio element:', musicAudio);
    console.log('Audio src:', musicAudio.src);
    console.log('Audio volume:', musicAudio.volume);
    
    musicAudio.play().then(() => {
      console.log('Music playing successfully!');
      playPauseBtn.textContent = '⏸️';
      isPlaying = true;
    }).catch(err => {
      console.error('Audio play failed:', err);
      alert('Audio play failed: ' + err.message + '\nCheck console for details.');
      trackInfo.textContent = 'Error: ' + err.message;
      playPauseBtn.textContent = '▶️';
      isPlaying = false;
    });
  }
}

function updateTrackInfo() {
  const track = musicPlaylist[currentTrackIndex];
  trackInfo.textContent = `${currentTrackIndex + 1}/${musicPlaylist.length}: ${track.name}`;
}

// ------------------ WORLD / MOVEMENT ------------------
const VIEW_W = 1100, VIEW_H = 600;
const WORLD_W = 3000, WORLD_H = 3000;

let playerX = 1550, playerY = 2425;
let isStudying = false;
let inCafe = false;
let presenceUpdateTimeout = null;

function updatePlayerPosition() {
  if (!inCafe) {
    // Outside: pan the world image to keep player centered
    const offsetX = -(playerX - VIEW_W / 2);
    const offsetY = -(playerY - VIEW_H / 2);
    worldImg.style.left = offsetX + "px";
    worldImg.style.top = offsetY + "px";
    player.style.left = VIEW_W / 2 + "px";
    player.style.top = VIEW_H / 2 + "px";
    updatePondButtons(); // Update pond button positions when world pans
  } else {
    // Cafe: player positioned absolutely (uses playerX and playerY directly)
    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
    gameArea.style.backgroundPosition = "center";
  }

  // Position pet to trail the player
  if (petContainer && petContainer.style.display !== 'none') {
    if (!inCafe) {
      petContainer.style.left = (VIEW_W / 2 - 30) + 'px';
      petContainer.style.top  = (VIEW_H / 2 + 20) + 'px';
    } else {
      petContainer.style.left = (playerX - 30) + 'px';
      petContainer.style.top  = (playerY + 20) + 'px';
    }
  }

  // Sync state for presence updates
  playerState.x = playerX;
  playerState.y = playerY;
  if (multiplayerState.isLoggedIn) schedulePresenceUpdate();
}

// ------------------ ZOOM ------------------
let zoomLevel = 1;
const MIN_ZOOM = 0.8, MAX_ZOOM = 1.6, ZOOM_STEP = 0.1;
function updateZoom() { gameArea.style.transform = `scale(${zoomLevel})`; }
zoomInBtn.addEventListener('click', ()=>{zoomLevel=Math.min(MAX_ZOOM,zoomLevel+ZOOM_STEP);updateZoom();});
zoomOutBtn.addEventListener('click', ()=>{zoomLevel=Math.max(MIN_ZOOM,zoomLevel-ZOOM_STEP);updateZoom();});

// ------------------ LOGIN ------------------
if (loginBtn) {
  loginBtn.addEventListener('click', handleLogin);
  usernameInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter') handleLogin(); });
}

// ------------------ FULLSCREEN ------------------
fullscreenBtn.addEventListener('click', ()=>{
  if (!document.fullscreenElement) {
    gameArea.requestFullscreen().catch(err => console.log(`Fullscreen error: ${err.message}`));
  } else {
    document.exitFullscreen();
  }
});

// ------------------ CHARACTER SELECT ------------------
function applyCharacterSelection(charId, src){
  playerState.characterId = charId;
  playerSprite.src = src || `img/char_${charId}.png`;
  const username = playerState.name || localStorage.getItem('studyshroom_username') || 'player';
  localStorage.setItem(`studyshroom_char_selected_${username}`, '1');
  // Save the actual character choice so we can restore it on page refresh
  localStorage.setItem(`studyshroom_selected_char_${username}`, charId);
  characterOverlay.style.display = 'none';
  hostingerAPI.savePlayer(playerState);
  updatePlayerPosition();
}

document.querySelectorAll('.char-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    console.log('Character selected:', card.dataset.charId);
    applyCharacterSelection(card.dataset.charId, card.dataset.src);
    console.log('Character overlay hidden, player sprite updated to:', card.dataset.src);
  });
});

// ------------------ PET ------------------
function updatePetUI(){
  if(!playerState.petType){ petContainer.style.display='none'; feedPetBtn.disabled=true; return; }
  petContainer.style.display='block';
  // Get pet image source from shopItems or use default mapping
  const petItem = shopItems.find(item => item.petType === playerState.petType);
  const petImgSrc = petItem?.imgSrc || `img/${playerState.petType}.png`;
  
  console.log(`Setting pet to ${playerState.petType}, image: ${petImgSrc}`);
  
  // Always show petSprite and remove any emoji backups
  const oldBackup = document.getElementById('petEmojiBackup');
  if(oldBackup) oldBackup.remove();
  
  petSprite.style.display = 'block';
  petSprite.style.visibility = 'visible';
  petSprite.style.opacity = '1';
  petSprite.alt = `${playerState.petType} pet`;
  
  // Force reload by adding timestamp
  const timestamp = new Date().getTime();
  petSprite.src = `${petImgSrc}?t=${timestamp}`;
  
  petSprite.onload = ()=>{
    console.log('Pet image loaded successfully:', petImgSrc);
  };
  
  petSprite.onerror = ()=>{
    console.error('Pet image failed to load:', petImgSrc);
  };


  const level = Math.max(0,Math.min(2,playerState.petHunger));
  petHeart.src = heartImages[level];
  // Allow feeding if there is either a pet snack or any fish in inventory
  const hasFish = (playerState.inventory.salmon || 0) + (playerState.inventory.trout || 0) > 0;
  feedPetBtn.disabled = playerState.petFood<=0 && !hasFish;
}
feedPetBtn.addEventListener('click',()=>{
  if(!playerState.petType) return alert('Adopt a pet first!');
  if(playerState.petHunger>=2) return alert('Your pet is full ❤️');

  // Prefer feeding with fish from inventory; fall back to pet snacks
  if ((playerState.inventory.salmon || 0) > 0) {
    playerState.inventory.salmon = Math.max(0, playerState.inventory.salmon - 1);
    console.log('Fed pet with a salmon from inventory');
  } else if ((playerState.inventory.trout || 0) > 0) {
    playerState.inventory.trout = Math.max(0, playerState.inventory.trout - 1);
    console.log('Fed pet with a trout from inventory');
  } else if (playerState.petFood > 0) {
    playerState.petFood--;
    console.log('Fed pet with a purchased snack');
  } else {
    return alert('No food available. Catch fish or buy a snack in the shop.');
  }

  playerState.petHunger++;
  updateHUD();
  updatePetUI();
  hostingerAPI.savePlayer(playerState);
});

// ------------------ STUDY SYSTEM (DURATION-BASED, WITH TIMER AND MUSHROOM REWARDS) ------------------
let isStudyingSession = false;
let studySessionDuration = 0;
let studySessionStartTime = 0;
let studyTimerInterval = null;

function spawnBubble(){
  const bubble=document.createElement('div');
  bubble.className='leaf-bubble';
  bubble.textContent=CURRENCY_ICON;
  const left=10+Math.random()*80;
  const scale=0.9+Math.random()*0.4;
  bubble.style.left=`${left}%`;
  bubble.style.transform=`scale(${scale})`;
  bubbleContainer.appendChild(bubble);
  bubble.addEventListener('animationend',()=>bubble.remove());
}

function updateStudyTimer(){
  const elapsedMs = Date.now() - studySessionStartTime;
  const elapsedSecs = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(elapsedSecs / 60);
  const secs = elapsedSecs % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  // Update timer in study overlay (if element exists)
  const timerDisplay = document.getElementById('studyTimer');
  if(timerDisplay) timerDisplay.textContent = display;
  
  // Spawn bubble every second
  if(elapsedSecs > 0 && elapsedSecs % 1 === 0) {
    spawnBubble();
  }
}

function startStudySession(){
  if(isStudyingSession) return;
  isStudyingSession = true;
  isStudying = true;
  studySessionStartTime = Date.now();
  studyOverlay.style.display = 'flex';
  // Clear only bubble elements, not the focus GIF
  const bubbles = bubbleContainer.querySelectorAll('.leaf-bubble');
  bubbles.forEach(b => b.remove());
  startBtn.disabled = true;
  stopBtn.disabled = false;
  openShopBtn.disabled = true;
  toggleViewBtn.disabled = true;
  feedPetBtn.disabled = true;
  
  // Start timer updates every 100ms
  if(studyTimerInterval) clearInterval(studyTimerInterval);
  studyTimerInterval = setInterval(updateStudyTimer, 100);
  updateStudyTimer(); // Initial update
}

function stopStudySession(){
  if(!isStudyingSession) return;
  if(studyTimerInterval) clearInterval(studyTimerInterval);
  studyTimerInterval = null;
  
  isStudyingSession = false;
  isStudying = false;
  studySessionDuration = Math.round((Date.now() - studySessionStartTime) / 1000);
  studyOverlay.style.display = 'none';
  startBtn.disabled = false;
  stopBtn.disabled = true;
  openShopBtn.disabled = false;
  toggleViewBtn.disabled = false;
  feedPetBtn.disabled = false;

  // Earn 1 mushroom per minute (rounded down)
  const reward = Math.floor(studySessionDuration / 60);

  playerState.totalMinutesStudied += Math.round(studySessionDuration/60);
  playerState.completedSessions++;
  playerState.currency += reward;
  updateHUD();
  updatePetUI();

  // Save to Hostinger database
  hostingerAPI.recordSession(reward, studySessionDuration);
  hostingerAPI.savePlayer(playerState);
  
  if(reward > 0){
    alert(`Great work! You earned ${reward} ${CURRENCY_ICON} from ${Math.floor(studySessionDuration/60)} minute(s) of studying!`);
  }
}

startBtn.addEventListener('click', startStudySession);
stopBtn.addEventListener('click', stopStudySession);
stopStudyOverlayBtn.addEventListener('click', stopStudySession);

// Normal movement keyboard handler stays active while not studying
window.addEventListener('keydown', (e) => {
  if(isStudyingSession) return; // Don't move while studying
  if(isStudying || characterOverlay.offsetParent) return; // Don't move in other overlays (but allow cafe movement)

  const key = e.key.toLowerCase();
  const speed = 12;
  let moved = false;

  if (key === 'arrowup' || key === 'w') { playerY -= speed; moved=true; }
  else if (key === 'arrowdown' || key === 's') { playerY += speed; moved=true; }
  else if (key === 'arrowleft' || key === 'a') { playerX -= speed; moved=true; }
  else if (key === 'arrowright' || key === 'd') { playerX += speed; moved=true; }

  if (moved) {
    if (!inCafe) {
      const margin = 100;
      playerX = Math.max(margin, Math.min(WORLD_W - margin, playerX));
      playerY = Math.max(margin, Math.min(WORLD_H - margin, playerY));
    } else {
      const margin = 32;
      playerX = Math.max(margin, Math.min(VIEW_W - margin, playerX));
      playerY = Math.max(margin, Math.min(VIEW_H - margin, playerY));
    }
    updatePlayerPosition();
  }
});

// ------------------ SHOP ------------------
function renderShopItems(){
  shopItemsContainer.innerHTML='';
  shopItems.forEach(item=>{
    let owned=false;
    let ownedPets = playerState.ownedPets || [];
    if(item.category==='decor') owned=playerState.items.includes(item.id);
    else if(item.category==='pet') owned=ownedPets.includes(item.petType);

    const div=document.createElement('div');
    div.className='shop-item';
    
    // Use PNG image for pets, emoji for others
    if(item.category==='pet' && item.imgSrc){
      const img=document.createElement('img');
      const timestamp = new Date().getTime();
      img.src=`${item.imgSrc}?t=${timestamp}`;
      img.style.width='70px';
      img.style.height='70px';
      img.style.objectFit='contain';
      // Fallback to emoji if image fails to load
      img.onerror=()=>{
        console.error(`Failed to load pet image: ${item.imgSrc}`);
        img.style.display='none';
        const em=document.createElement('div');
        em.className='shop-item-emoji';
        em.textContent=item.emoji;
        div.insertBefore(em, div.firstChild);
      };
      img.onload=()=>{
        console.log(`Successfully loaded pet image: ${item.imgSrc}`);
      };
      div.appendChild(img);
    } else {
      const em=document.createElement('div');
      em.className='shop-item-emoji';
      em.textContent=item.emoji;
      div.appendChild(em);
    }
    
    const name=document.createElement('div'); name.textContent=item.name;
    const price=document.createElement('div'); price.textContent=`${item.price} ${CURRENCY_ICON}`;
    const btn=document.createElement('button');
    btn.textContent=owned&&item.category!=='food'?'Owned':'Buy';
    btn.disabled=owned&&item.category!=='food';
    btn.addEventListener('click',()=>{
      if(playerState.currency<item.price) return alert(`Not enough ${CURRENCY_ICON}!`);
      playerState.currency-=item.price;
      if(item.category==='decor' && !playerState.items.includes(item.id)) playerState.items.push(item.id);
      else if(item.category==='pet'){
        if(!playerState.ownedPets) playerState.ownedPets = [];
        if(!playerState.ownedPets.includes(item.petType)) playerState.ownedPets.push(item.petType);
        playerState.petType=item.petType;
        playerState.petHunger=0;
        console.log('Purchased pet:', item.petType, 'Image:', item.imgSrc);
      }
      else if(item.category==='food') playerState.petFood++;
      updateHUD();
      updatePetUI();
      renderShopItems();
      hostingerAPI.savePlayer(playerState);
    });
    div.appendChild(name); div.appendChild(price); div.appendChild(btn);
    shopItemsContainer.appendChild(div);
  });
}
openShopBtn.addEventListener('click',()=>{
  if(isStudying) return;
  shopCoinsDisplay.textContent=playerState.currency;
  renderShopItems();
  shopOverlay.style.display='flex';
});
closeShopBtn.addEventListener('click',()=>{ shopOverlay.style.display='none'; });

// ------------------ INVENTORY ------------------
function renderInventory(){
  ownedPetsContainer.innerHTML='';
  fishContainer.innerHTML='';
  snacksContainer.innerHTML='';
  
  // Show owned pets
  const ownedPets = playerState.ownedPets || [];
  ownedPets.forEach(petType=>{
    const petItem = shopItems.find(item => item.petType === petType);
    if(!petItem) return;
    
    const div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.padding = '10px';
    div.style.border = playerState.petType === petType ? '2px solid gold' : '1px solid #ccc';
    div.style.borderRadius = '8px';
    
    const img = document.createElement('img');
    const timestamp = new Date().getTime();
    img.src = `${petItem.imgSrc}?t=${timestamp}`;
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    // Fallback to emoji if image fails to load
    img.onerror = ()=>{
      console.error(`Failed to load inventory pet image: ${petItem.imgSrc}`);
      img.style.display='none';
      const em=document.createElement('div');
      em.style.fontSize='2.5rem';
      em.textContent=petItem.emoji;
      div.insertBefore(em, div.firstChild);
    };
    img.onload = ()=>{
      console.log(`Successfully loaded inventory pet image: ${petItem.imgSrc}`);
    };
    div.appendChild(img);
    
    const name = document.createElement('div');
    name.textContent = petItem.name;
    name.style.fontSize = '0.9rem';
    name.style.marginTop = '5px';
    div.appendChild(name);
    
    const btn = document.createElement('button');
    btn.textContent = playerState.petType === petType ? 'Equipped' : 'Equip';
    btn.disabled = playerState.petType === petType;
    btn.addEventListener('click', ()=>{
      playerState.petType = petType;
      updatePetUI();
      renderInventory();
    });
    div.appendChild(btn);
    
    ownedPetsContainer.appendChild(div);
  });
  
  // Show fish
  const inv = playerState.inventory || {};
  if((inv.salmon || 0) > 0 || (inv.trout || 0) > 0){
    if((inv.salmon || 0) > 0){
      const div = document.createElement('div');
      div.textContent = `🐟 Salmon x${inv.salmon}`;
      div.style.marginBottom = '5px';
      fishContainer.appendChild(div);
    }
    if((inv.trout || 0) > 0){
      const div = document.createElement('div');
      div.textContent = `🐟 Trout x${inv.trout}`;
      div.style.marginBottom = '5px';
      fishContainer.appendChild(div);
    }
  } else {
    fishContainer.textContent = 'None caught yet';
  }
  
  // Show snacks
  if(playerState.petFood > 0){
    const div = document.createElement('div');
    div.textContent = `🍖 Snacks x${playerState.petFood}`;
    snacksContainer.appendChild(div);
  } else {
    snacksContainer.textContent = 'None purchased yet';
  }
}

function openInventory(){
  renderInventory();
  inventoryOverlay.style.display = 'flex';
}

closeInventoryBtn.addEventListener('click', ()=>{
  inventoryOverlay.style.display = 'none';
});

openInventoryBtn.addEventListener('click',()=>{
  if(isStudying) return;
  openInventory();
});

// ------------------ CAFE / OUTSIDE ------------------
toggleViewBtn.addEventListener('click',()=>{
  inCafe=!inCafe;
  if(inCafe){
    gameArea.classList.remove('outside-view');
    gameArea.classList.add('cafe-view');
    worldImg.style.display='none';
    gameArea.style.backgroundImage='url("img/cafe.png")';
    gameArea.style.backgroundSize='cover';
    gameArea.style.backgroundPosition='center';
    toggleViewBtn.textContent='Go Outside';
    playerX=VIEW_W/2; playerY=VIEW_H/2;
    multiplayerState.currentLocation = 'cafe';
    chatBox.style.display='flex';
    if (openChatBtn) openChatBtn.style.display='none';
    multiplayerState.lastChatId = 0; // reset to fetch latest
    fetchChatMessages();
  }else{
    gameArea.classList.remove('cafe-view');
    gameArea.classList.add('outside-view');
    worldImg.style.display='block';
    gameArea.style.backgroundImage='none';
    toggleViewBtn.textContent='Go to Café';
    playerX=1550; playerY=2425;
    multiplayerState.currentLocation = 'world';
    chatBox.style.display='none';
    if (openChatBtn) openChatBtn.style.display='none';
  }
  updatePlayerPosition();
  updatePondButtons();
  if (multiplayerState.isLoggedIn) {
    updatePlayerPresence();
    fetchOnlinePlayers();
  }
});

// ------------------ HUD ------------------
function updateHUD(){
  currentUserLabel.textContent=playerState.name;
  coinCountSpan.textContent=playerState.currency;
  foodCountSpan.textContent=playerState.petFood;
}

// ------------------ POND BUTTONS ------------------
const ponds=[
  {btn:pond1Btn,worldX:870,worldY:690,width:100,height:100,fish:'Salmon'},
  {btn:pond2Btn,worldX:630,worldY:1890,width:110,height:110,fish:'Trout'}
];

function schedulePresenceUpdate(){
  if(presenceUpdateTimeout) clearTimeout(presenceUpdateTimeout);
  presenceUpdateTimeout = setTimeout(()=>{
    updatePlayerPresence();
  }, 250);
}

function updatePondButtons(){
  if (inCafe) {
    // Hide pond buttons in cafe
    ponds.forEach(p => p.btn.style.display = 'none');
    return;
  }
  // Show and position pond buttons outside relative to world image panning
  ponds.forEach(p => p.btn.style.display = 'block');
  ponds.forEach(p=>{
    // Position based on world image offset
    const worldOffsetX = parseFloat(worldImg.style.left) || 0;
    const worldOffsetY = parseFloat(worldImg.style.top) || 0;
    p.btn.style.left = (worldOffsetX + p.worldX) + 'px';
    p.btn.style.top = (worldOffsetY + p.worldY) + 'px';
    p.btn.style.width = p.width + 'px';
    p.btn.style.height = p.height + 'px';
  });
}
window.addEventListener('load',updatePondButtons);
window.addEventListener('resize',updatePondButtons);

function showFishingPopup(pondNumber){
  catchMessage.style.display='none';
  fishingGif.style.display='block';
  fishingOverlay.style.display='flex';
  
  // Use character-specific fishing GIF based on selected character
  const charId = playerState.characterId || 'girl1';
  fishingGif.src = `img/${charId}_fish.gif`;
  
  setTimeout(()=>{
    fishingGif.style.display='none';
    const fishName = ponds[pondNumber-1].fish || 'Fish';
    const key = fishName.toLowerCase();
    // normalize keys to 'salmon' or 'trout'
    const normalizedKey = key.includes('salmon') ? 'salmon' : (key.includes('trout') ? 'trout' : key);
    // add fish to inventory
    if(!playerState.inventory) playerState.inventory = { salmon:0, trout:0 };
    playerState.inventory[normalizedKey] = (playerState.inventory[normalizedKey] || 0) + 1;

    catchMessage.textContent = `You caught a ${fishName}! (${playerState.inventory[normalizedKey]} now in inventory)`;
    catchMessage.style.display='block';
    updateHUD();
    hostingerAPI.savePlayer(playerState);
  },3000);
}
pond1Btn.addEventListener('click',()=>showFishingPopup(1));
pond2Btn.addEventListener('click',()=>showFishingPopup(2));
fishingOverlay.addEventListener('click',()=>{ fishingOverlay.style.display='none'; });

// ------------------ CAFE CHAT ------------------
function sendChatMessage(){
  const text = chatInput.value.trim();
  if(!text) return;
  chatInput.value='';
  // optimistic append
  const tempId = multiplayerState.lastChatId + 0.1;
  multiplayerState.chatMessages.push({ id: tempId, username: playerState.name, message: text });
  renderChatMessages();
  hostingerAPI.sendChat(text, 'cafe').then(id=>{
    if (id) {
      multiplayerState.lastChatId = Math.max(multiplayerState.lastChatId, id);
    }
  });
}

sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter') sendChatMessage(); });

closeChatBtn.addEventListener('click', ()=>{ 
  chatBox.style.display='none';
  if (openChatBtn) openChatBtn.style.display='block';
});

if (openChatBtn) {
  openChatBtn.addEventListener('click', ()=>{
    chatBox.style.display='flex';
    openChatBtn.style.display='none';
    chatInput.focus();
  });
}

// ------------------ INIT ------------------
// ==================== LOGIN SYSTEM ====================
function startLogin() {
  loginOverlay.style.display = 'flex';
  usernameInput.focus();
}

function handleLogin() {
  const username = usernameInput.value.trim();
  if (!username) {
    alert('Please enter a username');
    return;
  }

  playerState.name = username;
  localStorage.setItem('studyshroom_username', username);
  if (hostingerAPI?.setUserIdFromUsername) {
    hostingerAPI.setUserIdFromUsername(username);
  }
  multiplayerState.isLoggedIn = true;
  loginOverlay.style.display = 'none';
  
  currentUserLabel.textContent = username;
  
  // Start the game initialization
  loadPlayerData();

  // Persist name immediately
  hostingerAPI.savePlayer(playerState);
  
  // Start multiplayer updates
  startMultiplayerUpdates();
  
  console.log(`✅ Logged in as ${username}`);
}

async function loadPlayerData() {
  const existingPlayer = await hostingerAPI.loadPlayer();
  
  // Restore username from localStorage immediately (before using it for flag lookups)
  const storedUsername = localStorage.getItem('studyshroom_username');
  if (storedUsername) {
    playerState.name = storedUsername;
  }
  
  const username = playerState.name; // Now use the restored username
  
  if(existingPlayer) {
    // Check if this account has an explicit character selection saved BEFORE overwriting with server data
    const charSelectionFlag = localStorage.getItem(`studyshroom_char_selected_${username}`);
    const hasExplicitSelection = charSelectionFlag === '1';
    
    // Save the user's selected character if it exists
    const userSelectedCharacter = hasExplicitSelection ? localStorage.getItem(`studyshroom_selected_char_${username}`) : null;

    // Normalize items/inventory/ownedPets payload coming from server (stored inside items JSON)
    const incomingItems = existingPlayer.items;
    let serverItemsArray = [];
    let serverInventory = {};
    let serverOwnedPets = [];

    if (Array.isArray(incomingItems)) {
      serverItemsArray = incomingItems;
    } else if (incomingItems && typeof incomingItems === 'object') {
      serverItemsArray = incomingItems.items || [];
      serverInventory = incomingItems.inventory || {};
      serverOwnedPets = incomingItems.ownedPets || [];
    }

    Object.assign(playerState, existingPlayer);
    playerState.items = serverItemsArray;
    playerState.inventory = { ...playerState.inventory, ...serverInventory };
    playerState.ownedPets = serverOwnedPets;
    
    // If user has explicit selection, use their choice instead of server default
    if (hasExplicitSelection && userSelectedCharacter) {
      playerState.characterId = userSelectedCharacter;
    }
    // If no explicit selection AND no sessions, force null to show picker
    else if (!hasExplicitSelection && existingPlayer.completed_sessions === 0) {
      playerState.characterId = null;
    }
    // Otherwise, keep whatever the server returned
    
    console.log('✅ Loaded player data from server, characterId:', playerState.characterId, 'hasExplicitSelection:', hasExplicitSelection, 'userSelectedCharacter:', userSelectedCharacter, 'ownedPets:', playerState.ownedPets, 'inventory:', playerState.inventory);
  } else {
    console.log('ℹ️ New player - starting fresh');
  }
  // Apply character sprite from state
  if (playerState.characterId) {
    playerSprite.src = `img/char_${playerState.characterId}.png`;
  } else {
    playerSprite.src = 'img/char_girl1.png'; // temporary fallback until user picks
  }
  updateHUD();
  updatePetUI();
  const hasCharSelected = localStorage.getItem(`studyshroom_char_selected_${username}`) === '1' || !!playerState.characterId;
  characterOverlay.style.display = hasCharSelected ? 'none' : 'flex';
  console.log('Character picker visible:', !hasCharSelected, 'hasCharSelected:', hasCharSelected);
  updatePlayerPosition();

  // Persist chosen name to server
  hostingerAPI.savePlayer(playerState);
}

function startMultiplayerUpdates() {
  // Update presence every 2 seconds
  if (multiplayerState.updateInterval) clearInterval(multiplayerState.updateInterval);
  multiplayerState.updateInterval = setInterval(() => {
    if (multiplayerState.isLoggedIn) {
      updatePlayerPresence();
      fetchOnlinePlayers();
    }
  }, 42);
  
  // Update chat every 2 seconds if in cafe
  if (multiplayerState.chatUpdateInterval) clearInterval(multiplayerState.chatUpdateInterval);
  multiplayerState.chatUpdateInterval = setInterval(() => {
    if (multiplayerState.isLoggedIn && multiplayerState.currentLocation === 'cafe') {
      fetchChatMessages();
    }
  }, 2000);
}

async function updatePlayerPresence() {
  await hostingerAPI.updatePresence({
    name: playerState.name,
    characterId: playerState.characterId,
    petType: playerState.petType,
    currentLocation: multiplayerState.currentLocation,
    x: playerState.x,
    y: playerState.y
  });
}

async function fetchOnlinePlayers() {
  const players = await hostingerAPI.getOnlinePlayers(multiplayerState.currentLocation);
  renderOtherPlayers(players);
  if (onlineCountSpan) onlineCountSpan.textContent = players.length + 1; // +1 for self
}

function renderOtherPlayers(players) {
  otherPlayersLayer.innerHTML = '';
  
  players.forEach(otherPlayer => {
    // Create container for this player
    const playerDiv = document.createElement('div');
    playerDiv.className = 'other-player';
    playerDiv.style.position = 'absolute';
    // Position: if outside, center relative to our camera; if cafe, use absolute
    if (!inCafe) {
      const ox = (otherPlayer.x || 0) - playerX;
      const oy = (otherPlayer.y || 0) - playerY;
      playerDiv.style.left = (VIEW_W / 2 + ox) + 'px';
      playerDiv.style.top  = (VIEW_H / 2 + oy) + 'px';
    } else {
      playerDiv.style.left = (otherPlayer.x || 0) + 'px';
      playerDiv.style.top  = (otherPlayer.y || 0) + 'px';
    }
    playerDiv.style.display = 'flex';
    playerDiv.style.flexDirection = 'column';
    playerDiv.style.alignItems = 'center';
    
    // Character sprite
    const charImg = document.createElement('img');
    charImg.src = `img/char_${otherPlayer.character_id}.png`;
    charImg.style.width = '40px';
    charImg.style.height = '40px';
    charImg.style.objectFit = 'contain';
    charImg.onerror = () => { charImg.src = 'img/char_girl1.png'; };
    playerDiv.appendChild(charImg);
    
    // Pet sprite if they have one
    if (otherPlayer.pet_type) {
      const petItem = shopItems.find(item => item.petType === otherPlayer.pet_type);
      if (petItem) {
        const petImg = document.createElement('img');
        petImg.src = petItem.imgSrc;
        petImg.style.width = '30px';
        petImg.style.height = '30px';
        petImg.style.objectFit = 'contain';
        petImg.style.marginTop = '-10px';
        petImg.onerror = () => { petImg.textContent = petItem.emoji; };
        playerDiv.appendChild(petImg);
      }
    }
    
    // Username label
    const nameDiv = document.createElement('div');
    nameDiv.textContent = otherPlayer.username;
    nameDiv.style.fontSize = '0.75rem';
    nameDiv.style.marginTop = '5px';
    nameDiv.style.backgroundColor = 'rgba(255,255,255,0.8)';
    nameDiv.style.padding = '2px 5px';
    nameDiv.style.borderRadius = '3px';
    playerDiv.appendChild(nameDiv);
    
    otherPlayersLayer.appendChild(playerDiv);
  });
}

async function fetchChatMessages() {
  const messages = await hostingerAPI.getChatMessages('cafe', 50, multiplayerState.lastChatId);
  if (messages.length > 0) {
    messages.forEach(msg => {
      if (msg.id > multiplayerState.lastChatId) {
        multiplayerState.lastChatId = msg.id;
        multiplayerState.chatMessages.push(msg);
      }
    });
    // Keep only last 100 messages
    if (multiplayerState.chatMessages.length > 100) {
      multiplayerState.chatMessages = multiplayerState.chatMessages.slice(-100);
    }
    renderChatMessages();
  }
}

function renderChatMessages() {
  if (!chatMessagesDiv) return;
  chatMessagesDiv.innerHTML = multiplayerState.chatMessages.map(msg => {
    return `<div class="chat-message"><strong>${msg.username}:</strong> ${msg.message}</div>`;
  }).join('');
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

// ==================== INIT FUNCTION ====================
function init(){
  // Initialize music player
  initMusicPlayer();
  // Load todos
  loadTodos();
  // Show login overlay first
  startLogin();
}

// Ensure init() runs after page is loaded
window.addEventListener('DOMContentLoaded', () => {
  if (!hostingerAPI) {
      hostingerAPI = new HostingerAPI();
  }
  init();
});
