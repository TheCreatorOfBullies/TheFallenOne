export function initialNeeds(saved={}) {
 return { hunger:saved.hunger ?? 100, thirst:saved.thirst ?? 100, bleeding:saved.bleeding ?? false };
}
export function advanceNeeds(needs, health, dt) {
 const next={...needs,hunger:Math.max(0,needs.hunger-dt/18),thirst:Math.max(0,needs.thirst-dt/12)};
 const damage=(next.bleeding ? dt/10 : 0)+(next.hunger===0||next.thirst===0 ? dt/8 : 0);
 return {needs:next,health:Math.max(0,health-damage)};
}
export function consume(id, needs, health) {
 if(id==='water') return {needs:{...needs,thirst:Math.min(100,needs.thirst+45)},health};
 if(id==='food') return {needs:{...needs,hunger:Math.min(100,needs.hunger+45)},health};
 if(id==='bandage') return {needs:{...needs,bleeding:false},health:Math.min(100,health+15)};
 return null;
}
