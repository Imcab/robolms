"use client";
import { BookOpen, Settings, LogOut, Home } from "lucide-react";
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
      {/* Barra Superior - TOTALMENTE NEGRA */}
      <header className="bg-[#0a0a0a] border-b border-gray-800 h-16 flex items-center px-6 justify-between sticky top-0 z-50">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => router.push('/dashboard')}
        >
          {/* Tu Ícono Personalizado */}
          <div className="w-8 h-8 relative flex items-center justify-center">
            <img 
              src="/favicon.ico" 
              alt="rmo logo" 
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32/dc2626/ffffff?text=R';
              }}
            />
          </div>
          <span className="font-bold text-white text-xl tracking-tight">rmo</span>
        </div>
        
        <div className="flex items-center gap-5">
          <span className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded-full font-bold shadow-sm">
            Perfil: {role}
          </span>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors" 
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navegación Lateral - AHORA CON FLEX PARA EMPUJAR EL LOGO ABAJO */}
        <aside className="w-56 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">
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

            <button 
              onClick={() => router.push("/dashboard/cursos")} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-semibold rounded transition-colors ${pathname.includes('/cursos') ? 'text-red-700 bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <BookOpen size={18} />
              <span>Cursos</span>
            </button>
            
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

          {/* BRANDING INFERIOR STZ ROBOTICS */}
          <div className="mt-auto pt-6 border-t border-gray-100 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Powered by</p>
            <img 
              src="/stzlogo.png" 
              alt="STZ Robotics" 
              className="w-28 mx-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}