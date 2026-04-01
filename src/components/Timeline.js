export default function Timeline({ milestones }) {
  if (!milestones || milestones.length === 0) {
    return <div className="text-slate-400 italic">Cole sua primeira análise para gerar sua linha do tempo...</div>;
  }

  return (
    <div className="relative">
      {/* Linha Vertical Central */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-100 lg:left-1/2 lg:-ml-px"></div>

      <div className="space-y-12">
        {milestones.map((skill, index) => (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            {/* Círculo da Milestone */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-md z-10 absolute left-0 lg:left-1/2 lg:-ml-4 transition-transform group-hover:scale-125">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Conteúdo do Card */}
            <div className="w-[calc(100%-3rem)] ml-12 lg:ml-0 lg:w-[45%] bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Fase {index + 1}</span>
              <h3 className="text-lg font-bold text-slate-800 mt-1">{skill}</h3>
              <p className="text-sm text-slate-500 mt-2 italic">Aguardando confirmação de aprendizado...</p>
              
              <div className="mt-4 flex gap-2">
                <button className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-green-100 hover:text-green-700 transition-colors">Marcar como Feito</button>
                <button className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors">Ver Mentorias</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}