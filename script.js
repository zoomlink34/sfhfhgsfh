const firebaseConfig = {
    apiKey: "AIzaSyDcFXKaFi1lPOV5wMqFwcjhXlpKdpKkxgE",
    authDomain: "the-10-million-pixels-plus.firebaseapp.com",
    projectId: "the-10-million-pixels-plus",
    databaseURL: "https://the-10-million-pixels-plus-default-rtdb.firebaseio.com/",
    storageBucket: "the-10-million-pixels-plus.firebasestorage.app",
    messagingSenderId: "589782307046",
    appId: "1:589782307046:web:fcc40b27c846d5dcb86b27"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');

const blockW = 100, blockH = 60;
const cols = 316, rows = 317; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.05, pX = 0, pY = 0, isD = false, sX, sY, pixels = {};

function render() {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 1;

    for(let i=0; i<cols; i++) {
        for(let j=0; j<rows; j++) {
            let x = i * blockW, y = j * blockH;
            ctx.strokeRect(x, y, blockW, blockH);
            if(scale > 0.4) {
                ctx.fillStyle = "#888"; ctx.font = "14px Arial";
                ctx.fillText("#" + ((j * cols) + i + 1), x + 30, y + 35);
            }
        }
    }

    Object.keys(pixels).forEach(id => {
        const p = pixels[id];
        if(p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => { ctx.drawImage(img, p.x, p.y, blockW, blockH); };
        }
    });
}

function updateUI() { 
    document.getElementById('mover').style.transform = `translate(${pX}px,${pY}px) scale(${scale})`; 
    render(); 
}

// বাটন জুম সচল করা
document.getElementById('plusBtn').onclick = () => { scale = Math.min(scale * 1.5, 3); updateUI(); };
document.getElementById('minusBtn').onclick = () => { scale = Math.max(scale / 1.5, 0.02); updateUI(); };
function resetView() { scale = 0.05; pX = 0; pY = 0; updateUI(); }

// সার্চ অটো-ফোকাস
function searchPixel() {
    const q = document.getElementById('searchInput').value;
    if(q > 0 && q <= 100000) {
        const idx = q - 1;
        const tx = (idx % cols) * blockW;
        const ty = Math.floor(idx / cols) * blockH;
        scale = 1.2;
        const vp = document.getElementById('viewport');
        pX = (vp.offsetWidth/2) - (tx + 50) * scale;
        pY = (vp.offsetHeight/2) - (ty + 30) * scale;
        updateUI();
        document.getElementById('search-panel').classList.add('search-hidden');
    }
}

function toggleSearch() { document.getElementById('search-panel').classList.toggle('search-hidden'); }

// এরিয়ার ভেতরে জুম, বাইরে স্ক্রল
const vp = document.getElementById('viewport');
vp.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) scale = Math.min(scale * 1.2, 3);
    else scale = Math.max(scale / 1.2, 0.02);
    updateUI();
}, {passive: false});

vp.onmousedown = (e) => { isD = true; sX = e.clientX-pX; sY = e.clientY-pY; };
window.onmouseup = () => isD = false;
window.onmousemove = (e) => { if(isD){ pX = e.clientX-sX; pY = e.clientY-sY; updateUI(); } };

db.ref('pixels').on('value', s => { pixels = s.val() || {}; render(); document.getElementById('sold-count').innerText = Object.keys(pixels).length; });
updateUI();
