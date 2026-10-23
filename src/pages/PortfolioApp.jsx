import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, MapPin, Menu, Moon, Sun, X } from 'lucide-react';
import { api, apiList, assetUrl } from '../lib/api';

const emptyContent = { profile: null, skills: [], projects: [], experience: [], education: [], certifications: [], resume: null, settings: null };

function usePortfolio() {
  const [content, setContent] = useState(emptyContent);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    Promise.allSettled([api('/api/profile/'), apiList('/api/skills/'), apiList('/api/projects/'), apiList('/api/experience/'), apiList('/api/education/'), apiList('/api/certifications/'), api('/api/resume/'), api('/api/settings/')])
      .then((results) => {
        if (!active) return;
        const [profileResult, ...rest] = results;
        const value = (result, fallback) => result.status === 'fulfilled' ? result.value : fallback;
        const [skillsResult, projectsResult, experienceResult, educationResult, certificationResult, resumeResult, settingsResult] = rest;
        const profile = value(profileResult, null), skills = value(skillsResult, []), projects = value(projectsResult, []), experience = value(experienceResult, []), education = value(educationResult, []), certifications = value(certificationResult, []), resume = value(resumeResult, null), settings = value(settingsResult, null);
        setContent({ profile, skills, projects, experience, education, certifications, resume: resume?.file ? resume : null, settings });
        setError(profileResult.status === 'rejected' ? 'The portfolio service is not available right now. Please try again later.' : '');
        setLoading(false);
      });
    return () => { active = false; };
  }, []);
  return { content, error, loading };
}

