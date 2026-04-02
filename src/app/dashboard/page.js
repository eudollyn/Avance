"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { logout } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, CheckCircle2, LogOut, Search,
  Trash2, Layout, BookOpen, ChevronLeft, ChevronUp,
  Save, Sparkles, PencilLine, Link as LinkIcon, Target,
  Award, Clock, Eye, Briefcase, ExternalLink,
  CheckCheck, AlertCircle, Loader2, X, SlidersHorizontal
} from 'lucide-react';

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 md:top-6 z-[500] flex flex-col gap-2 pointer-events-none w-[90vw] md:w-auto">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-black text-[11px] uppercase tracking-widest animate-in slide-in-from-top md:slide-in-from-right duration-300 ${
          t.type === 'success' ? 'bg-green-500 text-white' :
          t.type === 'error'   ? 'bg-red-500 text-white' :
                                 'bg-slate-900 text-white'
        }`}>
          {t.type === 'success' ? <CheckCheck size={14}/> : <AlertCircle size={14}/>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-100 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
        <Icon size={28} strokeWidth={1.5}/>
      </div>
      <h3 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm font-medium max-w-xs leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────
function ProgressRing({ value, size = 80 }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EFF6FF" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2563EB" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={dash}
        strokeLinecap="round" style={{transition:'stroke-dashoffset 0.8s ease'}}/>
    </svg>
  );
}

// ─── IA DRAWER (mobile) ───────────────────────────────────────────────────────
function IADrawer({ open, onClose, profile, pastedText, setPastedText, onSync, onFinish, syncing, finishing, hasRoadmap }) {
  return (
    <>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 bg-black/50 z-[150] md:hidden" onClick={onClose}/>}
      {/* Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 z-[160] md:hidden bg-slate-900 rounded-t-[2.5rem] shadow-2xl transition-transform duration-400 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-white/20 rounded-full"/>
        </div>
        <div className="px-6 pb-8 pt-2 text-white space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-base uppercase text-blue-400 italic flex items-center gap-2"><Sparkles size={18}/> Alimentar IA</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2"><X size={20}/></button>
          </div>
          <button
            onClick={() => { window.open(`https://chatgpt.com/?q=${encodeURIComponent('Mentor: Sou ' + profile?.currentRole + ' e quero ser ' + profile?.goal + '. Gere apenas uma lista numerada de 5 etapas técnicas. Formato Título: Descrição.')}`, '_blank'); }}
            className="w-full bg-blue-600 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            1. Abrir GPT
          </button>
          <textarea
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Cole aqui o resultado do GPT..."
            className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono outline-none focus:border-blue-500 resize-none transition-colors"
          />
          <button
            onClick={onSync}
            disabled={syncing}
            className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-60 active:scale-95"
          >
            {syncing ? <><Loader2 size={14} className="animate-spin"/> Sincronizando...</> : "2. Sincronizar Mapa"}
          </button>
          {hasRoadmap && (
            <button
              onClick={onFinish}
              disabled={finishing}
              className="w-full text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-all py-3 disabled:opacity-30"
            >
              {finishing ? <><Loader2 size={12} className="animate-spin"/> Arquivando...</> : <><Trash2 size={13}/> Finalizar Projeto</>}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── BACKLINKS DRAWER (mobile) ────────────────────────────────────────────────
function BacklinksDrawer({ open, onClose, roadmap, allNotes, selectedNote, onSelect }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-[150] xl:hidden" onClick={onClose}/>}
      <div className={`fixed bottom-0 left-0 right-0 z-[160] xl:hidden bg-white rounded-t-[2.5rem] shadow-2xl transition-transform duration-400 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full"/>
        </div>
        <div className="px-6 pb-24 pt-2 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2"><LinkIcon size={14}/> Etapas</h3>
            <button onClick={onClose} className="text-slate-400 p-2"><X size={18}/></button>
          </div>
          <div className="space-y-3">
            <div onClick={() => { onSelect(""); onClose(); }} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedNote === "" ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-50 border-transparent text-slate-500'}`}>
              <p className="text-[10px] font-black uppercase opacity-60 mb-0.5">Base</p>
              <p className="text-sm font-bold italic">Notas Gerais</p>
            </div>
            {roadmap.map((item, i) => (
              <div key={i} onClick={() => { onSelect(item.title); onClose(); }} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedNote === item.title ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                <p className="text-[10px] font-black uppercase opacity-60 mb-0.5">Etapa {i + 1}</p>
                <p className="text-sm font-bold uppercase tracking-tighter leading-tight">{item.title}</p>
                {allNotes[item.title] && <p className="text-[9px] mt-1 opacity-60 italic">✓ Com notas</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();

  const [user, setUser]                       = useState(null);
  const [profile, setProfile]                 = useState({ goal: "", currentRole: "", displayName: "", photoURL: "" });
  const [roadmap, setRoadmap]                 = useState([]);
  const [completedSkills, setCompletedSkills] = useState([]);
  const [allNotes, setAllNotes]               = useState({});
  const [notes, setNotes]                     = useState("");
  const [selectedNote, setSelectedNote]       = useState("");
  const [archives, setArchives]               = useState([]);
  const [pastedText, setPastedText]           = useState("");
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState("roadmap");
  const [showOnboarding, setShowOnboarding]   = useState(false);
  const [saveStatus, setSaveStatus]           = useState("Sincronizado");
  const [viewingArchive, setViewingArchive]   = useState(null);
  const [syncing, setSyncing]                 = useState(false);
  const [finishing, setFinishing]             = useState(false);
  const [toasts, setToasts]                   = useState([]);
  const [showIADrawer, setShowIADrawer]       = useState(false);
  const [showBacklinks, setShowBacklinks]     = useState(false);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // FIREBASE
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({ ...data, displayName: currentUser.displayName || "Usuário", photoURL: currentUser.photoURL || "" });
          setRoadmap(data.roadmap || []);
          setCompletedSkills(data.completedSkills || []);
          setArchives(data.archives || []);
          setAllNotes(data.allNotes || {});
          setNotes(data.notes || "");
          if (!data.goal) setShowOnboarding(true);
        } else { setShowOnboarding(true); }
        setLoading(false);
      } else { router.push('/login'); }
    });
    return () => unsub();
  }, [router]);

  const progress = useMemo(() => {
    const r = viewingArchive ? viewingArchive.roadmap : roadmap;
    const c = viewingArchive ? (viewingArchive.completedSkills || []) : completedSkills;
    return r.length > 0 ? Math.round((c.length / r.length) * 100) : 0;
  }, [roadmap, completedSkills, viewingArchive]);

  const toggleSkill = async (title) => {
    if (viewingArchive) return;
    const isCompleted = completedSkills.includes(title);
    const updated = isCompleted ? completedSkills.filter(s => s !== title) : [...completedSkills, title];
    setCompletedSkills(updated);
    await updateDoc(doc(db, "users", user.uid), { completedSkills: updated });
    if (!isCompleted) addToast(`"${title}" concluído! 🎯`);
  };

  const openArchive = (archive) => { setViewingArchive(archive); setActiveTab("roadmap"); };

  const saveCurrentNote = async (val) => {
    if (viewingArchive) return;
    setSaveStatus("Salvando...");
    if (selectedNote) {
      const updated = { ...allNotes, [selectedNote]: val };
      setAllNotes(updated);
      await updateDoc(doc(db, "users", user.uid), { allNotes: updated });
    } else {
      setNotes(val);
      await updateDoc(doc(db, "users", user.uid), { notes: val });
    }
    setTimeout(() => setSaveStatus("Sincronizado"), 800);
  };

  const handleSyncData = async () => {
    if (!pastedText.trim()) { addToast("Cole o texto do GPT antes de sincronizar.", "error"); return; }
    setSyncing(true);
    try {
      const lines = pastedText.split('\n');
      let newSkills = [];
      lines.forEach(line => {
        const clean = line.trim();
        if (/^\d+[\.\ )]\s/.test(clean)) {
          const raw = clean.replace(/^\d+[\.\ )]\s/, '');
          const parts = raw.split(':');
          newSkills.push({ title: parts[0].trim(), fullDescription: parts[1]?.trim() || parts[0].trim() });
        }
      });
      if (newSkills.length > 0) {
        await updateDoc(doc(db, "users", user.uid), { roadmap: newSkills, completedSkills: [], allNotes: {} });
        setRoadmap(newSkills); setCompletedSkills([]); setAllNotes({}); setPastedText("");
        addToast(`${newSkills.length} etapas mapeadas!`);
        setShowIADrawer(false);
      } else {
        addToast("Nenhuma etapa encontrada. Verifique o formato.", "error");
      }
    } catch { addToast("Erro ao sincronizar.", "error"); }
    finally { setSyncing(false); }
  };

  const handleArchiveAndReset = async () => {
    if (!confirm("Deseja finalizar e arquivar este projeto como uma vitória?")) return;
    setFinishing(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { archives: arrayUnion({ id: Date.now(), goal: profile.goal, date: new Date().toLocaleDateString('pt-BR'), progress, roadmap, allNotes, notes, completedSkills }) });
      await updateDoc(userRef, { goal: "", roadmap: [], completedSkills: [], allNotes: {}, notes: "" });
      addToast("Vitória arquivada! 🏆");
      setTimeout(() => window.location.reload(), 1200);
    } catch { addToast("Erro ao finalizar.", "error"); setFinishing(false); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950 font-black text-blue-500 text-xl italic animate-pulse uppercase tracking-[0.3em]">Avance...</div>
  );

  const currentRoadmap = viewingArchive ? viewingArchive.roadmap : roadmap;

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      <Toast toasts={toasts}/>

      {/* ── SIDEBAR (desktop) / BOTTOM NAV (mobile) ── */}
      <aside className="fixed bottom-0 left-0 w-full bg-slate-950 text-white z-[100] shadow-2xl md:static md:w-72 md:flex-col md:p-8 md:h-screen md:flex">

        {/* Desktop logo */}
        <Link href="/" className="hidden md:flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Zap size={18} fill="white"/></div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Avance</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full md:flex-grow px-2 py-3 md:px-0 md:py-0">
          {[
            { id: "roadmap",  label: "Jornada",  icon: Layout },
            { id: "notes",    label: "Notebook", icon: BookOpen },
            { id: "archives", label: "Vitórias", icon: Award },
          ].map(({ id, label, icon: Icon }) => {
            const active = id === "archives"
              ? activeTab === "archives" || !!viewingArchive
              : activeTab === id && !viewingArchive;
            return (
              <button key={id}
                onClick={() => { if (id !== "archives") setViewingArchive(null); setActiveTab(id); }}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1.5 md:gap-3 px-2 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={16} className="md:w-[18px] md:h-[18px]"/>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop user */}
        <div className="hidden md:flex flex-col mt-auto pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            {profile.photoURL
              ? <img src={profile.photoURL} className="w-9 h-9 rounded-full border-2 border-blue-600" alt="Avatar"/>
              : <div className="w-9 h-9 rounded-full border-2 border-blue-600 bg-slate-800 flex items-center justify-center text-white font-black text-sm">{profile.displayName?.[0]}</div>
            }
            <div className="overflow-hidden">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Operacional</p>
              <p className="text-[11px] font-bold text-white truncate uppercase italic tracking-tighter">{profile.displayName}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest text-[10px]">
            <LogOut size={15}/> Encerrar
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-grow overflow-y-auto h-screen pb-20 md:pb-0 scroll-smooth">

        {/* Banner modo leitura */}
        {viewingArchive && (
          <div className="bg-blue-600 text-white px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-[110] font-black uppercase text-[9px] md:text-[10px] tracking-widest italic shadow-xl">
            <span className="flex items-center gap-2 truncate mr-3"><Eye size={14}/> {viewingArchive.goal}</span>
            <button onClick={() => setViewingArchive(null)} className="bg-white text-blue-600 px-4 py-1.5 rounded-full whitespace-nowrap text-[9px]">Sair</button>
          </div>
        )}

        {/* ══ JORNADA ══ */}
        {activeTab === 'roadmap' && (
          <div className="p-4 md:p-16 max-w-5xl mx-auto animate-in fade-in duration-700">

            {/* Header mobile-friendly */}
            <div className="flex items-end justify-between gap-4 mb-6 md:mb-12">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-slate-950 mb-3">A Rota.</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px] italic truncate max-w-[140px] md:max-w-none">
                    {viewingArchive ? viewingArchive.goal : profile?.goal}
                  </p>
                  {!viewingArchive && profile.goal && (
                    <button
                      onClick={() => window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(profile.goal)}`, '_blank')}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                    >
                      <Briefcase size={10}/> Vagas
                    </button>
                  )}
                </div>
              </div>

              {/* Readiness compacto no mobile */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border p-4 md:p-8 flex items-center gap-3 md:gap-6 flex-shrink-0">
                <div className="relative flex items-center justify-center">
                  <ProgressRing value={progress} size={56}/>
                  <span className="absolute text-sm font-black text-blue-600 italic">{progress}%</span>
                </div>
                <div className="hidden md:block leading-none">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Readiness</p>
                  <p className="text-xs font-bold text-slate-500 italic">
                    {progress === 0  ? "Inicie" :
                     progress < 50  ? "Em progresso..." :
                     progress < 100 ? "Quase lá! 🔥" : "Pronto! 🏆"}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills list */}
            <div className="space-y-4 md:space-y-8 mb-8">
              {currentRoadmap.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="Rota vazia"
                  description="Use o botão abaixo para gerar seu mapa de habilidades com o GPT."
                  action={
                    <button
                      onClick={() => setShowIADrawer(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      <Sparkles size={13}/> Alimentar IA
                    </button>
                  }
                />
              ) : currentRoadmap.map((item, index) => {
                const isDone = viewingArchive
                  ? viewingArchive.completedSkills?.includes(item.title)
                  : completedSkills.includes(item.title);
                return (
                  <div key={index} className={`flex items-start gap-3 md:gap-8 transition-all duration-500 ${isDone && !viewingArchive ? 'opacity-30 grayscale' : ''}`}>
                    {/* Number / check */}
                    <button
                      onClick={() => !viewingArchive && toggleSkill(item.title)}
                      title={isDone ? "Desmarcar" : "Concluir"}
                      className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center font-black shadow-lg transition-all active:scale-90 ${isDone ? 'bg-green-500 text-white' : 'bg-blue-600 text-white shadow-blue-200 hover:scale-105'}`}
                    >
                      {isDone ? <CheckCircle2 size={20}/> : <span className="text-base md:text-xl italic">{index + 1}</span>}
                    </button>

                    {/* Card */}
                    <div className="flex-grow bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border shadow-lg">
                      <h3 className="text-base md:text-2xl font-black tracking-tighter text-slate-950 mb-2 uppercase italic leading-tight">{item.title}</h3>
                      <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed mb-4 italic">{item.fullDescription}</p>
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => window.open(`https://www.youtube.com/results?search_query=curso+completo+${encodeURIComponent(item.fullDescription)}`, '_blank')}
                          className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase flex items-center gap-1.5"
                        >
                          <Search size={11}/> Tutorial
                        </button>
                        <button
                          onClick={() => { setSelectedNote(item.title); setActiveTab("notes"); }}
                          className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase flex items-center gap-1.5"
                        >
                          <PencilLine size={11}/> Notas
                        </button>
                        {!viewingArchive && (
                          <button
                            onClick={() => toggleSkill(item.title)}
                            className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase transition-all ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}
                          >
                            {isDone ? "✓ Feito" : "Concluir"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Painel IA inline */}
            {!viewingArchive && (
              <div className="hidden md:block bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl border border-white/5 mb-16">
                <h3 className="font-black text-lg uppercase mb-8 text-blue-500 italic flex items-center gap-3"><Sparkles size={22}/> Alimentar IA</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <button
                      onClick={() => window.open(`https://chatgpt.com/?q=${encodeURIComponent('Mentor: Sou ' + profile?.currentRole + ' e quero ser ' + profile?.goal + '. Gere apenas uma lista numerada de 5 etapas técnicas. Formato Título: Descrição.')}`, '_blank')}
                      className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 transition-all"
                    >
                      1. Abrir GPT
                    </button>
                    <button
                      onClick={handleSyncData}
                      disabled={syncing}
                      className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-60"
                    >
                      {syncing ? <><Loader2 size={14} className="animate-spin"/> Sincronizando...</> : "2. Sincronizar Mapa"}
                    </button>
                  </div>
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Cole aqui o resultado do GPT..."
                    className="h-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono outline-none focus:border-blue-500 resize-none transition-colors"
                  />
                </div>
                <button
                  onClick={handleArchiveAndReset}
                  disabled={finishing || roadmap.length === 0}
                  className="mt-8 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-30"
                >
                  {finishing ? <><Loader2 size={12} className="animate-spin"/> Arquivando...</> : <><Trash2 size={14}/> Finalizar Projeto</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ VITÓRIAS ══ */}
        {activeTab === 'archives' && (
          <div className="p-4 md:p-16 max-w-5xl mx-auto animate-in fade-in duration-700">
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase italic text-slate-950 leading-none mb-8 md:mb-16">Vitórias.</h1>
            {archives.length === 0 ? (
              <EmptyState
                icon={Award}
                title="Nenhuma vitória ainda"
                description="Conclua um projeto na Jornada e finalize-o. Ele aparecerá aqui."
                action={
                  <button onClick={() => setActiveTab("roadmap")} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                    <Layout size={13}/> Ir para Jornada
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {archives.map((v, i) => (
                  <div key={i} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-lg border border-white hover:border-blue-200 hover:-translate-y-0.5 transition-all">
                    <div className="flex justify-between items-start mb-5">
                      <Award className="text-blue-600" size={32}/>
                      <div className="text-right">
                        <div className="text-[9px] font-black text-slate-300 uppercase italic flex items-center gap-1.5 justify-end mb-1"><Clock size={10}/> {v.date}</div>
                        <div className="text-[9px] font-black text-green-500 uppercase italic">{v.progress}% concluído</div>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black tracking-tighter text-slate-900 mb-5 uppercase italic leading-tight">{v.goal}</h3>
                    <button onClick={() => openArchive(v)} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                      Revisar <ExternalLink size={13}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ NOTEBOOK ══ */}
        {activeTab === 'notes' && (
          <div className="h-full flex flex-col xl:flex-row animate-in fade-in duration-500 overflow-hidden">
            <div className="flex-grow p-4 md:p-16 flex flex-col max-w-4xl mx-auto w-full">

              {/* Header notebook */}
              <div className="mb-5 md:mb-10 flex justify-between items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-none mb-2">Note.</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {!viewingArchive && (
                      <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-[9px] font-black text-blue-600 uppercase border shadow-sm italic">
                        <Save size={10}/> {saveStatus}
                      </span>
                    )}
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate max-w-[130px] md:max-w-none">
                      {selectedNote || "Notas Gerais"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mobile: botão backlinks */}
                  <button
                    onClick={() => setShowBacklinks(true)}
                    className="xl:hidden bg-white border p-3 rounded-xl shadow-sm text-slate-500 hover:text-blue-600 transition-all"
                    title="Ver etapas"
                  >
                    <SlidersHorizontal size={16}/>
                  </button>
                  <button
                    onClick={() => setActiveTab("roadmap")}
                    className="bg-slate-950 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg hover:bg-blue-600 hover:scale-105 transition-all"
                    title="Voltar"
                  >
                    <ChevronLeft size={18}/>
                  </button>
                </div>
              </div>

              <textarea
                readOnly={!!viewingArchive}
                value={selectedNote
                  ? (viewingArchive ? viewingArchive.allNotes?.[selectedNote] || "" : allNotes[selectedNote] || "")
                  : (viewingArchive ? viewingArchive.notes : notes)}
                onChange={(e) => saveCurrentNote(e.target.value)}
                placeholder={`# ${selectedNote || "Notas Gerais"}\n\nO que você aprendeu hoje?\nComece a documentar aqui...`}
                className="flex-grow w-full p-5 md:p-14 bg-white rounded-2xl md:rounded-[4rem] shadow-lg border-none outline-none font-mono text-sm md:text-xl text-slate-800 leading-relaxed resize-none focus:shadow-blue-100 transition-all min-h-[50vh]"
              />
            </div>

            {/* Backlinks desktop */}
            <div className="hidden xl:flex w-80 bg-white/60 border-l border-slate-100 flex-col p-8 overflow-y-auto">
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2"><LinkIcon size={14}/> Etapas</h3>
              <div className="space-y-3">
                <div onClick={() => setSelectedNote("")} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedNote === "" ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-white text-slate-400 shadow-sm hover:border-slate-100'}`}>
                  <p className="text-[9px] font-black uppercase mb-0.5 opacity-60">Base</p>
                  <p className="text-xs font-bold italic">Notas Gerais</p>
                </div>
                {currentRoadmap.length === 0
                  ? <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic text-center py-6">Nenhuma etapa</p>
                  : currentRoadmap.map((item, i) => (
                    <div key={i} onClick={() => setSelectedNote(item.title)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedNote === item.title ? 'bg-blue-600 text-white border-blue-500' : 'bg-white border-white text-slate-600 shadow-sm hover:border-blue-100'}`}>
                      <p className="text-[9px] font-black uppercase mb-0.5 opacity-60">Etapa {i + 1}</p>
                      <p className="text-xs font-bold uppercase tracking-tighter leading-tight">{item.title}</p>
                      {allNotes[item.title] && <p className="text-[9px] mt-1 opacity-60 italic">✓ Com notas</p>}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── IA DRAWER (mobile) ── */}
      {!viewingArchive && activeTab === 'roadmap' && (
        <>
          {/* Botão flutuante mobile */}
          <button
            onClick={() => setShowIADrawer(true)}
            className="fixed bottom-20 right-4 md:hidden z-[90] bg-blue-600 text-white w-12 h-12 rounded-2xl shadow-2xl shadow-blue-300 flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all"
            title="Alimentar IA"
          >
            <Sparkles size={20}/>
          </button>
          <IADrawer
            open={showIADrawer}
            onClose={() => setShowIADrawer(false)}
            profile={profile}
            pastedText={pastedText}
            setPastedText={setPastedText}
            onSync={handleSyncData}
            onFinish={handleArchiveAndReset}
            syncing={syncing}
            finishing={finishing}
            hasRoadmap={roadmap.length > 0}
          />
        </>
      )}

      {/* ── BACKLINKS DRAWER (mobile) ── */}
      <BacklinksDrawer
        open={showBacklinks}
        onClose={() => setShowBacklinks(false)}
        roadmap={currentRoadmap}
        allNotes={allNotes}
        selectedNote={selectedNote}
        onSelect={setSelectedNote}
      />

      {/* ── ONBOARDING ── */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 md:p-16 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl animate-bounce"><Zap size={32} fill="white"/></div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter uppercase italic leading-none">Novo Alvo.</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-10">Mapeie seu futuro com IA.</p>
            <div className="space-y-3">
              <input id="curRole" placeholder="CARGO ATUAL" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-xs tracking-widest text-center uppercase focus:ring-2 focus:ring-blue-500 transition-all"/>
              <input id="newGoal" placeholder="ALVO FINAL" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-xs tracking-widest text-center uppercase focus:ring-2 focus:ring-blue-500 transition-all"/>
            </div>
            <button
              onClick={async () => {
                const gr = document.getElementById('newGoal').value;
                const cr = document.getElementById('curRole').value;
                if (!gr || !cr) { addToast("Preencha os dois campos!", "error"); return; }
                await updateDoc(doc(db, "users", user.uid), { goal: gr, currentRole: cr, roadmap: [], completedSkills: [], allNotes: {}, notes: "" });
                window.location.reload();
              }}
              className="w-full mt-10 bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
            >
              INICIAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
