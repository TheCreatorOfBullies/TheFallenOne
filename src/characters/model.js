import * as THREE from 'three';
const mat = color => new THREE.MeshStandardMaterial({color, roughness:1});
function box(w,h,d,color,x,y,z, parent){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export function makePerson(c={}, zombie=false){
 const g=new THREE.Group(); const skin=zombie?'#8d997d':c.skin||'#d8aa86', shirt=zombie?'#626c56':c.shirt||'#65715d';
 const scale=.84+Number(c.weight??50)*.003, muscle=Number(c.muscle??40)*.0015;
 box((.55+muscle)*scale,.68,.30,shirt,0,1.12,0,g); box(.48,.52,.42,skin,0,1.74,0,g);
 const hair=c.hair??0;
 if(hair!==14){const hc=['#3a3028','#292722','#574432','#6b5946'][hair%4];box(.51,hair===3?.08:.15,.44,hc,0,2.02,0,g);
  if([4,5,6,7,11,12].includes(hair))box(.49,hair===4?.55:.34,.12,hc,0,1.73,-.2,g);
  if([1,8,11].includes(hair)){box(.16,.12,.18,hc,-.2,2.1,.04,g);box(.16,.1,.2,hc,.15,2.11,-.1,g)}
  if(hair===9)box(.14,.23,.4,hc,0,2.17,0,g);
  if([6,7].includes(hair))box(.18,.23,.18,hc,0,1.9,-.29,g);
  if([2,13].includes(hair))box(.27,.11,.07,hc,-.1,1.96,.24,g);
 }
 const armL=box(.16+muscle,.65,.18,skin,-.38*scale,1.12,0,g),armR=box(.16+muscle,.65,.18,skin,.38*scale,1.12,0,g);
 const legL=box(.20,.63,.23,'#343b37',-.14,.46,0,g),legR=box(.20,.63,.23,'#343b37',.14,.46,0,g);
 box(.22,.12,.30,'#252622',-.14,.10,.04,g);box(.22,.12,.30,'#252622',.14,.10,.04,g);
 const pack=box(.5,.62,.22,'#5a5947',0,1.18,-.26,g);pack.visible=false;const bat=box(.10,1.15,.10,'#806746',.48,1.05,.15,g);bat.visible=false;g.userData={armL,armR,legL,legR,pack,bat};return g;
}
