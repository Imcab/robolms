"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Trophy, MessageSquare } from "lucide-react";

export default function TabNotas({ courseId, session }: { courseId: string, session: any }) {
  const [studentGrades, setStudentGrades] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;
    const fetchMyGrades = async () => {
      const { data } = await supabase
        .from('tasks')
        .select(`id, title, weight_percentage, modules!inner(name), submissions!left(score, feedback)`)
        .eq('modules.course_id', courseId)
        .eq('is_graded', true)
        .eq('submissions.student_id', session.user.id);
      if (data) setStudentGrades(data);
    };
    fetchMyGrades();
  }, [courseId, session]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Resumen de Evaluaciones</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {studentGrades.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No hay actividades calificadas aún.</div>
        ) : (
          studentGrades.map(grade => {
            const submission = grade.submissions?.[0];
            const score = submission?.score;
            return (
              <div key={grade.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{grade.modules.name}</p>
                    <h4 className="font-bold text-gray-900 text-base">{grade.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Peso del curso: {grade.weight_percentage}%</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Calificación</p>
                      <div className={`text-2xl font-bold ${score >= 70 ? 'text-green-600' : score ? 'text-red-600' : 'text-gray-300'}`}>
                        {score !== undefined && score !== null ? score : '--'}
                      </div>
                    </div>
                    <div className="w-full md:w-64">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><MessageSquare size={10} /> Retroalimentación</p>
                      <div className="bg-gray-100/50 p-3 rounded-lg text-xs text-gray-700 italic border border-gray-200/50">
                        {submission?.feedback || "Sin comentarios adicionales por el profesor."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}