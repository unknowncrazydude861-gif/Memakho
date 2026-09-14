const preloader=document.querySelector('.preloader');
window.addEventListener('load',()=>setTimeout(()=>preloader.classList.add('hide'),700));

const hero=document.querySelector('.hero');
const layers=[...document.querySelectorAll('[data-depth]')];
let mx=0,my=0,tx=0,ty=0;
window.addEventListener('mousemove',e=>{mx=(e.clientX/window.innerWidth-.5);my=(e.clientY/window.innerHeight-.5)});
function parallax(){tx+=(mx-tx)*.035;ty+=(my-ty)*.035;layers.forEach(el=>{const d=Number(el.dataset.depth);el.style.transform=`translate3d(${tx*d*22}px,${ty*d*16}px,0)`});requestAnimationFrame(parallax)}
parallax();

const scene=document.querySelector('.scene');
window.addEventListener('scroll',()=>{const y=window.scrollY;scene.style.transform=`translateY(${y*.045}px) scale(${1+Math.min(y/16000,.025)})`;});

// A tiny procedural ambient piano bed. It uses Web Audio oscillators, so there is no copyrighted audio file.
const toggle=document.getElementById('soundToggle');
const label=toggle.querySelector('.sound-label');
let audioCtx=null,master=null,timer=null,playing=false;
const notes={C3:130.81,D3:146.83,E3:164.81,G3:196,A3:220,C4:261.63,D4:293.66,E4:329.63,G4:392,A4:440,C5:523.25};
const progression=[['C3','E3','G3'],['A3','C4','E4'],['F3','A3','C4'],['G3','B3','D4']];
const melody=[['E4',0],['G4',.55],['A4',1.1],['G4',1.8],['E4',2.55],['D4',3.2],['C4',4.05],['E4',4.75]];
function tone(freq,start,duration,vol=0.025){if(!audioCtx||!master)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();o.type='sine';o.frequency.value=freq;filter.type='lowpass';filter.frequency.value=1800;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(vol,start+.04);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(filter).connect(g).connect(master);o.start(start);o.stop(start+duration+.05)}
function playBar(){if(!audioCtx)return;const now=audioCtx.currentTime+.05;const idx=Math.floor(Date.now()/1000/12)%4;const chord=progression[idx];chord.forEach((n,i)=>tone(notes[n]||196,now+i*.08,5.8,.018));melody.forEach(([n,t])=>tone(notes[n],now+t,1.6,.012));}
function startMusic(){audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=.35;master.connect(audioCtx.destination);playBar();timer=setInterval(playBar,12000);playing=true;toggle.classList.add('on');toggle.setAttribute('aria-pressed','true');label.textContent='sound on'}
function stopMusic(){if(timer)clearInterval(timer);timer=null;if(audioCtx){audioCtx.close();audioCtx=null}playing=false;toggle.classList.remove('on');toggle.setAttribute('aria-pressed','false');label.textContent='sound off'}
toggle.addEventListener('click',()=>playing?stopMusic():startMusic());

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'})}}));
