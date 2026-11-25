import * as THREE from 'three';
import {hash,district} from '../biomes/generation';
const materials={};
function material(color){
 if(materials[color])return materials[color];
 const canvas=document.createElement('canvas');canvas.width=16;canvas.height=16;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,16,16);
 // Small, deterministic flecks make surfaces read as pixel textures, not smooth polygons.
 for(let i=0;i<34;i++){let x=Math.floor(hash(i,1,color.length)*16),y=Math.floor(hash(i,2,color.length)*16);ctx.fillStyle=i%3?'#ffffff10':'#00000017';ctx.fillRect(x,y,i%4===0?2:1,1)}
 const map=new THREE.CanvasTexture(canvas);map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;
 return materials[color]=new THREE.MeshStandardMaterial({map,roughness:1});
}
export function box(parent,w,h,d,color,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function tree(g,x,z,r){box(g,.35,2,.35,'#504837',x,1,z);box(g,2.2,1.4,2.2,r>.5?'#3c4a34':'#46513a',x,2.5,z);box(g,1.6,1.2,1.6,'#374532',x,3.4,z)}
function container(g,x,z,id,loot,color='#8a7050'){const mesh=box(g,.9,.8,.8,color,x,.4,z);box(g,.94,.07,.84,'#aa9167',x,.83,z);loot.push({x,z,id,mesh});}
function house(g,x,z,variant,colliders,loot,id,type){
 const wall=type==='suburb'?'#c2c2b3':variant>.55?'#9c9e91':'#78796c';
 box(g,8,.16,7,'#665e4e',x,.09,z);
 box(g,8,2.5,.22,wall,x,1.25,z-3.5);box(g,.22,2.5,7,wall,x-4,1.25,z);box(g,.22,2.5,2.7,wall,x+4,1.25,z-2.15);box(g,.22,2.5,2.7,wall,x+4,1.25,z+2.15);
 box(g,2.7,.55,.22,wall,x-2.65,.28,z+3.5);box(g,2.7,.55,.22,wall,x+2.65,.28,z+3.5);
 // Windows, lintels and a cutaway upper floor suggest the rest of the building.
 box(g,1.3,.8,.24,'#495b58',x-2,1.55,z-3.36);box(g,1.3,.8,.24,'#495b58',x+2,1.55,z-3.36);
 box(g,8,.25,.35,'#4b4c42',x,2.6,z-3.45);
 if(type==='suburb') {box(g,8,1.1,.18,wall,x,3.2,z-3.5);box(g,1.3,.6,.2,'#495b58',x-2,3.2,z-3.36);box(g,1.3,.6,.2,'#495b58',x+2,3.2,z-3.36)}
 colliders.push({x:x-4,z,w:.3,d:7},{x,z:z-3.5,w:8,d:.3},{x:x+4,z:z-2.15,w:.3,d:2.7},{x:x+4,z:z+2.15,w:.3,d:2.7},{x:x-2.65,z:z+3.5,w:2.7,d:.3},{x:x+2.65,z:z+3.5,w:2.7,d:.3});
 box(g,2.4,.25,1.4,'#777264',x-2.4,.5,z-2.3);box(g,1.9,.18,1,'#a39e89',x-2.4,.69,z-2.3);
 box(g,1.4,.75,.65,'#554d3b',x+2.7,.4,z-2.9);box(g,1.3,.1,.65,'#77705c',x+2.7,.82,z-2.9);
 box(g,1.6,.6,.7,'#615746',x-2.8,.35,z+1.5);box(g,1.1,.45,.9,'#55594d',x+2.5,.25,z+2.3);
 container(g,x+2.7,z-1.6,`${id}:0`,loot);container(g,x-2.8,z+1.5,`${id}:1`,loot,'#6b6250');
}
export function makeChunk(cx,cz,seed,spawnChunk={x:0,z:0}){
 const g=new THREE.Group(),colliders=[],loot=[];let type=(cx===spawnChunk.x&&cz===spawnChunk.z)?'suburb':district(cx,cz,seed), ox=cx*24,oz=cz*24;
 box(g,24,.12,24,type==='forest'?'#495542':type==='river'?'#65705a':'#5b624c',ox,-.08,oz);
 if(type==='river'){
  box(g,7,.05,24,'#596e69',ox+2,0,oz);for(let i=0;i<8;i++)box(g,1.1,.02,.06,'#91a69d',ox-1+hash(i,cx,seed)*6,.05,oz-11+i*3);
 }
 if(!['forest','river'].includes(type)){
  box(g,24,.03,5,'#434942',ox,.01,oz+9.5);for(let i=-2;i<=2;i++)box(g,2,.035,.10,'#898779',ox+i*5,.04,oz+9.5);
  house(g,ox-3,oz-2,hash(cx,cz,seed+2),colliders,loot,`${cx},${cz}`,type);
  if(type==='city'){box(g,4,.15,7,'#747769',ox+7,.08,oz-4);box(g,4,3,.2,'#85897c',ox+7,1.5,oz-7.5);container(g,ox+7,oz-4,`${cx},${cz}:2`,loot)}
  else if(hash(cx,cz,seed+7)>.6){box(g,4,.15,4,'#77796c',ox+7,.08,oz-4);box(g,4,2,.2,'#99998a',ox+7,1,oz-6);box(g,.2,2,4,'#99998a',ox+9,1,oz-4);container(g,ox+7,oz-4,`${cx},${cz}:2`,loot)}
  if(hash(cx,cz,seed+3)>.35){box(g,3.3,.7,1.65,'#5d6159',ox+6,.5,oz+9);box(g,1.6,.55,1.5,'#71746a',ox+6,.99,oz+9);for(let dx of [-1.1,1.1])for(let dz of [-.85,.85])box(g,.6,.6,.22,'#292e2c',ox+6+dx,.35,oz+9+dz);colliders.push({x:ox+6,z:oz+9,w:3.3,d:1.8})}
 }
 for(let i=0;i<(type==='forest'?16:type==='river'?9:5);i++){let lx=-10+hash(cx*20+i,cz,seed)*20,lz=-10+hash(cx,cz*20+i,seed+4)*20;if(!['forest','river'].includes(type)&&lx<2&&lz<3)continue;if(type==='river'&&lx>-3&&lx<6)continue;let x=ox+lx,z=oz+lz;tree(g,x,z,hash(i,cx,seed));colliders.push({x,z,w:.6,d:.6})}
 for(let i=0;i<20;i++){let x=ox-12+hash(i,cx+cz,seed+5)*24,z=oz-12+hash(cx,cz+i,seed+6)*24;box(g,.16,.13,.16,'#81866a',x,.08,z)}
 return {group:g,colliders,loot,type};
}
