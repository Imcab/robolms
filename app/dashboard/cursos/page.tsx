"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; 
import { 
  BookOpen, 
  ClipboardCheck, 
  Calendar, 
  Presentation, 
  Megaphone, 
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

import TabContenido from "./components/TabContenido";
import TabNotas from "./components/TabNotas";
import TabCalendario from "./components/TabCalendario";
import TabResumen from "./components/TabResumen";
import TabProfesores from "./components/TabProfesores";
import TabAnuncios from "./components/TabAnuncios";

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
      
      {/* HEADER ELEGANTE */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catálogo Académico</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">Selecciona un programa para acceder a sus recursos, profesores y evaluaciones.</p>
      </div>

      {/* GRID DE MATERIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div 
            key={course.id}
            onClick={() => { setSelectedCourseId(course.id); setActiveTab("resumen"); }}
            className={`relative p-6 rounded-xl border bg-white shadow-sm cursor-pointer transition-all duration-200 group overflow-hidden ${
              selectedCourseId === course.id 
                ? 'border-red-600 ring-1 ring-red-600' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${selectedCourseId === course.id ? 'bg-red-600' : 'bg-transparent group-hover:bg-gray-200 transition-colors'}`}></div>
            
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded uppercase tracking-widest border border-gray-200 mb-4 inline-block">
              {course.code}
            </span>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-4">{course.name}</h3>
            
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
              <span className={`text-xs font-semibold flex items-center gap-1 transition-colors ${selectedCourseId === course.id ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-700'}`}>
                {selectedCourseId === course.id ? 'Viendo curso' : 'Entrar al aula'}
              </span>
              <ArrowRight size={16} className={`${selectedCourseId === course.id ? 'text-red-600 translate-x-1' : 'text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1'} transition-all`} />
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-3 py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800">No hay cursos disponibles</h3>
            <p className="text-sm text-gray-500 mt-1">Actualmente no estás inscrito en ninguna materia.</p>
          </div>
        )}
      </div>

      {/* ÁREA DEL CURSO SELECCIONADO */}
      {selectedCourseId && (
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* BANNER BLANCO FORMAL */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2.5 py-0.5 rounded border border-red-100 uppercase tracking-widest">
                  {selectedCourse?.code}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Programa de estudios
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{selectedCourse?.name}</h2>
            </div>
            
            {/* SUB-MENÚ TIPO PESTAÑAS LIMPIAS */}
            <div className="flex bg-gray-50 p-1.5 rounded-lg border border-gray-200 overflow-x-auto max-w-full scrollbar-hide">
              <button 
                onClick={() => setActiveTab("resumen")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "resumen" ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <LayoutDashboard size={14} /> Resumen
              </button>
              <button 
                onClick={() => setActiveTab("contenido")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "contenido" ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <BookOpen size={14} /> Contenido
              </button>
              <button 
                onClick={() => setActiveTab("notas")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "notas" ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <ClipboardCheck size={14} /> Mis notas
              </button>
              <button 
                onClick={() => setActiveTab("calendario")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "calendario" ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <Calendar size={14} /> Calendario
              </button>
              <button 
                onClick={() => setActiveTab("profesores")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "profesores" ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <Presentation size={14} /> Profesores
              </button>
              <button 
                onClick={() => setActiveTab("anuncios")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === "anuncios" ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <Megaphone size={14} /> Anuncios
              </button>
            </div>
          </div>

          {/* Renderizado condicional */}
          <div className="pt-2">
            {activeTab === "resumen" && <TabResumen courseId={selectedCourseId} />}
            {activeTab === "contenido" && <TabContenido courseId={selectedCourseId} />}
            {activeTab === "notas" && <TabNotas courseId={selectedCourseId} session={session} />}
            {activeTab === "calendario" && <TabCalendario course={selectedCourse} />}
            {activeTab === "profesores" && <TabProfesores courseId={selectedCourseId} />}
            {activeTab === "anuncios" && <TabAnuncios courseId={selectedCourseId} />}
          </div>
        </div>
      )}
    </div>
  );
}