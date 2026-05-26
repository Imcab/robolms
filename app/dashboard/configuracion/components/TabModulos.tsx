"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { Trash2 } from "lucide-react";

export default function TabModulos({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<any[]>([]);
  const [modName, setModName] = useState("");
  const [modWeight, setModWeight] = useState<number | "">("");
  const [isNA, setIsNA] = useState(false);

  const fetchModules = async () => {
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });
    if (data) setModules(data);
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const totalCourseWeight = useMemo(() => modules.reduce((acc, m) => acc + (m.weight_percentage || 0), 0), [modules]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightToApply = isNA ? null : Number(modWeight);
    
    if (!isNA && (totalCourseWeight + (weightToApply || 0)) > 100) {
      return alert("Error: El plan de evaluación excedería el 100%.");
    }

    const { error } = await supabase.from('modules').insert([{
      course_id: courseId,
      name: modName,
      weight_percentage: weightToApply
    }]);

    if (!error) {
      setModName("");
      setModWeight("");
      setIsNA(false);
      fetchModules();
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm("¿Eliminar este módulo de forma permanente? Se perderán las tareas asociadas.")) {
      await supabase.from('modules').delete().eq('id', id);
      fetchModules();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
      <form onSubmit={handleAddModule} className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4 h-fit">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Registrar Módulo</h2>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">NOMBRE DEL MÓDULO</label>
          <input type="text" required value={modName} onChange={e => setModName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-red-600" />
        </div>
        <div className="bg-gray-50 p-4 border border-gray-200 rounded space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isNA} onChange={e => setIsNA(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
            <span className="text-sm font-bold text-gray-900">Módulo Informativo (N/A)</span>
          </label>
          {!isNA && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">PONDERACIÓN GLOBAL (%)</label>
              <input type="number" required min="1" max={100 - totalCourseWeight} value={modWeight} onChange={e => setModWeight(Number(e.target.value))} placeholder={`Máximo disponible: ${100 - totalCourseWeight}%`} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-red-600" />
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2.5 rounded text-sm hover:bg-gray-800 uppercase tracking-wide transition-colors">Guardar Módulo</button>
      </form>
      
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Módulos Existentes</h2>
        {modules.length === 0 ? (
           <p className="text-xs text-gray-400 italic">No hay módulos configurados.</p>
        ) : (
          modules.map(mod => (
            <div key={mod.id} className="bg-white p-4 border border-gray-200 rounded shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{mod.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ponderación: {mod.weight_percentage !== null ? `${mod.weight_percentage}%` : 'N/A'}</p>
              </div>
              <button onClick={() => handleDeleteModule(mod.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded transition-colors" title="Eliminar Módulo">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}