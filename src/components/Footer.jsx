import { Logo } from './ui.jsx';
export default function Footer({ go }) { return <footer><Logo small/><div><button onClick={()=>go('clientes')}>Clientes</button><button onClick={()=>go('partners')}>Partners</button><button onClick={()=>go('catalogo')}>Catálogo</button></div><p>© 2026 NOVOeia</p></footer>; }