export default function PortfolioApp() {
  const { content, error, loading } = usePortfolio();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('portfolio-theme') !== 'light');
  const [category, setCategory] = useState('All');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [formState, setFormState] = useState({ loading: false, message: '', error: false });
  const profile = content.profile || {};
  const categories = useMemo(() => ['All', ...new Set(content.projects.map((item) => item.category).filter(Boolean))], [content.projects]);
  const visibleProjects = content.projects.filter((item) => item.is_published !== false && (category === 'All' || item.category === category));
  const nav = [['About', '#about'], ['Skills', '#skills'], ['Projects', '#projects'], ['Experience', '#experience'], ['Education', '#education'], ['Certifications', '#certifications'], ['Contact', '#contact']];
  const projectRoute = window.location.pathname.match(/^\/projects\/(\d+)\/?$/);
  const detailProject = projectRoute ? content.projects.find((item) => String(item.id) === projectRoute[1]) : null;
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.title = content.settings?.site_title || `${profile.full_name || 'Atul Kumar Dubey'} | Portfolio`;
    let description = document.querySelector('meta[name="description"]');
    if (!description) { description = document.createElement('meta'); description.name = 'description'; document.head.append(description); }
    const summary = content.settings?.meta_description || profile.short_intro || 'Portfolio and projects.';
    description.content = summary;
    [['og:title', document.title], ['og:description', summary]].forEach(([property, value]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.append(tag); }
      tag.content = value;
    });
  }, [dark, content.settings, profile.full_name, profile.short_intro]);
  const toggleTheme = () => { const next = !dark; setDark(next); localStorage.setItem('portfolio-theme', next ? 'dark' : 'light'); };

  async function submitContact(event) {
    event.preventDefault(); setFormState({ loading: true, message: '', error: false });
    try {
      await api('/api/contact/', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
      setFormState({ loading: false, message: 'Thanks for your message. I will be in touch.', error: false });
    } catch (e) { setFormState({ loading: false, message: e.message, error: true }); }
  }

  if (projectRoute) {
    if (!detailProject) return <main className="admin-not-found"><h1>Project not found</h1><p>This project may have been removed or unpublished.</p><a href="/">Return to portfolio</a></main>;
    return <div className={`site-shell ${dark ? 'theme-dark' : 'theme-light'}`}><header className="header"><a href="/" className="brand"><span className="brand-mark">AK</span><span>{profile.full_name || 'Atul Kumar Dubey'}</span></a><a href="/#projects">← All projects</a></header><main className="project-detail-page section-wrap"><div className="section-kicker">{detailProject.category}</div><h1>{detailProject.title}</h1><p className="project-summary">{detailProject.description}</p>{detailProject.image && <img className="project-image" src={assetUrl(detailProject.image)} alt={detailProject.title} />}<div className="tag-list">{(detailProject.technologies || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><p className="project-status">Status: {detailProject.status}</p><div className="project-actions">{detailProject.github_url && <a className="button button-secondary" href={detailProject.github_url} target="_blank" rel="noreferrer">View repository <ArrowUpRight size={16} /></a>}{detailProject.live_url && <a className="button button-primary" href={detailProject.live_url} target="_blank" rel="noreferrer">Open live demo <ArrowUpRight size={16} /></a>}</div></main></div>;
  }
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return <main className="admin-not-found"><h1>Page not found</h1><a href="/">Return to portfolio</a></main>;

  return <div className={`site-shell ${dark ? 'theme-dark' : 'theme-light'}`}>
    <header className="header"><a href="#home" className="brand"><span className="brand-mark">AK</span><span>{profile.full_name || 'Atul Kumar Dubey'}<span className="brand-dot">.</span></span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'}>{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button></nav>
    </header>
    {loading && <p className="api-notice text-sm" role="status">Loading portfolio…</p>}{error && <p className="api-notice" role="status">{error}</p>}
    <main>
      <section className="hero section-wrap" id="home"><div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> {profile.availability_status || 'OPEN TO OPPORTUNITIES'}</div>
        <h1>{profile.full_name || 'Atul Kumar Dubey'}<br /><span className="gradient-text">{profile.professional_title || 'Data & Analytics Professional'}</span></h1>
        <p className="hero-lede">{profile.short_intro || 'Building reliable data workflows and turning complex information into clear, useful insights.'}</p>
        <div className="hero-actions"><a className="button button-primary" href="#projects">View projects <ArrowDownRight size={17} /></a><a className="button button-secondary" href={content.resume?.file ? assetUrl(content.resume.file) : '/Atuldubey.pdf'} target="_blank" rel="noreferrer" download>Download resume</a><a className="button button-secondary" href="#contact">Contact me</a></div>
        <div className="hero-links">{profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer"><Github size={16} /> GitHub <ArrowUpRight size={13} /></a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn <ArrowUpRight size={13} /></a>}{(profile.other_links || []).map((item) => item.url && <a key={item.label || item.url} href={item.url} target="_blank" rel="noreferrer">{item.label || 'Social link'} <ArrowUpRight size={13} /></a>)}{profile.email && <a href={`mailto:${profile.email}`}><Mail size={16} /> {profile.email}</a>}{profile.location && <span><MapPin size={15} /> {profile.location}</span>}</div>
      </div>{profile.profile_picture && <img className="profile-photo" src={assetUrl(profile.profile_picture)} alt={profile.full_name || 'Profile'} />}</section>
      <section className="intro-strip section-wrap" id="about"><div className="section-kicker">01 / ABOUT</div><div className="intro-content"><h2>{profile.about_heading || 'About me'}</h2><div><p>{profile.about_me || 'More about my background and career goals will appear here.'}</p></div></div></section>
      <section className="section-wrap skills-section" id="skills"><div className="section-heading"><div><div className="section-kicker">02 / TOOLKIT</div><h2>Skills built for <span className="gradient-text">real work.</span></h2></div></div><div className="skills-grid">{content.skills.map((skill, index) => { const proficiency = Number.isFinite(Number(skill.proficiency)) ? Number(skill.proficiency) : 70; return <article className="skill-card" key={skill.id}><div className="skill-card-top"><span className="skill-icon">{skill.icon || '✦'}</span><span className="card-index">{String(index + 1).padStart(2, '0')}</span></div><h3>{skill.name}</h3><small>{skill.category}</small>{skill.description && <p>{skill.description}</p>}<div className="skill-level">{proficiency}%<span><i style={{ width: `${Math.max(0, Math.min(100, proficiency))}%` }} /></span></div></article>;})}</div>{!content.skills.length && <p className="empty-state">Skills will appear here once added in the admin dashboard.</p>}</section>
      <section className="section-wrap projects-section" id="projects"><div className="section-heading"><div><div className="section-kicker">03 / SELECTED WORK</div><h2>Projects with a <span className="gradient-text">purpose.</span></h2></div></div><div className="project-filters">{categories.map((item) => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="projects-list">{visibleProjects.map((project, index) => <article className="project-card" key={project.id}><div className="project-main"><div className="project-meta"><span className="project-number">{String(index + 1).padStart(2, '0')}</span><span className="project-label">{project.category}</span></div>{project.image && <img className="project-image" src={assetUrl(project.image)} alt={project.title} />}<h3>{project.title}</h3><p className="project-summary">{project.description}</p><div className="tag-list">{(project.technologies || []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><a className="project-link" href={`/projects/${project.id}/`}>Project details <ArrowUpRight size={15} /></a><div className="project-actions">{project.github_url && <a className="project-link" href={project.github_url} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>}{project.live_url && <a className="project-link" href={project.live_url} target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={15} /></a>}</div><span className="project-status">{project.status}</span></div></article>)}</div>{!visibleProjects.length && <p className="empty-state">No projects in this category yet.</p>}</section>
      <section className="section-wrap experience-section" id="experience"><div className="section-heading"><div><div className="section-kicker">04 / EXPERIENCE</div><h2>Professional <span className="gradient-text">experience.</span></h2></div></div><div className="timeline">{content.experience.map((item, index) => <article className="timeline-item" key={item.id}><div className="timeline-marker">{String(index + 1).padStart(2, '0')}</div><div className="timeline-content"><div className="timeline-top"><div><h3>{item.job_title}</h3><p>{item.company} · {item.location}</p></div><span className="period">{item.start_date} – {item.is_current ? 'Present' : item.end_date}</span></div><p>{item.description}</p></div></article>)}</div>{!content.experience.length && <p className="empty-state">Experience details will appear here once added in the admin dashboard.</p>}</section>
      <section className="section-wrap experience-section" id="education"><div className="section-heading"><div><div className="section-kicker">05 / EDUCATION</div><h2>Education & <span className="gradient-text">learning.</span></h2></div></div><div className="timeline">{content.education.map((item, index) => <article className="timeline-item" key={item.id}><div className="timeline-marker">{String(index + 1).padStart(2, '0')}</div><div className="timeline-content"><div className="timeline-top"><div><h3>{item.degree}</h3><p>{item.institution}{item.location ? ` · ${item.location}` : ''}</p></div><span className="period">{item.start_date}{item.end_date ? ` – ${item.end_date}` : ' – Present'}</span></div>{item.description && <p>{item.description}</p>}</div></article>)}</div>{!content.education.length && <p className="empty-state">Education details will appear here once added in the admin dashboard.</p>}</section>
      <section className="section-wrap experience-section" id="certifications"><div className="section-heading"><div><div className="section-kicker">06 / CERTIFICATIONS</div><h2>Credentials & <span className="gradient-text">certifications.</span></h2></div></div><div className="credential-list">{content.certifications.map((item, index) => <article className="credential-card" key={item.id}><div className="credential-icon"><span>{String(index + 1).padStart(2, '0')}</span></div><div><h3>{item.name}</h3><p>{item.issuer}{item.issue_date ? ` · ${item.issue_date}` : ''}</p></div>{item.credential_url && <a className="icon-button" href={item.credential_url} target="_blank" rel="noreferrer" aria-label={`View ${item.name} credential`}><ArrowUpRight size={17} /></a>}</article>)}</div>{!content.certifications.length && <p className="empty-state">Certifications will appear here once added in the admin dashboard.</p>}</section>
      {content.settings?.allow_contact_form !== false && <section className="contact-section" id="contact"><div className="section-wrap contact-layout"><div className="contact-copy"><div className="section-kicker">07 / CONTACT</div><h2>Have data to<br /><span className="gradient-text">make sense of?</span></h2><p>{profile.contact_intro || 'Have an opportunity or question? Send me a message.'}</p>{profile.email && <a className="contact-email" href={`mailto:${profile.email}`}><Mail size={18} /> {profile.email}</a>}</div><form className="contact-form" onSubmit={submitContact}><div className="form-heading"><h3>Send a message</h3><span>Your message is sent securely to the portfolio inbox.</span></div><label>Your name<input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength="120" /></label><label>Email address<input name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength="254" /></label><label>Subject<input name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength="180" /></label><label>Message<textarea name="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="4" required maxLength="5000" /></label><label className="honeypot" aria-hidden="true">Website<input tabIndex="-1" autoComplete="off" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label><button className="button button-primary submit-button" disabled={formState.loading}>{formState.loading ? 'Sending…' : 'Send message'}</button>{formState.message && <p className={formState.error ? 'form-message error' : 'form-message'} role="status">{formState.message}</p>}</form></div></section>}
    </main><footer className="footer section-wrap"><a href="#home" className="brand"><span className="brand-mark">AK</span><span>{profile.full_name || 'Atul Kumar Dubey'}</span></a><p>{content.settings?.footer_text || 'Designed around data, built with intent.'}</p><a href="/admin-panel/" className="admin-entry">Admin</a></footer>
  </div>;
}
