export function moveWithCollision(position,dx,dz,colliders){
 const radius=.34; const blocked=(x,z)=>colliders.some(c=>x+radius>c.x-c.w/2&&x-radius<c.x+c.w/2&&z+radius>c.z-c.d/2&&z-radius<c.z+c.d/2);
 if(!blocked(position.x+dx,position.z))position.x+=dx;
 if(!blocked(position.x,position.z+dz))position.z+=dz;
}
