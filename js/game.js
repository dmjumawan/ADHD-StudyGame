// Initialize Hostinger API (will be created on page load)
var hostingerAPI;

// ------------------ BASIC STATE ------------------
const playerState = {
  name: 'Player',
  currency: 0,
  characterId: 'girl1',
  items: [],
  // inventory holds counts of consumables and caught fish
  inventory: {
    salmon: 0,
    trout: 0
  },
  totalMinutesStudied: 0,
  completedSessions: 0,
  petType: null,
  petHunger: 0,
  petFood: 0
};

const shopItems = [
  { id: 'pet_cat', name: 'Cat', price: 50, emoji: '🐱', category: 'pet', petType: 'cat', imgSrc: 'img/pet_cat.png' },
  { id: 'pet_dog', name: 'Dog', price: 50, emoji: '🐶', category: 'pet', petType: 'dog', imgSrc: 'img/pet_dog.png' },
  { id: 'pet_chicken', name: 'Chicken', price: 50, emoji: '🐔', category: 'pet', petType: 'chicken', imgSrc: 'img/chicken.png' },
  { id: 'pet_deer', name: 'Deer', price: 50, emoji: '🦌', category: 'pet', petType: 'deer', imgSrc: 'img/deer.png' },
  { id: 'pet_fox', name: 'Fox', price: 50, emoji: '🦊', category: 'pet', petType: 'fox', imgSrc: 'img/fox.png' },
  { id: 'pet_hamster', name: 'Hamster', price: 50, emoji: '�', category: 'pet', petType: 'hamster', imgSrc: 'img/hamster.png' },
  { id: 'pet_hedgehog', name: 'Hedgehog', price: 50, emoji: '🦔', category: 'pet', petType: 'hedgehog', imgSrc: 'img/hedgehog.png' },
  { id: 'pet_jellycat', name: 'Jellycat', price: 50, emoji: '🪼', category: 'pet', petType: 'jellycat', imgSrc: 'img/jellycat.png' },
  { id: 'pet_sloth', name: 'Sloth', price: 50, emoji: '🦥', category: 'pet', petType: 'sloth', imgSrc: 'img/sloth.png' },
  { id: 'pet_snack', name: 'Pet Snack', price: 1, emoji: '🍖', category: 'food' },
  { id: 'flower_hat', name: 'Flower Hat', price: 10, emoji: '🌼', category: 'decor' },
  { id: 'mushroom_lamp', name: 'Mushroom Lamp', price: 20, emoji: '🍄', category: 'decor' },
  { id: 'leaf_rug', name: 'Leaf Rug', price: 12, emoji: '🍃', category: 'decor' },
  { id: 'tea_set', name: 'Tea Set', price: 15, emoji: '🍵', category: 'decor' }
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
const fullscreenBtn     = document.getElementById('fullscreenBtn');
const zoomInBtn         = document.getElementById('zoomInBtn');
const zoomOutBtn        = document.getElementById('zoomOutBtn');
// studyKeycapture, focusHint and related keypress-capture elements were removed from the UI

const pond1Btn          = document.getElementById("pond1-btn");
const pond2Btn          = document.getElementById("pond2-btn");
const worldImg          = document.getElementById("worldImage");

const fishingOverlay    = document.getElementById("fishingOverlay");
const fishingGif        = document.getElementById("fishingGif");
const catchMessage      = document.getElementById("catchMessage");

const chatBox           = document.getElementById("chatBox");
const chatMessages      = document.getElementById("chatMessages");
const chatInput         = document.getElementById("chatInput");
const sendChatBtn       = document.getElementById("sendChatBtn");
const closeChatBtn      = document.getElementById("closeChatBtn");

const tabNotification   = document.getElementById("tabNotification");
const tabKeypressCount  = document.getElementById("tabKeypressCount");
const closeTabNotification = document.getElementById("closeTabNotification");

const inventoryOverlay  = document.getElementById("inventoryOverlay");
const closeInventoryBtn = document.getElementById("closeInventoryBtn");
const ownedPetsContainer = document.getElementById("ownedPetsContainer");
const fishContainer     = document.getElementById("fishContainer");
const snacksContainer   = document.getElementById("snacksContainer");

// ------------------ WORLD / MOVEMENT ------------------
const VIEW_W = 1100, VIEW_H = 600;
const WORLD_W = 3000, WORLD_H = 3000;

let playerX = 1550, playerY = 2425;
let isStudying = false;
let inCafe = false;

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
}

