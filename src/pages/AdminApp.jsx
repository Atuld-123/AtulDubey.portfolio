import React, { useEffect, useState } from 'react';
import { api, apiList, refreshCsrf, assetUrl } from '../lib/api';
import { LogOut, Plus, Save, Trash2, Eye, EyeOff, LayoutDashboard, UserRound, FolderKanban, Wrench, BriefcaseBusiness, GraduationCap, Award, FileText, MessageSquare, Settings, X } from 'lucide-react';

const resources = {
  skills: { label: 'Skills', endpoint: '/api/skills/', icon: Wrench, fields: [['name', 'Skill name'], ['category', 'Category', 'select', ['Programming', 'Backend Development', 'Databases', 'Cybersecurity', 'Networking', 'Linux', 'Cloud', 'DevOps', 'Tools', 'Analytics & BI', 'Other']], ['description', 'Description'], ['proficiency', 'Proficiency (0–100)', 'number'], ['icon', 'Icon or emoji'], ['order', 'Display order', 'number']] },
  projects: { label: 'Projects', endpoint: '/api/projects/', icon: FolderKanban, fields: [['title', 'Title'], ['description', 'Description', 'textarea'], ['technologies', 'Technologies (comma separated)'], ['category', 'Category'], ['status', 'Status', 'select', ['Completed', 'In Progress', 'Planned']], ['github_url', 'GitHub URL'], ['live_url', 'Live demo URL'], ['featured', 'Featured', 'checkbox'], ['is_published', 'Published', 'checkbox'], ['order', 'Display order', 'number'], ['image', 'Project image', 'file']] },
  experience: { label: 'Experience', endpoint: '/api/experience/', icon: BriefcaseBusiness, fields: [['job_title', 'Job title'], ['company', 'Company'], ['location', 'Location'], ['start_date', 'Start date'], ['end_date', 'End date'], ['is_current', 'Current role', 'checkbox'], ['description', 'Description', 'textarea'], ['order', 'Display order', 'number']] },
  education: { label: 'Education', endpoint: '/api/education/', icon: GraduationCap, fields: [['degree', 'Degree'], ['institution', 'Institution'], ['location', 'Location'], ['start_date', 'Start date'], ['end_date', 'End date'], ['description', 'Description', 'textarea'], ['order', 'Display order', 'number']] },
  certifications: { label: 'Certifications', endpoint: '/api/certifications/', icon: Award, fields: [['name', 'Certification'], ['issuer', 'Issuer'], ['issue_date', 'Issue date'], ['credential_url', 'Credential URL'], ['order', 'Display order', 'number']] },
  messages: { label: 'Contact messages', endpoint: '/api/messages/', icon: MessageSquare, readOnly: true, fields: [['name', 'Name'], ['email', 'Email'], ['subject', 'Subject'], ['message', 'Message', 'textarea'], ['created_at', 'Received'], ['is_read', 'Read', 'checkbox']] },
};

