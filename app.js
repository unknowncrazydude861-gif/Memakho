import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { EXRLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/EXRLoader.js';

const state={photos:[],sceneProgress:0,targetProgress:0,pointerX:0,pointerY:0};
const demoPhotos=[
 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=82'
];

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const toast=(msg)=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)};

// Three-dimensional memory environment
const root=$('#webgl');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;root.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);camera.position.set(0,0,15);
scene.fog=new THREE.FogExp2(0x090b07,.027);
scene.add(new THREE.AmbientLight(0xc7d0bc,.85));
const key=new THREE.PointLight(0xe6d7ad,20,30);key.position.set(3,4,7);scene.add(key);
const fill=new THREE.PointLight(0x9aa77f,10,22);fill.position.set(-6,-3,2);scene.add(fill);

const world=new THREE.Group();scene.add(world);
const orb=new THREE.Mesh(new THREE.SphereGeometry(2.05,64,64),new THREE.MeshPhysicalMaterial({color:0x9da98d,metalness:.08,roughness:.12,transmission:.72,thickness:1.4,transparent:true,opacity:.72,ior:1.46,envMapIntensity:1.2}));world.add(orb);
const inner=new THREE.Mesh(new THREE.SphereGeometry(1.18,40,40),new THREE.MeshPhysicalMaterial({color:0x151912,roughness:.25,metalness:.15,emissive:0x333922,emissiveIntensity:.35}));world.add(inner);
const ringMat=new THREE.MeshBasicMaterial({color:0xd9ceac,transparent:true,opacity:.36});
for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(2.7+i*.42,.012,10,180),ringMat.clone());r.rotation.set(.7+i*.4,.2-i*.3,.3+i*.7);world.add(r)}
const glow=new THREE.PointLight(0xf4dfa5,22,9);glow.position.set(0,0,1);world.add(glow);

const particleGroup=new THREE.Group();world.add(particleGroup);
for(let i=0;i<75;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(Math.random()*.035+.012,8,8),new THREE.MeshBasicMaterial({color:i%3===0?0xd6ca9f:0x9aa98b,transparent:true,opacity:.32+Math.random()*.35}));const a=Math.random()*Math.PI*2;const rad=3+Math.random()*6;p.position.set(Math.cos(a)*rad,(Math.random()-.5)*7,Math.sin(a)*rad*.45-2);p.userData={a,r:rad,s:.002+Math.random()*.006,phase:Math.random()*6};particleGroup.add(p)}

const photoGroup=new THREE.Group();world.add(photoGroup);
const textureLoader=new THREE.TextureLoader();
const photoMeshes=[];
function makePhotoTexture(url){return new Promise(resolve=>{textureLoader.load(url,tex=>{tex.colorSpace=THREE.SRGBColorSpace;resolve(tex)},undefined,()=>resolve(null))})}
function makeCard(tex,index,total){const aspect=1.16;const geo=new THREE.PlaneGeometry(2.45,2.45/aspect);const mat=new THREE.MeshPhysicalMaterial({map:tex,color:0xffffff,roughness:.6,metalness:.08,transparent:true});const mesh=new THREE.Mesh(geo,mat);mesh.userData.base=index;mesh.userData.total=total;mesh.userData.seed=Math.random()*10;const frame=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xe3d6b3,transparent:true,opacity:.38}));mesh.add(frame);photoGroup.add(mesh);photoMeshes.push(mesh);return mesh}
async function rebuildPhotoMeshes(){for(const m of photoMeshes){m.material.map?.dispose();m.material.dispose();m.geometry.dispose();photoGroup.remove(m)}photoMeshes.length=0;const list=state.photos.length?state.photos.map(p=>p.url):demoPhotos;for(let i=0;i<list.length;i++){const tex=await makePhotoTexture(list[i]);if(tex)makeCard(tex,i,list.length)}layoutPhotos()}
function layoutPhotos(){const total=photoMeshes.length||1;photoMeshes.forEach((m,i)=>{const a=(i/Math.max(total,1))*Math.PI*2;const radius=4.1+(i%3)*.45;m.userData.a=a;m.userData.radius=radius;m.position.set(Math.cos(a)*radius,Math.sin(a*1.35)*1.55,Math.sin(a)*1.3-1.1);m.rotation.set(-.08*Math.sin(a),-a+.35,.08*Math.cos(a));m.scale.setScalar(.92+(i%2)*.07)})}

