"use client";
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Target, Cpu, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => { if (user) setIsLogged(true); });
  }, []);

  const handleStart = () => router.push(isLogged ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-200">A</div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Avance</span>
        </div>
        <button onClick={handleStart} className="bg-slate-950 text-white px-8 py-2.5 rounded-full text-[10px] font-black hover:bg-blue-600 transition-all uppercase tracking-widest">
            {isLogged ? "Ir para Dashboard" : "Entrar Agora"}
        </button>
      </nav>

      <header className="pt-48 pb-20 px-6 text-center relative">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-blue-100 italic animate-pulse">
            <Sparkles size={14} fill="currentColor" /> IA de Carreira v1.0
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-10 text-slate-900">
            Sua carreira não <br /> deve ser um <span className="text-blue-600 italic underline decoration-blue-100 underline-offset-8">palpite.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
            O Avance utiliza IA para mapear habilidades exatas e constrói seu segundo cérebro focado em evolução profissional.
          </p>
          <button onClick={handleStart} className="group bg-blue-600 text-white px-14 py-7 rounded-[3rem] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center gap-4 uppercase tracking-tighter active:scale-95 mb-24">
            {isLogged ? "Continuar Minha Rota" : "Traçar Rota com IA"}
            <ArrowRight size={24} />
          </button>

          <div className="relative w-full max-w-5xl group">
             <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-400 rounded-[4rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
             <div className="relative bg-slate-950 p-3 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                  className="w-full rounded-[3.5rem] opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                  alt="Avance Dashboard" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
             </div>
          </div>
        </div>
      </header>

      <section className="py-32 bg-slate-50 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-white">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8"><Target size={28} strokeWidth={3} /></div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">Nodos de Estudo</h3>
                <p className="text-slate-500 font-medium leading-relaxed italic">Visualize o conhecimento como uma rede conectada, não apenas uma lista.</p>
            </div>
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-white">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8"><Cpu size={28} /></div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">Mapeamento IA</h3>
                <p className="text-slate-500 font-medium leading-relaxed italic">Ponte direta com o GPT-4 para filtrar o ruído e focar no que te emprega.</p>
            </div>
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-white">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8"><TrendingUp size={28} /></div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">Readiness Score</h3>
                <p className="text-slate-500 font-medium leading-relaxed italic">Saiba exatamente quando seu perfil está maduro para os grandes players.</p>
            </div>
        </div>
      </section>

      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-24">
          <div className="flex-1 text-left">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic mb-8 leading-[0.9]">A ponte perfeita entre <br /><span className="text-blue-600 underline">você e o ChatGPT.</span></h2>
            <div className="space-y-8 font-bold text-slate-600 mt-12 text-lg">
               <div className="flex items-center gap-4"><CheckCircle2 className="text-blue-600" size={24}/> <p>Prompts de elite baseados no seu momento.</p></div>
               <div className="flex items-center gap-4"><CheckCircle2 className="text-blue-600" size={24}/> <p>Transformamos texto em roadmaps visuais.</p></div>
               <div className="flex items-center gap-4"><CheckCircle2 className="text-blue-600" size={24}/> <p>Notebook Obsidian para salvar seu conhecimento.</p></div>
            </div>
          </div>
          <div className="flex-1 bg-slate-950 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black italic">01</div> <p className="font-bold text-xl uppercase italic">IA Analisa seu Perfil</p></div>
                <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black italic">02</div> <p className="font-bold text-xl uppercase italic">GPT Traça a Rota</p></div>
                <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black italic">03</div> <p className="font-bold text-xl uppercase italic">Você Avance.</p></div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}