// ------------------ ZOOM ------------------
let zoomLevel = 1;
const MIN_ZOOM = 0.8, MAX_ZOOM = 1.6, ZOOM_STEP = 0.1;
function updateZoom() { gameArea.style.transform = `scale(${zoomLevel})`; }
zoomInBtn.addEventListener('click', ()=>{zoomLevel=Math.min(MAX_ZOOM,zoomLevel+ZOOM_STEP);updateZoom();});
zoomOutBtn.addEventListener('click', ()=>{zoomLevel=Math.max(MIN_ZOOM,zoomLevel-ZOOM_STEP);updateZoom();});

// ------------------ FULLSCREEN ------------------
fullscreenBtn.addEventListener('click', ()=>{
  if (!document.fullscreenElement) {
    gameArea.requestFullscreen().catch(err => console.log(`Fullscreen error: ${err.message}`));
  } else {
    document.exitFullscreen();
  }
});

// ------------------ CHARACTER SELECT ------------------
document.querySelectorAll('.char-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    console.log('Character selected:', card.dataset.charId);
    playerState.characterId = card.dataset.charId;
    playerSprite.src = card.dataset.src;
    characterOverlay.style.display = 'none';
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
  bubbleContainer.innerHTML = '';
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
      img.src=item.imgSrc;
      img.style.width='60px';
      img.style.height='60px';
      img.style.objectFit='contain';
      // Fallback to emoji if image fails to load
      img.onerror=()=>{
        img.style.display='none';
        const em=document.createElement('div');
        em.className='shop-item-emoji';
        em.textContent=item.emoji;
        div.insertBefore(em, div.firstChild);
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
    img.src = petItem.imgSrc;
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    // Fallback to emoji if image fails to load
    img.onerror = ()=>{
      img.style.display='none';
      const em=document.createElement('div');
      em.style.fontSize='2.5rem';
      em.textContent=petItem.emoji;
      div.insertBefore(em, div.firstChild);

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
    chatBox.style.display='flex';
    chatBtn.style.display='none';
  }else{
    gameArea.classList.remove('cafe-view');
    gameArea.classList.add('outside-view');
    worldImg.style.display='block';
    gameArea.style.backgroundImage='none';
    toggleViewBtn.textContent='Go to Café';
    playerX=1550; playerY=2425;
    chatBox.style.display='none';
    chatBtn.style.display='none';
  }
  updatePlayerPosition();
  updatePondButtons();
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
  fishingGif.src='img/fishing.gif';
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
  },3000);
}
pond1Btn.addEventListener('click',()=>showFishingPopup(1));
pond2Btn.addEventListener('click',()=>showFishingPopup(2));
fishingOverlay.addEventListener('click',()=>{ fishingOverlay.style.display='none'; });

// ------------------ CAFE CHAT ------------------
const chatBtn           = document.getElementById("openChatBtn");

function addChatMessage(text, isOwn=true){
  const msgDiv = document.createElement('div');
  msgDiv.className = isOwn ? 'chat-message own' : 'chat-message other';
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage(){
  const text = chatInput.value.trim();
  if(!text) return;
  addChatMessage(text, true);
  chatInput.value = '';
}

sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e)=>{
  if(e.key==='Enter') sendMessage();
});

closeChatBtn.addEventListener('click', ()=>{ 
  chatBox.style.display='none';
  chatBtn.style.display='block';
});

chatBtn.addEventListener('click', ()=>{
  chatBox.style.display='flex';
  chatBtn.style.display='none';
  chatInput.focus();
});

// Show/hide chat based on cafe view
const originalToggle = toggleViewBtn.onclick;
toggleViewBtn.addEventListener('click', ()=>{
  setTimeout(()=>{
    if(inCafe) chatBox.style.display='flex';
    else chatBox.style.display='none';
  }, 10);
});

// ------------------ INIT ------------------
function init(){
  // Load player data from Hostinger if available
  hostingerAPI.loadPlayer().then(existingPlayer => {
    if(existingPlayer) {
      Object.assign(playerState, existingPlayer);
      console.log('✅ Loaded player data from Hostinger');
    } else {
      console.log('ℹ️ New player - starting fresh');
    }
    updateHUD();
    updatePetUI();
  });
  
  updateHUD();
  updatePetUI();
  updateZoom();
  characterOverlay.style.display='flex';
  updatePlayerPosition();
}

// Ensure init() runs after page is loaded
window.addEventListener('DOMContentLoaded', () => {
  if (!hostingerAPI) {
      hostingerAPI = new HostingerAPI();
  }
  init();
});
