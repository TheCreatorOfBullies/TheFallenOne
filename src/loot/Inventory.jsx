import React from 'react';
import {X,Plus} from 'lucide-react';
import {ITEMS,lootFor,capacity,usedSlots} from './items';
export default function Inventory({inventory,lootId,looted={},onTake,onUse,onClose}){
 const loot=lootId?lootFor(lootId):[],taken=Array.isArray(looted[lootId])?looted[lootId]:[];
 // Lay each item out across its occupied cells, including its continuation cells.
 const slots=[];inventory.forEach((id,index)=>{const item=ITEMS[id];if(!item)return;for(let n=0;n<item.size;n++)slots.push({id,index,first:n===0})});
 return <div className="modal-shade" onClick={onClose}><section className="dialog inventory-dialog" onClick={e=>e.stopPropagation()}>
  <div className="dialog-head"><div><span className="eyebrow">ВАШИ ВЕЩИ</span><h2>{lootId?'Обыск':'Инвентарь'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Закрыть"><X size={20}/></button></div>
  {lootId&&<><div className="inventory-label">СОДЕРЖИМОЕ <span>НАЖМИТЕ, ЧТОБЫ ВЗЯТЬ</span></div><div className="loot-list">{loot.map((id,i)=><button key={i} disabled={taken.includes(i)} onClick={()=>onTake(lootId,i)}><span className="item-icon">{ITEMS[id].icon}</span><span><b>{ITEMS[id].name}</b><small>{taken.includes(i)?'Взято':`${ITEMS[id].size} яч.`}</small></span><Plus size={16}/></button>)}</div></>}
  <div className="inventory-label">ИНВЕНТАРЬ <span>{usedSlots(inventory)} / {capacity(inventory)} ЯЧ.</span></div>
  <div className="inventory-grid">{Array.from({length:capacity(inventory)},(_,i)=>{let slot=slots[i],item=slot&&ITEMS[slot.id];return <button key={i} onClick={()=>slot&&onUse(slot.index)} title={item?.desc||''} className={slot?'filled '+(!slot.first?'continuation':''):''}>{slot?.first&&<><span>{item.icon}</span><small>{item.name}</small></>}</button>})}</div>
  <p className="inventory-hint">Нажмите на воду, еду или бинт, чтобы использовать. Лучший рюкзак надевается автоматически.</p><button className="wide-action" onClick={onClose}>ЗАКРЫТЬ <X size={15}/></button>
 </section></div>;
}