const panels = [
  ['overview', 'Overview', LayoutDashboard], ['profile', 'Profile', UserRound], ['about', 'About me', UserRound], ['skills', 'Skills', Wrench], ['projects', 'Projects', FolderKanban], ['experience', 'Experience', BriefcaseBusiness], ['education', 'Education', GraduationCap], ['certifications', 'Certifications', Award], ['resume', 'Resume', FileText], ['social', 'Social links', UserRound], ['messages', 'Contact messages', MessageSquare], ['settings', 'Website settings', Settings],
];
const profileFields = {
  profile: [['full_name', 'Full name'], ['professional_title', 'Professional title'], ['short_intro', 'Short introduction', 'textarea'], ['availability_status', 'Availability'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['profile_picture', 'Profile picture', 'file']],
  about: [['about_heading', 'Heading'], ['about_me', 'Personal summary', 'textarea'], ['contact_intro', 'Contact introduction', 'textarea']],
  social: [['linkedin_url', 'LinkedIn URL'], ['github_url', 'GitHub URL'], ['other_links', 'Other links (JSON)', 'textarea']],
  settings: [['site_title', 'Website title'], ['meta_description', 'Meta description', 'textarea'], ['footer_text', 'Footer text'], ['allow_contact_form', 'Enable contact form', 'checkbox']],
};

const unwrap = (data) => data?.results || data || [];
function Field({ spec, value, onChange }) {
  const [key, label, type = 'text', options = []] = spec;
  const shared = { name: key, id: key, onChange, required: ['name', 'title', 'job_title', 'company', 'degree', 'institution'].includes(key) };
  return <label className={type === 'checkbox' ? 'admin-check' : 'admin-field'}>{type === 'checkbox' ? <><input {...shared} type="checkbox" checked={Boolean(value)} />{label}</> : <>{label}{type === 'select' ? <select {...shared} value={value || options[0]}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea {...shared} value={value ?? ''} rows={key === 'message' ? 5 : 3} /> : <input {...shared} type={type} value={type === 'file' ? undefined : (value ?? '')} accept={key.includes('picture') || key === 'image' ? 'image/jpeg,image/png,image/webp' : key === 'file' ? 'application/pdf' : undefined} />}</>}</label>;
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState('');
  const [panel, setPanel] = useState('overview');
  const [profile, setProfile] = useState({});
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [notice, setNotice] = useState({ text: '', error: false });
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function loadProfile() { const item = await api('/api/profile/'); setProfile(item || {}); return item || {}; }
  async function loadPanel(selected = panel) {
    if (selected === 'settings') { const item = await api('/api/settings/'); setForm(item); return; }
    if (selected in profileFields) { const item = await loadProfile(); setForm(item); return; }
    if (resources[selected]) { setData(await apiList(resources[selected].endpoint)); return; }
    if (selected === 'resume') { setResume(await api('/api/resume/')); return; }
    if (selected === 'overview') {
      const counts = await Promise.all(['skills', 'projects', 'experience', 'messages'].map(async (name) => [name, await apiList(resources[name].endpoint)]));
      setStats(Object.fromEntries(counts.map(([name, items]) => [name, items.length])));
    }
  }
  useEffect(() => { (async () => { try { await refreshCsrf(); const result = await api('/api/auth/me/'); if (result.authenticated) { setUser(result); await loadProfile(); } } catch { /* Show sign-in */ } finally { setChecking(false); } })(); }, []);
  useEffect(() => { if (user) { setPanelLoading(true); loadPanel(panel).catch((e) => setNotice({ text: e.message, error: true })).finally(() => setPanelLoading(false)); } }, [panel, user]);

  async function submitLogin(event) {
    event.preventDefault(); setBusy(true); setLoginError('');
    try { await api('/api/auth/login/', { method: 'POST', body: JSON.stringify(login) }); await refreshCsrf(); const me = await api('/api/auth/me/'); setUser(me); await loadProfile(); setToast('Login successful. Welcome to your dashboard.'); }
    catch (e) { setLoginError(e.message); } finally { setBusy(false); }
  }
  async function logout() { try { await api('/api/auth/logout/', { method: 'POST' }); setToast('You have signed out successfully.'); } catch (e) { setNotice({ text: e.message, error: true }); } finally { setUser(null); setLogin({ username: '', password: '' }); setPanel('overview'); } }
  function handleField(event) { const { name, type, checked, value, files } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] : value })); }
  function selectPanel(nextPanel) { setPanelLoading(true); setData([]); setPanel(nextPanel); setEditing(null); setNotice({ text: '', error: false }); }
  function startNew() { setEditing('new'); setForm({ is_published: true, status: 'Completed', proficiency: 70 }); setNotice({ text: '', error: false }); }
  function startEdit(item) { setEditing(item.id); const next = { ...item }; if (Array.isArray(next.technologies)) next.technologies = next.technologies.join(', '); if (keyIsOtherLinks(next.other_links)) next.other_links = JSON.stringify(next.other_links, null, 2); setForm(next); setNotice({ text: '', error: false }); }
  async function saveResource(event) {
    event.preventDefault(); setBusy(true); setNotice({ text: '', error: false });
    try {
      const spec = resources[panel]; const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => { if (value === undefined || value === null || key === 'id' || key === 'image_url' || (['image', 'profile_picture'].includes(key) && typeof value === 'string')) return; if (key === 'technologies' && typeof value === 'string') value = value.split(',').map((item) => item.trim()).filter(Boolean); if (value instanceof File) payload.append(key, value); else if (typeof value === 'object') payload.append(key, JSON.stringify(value)); else payload.append(key, String(value)); });
      const endpoint = spec.endpoint + (editing !== 'new' ? `${editing}/` : '');
      await api(endpoint, { method: editing === 'new' ? 'POST' : 'PATCH', body: payload }); setEditing(null); setNotice({ text: 'Changes saved.', error: false }); await loadPanel(panel);
    } catch (e) { setNotice({ text: e.message, error: true }); } finally { setBusy(false); }
  }
  async function deleteItem(item) {
    if (!window.confirm(`Delete “${item.title || item.name || item.job_title || item.subject || item.degree || 'this item'}”? This cannot be undone.`)) return;
    try { await api(`${resources[panel].endpoint}${item.id}/`, { method: 'DELETE' }); setData(data.filter((entry) => entry.id !== item.id)); setNotice({ text: 'Item deleted.', error: false }); }
    catch (e) { setNotice({ text: e.message, error: true }); }
  }
  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setNotice({ text: '', error: false });
    try { const body = new FormData(); Object.entries(form).forEach(([key, value]) => { if (value === undefined || value === null || key === 'id' || key === 'updated_at' || (key === 'profile_picture' && typeof value === 'string')) return; if (key === 'other_links' && typeof value === 'string') value = JSON.parse(value || '[]'); body.append(key, value instanceof File ? value : typeof value === 'object' ? JSON.stringify(value) : String(value)); });
      const item = await api('/api/profile/', { method: 'PATCH', body }); setProfile(item); setForm(item); setNotice({ text: 'Profile saved.', error: false }); }
    catch (e) { setNotice({ text: e.message, error: true }); } finally { setBusy(false); }
  }
  async function saveSettings(event) {
    event.preventDefault(); setBusy(true); try { const item = await api('/api/settings/', { method: 'PATCH', body: JSON.stringify(form) }); setForm(item); setNotice({ text: 'Settings saved.', error: false }); }
    catch (e) { setNotice({ text: e.message, error: true }); } finally { setBusy(false); }
  }
  async function uploadResume(event) {
    event.preventDefault(); const file = form.file; if (!file) return; setBusy(true); const body = new FormData(); body.append('file', file);
    try { const item = await api('/api/resume/', { method: 'POST', body }); setResume(item); setForm({}); setNotice({ text: 'Resume uploaded.', error: false }); }
    catch (e) { setNotice({ text: e.message, error: true }); } finally { setBusy(false); }
  }
  async function deleteResume() { if (!window.confirm('Remove the current resume?')) return; try { await api('/api/resume/', { method: 'DELETE' }); setResume(null); setNotice({ text: 'Resume removed.', error: false }); } catch (e) { setNotice({ text: e.message, error: true }); } }
  async function removeProfilePicture() { if (!window.confirm('Remove the current profile picture?')) return; try { const item = await api('/api/profile/', { method: 'PATCH', body: JSON.stringify({ clear_profile_picture: true }) }); setProfile(item); setForm(item); setNotice({ text: 'Profile picture removed.', error: false }); } catch (e) { setNotice({ text: e.message, error: true }); } }
  function removeProjectImage() { setForm((current) => ({ ...current, image: '', clear_image: true })); }
  function keyIsOtherLinks(value) { return value !== undefined && value !== null; }

  if (checking) return <div className="admin-loading">Checking secure admin session…</div>;
  if (!user) return <main className="admin-login">{toast && <div className="admin-toast" role="status"><span className="admin-toast-check">&#10003;</span>{toast}</div>}<a className="brand" href="/"><span className="brand-mark">AK</span><span>Portfolio admin</span></a><form className="admin-login-card" onSubmit={submitLogin}><div className="section-kicker">SECURE DASHBOARD</div><h1>Sign in</h1><p>Use your Django staff account to manage portfolio content.</p><label className="admin-field">Username<input autoComplete="username" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} required /></label><label className="admin-field">Password<span className="admin-password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required /><button type="button" className="admin-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{loginError && <p className="admin-alert error">{loginError}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button></form><a className="admin-back" href="/">← Back to portfolio</a></main>;

  const active = panels.find(([key]) => key === panel); const Icon = active?.[2] || LayoutDashboard;
  const profileMode = panel in profileFields; const resource = resources[panel];
  return <div className="admin-layout">{toast && <div className="admin-toast" role="status"><span className="admin-toast-check">&#10003;</span>{toast}</div>}<aside className="admin-sidebar"><a href="/" className="brand"><span className="brand-mark">AK</span><span>Portfolio CMS</span></a><div className="admin-user"><span className="admin-avatar">{(profile.full_name || 'A').slice(0, 1)}</span><div><strong>{profile.full_name || user.username}</strong><small>Administrator</small></div></div><nav className="admin-nav">{panels.map(([key, label, NavIcon]) => <button key={key} className={panel === key ? 'selected' : ''} onClick={() => selectPanel(key)}><NavIcon size={17} />{label}</button>)}</nav><button type="button" className="admin-logout" onClick={logout}><LogOut size={17} />Sign out</button></aside>
    <main className="admin-main"><header className="admin-topbar"><div><div className="section-kicker">CONTENT MANAGEMENT</div><h1><Icon size={25} />{active?.[1] || 'Dashboard'}</h1></div><div className="admin-top-actions"><a className="admin-outline" href="/" target="_blank" rel="noreferrer"><Eye size={16} /> Preview site</a><button type="button" className="admin-outline mobile-logout" onClick={logout}><LogOut size={16} />Sign out</button></div></header>
      {notice.text && <p className={notice.error ? 'admin-alert error' : 'admin-alert success'} role="status">{notice.text}</p>}
      {panelLoading && <div className="admin-empty">Loading content…</div>}
      {!panelLoading && panel === 'overview' && <section className="admin-overview"><p className="admin-muted">Your changes are saved in the backend database and appear on the public site.</p><div className="admin-stat-grid">{[['skills', 'Skills', Wrench], ['projects', 'Projects', FolderKanban], ['experience', 'Experience', BriefcaseBusiness], ['messages', 'Messages', MessageSquare]].map(([key, label, StatIcon]) => <article className="admin-stat" key={key}><StatIcon size={20} /><strong>{stats[key] ?? '—'}</strong><span>{label}</span></article>)}</div><div className="admin-shortcuts"><h2>Quick actions</h2><button onClick={() => selectPanel('profile')}>Update profile details →</button><button onClick={() => selectPanel('projects')}>Manage projects →</button><button onClick={() => selectPanel('resume')}>Upload a new resume →</button></div></section>}
      {!panelLoading && profileMode && panel !== 'settings' && <section className="admin-editor"><p className="admin-muted">Changes are applied to the public portfolio after saving.</p><form onSubmit={saveProfile} className="admin-form-grid">{profileFields[panel].map((field) => <Field key={field[0]} spec={field} value={form[field[0]]} onChange={handleField} />)}{panel === 'profile' && (form.profile_picture instanceof File || profile.profile_picture) && <><img className="admin-upload-preview" src={form.profile_picture instanceof File ? URL.createObjectURL(form.profile_picture) : assetUrl(profile.profile_picture)} alt="Profile preview" />{profile.profile_picture && <button type="button" className="admin-outline" onClick={removeProfilePicture}>Remove current picture</button>}</>}<div className="admin-form-actions"><button className="button button-primary" disabled={busy}><Save size={16} />{busy ? 'Saving…' : 'Save changes'}</button><button type="button" className="admin-outline" onClick={() => loadPanel(panel)}>Cancel</button><a className="admin-outline" href="/" target="_blank" rel="noreferrer"><Eye size={16} />Preview</a></div></form></section>}
      {!panelLoading && panel === 'settings' && <section className="admin-editor"><p className="admin-muted">Changes are applied to the public portfolio after saving.</p><form onSubmit={saveSettings} className="admin-form-grid">{profileFields.settings.map((field) => <Field key={field[0]} spec={field} value={form[field[0]]} onChange={handleField} />)}<div className="admin-form-actions"><button className="button button-primary" disabled={busy}><Save size={16} />{busy ? 'Saving…' : 'Save settings'}</button><button type="button" className="admin-outline" onClick={() => loadPanel(panel)}>Cancel</button></div></form></section>}
      {!panelLoading && resource && <section className="admin-resource"><div className="admin-list-heading"><p className="admin-muted">{panel === 'messages' ? 'Only authenticated admins can view contact messages.' : 'Manage the content shown on your public portfolio.'}</p>{!resource.readOnly && <button className="button button-primary" onClick={startNew}><Plus size={17} />Add {resource.label.replace(/s$/, '')}</button>}</div>{editing !== null && <form className="admin-edit-card" onSubmit={saveResource}><div className="admin-edit-heading"><h2>{editing === 'new' ? `Add ${resource.label.replace(/s$/, '')}` : `Edit ${resource.label.replace(/s$/, '')}`}</h2><button type="button" aria-label="Close editor" onClick={() => setEditing(null)}><X size={19} /></button></div><div className="admin-form-grid">{resource.fields.filter(([key]) => !['created_at'].includes(key)).map((field) => <Field key={field[0]} spec={field} value={form[field[0]]} onChange={handleField} />)}</div>{panel === 'projects' && form.image && typeof form.image === 'string' && <><img className="admin-upload-preview" src={assetUrl(form.image)} alt="Current project" /><button type="button" className="admin-outline" onClick={removeProjectImage}>Remove current image</button></>}{form.image instanceof File && <img className="admin-upload-preview" src={URL.createObjectURL(form.image)} alt="Selected project" />}<div className="admin-form-actions"><button className="button button-primary" disabled={busy}><Save size={16} />{busy ? 'Saving…' : 'Save'}</button><button type="button" className="admin-outline" onClick={() => setEditing(null)}>Cancel</button></div></form>}
        <div className="admin-records">{data.map((item) => <article className="admin-record" key={item.id}><div className="admin-record-body"><strong>{item.title || item.name || item.job_title || item.subject || item.degree}</strong><span>{item.company || item.category || item.email || item.status || item.issuer || item.institution}</span>{item.message && <p>{item.message}</p>}{item.description && <p>{item.description}</p>}{item.is_published === false && <small className="admin-unpublished">Unpublished</small>}</div>{!resource.readOnly && <div className="admin-record-actions">{panel === 'projects' && <button title={item.is_published ? 'Unpublish' : 'Publish'} onClick={async () => { try { await api(`${resource.endpoint}${item.id}/`, { method: 'PATCH', body: JSON.stringify({ is_published: !item.is_published }) }); await loadPanel(); } catch (e) { setNotice({ text: e.message, error: true }); } }}>{item.is_published ? 'Unpublish' : 'Publish'}</button>}<button title="Edit" onClick={() => startEdit(item)}>Edit</button><button className="danger" title="Delete" onClick={() => deleteItem(item)}><Trash2 size={16} /></button></div>}</article>)}{!data.length && editing === null && <div className="admin-empty">Nothing here yet. Use the button above to add your first item.</div>}</div></section>}
      {!panelLoading && panel === 'resume' && <section className="admin-editor"><p className="admin-muted">Upload a PDF up to 10 MB. The public site will use the latest uploaded file.</p>{resume?.file && <div className="resume-current"><FileText size={23} /><div><strong>{resume.original_name || 'Current resume.pdf'}</strong><small>Uploaded {new Date(resume.uploaded_at).toLocaleString()}</small></div><button className="danger" onClick={deleteResume}><Trash2 size={17} />Remove</button></div>}<form onSubmit={uploadResume} className="admin-form-grid"><Field spec={['file', 'Choose a PDF', 'file']} value={form.file} onChange={handleField} />{form.file && <div className="file-preview">Selected: {form.file.name}</div>}<div className="admin-form-actions"><button className="button button-primary" disabled={busy || !form.file}><Save size={16} />{busy ? 'Uploading…' : 'Upload resume'}</button></div></form></section>}
    </main></div>;
}
