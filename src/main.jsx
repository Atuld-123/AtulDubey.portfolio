import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, CheckCircle2, Code2,
  Database, ExternalLink, Github, Linkedin, Mail, MapPin, Menu,
  MessageSquare, Network, Send, ShieldCheck, Sparkles, Terminal, X, Zap
} from 'lucide-react';
import './styles.css';

const skills = [
  { title: 'Programming & Processing', icon: Code2, items: ['Python', 'Pandas', 'PySpark'] },
  { title: 'SQL & Databases', icon: Database, items: ['SQL', 'CTEs & Subqueries', 'Joins & Aggregations', 'Window Functions'] },
  { title: 'Data Warehouse', icon: Network, items: ['Snowflake', 'RAW / STAGING / ANALYTICS', 'Star Schema'] },
  { title: 'Analytics & BI', icon: BarChart3, items: ['Power BI', 'DAX', 'Interactive Dashboards'] },
  { title: 'Excel & Reporting', icon: Terminal, items: ['VLOOKUP / XLOOKUP', 'INDEX-MATCH', 'Pivot Tables', 'SUMIFS / COUNTIFS'] },
  { title: 'Tools & Quality', icon: ShieldCheck, items: ['Git / GitHub', 'Data Validation', 'Data Quality Checks', 'ServiceNow (basic)'] }
];

const projects = [
  {
    number: '01',
    label: 'DATA ENGINEERING',
    title: 'Product Analytics Data Pipeline',
    summary: 'A repeatable pipeline that turns live product API data into clean, warehouse-ready datasets for analytics.',
    stack: ['Python', 'Pandas', 'PySpark', 'SQL', 'Snowflake'],
    details: [
      'Extracts product data from the DummyJSON Products API using Python and Requests.',
      'Cleans and transforms records with Pandas and PySpark, then writes Parquet output.',
      'Checks missing fields, duplicate IDs, and invalid price, stock, rating, and discount values.',
      'Models RAW, STAGING, and ANALYTICS layers in Snowflake with DIM_PRODUCT and FACT_SALES structures.'
    ],
    status: 'Power BI reporting layer planned',
    link: 'https://github.com/Atuld-123/product-analytics-data-pipeline',
    linkLabel: 'View repository'
  },
  {
    number: '02',
    label: 'BUSINESS INTELLIGENCE',
    title: 'Data Analytics Certification Project',
    summary: 'Hands-on data cleaning, transformation, visualization, and reporting practice focused on business decision support.',
    stack: ['Advanced Excel', 'SQL', 'Power BI'],
    details: [
      'Applied data cleaning and transformation workflows.',
      'Built interactive dashboards and visual reports.',
      'Used SQL and Excel analysis to organize information into decision-ready outputs.'
    ],
    status: 'AccioJob certification project',
    link: 'https://www.acciojob.com/',
    linkLabel: 'AccioJob'
  }
];

