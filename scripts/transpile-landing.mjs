import { transform } from 'esbuild';
import fs from 'fs';
import path from 'path';

const SRC = '/Users/andresgiraldo/Desktop/Daniel/Web-Editor-Component/src';
const DEST = '/Users/andresgiraldo/Desktop/Daniel/novoeia-platform/src';

const files = [
  ['components/SmartSiteHero.tsx', 'components/landing/SmartSiteHero.jsx'],
  ['components/SmartSiteShowcase.tsx', 'components/landing/SmartSiteShowcase.jsx'],
  ['components/SmartSiteVideo.tsx', 'components/landing/SmartSiteVideo.jsx'],
  ['components/SmartSiteOverview.tsx', 'components/landing/SmartSiteOverview.jsx'],
  ['components/SmartSitePlans.tsx', 'components/landing/SmartSitePlans.jsx'],
  ['components/SmartSiteExamplesFAQ.tsx', 'components/landing/SmartSiteExamplesFAQ.jsx'],
  ['components/SmartSiteInquiry.tsx', 'components/landing/SmartSiteInquiry.jsx'],
  ['components/SmartSiteDemoModal.tsx', 'components/landing/SmartSiteDemoModal.jsx'],
  ['components/SmartSiteDemoPanel.tsx', 'components/landing/SmartSiteDemoPanel.jsx'],
  ['components/SmartSiteMiniSite.tsx', 'components/landing/SmartSiteMiniSite.jsx'],
  ['components/HomeSections.tsx', 'components/landing/HomeSections.jsx'],
  ['components/HomeServices.tsx', 'components/landing/HomeServices.jsx'],
  ['components/ClientsSections.tsx', 'components/landing/ClientsSections.jsx'],
  ['components/PartnerModel.tsx', 'components/landing/PartnerModel.jsx'],
  ['components/site/Sections.tsx', 'components/landing/site/Sections.jsx'],
  ['components/site/PageHero.tsx', 'components/landing/site/PageHero.jsx'],
  ['components/site/HeroVisuals.tsx', 'components/landing/site/HeroVisuals.jsx'],
  ['data/smartSiteDemos.ts', 'data/smartSiteDemos.js'],
  ['data/smartSiteMeta.ts', 'data/smartSiteMeta.js'],
];

function fixImports(code) {
  let out = code;
  out = out.replace(/^import type .*;\n/gm, '');
  out = out.replace(/,\s*type [A-Za-z0-9_]+/g, '');
  out = out.replace(/from "\.\/ui"/g, 'from "../ui.jsx"');
  out = out.replace(/from "\.\.\/ui"/g, 'from "../../ui.jsx"');
  out = out.replace(/from "\.\.\/data\/smartSiteDemos"/g, 'from "../../data/smartSiteDemos.js"');
  out = out.replace(/from "\.\.\/data\/smartSiteMeta"/g, 'from "../../data/smartSiteMeta.js"');
  out = out.replace(/from "\.\.\/\.\.\/utils\/format"/g, 'from "../../../lib/format.js"');
  out = out.replace(/from "\.\.\/utils\/format"/g, 'from "../../lib/format.js"');
  out = out.replace(/from "\.\/SmartSite([A-Za-z]+)"/g, 'from "./SmartSite$1.jsx"');
  out = out.replace(/from "\.\/site\/([A-Za-z]+)"/g, 'from "./site/$1.jsx"');
  out = out.replace(/import \{ PublicHeader \} from "\.\.\/components\/PublicHeader";/g, 'import PublicHeader from "../PublicHeader.jsx";');
  out = out.replace(/import \{ Footer \} from "\.\.\/components\/Footer";/g, 'import Footer from "../Footer.jsx";');
  out = out.replace(/ as React\.ComponentType<\{size\?: number;\?;\}>/g, '');
  out = out.replace(/ as React\.ComponentType<\{size\?: number\}>/g, '');
  out = out.replace(/ as string/g, '');
  return out;
}

for (const [srcRel, destRel] of files) {
  const src = path.join(SRC, srcRel);
  const dest = path.join(DEST, destRel);
  const source = fs.readFileSync(src, 'utf8');
  const result = await transform(source, {
    loader: src.endsWith('.tsx') ? 'tsx' : 'ts',
    format: 'esm',
    jsx: 'automatic',
    target: 'es2020',
  });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, fixImports(result.code));
  console.log('OK', destRel);
}
