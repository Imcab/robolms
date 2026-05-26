"use client";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function TabCalendario({ course }: { course: any }) {
  if (!course?.start_date || !course?.end_date) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
        <CalendarIcon size={40} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Este curso no tiene fechas de inicio o fin configuradas.</p>
      </div>
    );
  }

  const startDate = new Date(course.start_date);
  const endDate = new Date(course.end_date);
  
  // Ajuste de Timezone
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
  endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Función para calcular días laborales (Excluye Sábado 6 y Domingo 0)
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

  const totalWorkingDays = getWorkingDays(startDate, endDate);
  
  // Calcular los días que ya pasaron y los que faltan
  let passedDays = 0;
  let remainingDays = 0;

  if (today > endDate) {
    passedDays = totalWorkingDays;
    remainingDays = 0;
  } else if (today < startDate) {
    passedDays = 0;
    remainingDays = totalWorkingDays;
  } else {
    passedDays = getWorkingDays(startDate, today) - 1; // Sin contar hoy como pasado
    remainingDays = getWorkingDays(today, endDate);
  }

  const progressPercentage = totalWorkingDays === 0 ? 0 : Math.round((passedDays / totalWorkingDays) * 100);

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Clock size={24} className="text-red-600" />
        <h2 className="text-lg font-bold text-gray-900">Tiempo del curso</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Días laborales totales</p>
          <p className="text-4xl font-bold text-gray-900">{totalWorkingDays}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-center">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Días restantes</p>
          <p className="text-4xl font-bold text-red-600">{remainingDays}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Progreso</p>
          <p className="text-4xl font-bold text-gray-900">{progressPercentage}%</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
          <span>{startDate.toLocaleDateString('es-MX')}</span>
          <span>{endDate.toLocaleDateString('es-MX')}</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-600 transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4 font-medium italic">
          El cálculo excluye fines de semana (sábados y domingos).
        </p>
      </div>
    </div>
  );
}