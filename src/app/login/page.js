"use client";
import { loginWithGoogle } from "../../lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        router.push("/dashboard"); // Se logar, vai pro painel
      }
    } catch (error) {
      console.error("Erro ao logar:", error);
      alert("Erro ao conectar com o Google. Verifique seu Firebase.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full p-12 bg-white rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <div className="flex justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-200">A</div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase self-center">AVANCE</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">Prepare seu próximo salto.</h2>
        <p className="text-slate-500 mb-10 font-medium">Faça login para salvar seus roadmaps e acompanhar sua evolução.</p>
        
        <button 
          onClick={handleLogin}
          className="flex items-center justify-center gap-4 w-full bg-white border-2 border-slate-100 py-4 rounded-2xl font-black text-slate-700 hover:bg-slate-50 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          Entrar com Google
        </button>
        
        <p className="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Inteligência Artificial & Carreira
        </p>
      </div>
    </div>
  );
}