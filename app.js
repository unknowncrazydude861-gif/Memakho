import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const state={photos:[],sceneProgress:0,targetProgress:0,pointerX:0,pointerY:0};
const demoPhotos=[
 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=82',
 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=82'
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)};

const root=$('#webgl');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;root.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);camera.position.set(0,0,15);
scene.fog=new THREE.FogExp2(0x070805,.026);
scene.add(new THREE.AmbientLight(0xd5dacb,.72));
const key=new THREE.PointLight(0xe8d7a3,24,32);key.position.set(5,4,8);scene.add(key);
const fill=new THREE.PointLight(0x7e916a,11,25);fill.position.set(-7,-3,2);scene.add(fill);

const world=new THREE.Group();world.position.set(3.35,.15,-.25);world.scale.setScalar(1.08);scene.add(world);
const orb=new THREE.Mesh(new THREE.SphereGeometry(2.12,64,64),new THREE.MeshPhysicalMaterial({color:0xaab493,metalness:.08,roughness:.1,transmission:.76,thickness:1.55,transparent:true,opacity:.74,ior:1.46,envMapIntensity:1.35}));world.add(orb);
const inner=new THREE.Mesh(new THREE.SphereGeometry(1.16,40,40),new THREE.MeshPhysicalMaterial({color:0x0b0f0a,roughness:.22,metalness:.2,emissive:0x363a26,emissiveIntensity:.45}));world.add(inner);
const innerGlow=new THREE.PointLight(0xe7d795,16,8);innerGlow.position.set(0,0,1.1);world.add(innerGlow);
const ringMat=new THREE.MeshBasicMaterial({color:0xd8ca9a,transparent:true,opacity:.34});
for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(2.68+i*.43,.012,8,180),ringMat.clone());r.rotation.set(.65+i*.36,.2-i*.24,.28+i*.7);world.add(r)}

const shardGroup=new THREE.Group();world.add(shardGroup);
const shardMats=[new THREE.MeshStandardMaterial({color:0x11130f,roughness:1}),new THREE.MeshStandardMaterial({color:0x1a1b16,roughness:1,metalness:.03}),new THREE.MeshStandardMaterial({color:0x2a2a23,roughness:.95})];
for(let i=0;i<28;i++){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(.08+Math.random()*.42,0),shardMats[i%3]);const a=Math.random()*Math.PI*2,rad=3.4+Math.random()*5.8;s.position.set(Math.cos(a)*rad,(Math.random()-.5)*5.5,Math.sin(a)*rad*.38-1.8);s.rotation.set(Math.random()*2,Math.random()*2,Math.random()*2);s.userData={a,rad,phase:Math.random()*Math.PI*2,speed:.15+Math.random()*.45};shardGroup.add(s)}
const goldGroup=new THREE.Group();world.add(goldGroup);
for(let i=0;i<11;i++){const geo=Math.random()>.55?new THREE.OctahedronGeometry(.08+Math.random()*.18,0):new THREE.TetrahedronGeometry(.09+Math.random()*.15,0);const s=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xdccf8f,transparent:true,opacity:.58+Math.random()*.3}));const a=Math.random()*Math.PI*2,rad=3.2+Math.random()*5.2;s.position.set(Math.cos(a)*rad,(Math.random()-.5)*5.2,Math.sin(a)*rad*.42-1.3);s.userData={phase:Math.random()*6,speed:.2+Math.random()*.5};goldGroup.add(s)}
const particleGroup=new THREE.Group();world.add(particleGroup);
for(let i=0;i<75;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(Math.random()*.035+.012,8,8),new THREE.MeshBasicMaterial({color:i%3===0?0xd6ca9f:0x9aa98b,transparent:true,opacity:.22+Math.random()*.42}));const a=Math.random()*Math.PI*2,rad=3+Math.random()*6;p.position.set(Math.cos(a)*rad,(Math.random()-.5)*7,Math.sin(a)*rad*.45-2);p.userData={phase:Math.random()*6};particleGroup.add(p)}

