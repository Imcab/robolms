"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../../lib/supabase";
import { Trash2, Edit2 } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function TabTareas({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ module_id: "", title: "", description: "", is_graded: true, weight_percentage: 0, due_date: "" });

  const fetchData = async () => {
    const { data: mData } = await supabase.from('modules').select('*').eq('course_id', courseId);
    if (mData) setModules(mData);
    
    // Traemos tareas uniendo módulos para filtrar por curso
    const { data: tData } = await supabase.from('tasks').select('*, modules!inner(course_id, name)').eq('modules.course_id', courseId);
    if (tData) setTasks(tData);
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.module_id) return alert("Seleccione módulo");

    const finalDate = form.is_graded && form.due_date ? new Date(form.due_date).toISOString() : null;
    const taskData = { ...form, weight_percentage: form.is_graded ? Number(form.weight_percentage) : 0, due_date: finalDate };

    if (editingId) {
      await supabase.from('tasks').update(taskData).eq('id', editingId);
    } else {
      await supabase.from('tasks').insert([taskData]);
    }
    
    setForm({ module_id: "", title: "", description: "", is_graded: true, weight_percentage: 0, due_date: "" });
    setEditingId(null);
    fetchData();
    alert("Contenido guardado exitosamente.");
  };

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    setForm({
      module_id: task.module_id, title: task.title, description: task.description || "",
      is_graded: task.is_graded, weight_percentage: task.weight_percentage,
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ""
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Borrar tarea?")) { await supabase.from('tasks').delete().eq('id', id); fetchData(); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-full">
      <form onSubmit={handleSave} className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">{editingId ? "Editar Tarea" : "Nueva Tarea"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">MÓDULO</label>
            <select required value={form.module_id} onChange={e => setForm({...form, module_id: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white">
              <option value="">-- Seleccionar --</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">TÍTULO</label>
            <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900" />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-600 mb-2">INSTRUCCIONES Y RECURSOS</label>
          <div className="bg-white text-gray-900">
             <ReactQuill theme="snow" value={form.description} onChange={val => setForm({...form, description: val})} className="h-64 mb-12" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-200 rounded space-y-4 mt-8">
          <label className="flex items-center gap-2 cursor-pointer border-b border-gray-200 pb-3">
            <input type="checkbox" checked={!form.is_graded} onChange={e => setForm({...form, is_graded: !e.target.checked})} className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-gray-900">Material de apoyo (Sin evaluación ni fecha límite)</span>
          </label>
          {form.is_graded && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">PESO (%)</label>
                <input type="number" required min="1" max="100" value={form.weight_percentage} onChange={e => setForm({...form, weight_percentage: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">FECHA LÍMITE (Cierre)</label>
                <input type="datetime-local" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900" />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <button type="submit" className="bg-red-600 text-white font-bold py-2.5 px-6 rounded text-sm uppercase">{editingId ? "Actualizar" : "Publicar"}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setForm({ module_id: "", title: "", description: "", is_graded: true, weight_percentage: 0, due_date: "" })}} className="bg-gray-200 text-gray-800 font-bold py-2.5 px-6 rounded text-sm uppercase">Cancelar</button>}
        </div>
      </form>

      {/* Lista de Tareas para Modificar/Borrar */}
      <div className="bg-white p-6 rounded border border-gray-200 shadow-sm overflow-y-auto max-h-[800px]">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Gestión de Tareas</h2>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="p-4 border border-gray-100 rounded bg-gray-50 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">{task.modules.name}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{task.title}</p>
                {task.is_graded && task.due_date && <p className="text-[10px] text-red-600 mt-1">Cierre: {new Date(task.due_date).toLocaleString()}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(task)} className="p-2 text-gray-500 hover:text-blue-600 bg-white rounded shadow-sm border border-gray-200"><Edit2 size={14}/></button>
                <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-500 hover:text-red-600 bg-white rounded shadow-sm border border-gray-200"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}