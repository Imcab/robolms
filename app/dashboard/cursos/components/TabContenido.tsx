"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { ChevronDown, ChevronUp, ClipboardList, GraduationCap, X, Trophy } from "lucide-react";

export default function TabContenido({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [previewTask, setPreviewTask] = useState<any | null>(null);
  const [currentGrade, setCurrentGrade] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Estructura y Tareas
      const { data: mods } = await supabase.from('modules').select('*, tasks(*)').eq('course_id', courseId).order('created_at', { ascending: true });
      if (mods) setModules(mods);

      // 2. Calificación (Para el widget superior)
      const { data: { session } } = await supabase.auth.getSession();
      const { data: structure } = await supabase
        .from('modules').select('weight_percentage, tasks(weight_percentage, submissions(score))')
        .eq('course_id', courseId).eq('tasks.submissions.student_id', session?.user.id);

      let total = 0;
      structure?.forEach(m => {
        m.tasks.forEach((t: any) => {
          total += (t.submissions?.[0]?.score || 0) * ((t.weight_percentage || 0) / 100) * ((m.weight_percentage || 0) / 100);
        });
      });
      setCurrentGrade(Number(total.toFixed(1)));
    };
    fetchData();
  }, [courseId, previewTask]);

  return (
    <div className="space-y-6">
      
      {/* WIDGET SUPERIOR DE NOTA */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Trophy size={20} /></div>
          <div>
            <h3 className="font-bold text-gray-900">Tu rendimiento actual</h3>
            <p className="text-xs text-gray-500">Basado en las actividades calificadas hasta hoy.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-gray-900">{currentGrade}</span>
          <span className="text-gray-400 font-bold ml-1">/ 100</span>
        </div>
      </div>

      {/* LISTA DE MÓDULOS */}
      <div className="space-y-4">
        {modules.map(mod => (
          <div key={mod.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))} className="flex items-center justify-between p-5 bg-gray-50 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                {expandedModules[mod.id] ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                <h3 className="font-bold text-gray-900">{mod.name}</h3>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                Módulo: {mod.weight_percentage}% del curso
              </span>
            </div>

            {expandedModules[mod.id] && (
              <div className="p-3 bg-white space-y-2">
                {mod.tasks.map((task: any) => (
                  <div key={task.id} onClick={() => setPreviewTask(task)} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-all border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-4">
                      {task.is_graded ? <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ClipboardList size={20} /></div> : <div className="p-2 bg-gray-100 text-gray-500 rounded-lg"><GraduationCap size={20} /></div>}
                      <div>
                        <p className="text-sm font-bold text-gray-900">{task.title}</p>
                        {task.is_graded && task.due_date && <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Cierre: {new Date(task.due_date).toLocaleString('es-MX')}</p>}
                      </div>
                    </div>
                    {/* INDICADOR DE PESO RELATIVO AL MÓDULO */}
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${task.is_graded ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-500'}`}>
                      {task.is_graded ? `${task.weight_percentage}% del módulo` : 'Lectura'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL INMERSIVO (Igual al anterior, solo quitamos estilos agresivos) */}
      {previewTask && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-2 backdrop-blur-md">
          <div className="bg-white w-[98vw] h-[98vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{previewTask.title}</h2>
              <button onClick={() => setPreviewTask(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={24}/></button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white border-2 border-dashed border-gray-300 p-10 min-h-full shadow-sm rounded-xl">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{previewTask.title}</h2>
                  <p className="text-sm font-semibold text-gray-500 mb-8 pb-4 border-b border-gray-100 uppercase tracking-wide">
                    {previewTask.is_graded ? `Evaluación: ${previewTask.weight_percentage}%` : 'Material de lectura'} 
                  </p>
                  <div className="ql-snow">
                    <div className="ql-editor !p-0 text-gray-900 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: previewTask.description || '<p>Sin descripción.</p>' }} />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
                <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Información</p>
                  <p className="text-lg font-bold text-gray-900">{previewTask.is_graded ? `${previewTask.weight_percentage}% del módulo` : 'Solo lectura'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}