const photoGroup=new THREE.Group();world.add(photoGroup);
const textureLoader=new THREE.TextureLoader(),photoMeshes=[];
function makePhotoTexture(url){return new Promise(resolve=>{textureLoader.load(url,tex=>{tex.colorSpace=THREE.SRGBColorSpace;resolve(tex)},undefined,()=>resolve(null))})}
function makeCard(tex,index,total){const geo=new THREE.PlaneGeometry(2.35,2.35/1.16);const mat=new THREE.MeshPhysicalMaterial({map:tex,color:0xffffff,roughness:.58,metalness:.08,transparent:true,side:THREE.DoubleSide});const mesh=new THREE.Mesh(geo,mat);mesh.userData.base=index;mesh.userData.total=total;mesh.userData.phase=index*1.7;const frame=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xe3d6b3,transparent:true,opacity:.52}));mesh.add(frame);photoGroup.add(mesh);photoMeshes.push(mesh);return mesh}
async function rebuildPhotoMeshes(){for(const m of photoMeshes){m.material.map?.dispose();m.material.dispose();m.geometry.dispose();photoGroup.remove(m)}photoMeshes.length=0;const list=state.photos.length?state.photos.map(p=>p.url):demoPhotos;for(let i=0;i<list.length;i++){const tex=await makePhotoTexture(list[i]);if(tex)makeCard(tex,i,list.length)}layoutPhotos()}
function layoutPhotos(){const total=Math.max(photoMeshes.length,1);photoMeshes.forEach((m,i)=>{const a=(i/total)*Math.PI*2;m.userData.a=a;m.userData.radius=4.15+(i%3)*.28;m.userData.orbitSpeed=.12+(i%4)*.018;m.userData.orbitTilt=(i%3-1)*.14;m.scale.setScalar(.94+(i%2)*.06)})}

function updateWorld(){state.sceneProgress+=(state.targetProgress-state.sceneProgress)*.055;const p=state.sceneProgress,px=state.pointerX,py=state.pointerY;const desiredX=3.35-Math.min(p,1.25)*2.45;const desiredY=.15-p*.22;world.position.x+=(desiredX+px*.45-world.position.x)*.04;world.position.y+=(desiredY-py*.22-world.position.y)*.04;world.position.z+=(-.25+Math.sin(p*Math.PI)*.5-world.position.z)*.04;world.rotation.y+=(px*.16+Math.sin(p*1.8)*.045-world.rotation.y)*.04;world.rotation.x+=(-py*.08+Math.cos(p*1.35)*.02-world.rotation.x)*.04;orb.rotation.y+=.0018;orb.rotation.x+=.00025;inner.rotation.y-=.00125;photoGroup.rotation.y+=.00008;shardGroup.rotation.y+=.00055;goldGroup.rotation.y-=.0006;particleGroup.rotation.y+=.001;const now=performance.now()*.001;shardGroup.children.forEach(s=>{const u=s.userData;s.position.y+=Math.sin(now*u.speed+u.phase)*.00075;s.rotation.x+=.0007;s.rotation.z-=.0005});goldGroup.children.forEach(s=>{const u=s.userData;s.rotation.x+=.002;s.rotation.y+=.003;s.position.y+=Math.sin(now*u.speed+u.phase)*.001});key.position.x=5+px*2;key.position.y=4-py*2;renderer.render(scene,camera);requestAnimationFrame(updateWorld)}

// Photos now travel continuously in a real 3D orbit around the central memory orb.
function animatePhotoOrbit(){const now=performance.now()*.001;photoMeshes.forEach((m,i)=>{const u=m.userData;const a=(u.a??0)+now*(u.orbitSpeed??.14);const r=u.radius??4.2;const tilt=u.orbitTilt??0;const x=Math.cos(a)*r;const z=Math.sin(a)*r;const y=Math.sin(a*2+u.phase)*.36-Math.sin(a)*r*Math.sin(tilt);m.position.set(x,y,z);m.rotation.set(.08*Math.sin(a)+tilt*.18,-a+Math.PI/2,.025*Math.cos(a));m.scale.setScalar((.94+(i%2)*.06)*(1+.025*Math.sin(now*1.15+i)))});requestAnimationFrame(animatePhotoOrbit)}

