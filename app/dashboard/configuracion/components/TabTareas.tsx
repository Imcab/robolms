"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../../lib/supabase";
import { Trash2, Edit2, ClipboardList, GraduationCap, Link as LinkIcon, Rocket } from "lucide-react";
import { SiGoogledrive, SiGithub } from "react-icons/si";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function TabTareas({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [taskType, setTaskType] = useState<"graded" | "material" | "link" | "exam">("graded");
  
  const [form, setForm] = useState({ 
    module_id: "", title: "", description: "", 
    weight_percentage: 0, due_date: "", link_url: "" 
  });

  const fetchData = async () => {
    const { data: mData } = await supabase.from('modules').select('*').eq('course_id', courseId);
    if (mData) setModules(mData);
    
    const { data: tData } = await supabase.from('tasks').select('*, modules!inner(course_id, name)').eq('modules.course_id', courseId);
    if (tData) setTasks(tData);
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.module_id) return alert("Seleccione módulo");

    const requiresDate = taskType === "graded" || taskType === "exam";
    const finalDate = requiresDate && form.due_date ? new Date(form.due_date).toISOString() : null;
    
    const taskData = { 
      module_id: form.module_id,
      title: form.title,
      description: (taskType === "link" || taskType === "exam") ? null : form.description,
      is_graded: taskType === "graded" || taskType === "exam", // Los exámenes también se califican
      is_exam: taskType === "exam",
      weight_percentage: requiresDate ? Number(form.weight_percentage) : 0,
      due_date: finalDate,
      link_url: taskType === "link" ? form.link_url : null
    };

    if (editingId) {
      await supabase.from('tasks').update(taskData).eq('id', editingId);
    } else {
      await supabase.from('tasks').insert([taskData]);
    }
    
    resetForm();
    fetchData();
    alert("Contenido guardado exitosamente.");
  };

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    setTaskType(task.link_url ? "link" : task.is_exam ? "exam" : task.is_graded ? "graded" : "material");
    setForm({
      module_id: task.module_id, 
      title: task.title, 
      description: task.description || "",
      weight_percentage: task.weight_percentage || 0,
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : "",
      link_url: task.link_url || ""
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Borrar elemento?")) { await supabase.from('tasks').delete().eq('id', id); fetchData(); }
  };

  const resetForm = () => {
    setEditingId(null);
    setTaskType("graded");
    setForm({ module_id: "", title: "", description: "", weight_percentage: 0, due_date: "", link_url: "" });
  };

  const renderIcon = (task: any) => {
    const iconSize = 16; 
    if (task.link_url) {
      if (task.link_url.includes('github.com')) return <div className="p-1.5 bg-gray-900 text-white rounded"><SiGithub size={iconSize} /></div>;
      if (task.link_url.includes('drive.google.com')) return <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded"><SiGoogledrive size={iconSize} /></div>;
      return <div className="p-1.5 bg-blue-50 text-blue-600 rounded"><LinkIcon size={iconSize} /></div>;
    }
    if (task.is_exam) return <div className="p-1.5 bg-purple-50 text-purple-600 rounded"><Rocket size={iconSize} /></div>;
    if (task.is_graded) return <div className="p-1.5 bg-red-50 text-red-600 rounded"><ClipboardList size={iconSize} /></div>;
    return <div className="p-1.5 bg-gray-100 text-gray-500 rounded"><GraduationCap size={iconSize} /></div>;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-full">
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">{editingId ? "Editar Contenido" : "Nuevo Contenido"}</h2>
        
        {/* SELECTOR DE TIPO DE CONTENIDO AMPLIADO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <button type="button" onClick={() => setTaskType("graded")} className={`py-2 px-2 rounded-md text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${taskType === 'graded' ? 'bg-white shadow-sm ring-1 ring-gray-200 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <ClipboardList size={18}/> Práctica
          </button>
          <button type="button" onClick={() => setTaskType("exam")} className={`py-2 px-2 rounded-md text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${taskType === 'exam' ? 'bg-white shadow-sm ring-1 ring-gray-200 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Rocket size={18}/> Examen
          </button>
          <button type="button" onClick={() => setTaskType("material")} className={`py-2 px-2 rounded-md text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${taskType === 'material' ? 'bg-white shadow-sm ring-1 ring-gray-200 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            <GraduationCap size={18}/> Material
          </button>
          <button type="button" onClick={() => setTaskType("link")} className={`py-2 px-2 rounded-md text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${taskType === 'link' ? 'bg-white shadow-sm ring-1 ring-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <LinkIcon size={18}/> Enlace
          </button>
        </div>

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

        {/* RENDERIZADO CONDICIONAL DEL CUERPO */}
        {taskType === "link" && (
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <label className="block text-xs font-bold text-blue-800 mb-2">URL DEL ENLACE EXTERNO</label>
            <div className="flex items-center gap-3">
              <LinkIcon size={20} className="text-blue-400" />
              <input type="url" required placeholder="https://..." value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} className="w-full p-2.5 border border-blue-200 rounded text-sm text-gray-900 shadow-sm" />
            </div>
          </div>
        )}
        
        {/* Editor de texto oculto para Enlaces y Exámenes */}
        {(taskType === "graded" || taskType === "material") && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-600 mb-2">INSTRUCCIONES Y RECURSOS</label>
            <div className="bg-white text-gray-900">
               <ReactQuill theme="snow" value={form.description} onChange={val => setForm({...form, description: val})} className="h-48 mb-12" />
            </div>
          </div>
        )}

        {/* Fechas y Peso para Tareas Evaluables Y Exámenes */}
        {(taskType === "graded" || taskType === "exam") && (
          <div className={`p-4 border rounded-lg ${taskType === 'exam' ? 'bg-purple-50 border-purple-100' : 'bg-red-50 border-red-100'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${taskType === 'exam' ? 'text-purple-800' : 'text-red-800'}`}>PESO (%)</label>
                <input type="number" required min="1" max="100" value={form.weight_percentage} onChange={e => setForm({...form, weight_percentage: Number(e.target.value)})} className={`w-full p-2.5 border rounded text-sm text-gray-900 ${taskType === 'exam' ? 'border-purple-200' : 'border-red-200'}`} />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${taskType === 'exam' ? 'text-purple-800' : 'text-red-800'}`}>FECHA DE APLICACIÓN</label>
                <input type="datetime-local" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className={`w-full p-2.5 border rounded text-sm text-gray-900 ${taskType === 'exam' ? 'border-purple-200' : 'border-red-200'}`} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button type="submit" className="bg-gray-900 text-white font-bold py-2.5 px-6 rounded-lg text-sm uppercase shadow-sm hover:bg-gray-800 transition-colors">
            {editingId ? "Actualizar" : "Publicar"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-800 font-bold py-2.5 px-6 rounded-lg text-sm uppercase hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de Tareas */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto max-h-[800px]">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Gestión de Contenido</h2>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex items-start justify-between group hover:border-gray-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="mt-1">{renderIcon(task)}</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{task.modules.name}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{task.title}</p>
                  {(task.is_graded || task.is_exam) && task.due_date && <p className="text-[10px] font-semibold text-gray-500 mt-1">Cierre: {new Date(task.due_date).toLocaleString('es-MX')}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(task)} className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded shadow-sm border border-gray-200 transition-colors"><Edit2 size={14}/></button>
                <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white rounded shadow-sm border border-gray-200 transition-colors"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}