function updateWorld(){
 state.sceneProgress+=(state.targetProgress-state.sceneProgress)*.055;
 const p=state.sceneProgress;
 const px=state.pointerX,py=state.pointerY;
 world.rotation.y+=(px*.16+Math.sin(p*2)*.035-world.rotation.y)*.04;
 world.rotation.x+=(-py*.08+Math.cos(p*1.6)*.018-world.rotation.x)*.04;
 world.position.y+=(-p*1.15-world.position.y)*.05;
 world.position.z+=(Math.sin(p*Math.PI)*.55-world.position.z)*.04;
 orb.rotation.y+=.0018;inner.rotation.y-=.0012;
 particleGroup.rotation.y+=.001;
 photoMeshes.forEach((m,i)=>{const a=m.userData.a+performance.now()*.00004*(i%2?1:-1);const r=m.userData.radius;m.position.x=Math.cos(a)*r;m.position.y=Math.sin(a*1.35)*1.55;m.position.z=Math.sin(a)*1.3-1.1+(p>1.35?Math.sin(i)*.3:0);m.rotation.y=-a+.35+px*.08;m.rotation.x=-.08*Math.sin(a)+py*.05;const pulse=1+.045*Math.sin(performance.now()*.0012+i);m.scale.setScalar((.94+(i%2)*.06)*pulse)});
 key.position.x=3+px*2;key.position.y=4-py*2;
 renderer.render(scene,camera);requestAnimationFrame(updateWorld)
}

function scrollProgress(){const max=document.documentElement.scrollHeight-innerHeight;state.targetProgress=max>0?scrollY/max*2.3:0}
addEventListener('scroll',scrollProgress,{passive:true});
addEventListener('pointermove',e=>{state.pointerX=e.clientX/innerWidth-.5;state.pointerY=e.clientY/innerHeight-.5});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});

// Local photo library — files never leave the browser.
const DB='memakho-memory-library',STORE='photos';
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbPut(item){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function dbAll(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const q=tx.objectStore(STORE).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function dbClear(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function formatDate(ms){const d=new Date(ms);return d.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}
function makeObjectUrl(blob){return URL.createObjectURL(blob)}
function renderLibrary(){const grid=$('#libraryGrid'),empty=$('#libraryEmpty');grid.innerHTML='';const list=state.photos;list.forEach((p,i)=>{const card=document.createElement('article');card.className='memory-card';card.style.setProperty('--ry',`${(i%3-1)*3}deg`);card.style.setProperty('--rx',`${(i%2?.6:-.6)}deg`);card.innerHTML=`<img src="${p.url}" alt="${p.name.replace(/"/g,'&quot;')}"><div class="memory-meta"><strong>${p.name.replace(/\.[^/.]+$/,'').slice(0,35)}</strong><span>${formatDate(p.lastModified)}</span></div>`;grid.appendChild(card)});empty.style.display=list.length?'none':'block';$('#photoStatus').textContent=`${list.length} local photo${list.length===1?'':'s'} loaded`}
async function addFiles(fileList){const files=[...fileList].filter(f=>f.type.startsWith('image/'));if(!files.length){toast('No image files found.');return}toast(`Reading ${files.length} photo${files.length>1?'s':''}…`);for(const file of files){const item={id:`${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,name:file.name,size:file.size,lastModified:file.lastModified,blob:file};await dbPut(item)}await loadPhotos();toast(`${files.length} photo${files.length>1?'s':''} added privately`)}
async function loadPhotos(){const saved=await dbAll();state.photos=saved.map(p=>({...p,url:makeObjectUrl(p.blob)}));renderLibrary();await rebuildPhotoMeshes()}
$('#photoInput').addEventListener('change',e=>addFiles(e.target.files));$('#folderInput').addEventListener('change',e=>addFiles(e.target.files));
$('#importBtn').onclick=()=>$('#photoInput').click();$('#folderBtn').onclick=()=>$('#folderInput').click();$('#importTop').onclick=()=>$('#photoInput').click();$('#photoTool').onclick=()=>$('#photoInput').click();
$('#clearBtn').onclick=async()=>{await dbClear();state.photos.forEach(p=>URL.revokeObjectURL(p.url));state.photos=[];renderLibrary();await rebuildPhotoMeshes();toast('Your local memory library is empty')};

// Drag and drop support over the whole page.
addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});
addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();addFiles(e.dataTransfer.files)});

$('#exploreBtn').onclick=()=>$('#features').scrollIntoView({behavior:'smooth'});
$('#timelineBtn').onclick=()=>$('#library').scrollIntoView({behavior:'smooth'});
$('#exploreApp').onclick=()=>$('#library').scrollIntoView({behavior:'smooth'});
$$('.capture-tools button').forEach(b=>b.addEventListener('click',()=>toast(`${b.dataset.kind} memory tool selected`)));

// Hide loader only after the 3D scene is ready.
(async()=>{await loadPhotos();setTimeout(()=>$('#loader').classList.add('hide'),900);updateWorld()})().catch(()=>{renderLibrary();setTimeout(()=>$('#loader').classList.add('hide'),900);updateWorld()});
