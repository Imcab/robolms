"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, AlertCircle, BookOpen, Users, Cpu } from "lucide-react";
import { supabase } from "./lib/supabase"; 

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.session) {
        const role = email.includes("admin") ? "Administrador" : "Estudiante";
        localStorage.setItem("robolms_role", role);
        router.push("/dashboard");
      }
    } catch (error: any) {
      setErrorMsg("Credenciales de acceso inválidas. Por favor, verifique su información.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Columna Izquierda: Branding e Información */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-32 -right-32 w-96 h-96 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl tracking-wide">RoboLMS</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Plataforma integral de <br />
            <span className="text-red-500">Robótica</span>
          </h1>
          
          <p className="text-gray-300 text-lg mb-12 max-w-md">
            Ecosistema de aprendizaje diseñado para la gestión académica, seguimiento y entrega de proyectos de ingeniería.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-800 rounded text-red-400"><BookOpen size={20} /></div>
              <div>
                <h3 className="font-bold text-white mb-1">Para Estudiantes</h3>
                <p className="text-sm text-gray-400">Accede a tus materiales, envía prácticas evaluables y da seguimiento a tu progreso técnico.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-800 rounded text-red-400"><Users size={20} /></div>
              <div>
                <h3 className="font-bold text-white mb-1">Para Profesores</h3>
                <p className="text-sm text-gray-400">Controla el calendario académico, gestiona rúbricas y evalúa repositorios centralizados.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500 font-medium mt-12">
          © {new Date().getFullYear()} STZ Robotics. Todos los derechos reservados.
        </div>
      </div>

      {/* Columna Derecha: Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-gray-200">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Acceso institucional
          </h2>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg text-sm text-gray-900 focus:border-red-600 outline-none transition-colors"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@stzrobotics.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:border-red-600 outline-none transition-colors"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg text-sm hover:bg-red-700 transition-colors mt-4 disabled:bg-red-400 shadow-sm"
            >
              {isLoading ? "Autenticando..." : "Ingresar al sistema"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}