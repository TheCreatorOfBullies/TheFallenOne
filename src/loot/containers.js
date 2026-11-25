import {lootFor,canTake} from './items.js';
export function containerAvailable(looted,id){
 const seen=looted[id];return seen!==true&&(!Array.isArray(seen)||seen.length<lootFor(id).length);
}
export function takeFromContainer(inventory,looted,id,index){
 const contents=lootFor(id),seen=Array.isArray(looted[id])?looted[id]:[];
 if(looted[id]===true||!Number.isInteger(index)||index<0||index>=contents.length||seen.includes(index))return null;
 const item=contents[index];if(!canTake(inventory,item))return null;
 return {inventory:[...inventory,item],looted:{...looted,[id]:[...seen,index]}};
}