function scrollProgress(){const max=document.documentElement.scrollHeight-innerHeight;state.targetProgress=max>0?scrollY/max*2.3:0}
addEventListener('scroll',scrollProgress,{passive:true});addEventListener('pointermove',e=>{state.pointerX=e.clientX/innerWidth-.5;state.pointerY=e.clientY/innerHeight-.5});addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});

const DB='memakho-memory-library',STORE='photos';
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbPut(item){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function dbAll(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const q=tx.objectStore(STORE).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function dbClear(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function formatDate(ms){return new Date(ms).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}
function makeObjectUrl(blob){return URL.createObjectURL(blob)}
function renderLibrary(){const grid=$('#libraryGrid'),empty=$('#libraryEmpty');grid.innerHTML='';const list=state.photos;list.forEach((p,i)=>{const card=document.createElement('article');card.className='memory-card';card.style.setProperty('--ry',`${(i%3-1)*3}deg`);card.style.setProperty('--rx',`${(i%2?.6:-.6)}deg`);card.innerHTML=`<img src="${p.url}" alt="${p.name.replace(/"/g,'&quot;')}"><div class="memory-meta"><strong>${p.name.replace(/\.[^/.]+$/,'').slice(0,35)}</strong><span>${formatDate(p.lastModified)}</span></div>`;grid.appendChild(card)});empty.style.display=list.length?'none':'block';$('#photoStatus').textContent=`${list.length} local photo${list.length===1?'':'s'} loaded`}
async function addFiles(fileList){const files=[...fileList].filter(f=>f.type.startsWith('image/'));if(!files.length){toast('No image files found.');return}toast(`Reading ${files.length} photo${files.length>1?'s':''}…`);for(const file of files){await dbPut({id:`${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,name:file.name,size:file.size,lastModified:file.lastModified,blob:file})}await loadPhotos();toast(`${files.length} photo${files.length>1?'s':''} added privately`)}
async function loadPhotos(){const saved=await dbAll();state.photos=saved.map(p=>({...p,url:makeObjectUrl(p.blob)}));renderLibrary();await rebuildPhotoMeshes()}
$('#photoInput').addEventListener('change',e=>addFiles(e.target.files));$('#folderInput').addEventListener('change',e=>addFiles(e.target.files));$('#importBtn').onclick=()=>$('#photoInput').click();$('#folderBtn').onclick=()=>$('#folderInput').click();$('#importTop').onclick=()=>$('#photoInput').click();$('#photoTool').onclick=()=>$('#photoInput').click();
$('#clearBtn').onclick=async()=>{await dbClear();state.photos.forEach(p=>URL.revokeObjectURL(p.url));state.photos=[];renderLibrary();await rebuildPhotoMeshes();toast('Your local memory library is empty')};
addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();addFiles(e.dataTransfer.files)});
$('#exploreBtn').onclick=()=>$('#features').scrollIntoView({behavior:'smooth'});$('#timelineBtn').onclick=()=>$('#library').scrollIntoView({behavior:'smooth'});$('#exploreApp').onclick=()=>$('#library').scrollIntoView({behavior:'smooth'});$$('.capture-tools button').forEach(b=>b.addEventListener('click',()=>toast(`${b.dataset.kind} memory tool selected`)));
(async()=>{await loadPhotos();setTimeout(()=>$('#loader').classList.add('hide'),900);updateWorld();animatePhotoOrbit()})().catch(()=>{renderLibrary();setTimeout(()=>$('#loader').classList.add('hide'),900);updateWorld();animatePhotoOrbit()});
