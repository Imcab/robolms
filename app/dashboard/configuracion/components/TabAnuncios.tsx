"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Trash2, Edit2, AlertCircle, Info, CheckCircle } from "lucide-react";

export default function TabAnuncios({ courseId }: { courseId: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ content: "", type: "info" });

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  useEffect(() => { fetchAnnouncements(); }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await supabase.from('announcements').update(form).eq('id', editingId);
    else await supabase.from('announcements').insert([{ course_id: courseId, ...form }]);
    
    setForm({ content: "", type: "info" }); setEditingId(null); fetchAnnouncements();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
      <div className="md:col-span-1">
        <form onSubmit={handleSave} className="bg-white p-6 border border-gray-200 rounded shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">{editingId ? "Editar Anuncio" : "Publicar Anuncio"}</h2>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">TIPO</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none">
              <option value="info">Informativo (Azul)</option>
              <option value="success">Éxito / Logro (Verde)</option>
              <option value="alert">¡Urgente! (Rojo)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">CONTENIDO</label>
            <textarea required value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none min-h-[120px]" />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2.5 rounded text-sm uppercase">{editingId ? "Actualizar" : "Publicar"}</button>
        </form>
      </div>
      <div className="md:col-span-2 space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className={`p-4 rounded border flex gap-4 ${ann.type === 'alert' ? 'bg-red-50 border-red-200' : ann.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="mt-1">{ann.type === 'alert' ? <AlertCircle size={20} className="text-red-600"/> : ann.type === 'success' ? <CheckCircle size={20} className="text-green-600"/> : <Info size={20} className="text-blue-600"/>}</div>
            <div className="flex-1"><p className="text-sm font-semibold text-gray-900 whitespace-pre-wrap">{ann.content}</p></div>
            <div className="flex flex-col gap-2 border-l border-gray-200/50 pl-3">
               <button onClick={() => {setEditingId(ann.id); setForm({content: ann.content, type: ann.type})}} className="text-gray-400 hover:text-gray-900"><Edit2 size={16}/></button>
               <button onClick={async () => { if(confirm("¿Borrar?")){ await supabase.from('announcements').delete().eq('id', ann.id); fetchAnnouncements(); } }} className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}