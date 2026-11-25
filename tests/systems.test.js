import test from 'node:test';
import assert from 'node:assert/strict';
import {capacity,usedSlots,canTake,lootFor} from '../src/loot/items.js';
import {initialNeeds,advanceNeeds,consume} from '../src/survival/needs.js';
import {makeBuild,cured} from '../src/construction/building.js';
import {gameHours,clockTime} from '../src/config/time.js';
import {district,hash} from '../src/biomes/generation.js';
import {moveWithCollision} from '../src/physics/movement.js';

test('loot capacity uses the largest backpack and counts all occupied cells',()=>{
 assert.equal(capacity([]),8);assert.equal(capacity(['backpack','daypack','hiking']),60);
 assert.equal(usedSlots(['bat','concrete','water']),8);assert.equal(canTake(['bat','concrete','water'],'bandage'),false);
 assert.equal(canTake(['bat','concrete','water'],'backpack'),true);assert.deepEqual(lootFor('3,4:0'),lootFor('3,4:0'));
});
test('needs, damage and supplies have bounded effects',()=>{
 let n=initialNeeds();let advanced=advanceNeeds({...n,bleeding:true},50,10);assert.equal(advanced.health,49);
 let bandaged=consume('bandage',advanced.needs,advanced.health);assert.equal(bandaged.needs.bleeding,false);assert.equal(bandaged.health,64);
 assert.equal(consume('water',{...n,thirst:80},100).needs.thirst,100);assert.equal(consume('bat',n,100),null);
});
test('day clock and concrete curing cross the day-night boundary correctly',()=>{
 assert.equal(clockTime(0),'08:00');assert.equal(clockTime(360),'20:00');assert.equal(clockTime(600),'08:00');assert.equal(gameHours(600),24);
 let concrete=makeBuild('concrete',{x:0,z:0},0,330);assert.equal(cured(concrete,360),false);assert.equal(cured(concrete,390),true);
 assert.equal(cured(makeBuild('plank',{x:0,z:0},0,0),0),true);
});
test('world generation is deterministic and collision prevents walking through walls',()=>{
 assert.equal(hash(3,-5,42),hash(3,-5,42));assert.equal(district(5,7,123),district(5,7,123));
 let p={x:0,z:0};moveWithCollision(p,1,1,[{x:1,z:0,w:1,d:1}]);assert.equal(p.x,0);assert.equal(p.z,1);
});

test('partial looting is persistent and cannot duplicate items',async()=>{
 const {takeFromContainer,containerAvailable}=await import('../src/loot/containers.js');
 const id='3,4:0',items=lootFor(id);let inventory=[],looted={};
 const result=takeFromContainer(inventory,looted,id,0);assert.ok(result);inventory=result.inventory;looted=result.looted;
 assert.equal(inventory[0],items[0]);assert.equal(takeFromContainer(inventory,looted,id,0),null);
 assert.equal(containerAvailable(looted,id),true);
 for(let i=1;i<items.length;i++){const next=takeFromContainer(inventory,looted,id,i);if(!next)break;inventory=next.inventory;looted=next.looted}
 if(looted[id].length===items.length)assert.equal(containerAvailable(looted,id),false);
 assert.equal(containerAvailable({[id]:true},id),false);
});
