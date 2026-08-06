import { useEffect, useMemo, useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import PartnersPage from './pages/PartnersPage.jsx';
import WebsPage from './pages/WebsPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GhlCallbackPage from './pages/GhlCallbackPage.jsx';
import ClientInterestPage from './pages/ClientInterestPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PartnerLandingPage from './pages/PartnerLandingPage.jsx';
import PartnerCheckoutPage from './pages/PartnerCheckoutPage.jsx';
import AppShell from './dashboards/AppShell.jsx';
import { platformApi } from './lib/platformApi.js';

function parseRoute() {
  const hashBody = location.hash.slice(1) || 'home';
  const hashPath = hashBody.split('?')[0];
  const parts = hashPath.split('/').filter(Boolean);
  const page = parts[0];

  if (page?.endsWith('-dashboard')) {
    return {
      page,
      section: parts[1] || 'dashboard',
      slug: null,
      productId: null,
    };
  }

  if (page === 'checkout') {
    return {
      page,
      section: parts[1] || 'success',
      slug: null,
      productId: null,
    };
  }

  if (page === 'p' && parts[1]) {
    if (parts[2] === 'checkout' && parts[3]) {
      return {
        page: 'partner-checkout',
        section: null,
        slug: parts[1],
        productId: parts[3],
      };
    }
    return {
      page: 'partner-landing',
      section: null,
      slug: parts[1],
      productId: null,
    };
  }

  return {
    page: page || hashPath,
    section: null,
    slug: null,
    productId: null,
  };
}

function readCheckoutSessionId() {
  const hashBody = location.hash.slice(1);
  if (!hashBody.includes('?')) return null;
  const query = hashBody.split('?').slice(1).join('?');
  return new URLSearchParams(query).get('session_id');
}

function readHashPage() {
  return parseRoute().page;
}

function readHashSection() {
  return parseRoute().section;
}

function readOAuthParams() {
  return platformApi.readPendingGhlOAuth();
}

export default function App() {
  const initialOAuth = readOAuthParams();
  const initialRoute = parseRoute();
  const [page, setPage] = useState(() => (initialOAuth ? 'ghl-callback' : initialRoute.page));
  const [section, setSection] = useState(() => initialRoute.section);
  const [landingSlug, setLandingSlug] = useState(() => initialRoute.slug || null);
  const [checkoutProductId, setCheckoutProductId] = useState(() => initialRoute.productId || null);
  const [oauth, setOauth] = useState(() => initialOAuth);

  const go = (next, nextSection = null) => {
    setOauth(null);
    const hashPath = String(next).split('?')[0];
    const parts = hashPath.split('/').filter(Boolean);
    const routePage = parts[0] || hashPath;
    const resolvedSection = nextSection || parts[1] || null;
    setPage(routePage);
    if (routePage.endsWith('-dashboard')) {
      setSection(resolvedSection || 'dashboard');
      setLandingSlug(null);
      setCheckoutProductId(null);
      location.hash = `${routePage}/${resolvedSection || 'dashboard'}`;
    } else if (routePage === 'checkout') {
      setSection(resolvedSection || 'success');
      setLandingSlug(null);
      setCheckoutProductId(null);
      location.hash = `checkout/${resolvedSection || 'success'}`;
    } else if (routePage === 'p' && parts[1]) {
      if (parts[2] === 'checkout' && parts[3]) {
        setPage('partner-checkout');
        setSection(null);
        setLandingSlug(parts[1]);
        setCheckoutProductId(parts[3]);
        location.hash = `p/${parts[1]}/checkout/${parts[3]}`;
      } else {
        setPage('partner-landing');
        setSection(null);
        setLandingSlug(parts[1]);
        setCheckoutProductId(null);
        location.hash = `p/${parts[1]}`;
      }
    } else if (routePage === 'p' && resolvedSection) {
      setPage('partner-landing');
      setSection(null);
      setLandingSlug(resolvedSection);
      setCheckoutProductId(null);
      location.hash = `p/${resolvedSection}`;
    } else {
      setSection(null);
      setLandingSlug(null);
      setCheckoutProductId(null);
      location.hash = routePage;
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onHashChange = () => {
      const route = parseRoute();
      setPage(route.page);
      setSection(route.section);
      setLandingSlug(route.slug || null);
      setCheckoutProductId(route.productId || null);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!page.endsWith('-dashboard')) return;

    let cancelled = false;

    (async () => {
      const { data } = await platformApi.getSession();
      if (cancelled) return;
      if (!data.session) {
        go('login');
        return;
      }

      const profile = await platformApi.getMyProfile();
      if (cancelled) return;

      const allowed = platformApi.roleToDashboard(profile?.role || 'client');
      if (page !== allowed) {
        go(`${allowed}/dashboard`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!oauth) return;
    const clean = new URL(window.location.href);
    clean.search = '';
    window.history.replaceState({}, '', clean.toString());
    setPage('ghl-callback');
  }, [oauth]);

  const content = useMemo(() => {
    if (oauth || page === 'ghl-callback') {
      return <GhlCallbackPage go={go} code={oauth?.code} state={oauth?.state} />;
    }
    if (page === 'home') return <HomePage go={go} />;
    if (page === 'clientes') return <ClientsPage go={go} />;
    if (page === 'partners') return <PartnersPage go={go} />;
    if (page === 'webs') return <WebsPage go={go} />;
    if (page === 'catalogo') return <CatalogPage go={go} />;
    if (page === 'precios') return <PricingPage go={go} />;
    if (page === 'registro-cliente') return <ClientInterestPage go={go} />;
    if (page === 'registro-partner') return <RegistrationPage go={go} />;
    if (page === 'login') return <LoginPage go={go} />;
    if (page === 'checkout') {
      return (
        <CheckoutPage
          go={go}
          status={section === 'cancel' ? 'cancel' : 'success'}
          sessionId={readCheckoutSessionId()}
        />
      );
    }
    if (page === 'partner-landing') {
      return <PartnerLandingPage go={go} slug={landingSlug} />;
    }
    if (page === 'partner-checkout') {
      return (
        <PartnerCheckoutPage
          go={go}
          slug={landingSlug}
          productId={checkoutProductId}
        />
      );
    }
    if (page === 'admin-dashboard') return <AppShell role="admin" section={section} go={go} />;
    if (page === 'partner-dashboard') return <AppShell role="partner" section={section} go={go} />;
    if (page === 'client-dashboard') return <AppShell role="client" section={section} go={go} />;
    return <HomePage go={go} />;
  }, [page, section, landingSlug, checkoutProductId, oauth]);

  return <div className="app">{content}</div>;
}