const experience = [
  {
    role: 'GIS Data Analyst',
    company: 'Geohunt Solutions Pvt. Ltd.',
    period: 'Apr 2026 — Sep 2026',
    points: [
      'Wrote SQL queries using joins, aggregations, and window functions for geospatial project reporting.',
      'Cleaned and transformed raw project data using Python, Pandas, and PySpark.',
      'Maintained data-quality checks across Snowflake RAW, STAGING, and ANALYTICS layers.',
      'Built Power BI dashboards and DAX reports; documented workflows using Git/GitHub.'
    ]
  },
  {
    role: 'Server Engineer',
    company: 'Allied Digital Services',
    period: 'Jan 2025 — Apr 2026',
    points: [
      'Wrote SQL queries with joins, subqueries, CTEs, and window functions for reporting.',
      'Performed full, differential, and transaction-log database backups and recovery.',
      'Produced daily, weekly, and monthly Excel/MIS reports using VLOOKUP, XLOOKUP, Pivot Tables, and data validation.',
      'Configured 100+ laptops/desktops and resolved Windows, networking, VPN, and domain issues.'
    ]
  }
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formMessage, setFormMessage] = useState('');
  const navItems = [['About', '#about'], ['Skills', '#skills'], ['Projects', '#projects'], ['Experience', '#experience'], ['Contact', '#contact']];

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormMessage('Please complete all fields before sending.');
      return;
    }
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:dubeyatul0490@gmail.com?subject=${subject}&body=${body}`;
    setFormMessage('Your email app should open with the message prepared. Please send it there.');
  };

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="header">
        <a href="#home" className="brand" aria-label="Atul Kumar Dubey home"><span className="brand-mark">AK</span><span>atul<span className="brand-dot">.</span></span></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Let’s talk <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> DATA · ENGINEERING · ANALYTICS</div>
            <h1>Making data<br />work <span className="gradient-text">smarter.</span></h1>
            <p className="hero-lede">I’m <strong>Atul Kumar Dubey</strong> — a data professional working across SQL, Python, Snowflake, and Power BI to turn raw information into reliable datasets and useful insights.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">Explore my work <ArrowDownRight size={17} /></a>
              <a className="button button-secondary" href="/Atuldubey.pdf" download><Download size={16} /> Download resume</a>
            </div>
            <div className="hero-links">
              <a href="https://github.com/Atuld-123" target="_blank" rel="noreferrer"><Github size={16} /> GitHub <ArrowUpRight size={13} /></a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn <ArrowUpRight size={13} /></a>
              <span><MapPin size={15} /> India</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Illustration of a data pipeline">
            <div className="visual-top"><span className="window-dots"><i /><i /><i /></span><span>pipeline_overview.py</span><span className="live-label"><span /> LIVE VIEW</span></div>
            <div className="code-lines"><span className="line-no">01</span><span><b>source</b> = <em>"product_api"</em></span><span className="line-no">02</span><span><b>transform</b> = <em>"clean + validate"</em></span><span className="line-no">03</span><span><b>warehouse</b> = <em>"snowflake"</em></span></div>
            <div className="pipeline">
              <div className="pipe-node"><div className="node-icon node-blue"><Code2 /></div><span>Extract</span><small>Python · API</small></div>
              <div className="pipe-connector"><span /></div>
              <div className="pipe-node"><div className="node-icon node-violet"><Zap /></div><span>Transform</span><small>Pandas · Spark</small></div>
              <div className="pipe-connector"><span /></div>
              <div className="pipe-node"><div className="node-icon node-green"><Database /></div><span>Warehouse</span><small>Snowflake</small></div>
            </div>
            <div className="visual-footer"><span><CheckCircle2 size={15} /> Data quality first</span><span className="footer-mono">RAW → STAGING → ANALYTICS</span></div>
            <div className="float-card"><div className="float-icon"><BarChart3 size={17} /></div><div><strong>Insights, not just data</strong><small>SQL · BI · Reporting</small></div><Sparkles size={15} className="sparkle" /></div>
          </div>
          <a className="scroll-cue" href="#about"><span /> Scroll to explore</a>
        </section>

        <section className="intro-strip section-wrap" id="about">
          <div className="section-kicker">01 / ABOUT</div>
          <div className="intro-content"><h2>From raw records<br />to <span className="gradient-text">clear decisions.</span></h2><div><p>I work at the intersection of data processing, analytics, and reporting. My experience includes SQL-based reporting, Python data transformation, Snowflake data-quality checks, and Power BI dashboards.</p><p>I enjoy building repeatable workflows that help teams trust their data — from extraction and validation through to analysis and presentation.</p><div className="education-line"><span className="education-icon"><Terminal size={18} /></span><div><strong>B.Tech, Computer Science and Engineering</strong><small>Shambhunath Institute of Engineering and Technology · 2021–2024</small></div></div></div></div>
        </section>

        <section className="section-wrap skills-section" id="skills">
          <div className="section-heading"><div><div className="section-kicker">02 / TOOLKIT</div><h2>Skills built for <span className="gradient-text">real-world data.</span></h2></div><p>A practical toolkit spanning data preparation, warehouse design, analytics, and reporting.</p></div>
          <div className="skills-grid">{skills.map((skill, i) => { const Icon = skill.icon; return <article className="skill-card" key={skill.title}><div className="skill-card-top"><span className="skill-icon"><Icon size={19} /></span><span className="card-index">0{i + 1}</span></div><h3>{skill.title}</h3><div className="tag-list">{skill.items.map(item => <span className="tag" key={item}>{item}</span>)}</div></article>; })}</div>
        </section>

        <section className="section-wrap projects-section" id="projects">
          <div className="section-heading"><div><div className="section-kicker">03 / SELECTED WORK</div><h2>Projects with a <span className="gradient-text">purpose.</span></h2></div><a className="text-link" href="https://github.com/Atuld-123/product-analytics-data-pipeline" target="_blank" rel="noreferrer">Explore GitHub <ArrowUpRight size={16} /></a></div>
          <div className="projects-list">{projects.map(project => <article className="project-card" key={project.number}><div className="project-main"><div className="project-meta"><span className="project-number">{project.number}</span><span className="project-label">{project.label}</span></div><h3>{project.title}</h3><p className="project-summary">{project.summary}</p><div className="tag-list">{project.stack.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><a className="project-link" href={project.link} target="_blank" rel="noreferrer">{project.linkLabel} <ArrowUpRight size={15} /></a></div><div className="project-detail"><div className="detail-title"><CheckCircle2 size={16} /> What I worked on</div><ul>{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul><div className="project-status"><span className="status-dot" /> {project.status}</div></div></article>)}</div>
          <div className="architecture-card"><div className="architecture-head"><div><div className="section-kicker">PIPELINE SNAPSHOT</div><h3>Designed for dependable data.</h3></div><span className="architecture-pill"><Network size={14} /> Architecture</span></div><div className="architecture-flow"><div className="arch-node"><Code2 /><span>API source</span><small>DummyJSON</small></div><ArrowRight className="arch-arrow" /><div className="arch-node"><Zap /><span>Extract & clean</span><small>Python · Pandas</small></div><ArrowRight className="arch-arrow" /><div className="arch-node"><Terminal /><span>Transform</span><small>PySpark · Parquet</small></div><ArrowRight className="arch-arrow" /><div className="arch-node"><Database /><span>Warehouse</span><small>Snowflake</small></div></div><p className="architecture-note"><span className="status-dot" /> Power BI reporting layer: planned, according to the project documentation.</p></div>
        </section>

        <section className="section-wrap experience-section" id="experience">
          <div className="section-heading"><div><div className="section-kicker">04 / EXPERIENCE</div><h2>Where I’ve <span className="gradient-text">made an impact.</span></h2></div><p>Experience across data analysis, reporting, data quality, and IT operations.</p></div>
          <div className="timeline">{experience.map((job, i) => <article className="timeline-item" key={job.company}><div className="timeline-marker">{i === 0 ? '01' : '02'}</div><div className="timeline-content"><div className="timeline-top"><div><h3>{job.role}</h3><p>{job.company}</p></div><span className="period">{job.period}</span></div><ul>{job.points.map(point => <li key={point}>{point}</li>)}</ul></div></article>)}</div>
        </section>

        <section className="section-wrap credential-section">
          <div className="credential-card"><div className="credential-icon"><CheckCircle2 size={23} /></div><div><div className="section-kicker">EDUCATION & CERTIFICATION</div><h3>Learning with a practical focus.</h3><p><strong>Data Analyst Certification — AccioJob</strong><br />SQL, Power BI, and Advanced Excel</p><p className="credential-education">B.Tech Computer Science and Engineering · Shambhunath Institute of Engineering and Technology, Prayagraj · CGPA 6.8</p></div></div>
        </section>

        <section className="contact-section" id="contact"><div className="section-wrap contact-layout"><div className="contact-copy"><div className="section-kicker">05 / CONTACT</div><h2>Have data to<br /><span className="gradient-text">make sense of?</span></h2><p>I’m interested in entry-level and junior opportunities across Data Engineering, ETL, SQL development, and Data Analytics.</p><a className="contact-email" href="mailto:dubeyatul0490@gmail.com"><Mail size={18} /> dubeyatul0490@gmail.com <ArrowUpRight size={15} /></a><div className="contact-phone"> <MessageSquare size={16} /> +91 7300681149</div></div><form className="contact-form" onSubmit={submit}><div className="form-heading"><h3>Send a message</h3><span>Typically best for professional enquiries</span></div><label>Your name<input name="name" value={form.name} onChange={update} placeholder="Name" required /></label><label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label><label>Message<textarea name="message" value={form.message} onChange={update} placeholder="Tell me a little about your opportunity..." rows="4" required /></label><button className="button button-primary submit-button" type="submit">Prepare email <Send size={16} /></button>{formMessage && <p className="form-message" role="status">{formMessage}</p>}<small className="form-note">This form opens your default email app; it does not send or store messages on a server.</small></form></div></section>
      </main>
      <footer className="footer section-wrap"><a href="#home" className="brand"><span className="brand-mark">AK</span><span>atul<span className="brand-dot">.</span></span></a><p>Designed around data, built with intent.</p><span>© {new Date().getFullYear()} Atul Kumar Dubey</span><a className="back-top" href="#home">Back to top ↑</a></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

