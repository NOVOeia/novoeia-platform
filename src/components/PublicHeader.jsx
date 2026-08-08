import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button, Logo } from './ui.jsx';
export default function PublicHeader({ go, active }) {
  const [open,setOpen]=useState(false);
  const links=[['Inicio','home'],['Clientes','clientes'],['Partners','partners'],['Webs Inteligentes','webs']];
  return <header className="public-header"><Logo small/><nav className={open?'open':''}>{links.map(([l,p])=><button key={p} className={active===p?'active':''} onClick={()=>{go(p);setOpen(false)}}>{l}</button>)}</nav><div className="header-actions"><Button variant="ghost" onClick={()=>go('login')}>Ingresar</Button><Button onClick={()=>go('registro-partner')}>Ser Partner</Button></div><button className="mobile-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>;
}
