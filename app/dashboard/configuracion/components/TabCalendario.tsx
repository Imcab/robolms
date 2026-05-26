"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TabCalendario({ courseId }: { courseId: string }) {
  const [courseInfo, setCourseInfo] = useState<{ start: string, end: string, code: string }>({ start: "", end: "", code: "" });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('courses').select('code, start_date, end_date').eq('id', courseId).single();
      if (data) {
        setCourseInfo({
          start: data.start_date || "",
          end: data.end_date || "",
          code: data.code || "CURSO"
        });
      }
    };
    fetchData();
  }, [courseId]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()); d++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }

  const isWithinCourse = (date: Date) => {
    if (!courseInfo.start || !courseInfo.end) return false;
    const s = new Date(courseInfo.start);
    const e = new Date(courseInfo.end);
    
    // Sumar el offset de la zona horaria para evitar desfaces en JavaScript Date
    s.setMinutes(s.getMinutes() + s.getTimezoneOffset());
    e.setMinutes(e.getMinutes() + e.getTimezoneOffset());

    date.setHours(0,0,0,0);
    s.setHours(0,0,0,0);
    e.setHours(0,0,0,0);
    return date >= s && date <= e;
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-5xl text-gray-900">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Calendario Operativo: <span className="text-red-600">{currentMonth.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded border border-gray-200 transition-colors"><ChevronLeft size={20}/></button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded border border-gray-200 transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-100 p-3 text-center font-bold text-xs uppercase text-gray-500">{day}</div>
        ))}
        {days.map((date, idx) => {
          const isActive = date ? isWithinCourse(date) : false;
          return (
            <div key={idx} className={`h-32 p-2 relative transition-colors ${!date ? 'bg-gray-50' : isActive ? 'bg-red-50 border-t-4 border-red-600' : 'bg-white'}`}>
              {date && (
                <>
                  <span className={`text-sm font-black ${isActive ? 'text-red-800' : 'text-gray-400'}`}>{date.getDate()}</span>
                  
                  {/* BLOQUE CON EL NOMBRE DEL CURSO */}
                  {isActive && (
                    <div className="mt-2 w-full">
                      <div className="bg-white border border-red-200 px-2 py-1 rounded shadow-sm text-center">
                        <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block truncate">
                          {courseInfo.code}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}