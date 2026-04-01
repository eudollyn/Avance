"use client";
import { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { logout } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, CheckCircle2, Trophy, LogOut, Search, 
  Trash2, Layout, BookOpen, ChevronLeft, 
  Save, Sparkles, PencilLine, Link as LinkIcon, Target,
  Award, FolderArchive, Clock, Eye, Briefcase, ExternalLink
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  
  // ESTADOS
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ goal: "", currentRole: "", displayName: "", photoURL: "" });
  const [roadmap, setRoadmap] = useState([]);
  const [completedSkills, setCompletedSkills] = useState([]);
  const [allNotes, setAllNotes] = useState({}); 
  const [notes, setNotes] = useState(""); 
  const [selectedNote, setSelectedNote] = useState(""); 
  const [archives, setArchives] = useState([]); 
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("roadmap"); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Sincronizado");
  const [viewingArchive, setViewingArchive] = useState(null);

  // 1. CARREGAMENTO FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            ...data,
            displayName: currentUser.displayName || "Usuário",
            photoURL: currentUser.photoURL || ""
          });
          setRoadmap(data.roadmap || []);
          setCompletedSkills(data.completedSkills || []);
          setArchives(data.archives || []);
          setAllNotes(data.allNotes || {});
          setNotes(data.notes || "");
          if (!data.goal) setShowOnboarding(true);
        } else {
          setShowOnboarding(true);
        }
        setLoading(false);
      } else { router.push('/login'); }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. PROGRESSO
  const progress = useMemo(() => {
    const r = viewingArchive ? viewingArchive.roadmap : roadmap;
    const c = viewingArchive ? (viewingArchive.completedSkills || []) : completedSkills;
    return r.length > 0 ? Math.round((c.length / r.length) * 100) : 0;
  }, [roadmap, completedSkills, viewingArchive]);

  // 3. AÇÕES
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
    if (!pastedText.trim()) return;
    const lines = pastedText.split('\n');
    let newSkills = [];
    lines.forEach(line => {
        const clean = line.trim();
        if (/^\d+[\.\)]\s/.test(clean)) {
            const rawContent = clean.replace(/^\d+[\.\)]\s/, '');
            const parts = rawContent.split(':');
            newSkills.push({ title: parts[0].trim(), fullDescription: parts[1]?.trim() || parts[0].trim() });
        }
    });
    if (newSkills.length > 0) {
      await updateDoc(doc(db, "users", user.uid), { roadmap: newSkills, completedSkills: [], allNotes: {} });
      setRoadmap(newSkills);
      setCompletedSkills([]);
      setAllNotes({});
      setPastedText("");
    }
  };

  const handleArchiveAndReset = async () => {
    if (confirm("Deseja finalizar e arquivar este projeto como uma vitória?")) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { 
          archives: arrayUnion({ id: Date.now(), goal: profile.goal, date: new Date().toLocaleDateString('pt-BR'), progress, roadmap, allNotes, notes, completedSkills }) 
        });
        await updateDoc(userRef, { goal: "", roadmap: [], completedSkills: [], allNotes: {}, notes: "" });
        window.location.reload();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 font-black text-blue-500 text-2xl italic animate-pulse uppercase tracking-[0.3em]">Avance...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR (DESKTOP) / BOTTOM NAV (MOBILE) */}
      <aside className="fixed bottom-0 left-0 w-full bg-slate-950 text-white flex flex-row justify-around p-4 md:static md:w-80 md:flex-col md:p-10 md:h-screen z-[100] shadow-2xl">
        <Link href="/" className="hidden md:flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Zap size={22} fill="white" /></div>
          <span className="text-2xl font-black tracking-tighter uppercase italic leading-none">Avance</span>
        </Link>
        
        <nav className="flex flex-row md:flex-col gap-2 md:gap-4 w-full md:flex-grow">
          <button onClick={() => { setViewingArchive(null); setActiveTab("roadmap"); }} className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-2 md:gap-4 px-4 py-3 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'roadmap' && !viewingArchive ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
            <Layout size={18} /> <span className="hidden md:block">Jornada</span>
          </button>
          <button onClick={() => setActiveTab("notes")} className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-2 md:gap-4 px-4 py-3 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
            <BookOpen size={18} /> <span className="hidden md:block">Notebook</span>
          </button>
          <button onClick={() => setActiveTab("archives")} className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-2 md:gap-4 px-4 py-3 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'archives' || viewingArchive ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
            <Award size={18} /> <span className="hidden md:block">Vitórias</span>
          </button>
        </nav>

        <div className="hidden md:flex flex-col mt-auto pt-10 border-t border-white/5 space-y-6">
           <div className="px-4 flex items-center gap-3">
              <img src={profile.photoURL} className="w-10 h-10 rounded-full border-2 border-blue-600 shadow-lg" alt="Avatar" />
              <div className="overflow-hidden leading-none">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Operacional</p>
                <p className="text-xs font-bold text-white truncate uppercase italic tracking-tighter">{profile.displayName}</p>
              </div>
           </div>
           <button onClick={() => logout()} className="w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest text-[10px]"><LogOut size={16} /> Encerrar</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow overflow-y-auto h-screen pb-24 md:pb-0 scroll-smooth">
        {viewingArchive && (
          <div className="bg-blue-600 text-white px-8 py-3 flex justify-between items-center sticky top-0 z-[110] font-black uppercase text-[10px] tracking-[0.3em] italic shadow-xl">
             <span className="flex items-center gap-2 truncate mr-4"><Eye size={16}/> Modo Leitura: {viewingArchive.goal}</span>
             <button onClick={() => setViewingArchive(null)} className="bg-white text-blue-600 px-5 py-1.5 rounded-full whitespace-nowrap">Sair</button>
          </div>
        )}

        {activeTab === 'roadmap' ? (
          <div className="p-6 md:p-20 max-w-6xl mx-auto space-y-12 md:space-y-20 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
               <div>
                  <h1 className="text-6xl md:text-[100px] font-black tracking-tighter uppercase italic leading-[0.8] text-slate-950 mb-6">A Rota.</h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-blue-600 font-bold uppercase tracking-widest text-xs italic underline decoration-2 underline-offset-4">Foco: {viewingArchive ? viewingArchive.goal : profile?.goal}</p>
                    {!viewingArchive && profile.goal && <button onClick={() => window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(profile.goal)}`, '_blank')} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"><Briefcase size={12}/> Ver Vagas</button>}
                  </div>
               </div>
               <div className="w-full lg:w-auto bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-2xl border flex items-center justify-between gap-10">
                  <div className="text-right leading-none"><p className="text-[10px] font-black text-slate-300 uppercase mb-2">Readiness</p><p className="text-6xl md:text-8xl font-black text-blue-600 italic tracking-tighter">{progress}%</p></div>
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-blue-600"><Trophy size={48} strokeWidth={2.5} /></div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 pb-24">
               <div className="lg:col-span-8 space-y-10 relative">
                {(viewingArchive ? viewingArchive.roadmap : roadmap).map((item, index) => {
                    const isDone = viewingArchive ? (viewingArchive.completedSkills?.includes(item.title)) : completedSkills.includes(item.title);
                    return (
                        <div key={index} className={`relative flex items-start gap-4 md:gap-10 transition-all duration-700 ${isDone && !viewingArchive ? 'opacity-30 grayscale scale-[0.98]' : 'hover:-translate-y-2'}`}>
                          <div onClick={() => !viewingArchive && toggleSkill(item.title)} className={`w-12 h-12 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] flex-shrink-0 flex items-center justify-center font-black cursor-pointer shadow-xl z-10 transition-all ${isDone ? 'bg-green-500 text-white' : 'bg-blue-600 text-white shadow-blue-200'}`}>
                            {isDone ? <CheckCircle2 size={32} /> : <span className="text-xl md:text-3xl italic">{index + 1}</span>}
                          </div>
                          <div className="flex-grow bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl">
                            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-950 mb-4 uppercase italic leading-none">{item.title}</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10 italic">{item.fullDescription}</p>
                            <div className="flex flex-wrap gap-3">
                               <button onClick={() => window.open(`https://www.youtube.com/results?search_query=curso+completo+${encodeURIComponent(item.fullDescription)}`, '_blank')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase flex items-center gap-2"><Search size={14}/> Tutorial</button>
                               <button onClick={() => { setSelectedNote(item.title); setActiveTab("notes"); }} className="text-[10px] font-black text-slate-400 bg-slate-50 px-6 py-3 rounded-2xl hover:bg-slate-900 hover:text-white transition-all uppercase flex items-center gap-2"><PencilLine size={14}/> Notas</button>
                               {!viewingArchive && <button onClick={() => toggleSkill(item.title)} className={`text-[10px] font-black px-6 py-3 rounded-2xl uppercase ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white shadow-lg shadow-blue-900/40'}`}>{isDone ? "OK" : "Concluir"}</button>}
                            </div>
                          </div>
                        </div>
                    )
                })}
              </div>
              {!viewingArchive && (
                 <div className="lg:col-span-4">
                    <div className="bg-slate-900 p-10 md:p-12 rounded-[3.5rem] md:rounded-[4rem] text-white shadow-2xl border border-white/5 sticky top-12">
                       <h3 className="font-black text-xl uppercase mb-10 text-blue-500 italic flex items-center gap-3"><Sparkles size={24}/> Alimentar IA</h3>
                       <button onClick={() => window.open(`https://chatgpt.com/?q=${encodeURIComponent('Mentor: Sou ' + profile?.currentRole + ' e quero ser ' + profile?.goal + '. Gere apenas uma lista numerada de 5 etapas técnicas. Formato Título: Descrição.')}`, '_blank')} className="w-full bg-blue-600 py-6 rounded-3xl font-black text-xs uppercase mb-8 shadow-xl">1. Abrir GPT</button>
                       <textarea value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Cole aqui..." className="w-full h-40 p-6 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-mono outline-none focus:border-blue-500 mb-8 resize-none" />
                       <button onClick={handleSyncData} className="w-full bg-white text-slate-950 py-6 rounded-3xl font-black text-xs uppercase">2. Sincronizar Mapa</button>
                       <button onClick={handleArchiveAndReset} className="w-full mt-12 text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest flex items-center justify-center gap-2"><Trash2 size={16}/> Finalizar Projeto</button>
                    </div>
                 </div>
              )}
            </div>
          </div>
        ) : activeTab === 'archives' ? (
          <div className="p-8 md:p-20 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
             <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic text-slate-950 leading-[0.8]">Vitórias.</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {archives.map((v, i) => (
                   <div key={i} className="bg-white p-10 rounded-[4rem] shadow-2xl border border-white hover:border-blue-200 transition-all group">
                      <div className="flex justify-between items-start mb-8"><Award className="text-blue-600" size={40} /><div className="text-[10px] font-black text-slate-300 uppercase italic flex items-center gap-2"><Clock size={12}/> {v.date}</div></div>
                      <h3 className="text-4xl font-black tracking-tighter text-slate-900 mb-8 uppercase italic leading-none">{v.goal}</h3>
                      <button onClick={() => openArchive(v)} className="w-full bg-slate-950 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl">Revisar Conhecimento <ExternalLink size={16}/></button>
                   </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col lg:flex-row animate-in slide-in-from-right duration-700 overflow-hidden">
             <div className="flex-grow p-6 md:p-20 flex flex-col max-w-5xl mx-auto w-full">
                <div className="mb-12 flex justify-between items-end">
                   <div>
                      <h1 className="text-6xl md:text-[120px] font-black text-slate-950 tracking-tighter uppercase italic leading-[0.7] mb-8">Note.</h1>
                      <div className="flex flex-wrap items-center gap-4">
                         {!viewingArchive && <span className="flex items-center gap-2 bg-white px-5 py-2 rounded-full text-[10px] font-black text-blue-600 uppercase border shadow-sm italic"><Save size={12}/> {saveStatus}</span>}
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic truncate max-w-[150px] md:max-w-none">Etapa: {selectedNote || "Global"}</span>
                      </div>
                   </div>
                   <button onClick={() => setActiveTab("roadmap")} className="bg-slate-950 text-white p-5 rounded-[2rem] shadow-xl hover:bg-blue-600 hover:scale-110 transition-all"><ChevronLeft size={24}/></button>
                </div>
                <textarea readOnly={!!viewingArchive} value={selectedNote ? (viewingArchive ? viewingArchive.allNotes[selectedNote] : allNotes[selectedNote] || "") : (viewingArchive ? viewingArchive.notes : notes)} onChange={(e) => saveCurrentNote(e.target.value)} placeholder="# Comece sua documentação..." className="w-full h-[60vh] md:h-full p-10 md:p-20 bg-white rounded-[3rem] md:rounded-[5rem] shadow-2xl border-none outline-none font-mono text-lg md:text-2xl text-slate-800 leading-relaxed resize-none focus:shadow-blue-100 transition-all" />
             </div>
             {/* BACKLINKS DESKTOP */}
             <div className="hidden xl:flex w-[400px] bg-white/50 border-l border-slate-100 flex-col p-12 overflow-y-auto">
                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-10 flex items-center gap-3"><LinkIcon size={16}/> Backlinks / Etapas</h3>
                <div className="space-y-4">
                   <div onClick={() => setSelectedNote("")} className={`p-8 rounded-[2.5rem] cursor-pointer transition-all border-4 ${selectedNote === "" ? 'bg-slate-900 text-white shadow-xl border-slate-800 scale-105' : 'bg-white border-white text-slate-400 shadow-sm hover:border-slate-100'}`}><p className="text-[10px] font-black uppercase mb-1 opacity-60">Base</p><p className="text-sm font-bold italic leading-tight">Notas Gerais</p></div>
                   {(viewingArchive ? viewingArchive.roadmap : roadmap).map((item, i) => (
                      <div key={i} onClick={() => setSelectedNote(item.title)} className={`p-8 rounded-[2.5rem] cursor-pointer transition-all border-4 ${selectedNote === item.title ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 border-blue-500 scale-105' : 'bg-white border-white text-slate-600 shadow-sm hover:border-blue-100'}`}><p className="text-[10px] font-black uppercase mb-1 opacity-60">Pág. {i + 1}</p><p className="text-sm font-bold leading-tight uppercase tracking-tighter">{item.title}</p></div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* ONBOARDING */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[4rem] p-16 shadow-2xl text-center border border-white/20">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-10 shadow-xl animate-bounce"><Zap size={40} fill="white" /></div>
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic leading-none">Novo Alvo.</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mb-12">Mapeie seu futuro com IA.</p>
            <div className="space-y-4">
                <input id="curRole" placeholder="CARGO ATUAL" className="w-full p-8 bg-slate-50 rounded-3xl outline-none font-black text-xs tracking-widest text-center uppercase" />
                <input id="newGoal" placeholder="ALVO FINAL" className="w-full p-8 bg-slate-50 rounded-3xl outline-none font-black text-xs tracking-widest text-center uppercase" />
            </div>
            <button onClick={async () => {
                const gr = document.getElementById('newGoal').value;
                const cr = document.getElementById('curRole').value;
                if(!gr || !cr) return alert("Preencha tudo!");
                await updateDoc(doc(db, "users", user.uid), { goal: gr, currentRole: cr, roadmap: [], completedSkills: [], allNotes: {}, notes: "" });
                window.location.reload();
              }} className="w-full mt-12 bg-blue-600 text-white py-8 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">INICIAR MAPEAMENTO</button>
          </div>
        </div>
      )}
    </div>
  );
}