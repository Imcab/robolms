"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function TabProfesores({ courseId }: { courseId: string }) {
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase.from('teachers').select('*').eq('course_id', courseId);
      if (data) setTeachers(data);
    };
    fetchTeachers();
  }, [courseId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl">
      {teachers.map(t => {
        const avatarUrl = t.github_username 
          ? `https://github.com/${t.github_username}.png` 
          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
        return (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <img src={avatarUrl} alt="Avatar de profesor" className="w-20 h-20 rounded-full border border-gray-100 object-cover mb-4 shadow-inner" />
            <h3 className="font-bold text-gray-900 text-base">{t.first_name} {t.last_name}</h3>
            <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">Profesor titular</p>
            
            {t.github_username && (
              <a 
                href={`https://github.com/${t.github_username}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200"
              >
                @{t.github_username}
              </a>
            )}
          </div>
        );
      })}
      {teachers.length === 0 && (
        <p className="text-sm text-gray-500 italic p-4 bg-white border rounded-lg col-span-3">
          No hay profesores registrados en esta materia.
        </p>
      )}
    </div>
  );
}