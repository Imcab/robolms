"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { 
  BookOpen, 
  Users, 
  Settings, 
  Megaphone, 
  GraduationCap, 
  ArrowRight,
  Bell,
  Clock
} from "lucide-react";

export default function DashboardHome() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Datos Admin
  const [adminStats, setAdminStats] = useState({ courses: 0, students: 0 });
  
  // Datos Estudiante
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  // Datos Compartidos
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const role = localStorage.getItem("robolms_role") || "Estudiante";
      setUserRole(role);

      if (role === "Administrador") {
        // --- DATA DEL ADMINISTRADOR ---
        const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
        const { data: enrollments } = await supabase.from('enrollments').select('student_id');
        const uniqueStudents = new Set(enrollments?.map(e => e.student_id)).size;
        
        setAdminStats({ courses: courseCount || 0, students: uniqueStudents || 0 });

        const { data: anns } = await supabase.from('announcements')
          .select('*, courses(name, code)')
          .order('created_at', { ascending: false })
          .limit(4);
        if (anns) setRecentAnnouncements(anns);

      } else {
        // --- DATA DEL ESTUDIANTE ---
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('course_id, courses(id, name, code)')
          .eq('student_id', session.user.id);
        
        const coursesList = enrollData?.map(e => e.courses) || [];
        setMyCourses(coursesList);

        // Buscar Tareas Próximas a Vencer
        if (coursesList.length > 0) {
          const courseIds = coursesList.map((c: any) => c.id);
          const today = new Date().toISOString();

          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, due_date, modules!inner(course_id, courses(name, code))')
            .eq('is_graded', true)
            .in('modules.course_id', courseIds)
            .gte('due_date', today)
            .order('due_date', { ascending: true })
            .limit(3);
          
          if (tasks) setUpcomingTasks(tasks);

          // Anuncios del estudiante
          const filterQuery = `course_id.in.(${courseIds.join(',')}),course_id.is.null`;
          const { data: anns } = await supabase.from('announcements')
            .select('*, courses(name, code)')
            .or(filterQuery)
            .order('created_at', { ascending: false })
            .limit(3);
          if (anns) setRecentAnnouncements(anns);
        }
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans pb-10 space-y-8">
      
      {/* HEADER DE BIENVENIDA UNIFICADO */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Hola, {userRole === "Administrador" ? "Profesor" : "Estudiante"}! Bienvenido a <span className="text-red-600">RoboLMS</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {userRole === "Administrador" 
              ? "Aquí tienes un resumen general de la plataforma y accesos de administración." 
              : "Revisa tus próximas entregas y accede rápidamente a tus materiales de estudio."}
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-14 h-14 bg-red-50 rounded-full border border-red-100">
          <GraduationCap size={28} className="text-red-600" />
        </div>
      </div>

      {userRole === "Administrador" ? (
        // ==========================================
        // VISTA DEL ADMINISTRADOR
        // ==========================================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 border-l-4 border-l-red-600">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg"><BookOpen size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cursos Activos</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.courses}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 border-l-4 border-l-gray-800">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estudiantes</p>
                  <p className="text-3xl font-bold text-gray-900">{adminStats.students}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Herramientas de gestión</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <button onClick={() => router.push('/dashboard/configuracion')} className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-colors"><Settings size={24} /></div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Centro de configuración</h3>
                  <p className="text-xs text-gray-500">Diseña el Canvas, tareas y evalúa rúbricas.</p>
                </button>
                <button onClick={() => router.push('/dashboard/cursos')} className="p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-colors"><BookOpen size={24} /></div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Catálogo de cursos</h3>
                  <p className="text-xs text-gray-500">Abre nuevos cursos institucionales y matrículas.</p>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
                <Megaphone size={16} className="text-red-600" /> 
                <h2 className="text-sm font-bold text-gray-800">Tablero de avisos</h2>
              </div>
              <div className="p-4 space-y-3">
                {recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-6">No hay avisos recientes.</p>
                ) : (
                  recentAnnouncements.map(ann => (
                    <div key={ann.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-[9px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 mb-1 inline-block">
                        {ann.courses?.code || 'Global'}
                      </span>
                      <p className="text-sm text-gray-800 font-medium">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // VISTA DEL ESTUDIANTE
        // ==========================================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* WIDGET: TAREAS PRÓXIMAS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                <h2 className="text-sm font-bold text-gray-800">Próximos vencimientos</h2>
              </div>
              <div className="p-0">
                {upcomingTasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock size={24} className="text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">¡Todo al día!</p>
                    <p className="text-xs text-gray-500 mt-1">No tienes entregas pendientes para los próximos días.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{task.modules?.courses?.name}</p>
                          <p className="text-sm font-bold text-gray-900">{task.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Cierra el</p>
                          <p className="text-xs font-semibold text-gray-700">{new Date(task.due_date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* WIDGET: ATAJOS DE CURSOS */}
            <div>
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-gray-500" /> Mis materias
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myCourses.map(course => (
                  <div 
                    key={course.id}
                    onClick={() => router.push('/dashboard/cursos')}
                    className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-red-300 hover:shadow-md transition-all group"
                  >
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">
                      {course.code}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-2 mb-3">{course.name}</h3>
                    <div className="text-xs font-bold text-gray-400 group-hover:text-red-600 flex items-center gap-1 transition-colors">
                      Ir al aula <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: ANUNCIOS ESTUDIANTE */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
                <Megaphone size={16} className="text-blue-500" /> 
                <h2 className="text-sm font-bold text-gray-800">Avisos recientes</h2>
              </div>
              <div className="p-4 space-y-4">
                {recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-6">Sin novedades.</p>
                ) : (
                  recentAnnouncements.map(ann => (
                    <div key={ann.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {ann.courses?.code || 'Institucional'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(ann.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}