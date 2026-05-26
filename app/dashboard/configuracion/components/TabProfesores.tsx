"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Trash2 } from "lucide-react";

export default function TabProfesores({ courseId }: { courseId: string }) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [form, setForm] = useState({ first_name: "", last_name: "", github_username: "" });

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*').eq('course_id', courseId);
    if (data) setTeachers(data);
  };

  useEffect(() => { fetchTeachers(); }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('teachers').insert([{ course_id: courseId, ...form }]);
    setForm({ first_name: "", last_name: "", github_username: "" });
    fetchTeachers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar profesor?")) { await supabase.from('teachers').delete().eq('id', id); fetchTeachers(); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <form onSubmit={handleSave} className="bg-white p-6 border border-gray-200 rounded shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Añadir Profesor</h2>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">NOMBRES</label>
            <input type="text" required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 focus:border-red-600 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">APELLIDOS</label>
            <input type="text" required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 focus:border-red-600 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">GITHUB (Opcional)</label>
            <input type="text" value={form.github_username} onChange={e => setForm({...form, github_username: e.target.value})} placeholder="Ej: Imcab o esangarr" className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 focus:border-red-600 outline-none" />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2.5 rounded text-sm uppercase">Registrar</button>
        </form>
      </div>

      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
        {teachers.map(t => {
          const avatarUrl = t.github_username ? `https://github.com/${t.github_username}.png` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
          return (
            <div key={t.id} className="bg-white border border-gray-200 rounded p-4 flex items-center gap-4 shadow-sm relative">
              <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full border border-gray-200 object-cover" />
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{t.first_name} {t.last_name}</h3>
                {t.github_username && <p className="text-xs text-gray-500 font-mono mt-0.5">@{t.github_username}</p>}
              </div>
              <button onClick={() => handleDelete(t.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-600"><Trash2 size={16}/></button>
            </div>
          )
        })}
      </div>
    </div>
  );
}