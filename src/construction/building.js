import {gameHours} from '../config/time.js';
export const BUILDINGS = {
 plank:{name:'Деревянное заграждение',width:1.5,depth:.35,height:1.5,color:'#80684d',cureHours:0},
 concrete:{name:'Бетонный блок',width:1.3,depth:1.3,height:1.2,color:'#858a7f',cureHours:2.5},
};
export function makeBuild(id,position,rotation,elapsed){
 if(!BUILDINGS[id])return null;
 return {id,x:Math.round((position.x+Math.sin(rotation)*1.8)*2)/2,z:Math.round((position.z+Math.cos(rotation)*1.8)*2)/2,placedAt:elapsed};
}
export const cured=(b,elapsed)=>gameHours(elapsed)-gameHours(b.placedAt)>=BUILDINGS[b.id].cureHours;
