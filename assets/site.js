// Trademark Greetings storefront
const RAWPREFIX = 'https://raw.githubusercontent.com/jgffyjbv/trademarkgreetings/main/';
const rel = u => u.replace(RAWPREFIX, '');

const CAT_ORDER = ['Birthday','Thank You','New Baby','Miss You','Congratulations','Encouragement',
  'Family','New Home','Graduation','Get Well','Sympathy','Just Because'];

let PRODUCTS = [], CARDS = [], NOTES = [], activeCat = 'All', viewList = [], lbIndex = 0;

async function boot(){
  try{
    const res = await fetch('data/products.json', {cache:'no-store'});
    PRODUCTS = await res.json();
  }catch(e){ console.error('load failed', e); return; }
  PRODUCTS.forEach(p => p.images = p.images.map(rel));
  CARDS = PRODUCTS.filter(p => p.type === 'card');
  NOTES = PRODUCTS.filter(p => p.type === 'notepad');
  buildHeroCollage();
  buildAboutArt();
  buildFilters();
  renderCards();
  renderNotes();
  wireLightbox();
  if(location.hash === '#peek') setTimeout(() => openLightbox(0), 350);
}

function catCounts(){
  const c = {}; CARDS.forEach(p => c[p.category] = (c[p.category]||0)+1); return c;
}
function buildFilters(){
  const counts = catCounts();
  const cats = ['All', ...CAT_ORDER.filter(c => counts[c])];
  const box = document.getElementById('filters');
  box.innerHTML = cats.map(c => {
    const n = c === 'All' ? CARDS.length : counts[c];
    return `<button class="pill${c===activeCat?' active':''}" data-cat="${c}">${c}<span class="n">${n}</span></button>`;
  }).join('');
  box.querySelectorAll('.pill').forEach(b => b.onclick = () => {
    activeCat = b.dataset.cat;
    box.querySelectorAll('.pill').forEach(x => x.classList.toggle('active', x.dataset.cat===activeCat));
    renderCards();
    document.getElementById('shop').scrollIntoView({behavior:'smooth', block:'start'});
  });
}

function cardHTML(p, i){
  return `<article class="prod" data-i="${i}">
    <div class="thumb"><span class="tag">${p.category}</span>
      <img loading="lazy" src="${p.images[0]}" alt="${p.title} — greeting card front">
      <div class="peek">✦ Click to read what's inside</div>
    </div>
    <div class="meta"><h3>${p.title}</h3>
      <div class="row"><span class="price">$${p.price}</span><span class="add">♥ View</span></div>
    </div></article>`;
}
function renderCards(){
  viewList = activeCat==='All' ? CARDS : CARDS.filter(p => p.category===activeCat);
  const g = document.getElementById('cardGrid');
  g.innerHTML = viewList.length ? viewList.map(cardHTML).join('')
    : `<div class="empty">No cards here yet — try another category ♥</div>`;
  g.querySelectorAll('.prod').forEach(el => el.onclick = () => openLightbox(+el.dataset.i));
}
function renderNotes(){
  const g = document.getElementById('padGrid');
  g.innerHTML = NOTES.map((p,i)=>`<article class="prod" data-n="${i}">
    <div class="thumb"><img loading="lazy" src="${p.images[0]}" alt="${p.title}"></div>
    <div class="meta"><h3>${p.title}</h3>
      <div class="row"><span class="price">$${p.price}</span><span class="add">♥ View</span></div>
    </div></article>`).join('');
  g.querySelectorAll('.prod').forEach(el => el.onclick = () => openNote(+el.dataset.n));
}

/* lightbox */
const lb = () => document.getElementById('lb');
function openLightbox(i){
  lbIndex = i; const p = viewList[i];
  document.getElementById('lbTag').textContent = p.category;
  document.getElementById('lbTitle').textContent = p.title;
  document.getElementById('lbPrice').textContent = '$'+p.price;
  document.getElementById('lbBody').className = 'lb-body';
  document.getElementById('lbBody').innerHTML =
    `<div class="lb-pane"><img src="${p.images[0]}" alt="${p.title} front"><div class="cap">the front</div></div>
     <div class="lb-pane"><img src="${p.images[1]}" alt="${p.title} inside"><div class="cap">…and inside ♥</div></div>`;
  document.getElementById('lbNav').style.display = '';
  lb().classList.add('open'); document.body.style.overflow='hidden';
}
function openNote(i){
  const p = NOTES[i];
  document.getElementById('lbTag').textContent = 'Notepad';
  document.getElementById('lbTitle').textContent = p.title;
  document.getElementById('lbPrice').textContent = '$'+p.price;
  document.getElementById('lbBody').className = 'lb-body single';
  document.getElementById('lbBody').innerHTML =
    `<div class="lb-pane"><img src="${p.images[0]}" alt="${p.title}"><div class="cap">die-cut lined notepad</div></div>`;
  document.getElementById('lbNav').style.display = 'none';
  lb().classList.add('open'); document.body.style.overflow='hidden';
}
function closeLB(){ lb().classList.remove('open'); document.body.style.overflow=''; }
function step(d){ lbIndex = (lbIndex + d + viewList.length) % viewList.length; openLightbox(lbIndex); }
function wireLightbox(){
  document.getElementById('lbClose').onclick = closeLB;
  document.getElementById('lbPrev').onclick = () => step(-1);
  document.getElementById('lbNext').onclick = () => step(1);
  lb().onclick = e => { if(e.target === lb()) closeLB(); };
  document.addEventListener('keydown', e => {
    if(!lb().classList.contains('open')) return;
    if(e.key==='Escape') closeLB();
    if(document.getElementById('lbNav').style.display!=='none'){
      if(e.key==='ArrowLeft') step(-1);
      if(e.key==='ArrowRight') step(1);
    }
  });
}

/* decorative */
function buildHeroCollage(){
  const picks = ['24-its-a-boy','2-bday-cupcake','58-congrats-target','34-new-home-welcome-home','9-bday-ladybug'];
  const box = document.getElementById('collage'); if(!box) return;
  picks.forEach((slug,i)=>{
    const p = CARDS.find(c=>c.slug===slug) || CARDS[i];
    const img = document.createElement('img');
    img.className = 'c c'+(i+1); img.src = p.images[0]; img.alt = p.title; img.loading='eager';
    box.appendChild(img);
  });
}
function buildAboutArt(){
  const picks = ['104-boggle-bday','48-sisters-are-the-greatest-gift','110-greatest-teacher-dictionary'];
  const box = document.getElementById('aboutArt'); if(!box) return;
  picks.forEach((slug,i)=>{
    const p = CARDS.find(c=>c.slug===slug) || CARDS[i];
    const img = document.createElement('img'); img.src = p.images[0]; img.alt = p.title; img.loading='lazy';
    box.appendChild(img);
  });
}

/* mobile menu */
function toggleMenu(){
  const n = document.querySelector('.nav');
  const open = n.style.display === 'flex';
  n.style.display = open ? '' : 'flex';
  if(!open){ n.style.position='absolute';n.style.top='78px';n.style.right='24px';n.style.flexDirection='column';
    n.style.background='#fff';n.style.padding='18px 22px';n.style.borderRadius='16px';n.style.boxShadow='var(--shadow-lg)'; }
}
document.addEventListener('DOMContentLoaded', () => {
  boot();
  const mb = document.getElementById('menuBtn'); if(mb) mb.onclick = toggleMenu;
});
