export const SAVE_KEY = 'fallen-one-save-v1';
export const SETTINGS_KEY = 'fallen-one-settings-v1';
export const DEFAULT_SETTINGS = { sensitivity: 1, joystick: 'left', sound: true };
export const SKILLS = [
  {id:'survivor', name:'Выживальщик', desc:'Голод и жажда нарастают медленнее.'},
  {id:'medic', name:'Медик', desc:'Бинты восстанавливают больше здоровья.'},
  {id:'builder', name:'Строитель', desc:'Начинает игру с досками.'},
  {id:'hunter', name:'Охотник', desc:'Начинает игру с водой и консервами.'},
  {id:'mechanic', name:'Механик', desc:'Начинает игру с битой.'},
  {id:'athlete', name:'Атлет', desc:'Передвигается немного быстрее.'},
  {id:'cook', name:'Повар', desc:'Еда лучше утоляет голод.'},
  {id:'stealth', name:'Тихоня', desc:'Заражённые замечают вас с меньшего расстояния.'},
];
export const HAIR = ['Короткая','Растрёпанная','Пробор','Ёжик','Длинная','Каре','Хвост','Пучок','Кудри','Ирокез','Выбритая','Волнистая','Косы','Чёлка','Без волос'];
export const SKINS = ['#d8aa86','#bd8c6b','#95664d','#70483b','#e4c0a0'];
export const SHIRTS = ['#65715d','#6d6156','#4b5c61','#756b57','#514d48'];
export const randomCharacter = () => ({gender: Math.random() > .5 ? 'male' : 'female', hair: Math.floor(Math.random()*15), skin: SKINS[Math.floor(Math.random()*SKINS.length)], shirt: SHIRTS[Math.floor(Math.random()*SHIRTS.length)], weight: 50, muscle: 40, skill:'survivor'});
