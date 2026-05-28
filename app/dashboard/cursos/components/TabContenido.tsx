"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { ChevronDown, ChevronUp, ClipboardList, GraduationCap, X, Trophy } from "lucide-react";


import "react-quill-new/dist/quill.snow.css";

export default function TabContenido({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [previewTask, setPreviewTask] = useState<any | null>(null);
  const [currentGrade, setCurrentGrade] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: mods } = await supabase.from('modules').select('*, tasks(*)').eq('course_id', courseId).order('created_at', { ascending: true });
      if (mods) setModules(mods);

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
    <div className="space-y-6 max-w-5xl">
      
      {/* WIDGET SUPERIOR DE NOTA */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded"><Trophy size={20} /></div>
          <div>
            <h3 className="font-bold text-gray-900">Tu rendimiento actual</h3>
            <p className="text-xs text-gray-500">Basado en las actividades calificadas hasta hoy.</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-gray-900">{currentGrade}</span>
          <span className="text-xs font-semibold text-gray-500 mt-1">/ 100</span>
        </div>
      </div>

      {/* LISTA DE MÓDULOS */}
      {modules.map(mod => (
        <div key={mod.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
          <div onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))} className="flex items-center justify-between p-5 bg-gray-50 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition-colors">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
              {expandedModules[mod.id] ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              {mod.name}
            </h3>
            <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">
              Módulo: {mod.weight_percentage}% del curso
            </span>
          </div>

          {expandedModules[mod.id] && (
            <div className="p-3 bg-white space-y-2">
              {mod.tasks.map((task: any) => (
                <div key={task.id} onClick={() => setPreviewTask(task)} className="flex items-center justify-between p-3 border border-gray-100 rounded-md cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    {task.is_graded ? <div className="p-2 bg-red-50 text-red-600 rounded"><ClipboardList size={20} /></div> : <div className="p-2 bg-gray-100 text-gray-500 rounded"><GraduationCap size={20} /></div>}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{task.title}</p>
                      {task.is_graded && task.due_date && <p className="text-xs text-gray-500 mt-1 font-semibold">Cierre: {new Date(task.due_date).toLocaleString('es-MX')}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1.5 rounded ${task.is_graded ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {task.is_graded ? `${task.weight_percentage}% del módulo` : 'Material de apoyo'}
                  </span>
                </div>
              ))}
              {mod.tasks.length === 0 && <p className="text-sm text-gray-400 italic p-4 text-center">No hay contenido en este módulo.</p>}
            </div>
          )}
        </div>
      ))}

      {/* MODAL INMERSIVO CALCADO AL 100% DEL TABPLAN */}
      {previewTask && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-2 backdrop-blur-md">
          <div className="bg-white w-[98vw] h-[98vh] rounded shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{previewTask.title}</h2>
              <button onClick={() => setPreviewTask(null)} className="p-2 hover:bg-gray-200 rounded text-gray-500 transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white border-2 border-dashed border-gray-400 p-10 min-h-full shadow-sm rounded">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{previewTask.title}</h2>
                  <p className="text-sm font-semibold text-gray-500 mb-8 pb-4 border-b border-gray-200">
                    {previewTask.is_graded ? `Evaluación: ${previewTask.weight_percentage}%` : 'Material de lectura'} 
                    {previewTask.is_graded && previewTask.due_date && ` • Cierre: ${new Date(previewTask.due_date).toLocaleString('es-MX')}`}
                  </p>
                  <div className="ql-snow">
                    <div className="ql-editor !p-0 text-gray-900 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: previewTask.description || '<p>No hay descripción detallada.</p>' }} />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
                {!previewTask.is_graded && (
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center mt-4">
                    <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="font-bold text-gray-900 text-lg">Material de apoyo</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Este documento es únicamente de referencia. No requiere entrega ni calificación.</p>
                  </div>
                )}

                {previewTask.is_graded && (
                  <>
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Ponderación</p>
                      <p className="text-lg font-bold text-gray-900">{previewTask.weight_percentage}% del módulo</p>
                    </div>

                    {previewTask.due_date && (
                      <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50 rounded">
                        <p className="text-sm font-bold text-red-900 mb-1">Fecha límite</p>
                        <p className="text-sm text-red-700">{new Date(previewTask.due_date).toLocaleString('es-MX')}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}