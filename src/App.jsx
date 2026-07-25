import {useMemo,useState} from 'react';
import HomePage from './pages/HomePage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import PartnersPage from './pages/PartnersPage.jsx';
import WebsPage from './pages/WebsPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppShell from './dashboards/AppShell.jsx';

export default function App(){
  const [page,setPage]=useState(()=>location.hash.slice(1)||'home');
  const go=p=>{setPage(p);location.hash=p;window.scrollTo(0,0)};
  const content=useMemo(()=>{
    if(page==='home')return <HomePage go={go}/>;
    if(page==='clientes')return <ClientsPage go={go}/>;
    if(page==='partners')return <PartnersPage go={go}/>;
    if(page==='webs')return <WebsPage go={go}/>;
    if(page==='catalogo')return <CatalogPage go={go}/>;
    if(page==='precios')return <PricingPage go={go}/>;
    if(page==='registro-cliente')return <RegistrationPage type="client" go={go}/>;
    if(page==='registro-partner')return <RegistrationPage type="partner" go={go}/>;
    if(page==='login')return <LoginPage go={go}/>;
    if(page==='admin-dashboard')return <AppShell role="admin" go={go}/>;
    if(page==='partner-dashboard')return <AppShell role="partner" go={go}/>;
    if(page==='client-dashboard')return <AppShell role="client" go={go}/>;
    return <HomePage go={go}/>;
  },[page]);
  return <div className="app">{content}</div>;
}
