"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  BookOpen, 
  ClipboardCheck, 
  Calendar, 
  Presentation, 
  Megaphone, 
  LayoutDashboard 
} from "lucide-react";

import TabContenido from "./components/TabContenido";
import TabNotas from "./components/TabNotas";
import TabCalendario from "./components/TabCalendario";
import TabResumen from "./components/TabResumen"; // Nuevo
import TabProfesores from "./components/TabProfesores";
import TabAnuncios from "./components/TabAnuncios"; // Nuevo

export default function CursosEstudiantePage() {
  const [session, setSession] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("resumen");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setSession(session);

      const savedRole = localStorage.getItem("robolms_role") || "Estudiante";
      
      if (savedRole === "Administrador") {
        const { data } = await supabase.from('courses').select('*').order('code', { ascending: true });
        if (data) setCourses(data);
      } else {
        const { data } = await supabase
          .from('enrollments')
          .select('course_id, courses(id, name, code, start_date, end_date)')
          .eq('student_id', session.user.id);
        if (data) setCourses(data.map((e: any) => e.courses));
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-gray-900 pb-20">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Explorar mis cursos</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión de contenidos y seguimiento de rendimiento académico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(course => (
          <div 
            key={course.id}
            onClick={() => { setSelectedCourseId(course.id); setActiveTab("resumen"); }}
            className={`p-5 rounded-lg border cursor-pointer transition-all bg-white shadow-sm ${
              selectedCourseId === course.id ? 'border-red-600 ring-1 ring-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">
              {course.code}
            </span>
            <h3 className="font-bold text-gray-900 text-base mt-2">{course.name}</h3>
          </div>
        ))}
      </div>

      {selectedCourseId && (
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg flex flex-col lg:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">{selectedCourse?.code}</p>
              <h2 className="text-2xl font-bold">{selectedCourse?.name}</h2>
            </div>
            
            {/* SUB-MENÚ EXPANDIDO CON LAS 6 TABS */}
            <div className="flex bg-white/10 p-1 rounded-lg overflow-x-auto max-w-full scrollbar-hide">
              <button onClick={() => setActiveTab("resumen")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "resumen" ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                <LayoutDashboard size={14} /> Resumen
              </button>
              <button onClick={() => setActiveTab("contenido")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "contenido" ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                <BookOpen size={14} /> Contenido
              </button>
              <button onClick={() => setActiveTab("notas")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "notas" ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                <ClipboardCheck size={14} /> Mis notas
              </button>
              <button onClick={() => setActiveTab("calendario")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "calendario" ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                <Calendar size={14} /> Calendario
              </button>
              <button onClick={() => setActiveTab("profesores")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "profesores" ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                <Presentation size={14} /> Profesores
              </button>
              <button onClick={() => setActiveTab("anuncios")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "anuncios" ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                <Megaphone size={14} /> Anuncios
              </button>
            </div>
          </div>

          {/* Renderizado condicional */}
          {activeTab === "resumen" && <TabResumen courseId={selectedCourseId} />}
          {activeTab === "contenido" && <TabContenido courseId={selectedCourseId} />}
          {activeTab === "notas" && <TabNotas courseId={selectedCourseId} session={session} />}
          {activeTab === "calendario" && <TabCalendario course={selectedCourse} />}
          {activeTab === "profesores" && <TabProfesores courseId={selectedCourseId} />}
          {activeTab === "anuncios" && <TabAnuncios courseId={selectedCourseId} />}
        </div>
      )}
    </div>
  );
}