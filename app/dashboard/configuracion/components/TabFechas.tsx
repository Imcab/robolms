"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function TabFechas({ courseId }: { courseId: string }) {
  const [courseStartDate, setCourseStartDate] = useState<string>("");
  const [courseEndDate, setCourseEndDate] = useState<string>("");

  useEffect(() => {
    const fetchDates = async () => {
      const { data } = await supabase
        .from('courses')
        .select('start_date, end_date')
        .eq('id', courseId)
        .single();
        
      if (data) {
        setCourseStartDate(data.start_date || "");
        setCourseEndDate(data.end_date || "");
      }
    };
    fetchDates();
  }, [courseId]);

  const handleUpdateDates = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('courses')
      .update({ start_date: courseStartDate, end_date: courseEndDate })
      .eq('id', courseId);

    if (error) {
      alert("Error al actualizar fechas: " + error.message);
    } else {
      alert("Calendario académico actualizado correctamente.");
    }
  };

  return (
    <form onSubmit={handleUpdateDates} className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-4 max-w-xl">
      <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Calendario Académico</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">FECHA DE INICIO</label>
          <input type="date" required value={courseStartDate} onChange={e => setCourseStartDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">FECHA DE CIERRE</label>
          <input type="date" required value={courseEndDate} onChange={e => setCourseEndDate(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-red-600" />
        </div>
      </div>
      <button type="submit" className="bg-red-600 text-white font-bold py-2.5 px-6 rounded text-sm hover:bg-red-700 uppercase tracking-wide mt-4 transition-colors">
        Actualizar Calendario
      </button>
    </form>
  );
}