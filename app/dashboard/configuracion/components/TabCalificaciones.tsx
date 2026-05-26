"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Save, UserCircle, CheckCircle2, MessageSquare } from "lucide-react";

export default function TabCalificaciones({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  const [tasks, setTasks] = useState<any[]>([]);
  // Almacena un objeto con el score y el feedback por cada taskId
  const [submissions, setSubmissions] = useState<Record<string, { score: string, feedback: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sData } = await supabase.from('enrollments').select('student_id, students(id, email, first_name, last_name)').eq('course_id', courseId);
      if (sData) setStudents(sData.map((e: any) => e.students));

      const { data: tData } = await supabase
        .from('tasks')
        .select('id, title, due_date, weight_percentage, modules!inner(course_id, name)')
        .eq('modules.course_id', courseId)
        .eq('is_graded', true);
      
      if (tData) setTasks(tData);
    };
    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (!selectedStudentId) {
      setSubmissions({});
      return;
    }
    const fetchSubmissions = async () => {
      const { data } = await supabase.from('submissions').select('task_id, score, feedback').eq('student_id', selectedStudentId);
      const currentSubs: Record<string, { score: string, feedback: string }> = {};
      if (data) {
        data.forEach(sub => {
          currentSubs[sub.task_id] = {
            score: sub.score !== null ? sub.score.toString() : "",
            feedback: sub.feedback || ""
          };
        });
      }
      setSubmissions(currentSubs);
    };
    fetchSubmissions();
  }, [selectedStudentId]);

  const handleScoreChange = (taskId: string, value: string) => {
    setSubmissions(prev => ({
      ...prev,
      [taskId]: { score: value, feedback: prev[taskId]?.feedback || "" }
    }));
  };

  const handleFeedbackChange = (taskId: string, value: string) => {
    setSubmissions(prev => ({
      ...prev,
      [taskId]: { score: prev[taskId]?.score || "", feedback: value }
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedStudentId) return;
    setIsSaving(true);

    const upserts = Object.entries(submissions).map(([taskId, data]) => ({
      task_id: taskId,
      student_id: selectedStudentId,
      score: data.score === "" ? null : Number(data.score),
      feedback: data.feedback.trim() === "" ? null : data.feedback.trim()
    }));

    const { error } = await supabase.from('submissions').upsert(upserts, { onConflict: 'task_id,student_id' });

    setIsSaving(false);
    if (error) alert("Error al guardar calificaciones: " + error.message);
    else alert("Calificaciones y retroalimentación guardadas exitosamente en el expediente.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-widest">
            Seleccionar Estudiante a Evaluar
          </label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)} 
              className="w-full pl-10 p-3 border border-gray-300 rounded text-sm font-bold text-gray-900 bg-gray-50 outline-none focus:border-red-600 transition-colors"
            >
              <option value="">-- Elija un alumno de la lista --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.last_name}, {s.first_name} ({s.email})</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedStudentId ? (
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Libro de Calificaciones</h2>
            <button 
              onClick={handleSaveGrades} 
              disabled={isSaving}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded text-xs uppercase tracking-wide hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              {isSaving ? "Guardando..." : <><Save size={16} /> Guardar Cambios</>}
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No hay tareas evaluables configuradas en este curso.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map(task => (
                <div key={task.id} className="p-4 flex flex-col lg:flex-row lg:items-start justify-between hover:bg-gray-50 transition-colors gap-6">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{task.modules.name}</p>
                    <p className="text-sm font-bold text-gray-900">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">Valor: {task.weight_percentage}%</span>
                      {task.due_date && <span className="text-[10px] text-gray-500 font-semibold uppercase">Cierre: {new Date(task.due_date).toLocaleString('es-MX')}</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4 w-full lg:w-auto">
                    <div className="w-full sm:w-32 flex-shrink-0">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Puntuación</label>
                      <input 
                        type="number" 
                        min="0" max="100" 
                        value={submissions[task.id]?.score ?? ""} 
                        onChange={(e) => handleScoreChange(task.id, e.target.value)}
                        placeholder="Sin calificar"
                        className="w-full p-2 border border-gray-300 rounded text-base text-gray-900 font-black outline-none focus:border-red-600 text-center bg-white shadow-inner" 
                      />
                    </div>
                    
                    <div className="w-full sm:w-72 lg:w-80 flex-shrink-0">
                      <label className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase mb-1">
                        <MessageSquare size={12} /> Feedback Opcional
                      </label>
                      <textarea 
                        rows={2}
                        value={submissions[task.id]?.feedback ?? ""} 
                        onChange={(e) => handleFeedbackChange(task.id, e.target.value)}
                        placeholder="Comentarios sobre la entrega..."
                        className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-red-600 bg-white resize-none" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {tasks.length > 0 && (
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <button onClick={handleSaveGrades} disabled={isSaving} className="bg-red-600 text-white font-bold py-3 px-8 rounded text-sm uppercase tracking-wide hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                {isSaving ? "Guardando..." : <><CheckCircle2 size={18} /> Guardar Todo</>}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded border border-gray-200 p-12 text-center">
          <UserCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold text-sm">Seleccione un estudiante en el menú superior para ver y editar sus calificaciones.</p>
        </div>
      )}

    </div>
  );
}