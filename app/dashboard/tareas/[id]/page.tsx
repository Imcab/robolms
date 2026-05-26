"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

// Tipamos el objeto de los params
interface TareaDetalleProps {
  params: Promise<{ id: string }>;
}

export default function TareaDetalle({ params }: TareaDetalleProps) {
  // Desempaquetamos los params (Next.js 15+ requiere hacerlo así en componentes de cliente)
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [role, setRole] = useState<string | null>("");
  
  // Estados para simular la BD
  const [calificacion, setCalificacion] = useState<string>("Sin calificar");
  const [fecha, setFecha] = useState<string>("2026-05-30");
  const [descripcion, setDescripcion] = useState<string>("Aplica el término proporcional para que la torreta no oscile.");

  useEffect(() => {
    setRole(localStorage.getItem("robolms_role"));
  }, []);

  const guardarCambios = async () => {
    // Lógica de actualización a Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ score: calificacion, status: 'calificado' })
      .eq('id', id);
  
    if (error) {
      alert("Error al guardar la calificación: " + error.message);
    } else {
      alert("Calificación registrada institucionalmente.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.push("/dashboard")} className="text-red-600 text-xs font-bold mb-4 hover:underline">
        ← Volver a Tareas
      </button>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        {/* Header de la tarea */}
        <div className="bg-gray-50 border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Práctica de Control PID {id}</h1>
          <div className="flex gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1"><FileText size={14}/> 100 Puntos Max</span>
            <span className="flex items-center gap-1"><CheckCircle size={14}/> Estado: Entregado</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Izquierda: Contenido */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Descripción de la Tarea</h3>
              {role === "admin" ? (
                <textarea 
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:border-red-500 outline-none min-h-[150px]"
                  value={descripcion}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)}
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-4 rounded border border-gray-100">{descripcion}</p>
              )}
            </div>
          </div>

          {/* Columna Derecha: Controles */}
          <div className="border-l border-gray-100 pl-6 space-y-6">
            
            {/* Control de Fecha */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Límite</h3>
              {role === "admin" ? (
                <input 
                  type="date" 
                  value={fecha}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFecha(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 focus:border-red-500 outline-none"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-700 bg-red-50 text-red-700 p-2 rounded border border-red-100 font-semibold">
                  <Calendar size={16} /> {fecha}
                </div>
              )}
            </div>

            {/* Control de Calificación */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Calificación</h3>
              {role === "admin" ? (
                <input 
                  type="number" 
                  placeholder="Ej: 95"
                  value={calificacion === "Sin calificar" ? "" : calificacion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCalificacion(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-gray-900 focus:border-red-500 outline-none"
                />
              ) : (
                <p className="text-2xl font-black text-gray-900">{calificacion} / 100</p>
              )}
            </div>

            {role === "admin" && (
              <button onClick={guardarCambios} className="w-full bg-red-600 text-white font-bold py-2 rounded shadow hover:bg-red-700 transition-colors">
                Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}