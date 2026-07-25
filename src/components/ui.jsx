import { LOGO } from '../logo.js';
import { Layers3 } from 'lucide-react';

function Button({ children, variant='primary', className='', ...props }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
}
function Logo({ small=false }) {
  return <div className="logo-wrap"><img src={LOGO} className={small?'logo-sm':'logo'} /><span>NOVO<span>eia</span></span></div>;
}
function Badge({ children, tone='blue' }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
function Stat({ icon:Icon, label, value, detail }) { return <div className="stat card"><div className="stat-icon"><Icon size={20}/></div><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></div>; }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Empty({ title, text, action }) { return <div className="empty card"><div className="empty-icon"><Layers3/></div><h3>{title}</h3><p>{text}</p>{action}</div>; }
export { Button, Logo, Badge, Stat, Field, Empty };
