"use client";
import { useState, useEffect, useMemo } from "react";
import { ClipboardList, GraduationCap, X, ChevronDown, ChevronUp, Link as LinkIcon, ExternalLink, Rocket } from "lucide-react";
import { supabase } from "../../../lib/supabase"; 
import { SiGoogledrive, SiGithub } from "react-icons/si";

export default function TabPlan({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [previewTask, setPreviewTask] = useState<any | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      const { data: modsData } = await supabase.from('modules').select('*, tasks(*)').eq('course_id', courseId).order('created_at', { ascending: true });
      if (modsData) setModules(modsData);
    };
    fetchCourseData();
  }, [courseId, previewTask]); 

  const totalCourseWeight = useMemo(() => modules.reduce((acc, m) => acc + (m.weight_percentage || 0), 0), [modules]);

  const renderIcon = (task: any) => {
    const iconSize = 20; 
    if (task.link_url) {
      if (task.link_url.includes('github.com')) return <div className="p-2 bg-gray-900 text-white rounded-lg shadow-sm"><SiGithub size={iconSize} /></div>;
      if (task.link_url.includes('drive.google.com')) return <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shadow-sm border border-yellow-100"><SiGoogledrive size={iconSize} /></div>;
      return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-100"><LinkIcon size={iconSize} /></div>;
    }
    if (task.is_exam) return <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shadow-sm border border-purple-100"><Rocket size={iconSize} /></div>;
    if (task.is_graded) return <div className="p-2 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-100"><ClipboardList size={iconSize} /></div>;
    return <div className="p-2 bg-gray-100 text-gray-500 rounded-lg shadow-sm border border-gray-200"><GraduationCap size={iconSize} /></div>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Ponderación global del curso</h2>
          <p className="text-sm text-gray-500 mt-1">El valor total debe sumar exactamente 100%.</p>
        </div>
        <div className="text-right">
          <span className={`text-4xl font-bold ${totalCourseWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalCourseWeight}%</span>
          <p className="text-xs font-semibold text-gray-500 mt-1">/ 100% Asignado</p>
        </div>
      </div>
      
      {modules.map(mod => (
        <div key={mod.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
            <div onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))} className="flex items-center justify-between p-5 bg-gray-50 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                {expandedModules[mod.id] ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>} 
                {mod.name}
              </h3>
              <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                {mod.weight_percentage !== null ? `${mod.weight_percentage}%` : 'N/A'}
              </span>
            </div>
            
            {expandedModules[mod.id] && (
              <div className="p-3 bg-white space-y-2">
                {mod.tasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      if (task.link_url) window.open(task.link_url, '_blank');
                      else if (!task.is_exam) setPreviewTask(task);
                    }} 
                    className={`flex items-center justify-between p-3 border border-gray-100 rounded-lg transition-all group ${
                      task.is_exam ? 'opacity-90' : 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {renderIcon(task)}
                      <div>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {task.title}
                          {task.link_url && <ExternalLink size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </p>
                        {(task.is_graded || task.is_exam) && task.due_date && (
                          <p className="text-xs text-gray-500 mt-1 font-semibold">
                            Fecha programada: {new Date(task.due_date).toLocaleString('es-MX')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                      task.link_url ? 'bg-blue-50 border border-blue-100 text-blue-700' : 
                      task.is_exam ? 'bg-purple-50 border border-purple-100 text-purple-700' : 
                      task.is_graded ? 'bg-red-50 border border-red-100 text-red-700' : 
                      'bg-gray-100 border border-gray-200 text-gray-600'
                    }`}>
                      {
                        task.link_url ? 'Enlace Externo' : 
                        task.is_exam ? `Examen: ${task.weight_percentage}%` : 
                        task.is_graded ? `Práctica: ${task.weight_percentage}%` : 
                        'Material de apoyo'
                      }
                    </span>
                  </div>
                ))}
                {mod.tasks.length === 0 && <p className="text-sm text-gray-400 italic p-4 text-center">No hay contenido en este módulo.</p>}
              </div>
            )}
        </div>
      ))}

      {/* MODAL INMERSIVO DE TAREAS */}
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
                    <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                      <p className="text-sm font-bold text-blue-900 mb-1">Gestión de notas</p>
                      <p className="text-sm text-blue-700">La asignación de calificaciones se ha movido al panel dedicado de <strong>"Calificaciones"</strong> en el menú superior.</p>
                    </div>
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