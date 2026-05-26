"use client";
import { BookOpen, Settings, LogOut, GraduationCap, Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const savedRole = localStorage.getItem("robolms_role");
    if (!savedRole) router.push("/");
    else setRole(savedRole);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("robolms_role");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-sm">
      {/* Barra Superior */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between sticky top-0 z-50">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => router.push('/dashboard')}
        >
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">RoboLMS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">
            Perfil: {role}
          </span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navegación Lateral */}
        <aside className="w-56 bg-white border-r border-gray-200 p-4 hidden md:block">
          <nav className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Principal</p>
            
            <button 
              onClick={() => router.push("/dashboard")} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-semibold rounded transition-colors ${pathname === '/dashboard' ? 'text-red-700 bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Home size={18} />
              <span>Inicio</span>
            </button>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3 px-2 border-t border-gray-100 pt-4">Navegación</p>

            {/* Cursos es visible para ambos: El admin gestiona, el alumno consulta */}
            <button 
              onClick={() => router.push("/dashboard/cursos")} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-semibold rounded transition-colors ${pathname.includes('/cursos') ? 'text-red-700 bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen size={18} />
              <span>Cursos</span>
            </button>
            
            {/* SOLUCIÓN: Configuración oculta por completo si el rol es Estudiante */}
            {role === "Administrador" && (
              <button 
                onClick={() => router.push("/dashboard/configuracion")} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 font-semibold rounded transition-colors ${pathname.includes('/configuracion') ? 'text-red-700 bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings size={18} />
                <span>Configuración</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}