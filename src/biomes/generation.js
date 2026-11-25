export function hash(x,z,seed=1){let n=Math.sin(x*127.1+z*311.7+seed*74.7)*43758.5453123;return n-Math.floor(n)}
export function district(x,z,seed){const n=hash(Math.floor(x/4),Math.floor(z/4),seed);return n>.79?'forest':n>.62?'river':n>.38?'suburb':n>.17?'outskirts':'city'}
export const districtNames={suburb:'Тихие кварталы',forest:'Сосновый лес',outskirts:'Окраина',river:'Речная низина',city:'Городской район'};
