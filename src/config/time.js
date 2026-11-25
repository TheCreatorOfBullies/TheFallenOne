// One day lasts 600 real seconds: 360 daylight and 240 at night.
export function gameHours(elapsed){
 const days=Math.floor(elapsed/600),phase=elapsed%600;
 return days*24+(phase<360?phase/360*12:12+(phase-360)/240*12);
}
export function clockTime(elapsed){const minutes=Math.floor(((8+gameHours(elapsed))%24)*60);return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
