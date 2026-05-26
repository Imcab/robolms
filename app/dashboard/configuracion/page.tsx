"use client";
import { useState, useEffect } from "react";
import { PieChart, BookOpen, ClipboardList, Users, Calendar, CalendarDays, Presentation, Megaphone, ClipboardCheck } from "lucide-react";
import { supabase } from "../../lib/supabase"; 

import TabFechas from "./components/TabFechas";
import TabModulos from "./components/TabModulos";
import TabTareas from "./components/TabTareas";
import TabPlan from "./components/TabPlan";
import TabEstudiantes from "./components/TabEstudiantes";
import TabProfesores from "./components/TabProfesores";
import TabAnuncios from "./components/TabAnuncios";
import TabCalendario from "./components/TabCalendario";
import TabCalificaciones from "./components/TabCalificaciones"; // El nuevo libro de notas

export default function ConfiguracionSistema() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("plan");
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('*');
      if (data) setAvailableCourses(data);
    };
    fetchCourses();
  }, []);

  if (!selectedCourse) {
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded border border-gray-200 shadow-sm text-center text-gray-900">
        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold uppercase">Seleccione un Curso</h2>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full max-w-md mx-auto p-3 border border-gray-300 rounded text-sm font-bold focus:border-red-600 outline-none text-gray-900">
          <option value="">-- Seleccionar Curso --</option>
          {availableCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
        </select>
      </div>
    );
  }

  const courseInfo = availableCourses.find(c => c.id === selectedCourse);

  return (
    <div className="max-w-[98%] mx-auto font-sans pb-10">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase">Configuración de Curso</h1>
          <p className="text-sm font-bold text-red-600">{courseInfo?.code} - {courseInfo?.name}</p>
        </div>
        <button onClick={() => setSelectedCourse("")} className="text-xs font-bold text-gray-500 hover:text-red-600 underline">Cambiar Curso</button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab("plan")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "plan" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><PieChart size={16} /> Estructura y Canvas</button>
        <button onClick={() => setActiveTab("calificaciones")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "calificaciones" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><ClipboardCheck size={16} /> Calificaciones</button>
        <button onClick={() => setActiveTab("fechas")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "fechas" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><CalendarDays size={16} /> Fechas</button>
        <button onClick={() => setActiveTab("calendario")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "calendario" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><Calendar size={16} /> Calendario</button>
        <button onClick={() => setActiveTab("tareas")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "tareas" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><ClipboardList size={16} /> Tareas</button>
        <button onClick={() => setActiveTab("modulos")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "modulos" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><BookOpen size={16} /> Módulos</button>
        <button onClick={() => setActiveTab("estudiantes")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "estudiantes" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><Users size={16} /> Estudiantes</button>
        <button onClick={() => setActiveTab("profesores")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "profesores" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><Presentation size={16} /> Profesores</button>
        <button onClick={() => setActiveTab("anuncios")} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide border-b-2 whitespace-nowrap ${activeTab === "anuncios" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}><Megaphone size={16} /> Anuncios</button>
      </div>

      {activeTab === "plan" && <TabPlan courseId={selectedCourse} />}
      {activeTab === "calificaciones" && <TabCalificaciones courseId={selectedCourse} />}
      {activeTab === "fechas" && <TabFechas courseId={selectedCourse} />}
      {activeTab === "calendario" && <TabCalendario courseId={selectedCourse} />}
      {activeTab === "tareas" && <TabTareas courseId={selectedCourse} />}
      {activeTab === "modulos" && <TabModulos courseId={selectedCourse} />}
      {activeTab === "estudiantes" && <TabEstudiantes courseId={selectedCourse} />}
      {activeTab === "profesores" && <TabProfesores courseId={selectedCourse} />}
      {activeTab === "anuncios" && <TabAnuncios courseId={selectedCourse} />}
    </div>
  );
}