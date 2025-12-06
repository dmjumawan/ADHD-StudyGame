// ------------------ BASIC STATE ------------------
const playerState = {
  name: 'Player',
  currency: 0,
  characterId: 'girl1',
  items: [],
  totalMinutesStudied: 0,
  completedSessions: 0,
  petType: null,
  petHunger: 0,
  petFood: 0
};

const shopItems = [
  { id: 'pet_cat', name: 'Cat Companion', price: 1, emoji: '🐱', category: 'pet', petType: 'cat' },
  { id: 'pet_dog', name: 'Dog Companion', price: 1, emoji: '🐶', category: 'pet', petType: 'dog' },
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
const ownedItemsList    = document.getElementById('ownedItemsList');
const minutesInput      = document.getElementById('minutesInput');
const startBtn          = document.getElementById('startStudyBtn');
const openShopBtn       = document.getElementById('openShopBtn');
const toggleViewBtn     = document.getElementById('toggleViewBtn');
const feedPetBtn        = document.getElementById('feedPetBtn');
const foodCountSpan     = document.getElementById('foodCount');
const studyOverlay      = document.getElementById('studyOverlay');
const studyTimerDisplay = document.getElementById('studyTimerDisplay');
const bubbleContainer   = document.getElementById('bubbleContainer');
const shopOverlay       = document.getElementById('shopOverlay');
const shopItemsContainer= document.getElementById('shopItemsContainer');
const shopCoinsDisplay  = document.getElementById('shopCoinsDisplay');
const closeShopBtn      = document.getElementById('closeShopBtn');
const characterOverlay  = document.getElementById('characterOverlay');
const fullscreenBtn     = document.getElementById('fullscreenBtn');
const zoomInBtn         = document.getElementById('zoomInBtn');
const zoomOutBtn        = document.getElementById('zoomOutBtn');

const pond1Btn          = document.getElementById("pond1-btn");
const pond2Btn          = document.getElementById("pond2-btn");
const worldImg          = document.getElementById("worldImage");

const fishingOverlay    = document.getElementById("fishingOverlay");
const fishingGif        = document.getElementById("fishingGif");
const catchMessage      = document.getElementById("catchMessage");

// ------------------ WORLD / MOVEMENT ------------------
const VIEW_W = 1100, VIEW_H = 600;
const WORLD_W = 3000, WORLD_H = 3000;

let playerX = 1550, playerY = 2425;
let isStudying = false;
let inCafe = false;

function updatePlayerPosition() {
  player.style.left = playerX + "px";
  player.style.top  = playerY + "px";

  // Keep player roughly centered if outside cafe
  if (!inCafe) {
    const offsetX = -(playerX - VIEW_W / 2);
    const offsetY = -(playerY - VIEW_H / 2);
    gameArea.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
  } else {
    gameArea.style.backgroundPosition = "center";
  }
}

// ------------------ ARROW KEY MOVEMENT ------------------
document.addEventListener('keydown', (e) => {
  if (isStudying) return;

  const key = e.key.toLowerCase();
  const speed = 12;
  let moved = false;

  if (key === 'arrowup' || key === 'w') { playerY -= speed; moved=true; }
  else if (key === 'arrowdown' || key === 's') { playerY += speed; moved=true; }
  else if (key === 'arrowleft' || key === 'a') { playerX -= speed; moved=true; }
  else if (key === 'arrowright' || key === 'd') { playerX += speed; moved=true; }

  if (moved) {
    const margin = 100;
    playerX = Math.max(margin, Math.min(WORLD_W - margin, playerX));
    playerY = Math.max(margin, Math.min(WORLD_H - margin, playerY));
    updatePlayerPosition();
  }
});

// ------------------ ZOOM ------------------
let zoomLevel = 1;
const MIN_ZOOM = 0.8, MAX_ZOOM = 1.6, ZOOM_STEP = 0.1;
function updateZoom() { gameArea.style.transform = `scale(${zoomLevel})`; }
zoomInBtn.addEventListener('click', ()=>{zoomLevel=Math.min(MAX_ZOOM,zoomLevel+ZOOM_STEP);updateZoom();});
zoomOutBtn.addEventListener('click', ()=>{zoomLevel=Math.max(MIN_ZOOM,zoomLevel-ZOOM_STEP);updateZoom();});

// ------------------ CHARACTER SELECT ------------------
document.querySelectorAll('.char-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    playerState.characterId = card.dataset.charId;
    playerSprite.src = card.dataset.src;
    characterOverlay.style.display = 'none';
  });
});

// ------------------ PET ------------------
function updatePetUI(){
  if(!playerState.petType){ petContainer.style.display='none'; feedPetBtn.disabled=true; return; }
  petContainer.style.display='block';
  petSprite.src = playerState.petType==='cat'?'img/pet_cat.png':'img/pet_dog.png';
  const level = Math.max(0,Math.min(2,playerState.petHunger));
  petHeart.src = heartImages[level];
  feedPetBtn.disabled = playerState.petFood<=0;
}
feedPetBtn.addEventListener('click',()=>{
  if(!playerState.petType) return alert('Adopt a pet first!');
  if(playerState.petFood<=0) return alert('No snacks! Buy one in shop.');
  if(playerState.petHunger>=2) return alert('Your pet is full ❤️');
  playerState.petFood--;
  playerState.petHunger++;
  updateHUD();
  updatePetUI();
});

