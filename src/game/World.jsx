import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';
import {makePerson} from '../characters/model';
import {makeChunk,box} from '../structures/world';
import {moveWithCollision} from '../physics/movement';
import {districtNames,hash} from '../biomes/generation';
import {containerAvailable,takeFromContainer} from '../loot/containers';
import {initialNeeds,advanceNeeds,consume} from '../survival/needs';
import {BUILDINGS,makeBuild,cured} from '../construction/building';
import {sound} from './sound';

export default function World({save,control,onUpdate,actionRef,settings}){
 const mount=useRef(null), onUpdateRef=useRef(onUpdate),settingsRef=useRef(settings);onUpdateRef.current=onUpdate;settingsRef.current=settings;
 useEffect(()=>{
  const el=mount.current, scene=new THREE.Scene();scene.background=new THREE.Color('#767e6b');scene.fog=new THREE.Fog('#767e6b',30,75);
  const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.BasicShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
  const camera=new THREE.OrthographicCamera(-15,15,10,-10,.1,150);const ambient=new THREE.HemisphereLight('#c5c8a9','#424a38',2);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#f1dfb6',2.2);sun.castShadow=true;sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-25,right:25,top:25,bottom:-25});scene.add(sun);scene.add(sun.target);
  const player=makePerson(save.character);scene.add(player);player.position.set(save.position?.x ?? -3,0,save.position?.z ?? -1);
  let elapsed=save.elapsed||0,health=save.health??100,needs=initialNeeds(save.needs),inventory=[...(save.inventory||[])],looted={...(save.looted||{})},buildings=[...(save.buildings||[])];
  let chunks=new Map(),zombies=[],people=[],builtMeshes=[],blood=[],lastDistrict='',noticeUntil=0,attackAt=0,updateClock=0,raid=null,last=performance.now(),frame=0,angle=Math.PI/4,pointer=null;
  const seed=save.seed,spawnChunk=save.spawnChunk||{x:0,z:0},temp=new THREE.Vector3();
  const emitSound=kind=>sound(kind,settingsRef.current.sound);
  const startRaid=()=>{let plane=new THREE.Group();box(plane,5,.3,.7,'#51574f',0,0,0);box(plane,1,.15,4,'#51574f',0,0,0);box(plane,.8,.6,.2,'#51574f',-2,.3,0);plane.position.set(player.position.x-25,12,player.position.z);scene.add(plane);raid={plane,start:elapsed,x:player.position.x,z:player.position.z,detonated:false};onUpdateRef.current({message:'Над городом слышен гул самолёта…'})};
  const resize=()=>{let w=el.clientWidth,h=el.clientHeight;renderer.setSize(Math.max(1,Math.floor(w*.65)),Math.max(1,Math.floor(h*.65)),false);renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';let aspect=w/h;camera.left=-11*aspect;camera.right=11*aspect;camera.top=11;camera.bottom=-11;camera.updateProjectionMatrix()};resize();window.addEventListener('resize',resize);
  const dragStart=e=>{pointer={id:e.pointerId,x:e.clientX};renderer.domElement.setPointerCapture(e.pointerId)};
  const dragMove=e=>{if(pointer?.id===e.pointerId){angle-=(e.clientX-pointer.x)*.006*settingsRef.current.sensitivity;pointer.x=e.clientX}};
  const dragEnd=()=>{pointer=null};renderer.domElement.addEventListener('pointerdown',dragStart);renderer.domElement.addEventListener('pointermove',dragMove);renderer.domElement.addEventListener('pointerup',dragEnd);renderer.domElement.addEventListener('pointercancel',dragEnd);
  const syncBuildings=()=>{for(const m of builtMeshes){scene.remove(m);m.geometry.dispose()}builtMeshes=buildings.map(b=>{let def=BUILDINGS[b.id];if(!def)return null;let m=box(scene,def.width,def.height,def.depth,def.color,b.x,def.height/2,b.z);return m}).filter(Boolean)};syncBuildings();
  const disposeGroup=group=>group.traverse(o=>{if(o.geometry)o.geometry.dispose()});
  const manage=()=>{
   let cx=Math.round(player.position.x/24),cz=Math.round(player.position.z/24);
   for(let x=cx-1;x<=cx+1;x++)for(let z=cz-1;z<=cz+1;z++){
    let key=x+','+z;if(!chunks.has(key)){let ch=makeChunk(x,z,seed,spawnChunk);chunks.set(key,ch);scene.add(ch.group);
     if((ch.type==='forest'||ch.type==='river')&&hash(x,z,seed+111)>.66){const animal=new THREE.Group();box(animal,1,.5,.45,'#89745b',0,.7,0);box(animal,.35,.35,.35,'#89745b',.55,.9,0);for(let dx of [-.35,.35])for(let dz of [-.16,.16])box(animal,.1,.5,.1,'#50483b',dx,.25,dz);animal.position.set(x*24+7,0,z*24+4);ch.group.add(animal);ch.animal=animal}
     if((x!==spawnChunk.x||z!==spawnChunk.z)&&hash(x,z,seed+99)>.87&&!['forest','river'].includes(ch.type)){let npc=makePerson({skin:'#bd8c6b',shirt:'#7e6d5a',hair:2});npc.position.set(x*24+5,0,z*24+3);npc.userData.hostile=hash(x,z,seed+100)>.7;npc.userData.hit=0;npc.userData.hp=75;ch.group.add(npc);people.push({npc,key})}
    }
   }
   for(const [key,ch] of chunks){let [x,z]=key.split(',').map(Number);if(Math.abs(x-cx)>1||Math.abs(z-cz)>1){scene.remove(ch.group);disposeGroup(ch.group);chunks.delete(key);people=people.filter(p=>p.key!==key)}}
   let d=chunks.get(cx+','+cz)?.type;if(d!==lastDistrict){lastDistrict=d;noticeUntil=performance.now()+3500;onUpdateRef.current({place:districtNames[d],showPlace:true})}
  };
  const snapshot=()=>({position:{x:player.position.x,z:player.position.z},elapsed,health,needs:{...needs},inventory:[...inventory],looted:{...looted},buildings:[...buildings]});
  const available=l=>containerAvailable(looted,l.id);
  const nearest=()=>[...chunks.values()].flatMap(c=>c.loot).filter(available).sort((a,b)=>Math.hypot(a.x-player.position.x,a.z-player.position.z)-Math.hypot(b.x-player.position.x,b.z-player.position.z))[0];
  actionRef.current={
   interact:()=>{let npc=people.find(p=>p.npc.position.distanceTo(player.position)<2.5);if(npc){onUpdateRef.current({message:npc.npc.userData.hostile?'Незнакомец выглядит опасно.':'Выживший: «Держитесь подальше от города.»'});return}let near=nearest();if(near&&Math.hypot(near.x-player.position.x,near.z-player.position.z)<2.5){emitSound('search');onUpdateRef.current({openLoot:near.id,snapshot:snapshot()})}else onUpdateRef.current({message:'Здесь нечего обыскать'});},
   attack:()=>{let now=performance.now();if(now-attackAt<400)return;attackAt=now;emitSound('hit');for(const z of zombies){if(z.position.distanceTo(player.position)<2.3){z.userData.hp-=inventory.includes('bat')?55:25;z.position.x+=(z.position.x-player.position.x)*.4;z.position.z+=(z.position.z-player.position.z)*.4;blood.push(box(scene,.6,.02,.6,'#673a32',z.position.x,.02,z.position.z));if(blood.length>60){let old=blood.shift();scene.remove(old);old.geometry.dispose()}}}people=people.filter(p=>{let npc=p.npc;if(npc.userData.hostile&&npc.position.distanceTo(player.position)<2.3){npc.userData.hp-=inventory.includes('bat')?55:25;if(npc.userData.hp<=0){npc.parent.remove(npc);disposeGroup(npc);return false}}return true})},
   take:(id,index)=>{let result=takeFromContainer(inventory,looted,id,index);if(!result)return false;({inventory,looted}=result);onUpdateRef.current({snapshot:snapshot()});return true},
   use:index=>{let item=inventory[index],result=consume(item,needs,health);if(!result)return false;inventory.splice(index,1);needs=result.needs;health=Math.min(100,result.health+(save.character.skill==='medic'&&item==='bandage'?10:0));if(save.character.skill==='cook'&&item==='food')needs.hunger=Math.min(100,needs.hunger+15);onUpdateRef.current({snapshot:snapshot()});return true},
   build:id=>{let idx=inventory.indexOf(id),def=BUILDINGS[id];if(idx<0||!def)return 'Нет материала';let b=makeBuild(id,player.position,player.rotation.y,elapsed);let blocked=[...chunks.values()].flatMap(c=>c.colliders).concat(buildings.map(v=>({x:v.x,z:v.z,w:BUILDINGS[v.id].width,d:BUILDINGS[v.id].depth}))).some(c=>Math.abs(c.x-b.x)<(c.w+def.width)/2&&Math.abs(c.z-b.z)<(c.d+def.depth)/2);if(blocked)return 'Здесь нельзя построить';inventory.splice(idx,1);buildings.push(b);syncBuildings();emitSound('build');onUpdateRef.current({snapshot:snapshot()});return id==='concrete'?'Бетон застывает':'Заграждение построено'},snapshot
  };
  const keys={};const down=e=>{if(e.repeat)return;keys[e.key.toLowerCase()]=true;if(control.current.paused)return;if(e.key.toLowerCase()==='e')actionRef.current?.interact();if(e.code==='Space'){e.preventDefault();actionRef.current?.attack()}};const up=e=>{keys[e.key.toLowerCase()]=false};window.addEventListener('keydown',down);window.addEventListener('keyup',up);
  function tick(now){
   frame=requestAnimationFrame(tick);let dt=Math.min((now-last)/1000,.05);last=now;if(control.current.paused){renderer.render(scene,camera);return}
   elapsed+=dt;({needs,health}=advanceNeeds(needs,health,save.character.skill==='survivor'?dt*.85:dt));player.userData.pack.visible=inventory.some(i=>['backpack','daypack','hiking'].includes(i));player.userData.bat.visible=inventory.includes('bat');if(inventory.includes('bat'))player.rotation.y=angle+Math.PI;manage();let mx=control.current.x+(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),mz=control.current.y+(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(mx,mz);
   if(len>.1){mx/=Math.max(1,len);mz/=Math.max(1,len);let dx=mx*Math.cos(angle)+mz*Math.sin(angle),dz=-mx*Math.sin(angle)+mz*Math.cos(angle);let buildColliders=buildings.filter(b=>cured(b,elapsed)).map(b=>({x:b.x,z:b.z,w:BUILDINGS[b.id].width,d:BUILDINGS[b.id].depth}));moveWithCollision(player.position,dx*dt*(save.character.skill==='athlete'?3.8:3.4),dz*dt*(save.character.skill==='athlete'?3.8:3.4),[...chunks.values()].flatMap(c=>c.colliders).concat(buildColliders));player.rotation.y=inventory.includes('bat')?angle+Math.PI:Math.atan2(dx,dz);let swing=Math.sin(now*.012)*.35;player.userData.legL.rotation.x=swing;player.userData.legR.rotation.x=-swing;player.userData.armL.rotation.x=-swing}else{player.userData.legL.rotation.x=player.userData.legR.rotation.x=0}player.userData.armR.rotation.x=now-attackAt<220?-1.5:0;
   if(elapsed>600&&zombies.length<5&&Math.random()<dt*.12){let z=makePerson({hair:Math.floor(Math.random()*15)},true),a=Math.random()*6.28;z.position.set(player.position.x+Math.cos(a)*15,0,player.position.z+Math.sin(a)*15);z.userData.hp=100;z.userData.hit=0;z.userData.speed=Math.random()<.18?2.2:.8;scene.add(z);zombies.push(z)}
   zombies=zombies.filter(z=>{if(z.userData.hp<=0||z.position.distanceTo(player.position)>35){scene.remove(z);disposeGroup(z);return false}let dist=z.position.distanceTo(player.position);if(dist<(save.character.skill==='stealth'?12:18)&&dist>1){temp.copy(player.position).sub(z.position).normalize();moveWithCollision(z.position,temp.x*dt*z.userData.speed,temp.z*dt*z.userData.speed,[...chunks.values()].flatMap(c=>c.colliders));z.rotation.y=Math.atan2(temp.x,temp.z);z.userData.legL.rotation.x=Math.sin(now*.005)*.2;z.userData.legR.rotation.x=-z.userData.legL.rotation.x}if(dist<1.3&&now-z.userData.hit>1800){health=Math.max(0,health-8);if(Math.random()<.25)needs.bleeding=true;z.userData.hit=now;emitSound('hurt');onUpdateRef.current({message:needs.bleeding?'Ранение: остановите кровотечение':'Вас ранили!'});}return true});
   for(const p of people){let npc=p.npc,dist=npc.position.distanceTo(player.position);if(npc.userData.hostile&&dist<8&&dist>1.2){temp.copy(player.position).sub(npc.position).normalize();npc.position.addScaledVector(temp,dt*1.1);npc.rotation.y=Math.atan2(temp.x,temp.z)}if(npc.userData.hostile&&dist<1.3&&now-npc.userData.hit>2500){health=Math.max(0,health-5);npc.userData.hit=now;onUpdateRef.current({message:'На вас напал выживший!'})}}
   if(!raid&&elapsed>600&&lastDistrict==='city'&&Math.random()<dt/900)startRaid();
   if(raid){let t=elapsed-raid.start;raid.plane.position.x=raid.x-25+t*6;if(t>4&&!raid.detonated){raid.detonated=true;emitSound('hurt');blood.push(box(scene,2.8,.04,2.8,'#35382f',raid.x,.04,raid.z));if(Math.hypot(player.position.x-raid.x,player.position.z-raid.z)<4){health=Math.max(0,health-35);onUpdateRef.current({message:'Взрыв! Вы получили ранение.'})}}if(t>9){scene.remove(raid.plane);disposeGroup(raid.plane);raid=null}}
   let phase=elapsed%600,night=phase>=360;let light=night?Math.max(.35,Math.min(1,(phase-360)/25,(600-phase)/25)):0;ambient.intensity=2-light*1.25;sun.intensity=2.2-light*1.75;scene.background.set('#767e6b').lerp(new THREE.Color('#343d39'),light);scene.fog.color.copy(scene.background);
   camera.position.set(player.position.x+Math.sin(angle)*23,20,player.position.z+Math.cos(angle)*23);camera.lookAt(player.position.x,0,player.position.z);sun.position.set(player.position.x+15,30,player.position.z+12);sun.target.position.copy(player.position);renderer.render(scene,camera);
   if(now-updateClock>500){updateClock=now;let near=nearest();onUpdateRef.current({snapshot:snapshot(),near:!!(near&&Math.hypot(near.x-player.position.x,near.z-player.position.z)<2.5)||people.some(p=>p.npc.position.distanceTo(player.position)<2.5),showPlace:now<noticeUntil})}
  }
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);actionRef.current=null;scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});renderer.dispose();el.removeChild(renderer.domElement)};
 },[]);
 return <div className="world-canvas" ref={mount}/>;
}
