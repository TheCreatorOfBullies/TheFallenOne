export const ITEMS = {
 water:{name:'Вода',icon:'◒',size:1,desc:'Восстанавливает жажду.'},
 food:{name:'Консервы',icon:'▤',size:1,desc:'Утоляет голод.'},
 bandage:{name:'Бинт',icon:'✚',size:1,desc:'Останавливает кровотечение и лечит.'},
 plank:{name:'Доски',icon:'▥',size:2,desc:'Материал для деревянного заграждения.'},
 bat:{name:'Бита',icon:'╱',size:3,desc:'Оружие ближнего боя.'},
 backpack:{name:'Школьный рюкзак',icon:'▧',size:2,slots:12,desc:'Добавляет 12 ячеек.'},
 daypack:{name:'Городской рюкзак',icon:'▧',size:3,slots:32,desc:'Добавляет 32 ячейки.'},
 hiking:{name:'Походный рюкзак',icon:'▧',size:4,slots:52,desc:'Добавляет 52 ячейки.'},
 concrete:{name:'Бетон',icon:'▦',size:4,desc:'Застывает после укладки.'},
};
export const LOOT_TABLES = [
 ['water','food','bandage'], ['plank','bat'], ['food','backpack'],
 ['concrete','water'], ['bandage','food'], ['water','daypack'],
 ['plank','food','bandage'], ['hiking','water']
];
export const lootFor = id => LOOT_TABLES[Math.abs([...id].reduce((n,c)=>n+c.charCodeAt(0),0))%LOOT_TABLES.length];
// Only the largest backpack is worn; backpacks never stack their capacity.
export const capacity = inventory => 8 + Math.max(0,...inventory.map(id=>ITEMS[id]?.slots || 0));
export const usedSlots = inventory => inventory.reduce((n,id)=>n+(ITEMS[id]?.size || 1),0);
export const canTake = (inventory,id) => !!ITEMS[id] && usedSlots(inventory)+ITEMS[id].size <= capacity([...inventory,id]);