// ------------------ STUDY TIMER ------------------
let timerId=null, remainingSeconds=0;
function formatTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }
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
startBtn.addEventListener('click',()=>{
  if(isStudying) return;
  const minutes=parseInt(minutesInput.value,10);
  if(!minutes || minutes<=0) return alert('Enter valid minutes.');
  isStudying=true; remainingSeconds=minutes*60;
  studyTimerDisplay.textContent=formatTime(remainingSeconds);
  studyOverlay.style.display='flex';
  bubbleContainer.innerHTML='';
  startBtn.disabled=openShopBtn.disabled=toggleViewBtn.disabled=feedPetBtn.disabled=true;
  const reward=minutes;
  timerId=setInterval(()=>{
    remainingSeconds--;
    studyTimerDisplay.textContent=formatTime(remainingSeconds);
    if(remainingSeconds>0) spawnBubble();
    if(remainingSeconds<=0){
      clearInterval(timerId);
      isStudying=false;
      studyOverlay.style.display='none';
      startBtn.disabled=openShopBtn.disabled=toggleViewBtn.disabled=false;
      playerState.currency+=reward;
      playerState.totalMinutesStudied+=reward;
      playerState.completedSessions++;
      updateHUD();
      updatePetUI();
      alert(`Nice work! You earned ${reward} ${CURRENCY_ICON}.`);
    }
  },1000);
});

// ------------------ SHOP ------------------
function renderShopItems(){
  shopItemsContainer.innerHTML='';
  shopItems.forEach(item=>{
    let owned=false;
    if(item.category==='decor') owned=playerState.items.includes(item.id);
    else if(item.category==='pet') owned=playerState.petType===item.petType;

    const div=document.createElement('div');
    div.className='shop-item';
    const em=document.createElement('div'); em.className='shop-item-emoji'; em.textContent=item.emoji;
    const name=document.createElement('div'); name.textContent=item.name;
    const price=document.createElement('div'); price.textContent=`${item.price} ${CURRENCY_ICON}`;
    const btn=document.createElement('button');
    btn.textContent=owned&&item.category!=='food'?'Owned':'Buy';
    btn.disabled=owned&&item.category!=='food';
    btn.addEventListener('click',()=>{
      if(playerState.currency<item.price) return alert(`Not enough ${CURRENCY_ICON}!`);
      playerState.currency-=item.price;
      if(item.category==='decor' && !playerState.items.includes(item.id)) playerState.items.push(item.id);
      else if(item.category==='pet'){ playerState.petType=item.petType; playerState.petHunger=0; }
      else if(item.category==='food') playerState.petFood++;
      updateHUD();
      updatePetUI();
      renderRoomItems();
      renderShopItems();
    });
    div.appendChild(em); div.appendChild(name); div.appendChild(price); div.appendChild(btn);
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

// ------------------ CAFE / OUTSIDE ------------------
toggleViewBtn.addEventListener('click',()=>{
  inCafe=!inCafe;
  if(inCafe){
    gameArea.classList.remove('outside-view');
    gameArea.classList.add('cafe-view');
    gameArea.style.backgroundImage='url("img/cafe.png")';
    toggleViewBtn.textContent='Go Outside';
    playerX=VIEW_W/2; playerY=VIEW_H/2;
  }else{
    gameArea.classList.remove('cafe-view');
    gameArea.classList.add('outside-view');
    gameArea.style.backgroundImage='url("img/forest_world_large.png")';
    toggleViewBtn.textContent='Go to Café';
    playerX=1550; playerY=2425;
  }
  updatePlayerPosition();
});

// ------------------ HUD ------------------
function updateHUD(){
  currentUserLabel.textContent=playerState.name;
  coinCountSpan.textContent=playerState.currency;
  foodCountSpan.textContent=playerState.petFood;
  ownedItemsList.textContent=playerState.items.length===0?'none yet':playerState.items.map(id=>{
    const item=shopItems.find(i=>i.id===id);
    return item?`${item.emoji} ${item.name}`:id;
  }).join(', ');
}

// ------------------ POND BUTTONS ------------------
const ponds=[
  {btn:pond1Btn,left:0.29,top:0.23,width:0.10,height:0.10,fish:'Salmon'},
  {btn:pond2Btn,left:0.21,top:0.63,width:0.11,height:0.11,fish:'Trout'}
];

function updatePondButtons(){
  const scaleX=worldImg.clientWidth;
  const scaleY=worldImg.clientHeight;
  ponds.forEach(p=>{
    p.btn.style.left=(p.left*scaleX)+'px';
    p.btn.style.top=(p.top*scaleY)+'px';
    p.btn.style.width=(p.width*scaleX)+'px';
    p.btn.style.height=(p.height*scaleY)+'px';
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
    catchMessage.textContent=`You caught a ${ponds[pondNumber-1].fish}!`;
    catchMessage.style.display='block';
  },3000);
}
pond1Btn.addEventListener('click',()=>showFishingPopup(1));
pond2Btn.addEventListener('click',()=>showFishingPopup(2));
fishingOverlay.addEventListener('click',()=>{ fishingOverlay.style.display='none'; });

// ------------------ INIT ------------------
function init(){
  updateHUD();
  updatePetUI();
  updateZoom();
  characterOverlay.style.display='flex';
  updatePlayerPosition();
  renderRoomItems(); // if you had room items
}
init();
