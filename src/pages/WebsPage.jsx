import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PublicHeader from '../components/PublicHeader.jsx';
import Footer from '../components/Footer.jsx';
import { SmartSiteHero } from '../components/landing/SmartSiteHero.jsx';
import { SmartSiteShowcase } from '../components/landing/SmartSiteShowcase.jsx';
import { SmartSiteVideo } from '../components/landing/SmartSiteVideo.jsx';
import { SmartSiteOverview } from '../components/landing/SmartSiteOverview.jsx';
import { SmartSitePlans } from '../components/landing/SmartSitePlans.jsx';
import { SmartSiteExamplesFAQ } from '../components/landing/SmartSiteExamplesFAQ.jsx';
import { SmartSiteInquiry } from '../components/landing/SmartSiteInquiry.jsx';
import '../styles/smart-sites.css';

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function WebsPage({ go }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const evaluate = () => scrollToSection('evaluacion');

  return (
    <div className="smart-sites-page smart-v2">
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <PublicHeader go={go} active="webs" />

      <SmartSiteHero onEvaluate={evaluate} onCompare={() => scrollToSection('niveles')} />

      <div className="seam seam-down" />
      <SmartSiteShowcase onEvaluate={evaluate} />

      <div className="seam seam-wave" />
      <SmartSiteVideo />

      <div className="seam seam-down" />
      <SmartSiteOverview />

      <SmartSitePlans onEvaluate={evaluate} />

      <div className="seam seam-wave" />
      <SmartSiteExamplesFAQ onEvaluate={evaluate} />

      <SmartSiteInquiry />

      <section className="final-cta">
        <div className="final-aura" />
        <div className="final-inner">
          <span className="section-eyebrow">EMPIEZA POR LO QUE NECESITAS HOY</span>
          <h2>Tu sitio debería <em>trabajar por ti.</em></h2>
          <p>Comienza con una base clara y activa nuevas funciones cuando estés listo para crecer.</p>
          <div className="final-actions">
            <button type="button" className="btn-glow" onClick={evaluate}>
              Solicitar una evaluación <ArrowRight size={16} />
            </button>
            <button type="button" className="btn-line" onClick={() => scrollToSection('ejemplos')}>
              Explorar experiencias
            </button>
          </div>
        </div>
      </section>

      <Footer go={go} />
    </div>
  );
}
