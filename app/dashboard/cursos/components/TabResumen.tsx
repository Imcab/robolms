"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Clock, Trophy, Megaphone, Calendar } from "lucide-react";

export default function TabResumen({ courseId }: { courseId: string }) {
  const [data, setData] = useState({
    remainingDays: 0,
    currentGrade: 0,
    recentAnnouncements: [] as any[],
    isLoading: true
  });

  useEffect(() => {
    const fetchSummary = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Obtener Fechas y Anuncios
      const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single();
      const { data: anns } = await supabase.from('announcements')
        .select('*').or(`course_id.eq.${courseId},course_id.is.null`)
        .order('created_at', { ascending: false }).limit(2);

      // 2. Calcular Días Laborales Restantes (CON LA LÓGICA EXACTA DEL CALENDARIO)
      let remaining = 0;
      if (course?.start_date && course?.end_date) {
        const startDate = new Date(course.start_date);
        const endDate = new Date(course.end_date);
        
        // Ajuste de Timezone vital para evitar que robe días
        startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
        endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getWorkingDays = (start: Date, end: Date) => {
          let count = 0;
          let cur = new Date(start);
          while (cur <= end) {
            const dayOfWeek = cur.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
            cur.setDate(cur.getDate() + 1);
          }
          return count;
        };

        if (today > endDate) {
          remaining = 0;
        } else if (today < startDate) {
          remaining = getWorkingDays(startDate, endDate); // Curso aún no empieza, muestra todos los días
        } else {
          remaining = getWorkingDays(today, endDate); // Curso en progreso
        }
      }

      // 3. Calcular Calificación Actual (Ponderada) - AHORA FILTRADA POR USUARIO
      const { data: structure } = await supabase
        .from('modules')
        .select('weight_percentage, tasks(weight_percentage, submissions(score))')
        .eq('course_id', courseId)
        .eq('tasks.submissions.student_id', session.user.id); // <- ¡FALTABA ESTE FILTRO!

      let totalWeightedScore = 0;
      if (structure) {
        structure.forEach(mod => {
          const modWeight = mod.weight_percentage || 0;
          mod.tasks.forEach((task: any) => {
            const taskWeight = task.weight_percentage || 0;
            const score = task.submissions?.[0]?.score || 0;
            // Formula: Nota * (% Tarea / 100) * (% Modulo / 100)
            totalWeightedScore += (score * (taskWeight / 100) * (modWeight / 100));
          });
        });
      }

      setData({
        remainingDays: remaining,
        currentGrade: Number(totalWeightedScore.toFixed(1)),
        recentAnnouncements: anns || [],
        isLoading: false
      });
    };

    fetchSummary();
  }, [courseId]);

  if (data.isLoading) return <div className="animate-pulse flex gap-4"><div className="h-32 w-full bg-gray-100 rounded-xl"></div></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* GRID DE MINI WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Widget: Nota Actual */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Calificación total</p>
            <p className="text-2xl font-bold text-gray-900">{data.currentGrade}<span className="text-sm text-gray-400">/100</span></p>
          </div>
        </div>

        {/* Widget: Tiempo Restante */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Días laborales</p>
            <p className="text-2xl font-bold text-gray-900">{data.remainingDays} <span className="text-sm text-gray-400 font-medium">restantes</span></p>
          </div>
        </div>

        {/* Widget: Estado del Curso */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estatus</p>
            <p className="text-sm font-bold text-gray-900 mt-1">Curso en impartición</p>
          </div>
        </div>
      </div>

      {/* Widget de Anuncios Recientes */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
          <Megaphone size={18} className="text-red-600" />
          <h3 className="font-bold text-gray-900">Últimos avisos</h3>
        </div>
        <div className="space-y-3">
          {data.recentAnnouncements.map(ann => (
            <div key={ann.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-800 font-medium line-clamp-2">{ann.content}</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase">{new Date(ann.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {data.recentAnnouncements.length === 0 && <p className="text-xs text-gray-400 italic">No hay avisos recientes.</p>}
        </div>
      </div>
    </div>
  );
}