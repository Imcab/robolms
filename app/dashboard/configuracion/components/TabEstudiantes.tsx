"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function TabEstudiantes({ courseId }: { courseId: string }) {
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [studentEmail, setStudentEmail] = useState<string>("");

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('enrollments')
      .select('student_id, students(id, first_name, last_name, email)')
      .eq('course_id', courseId);
      
    if (data) {
      setEnrolledStudents(data.map((e: any) => e.students));
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscar estudiante por email
    const { data: studentRecord, error: searchError } = await supabase
      .from('students')
      .select('id')
      .eq('email', studentEmail.toLowerCase())
      .single();

    if (searchError || !studentRecord) {
      return alert("No se encontró ningún estudiante con ese correo en Supabase.");
    }
    
    // Inscribir estudiante
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert([{ course_id: courseId, student_id: studentRecord.id }]);

    if (enrollError) {
      if (enrollError.code === '23505') alert("El estudiante ya se encuentra inscrito en este curso.");
      else alert("Error al inscribir: " + enrollError.message);
    } else {
      setStudentEmail("");
      fetchStudents();
      alert("Estudiante matriculado exitosamente.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
      <div className="md:col-span-1">
        <form onSubmit={handleEnrollStudent} className="bg-white p-6 border border-gray-200 rounded shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Inscribir Estudiante</h2>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">CORREO ELECTRÓNICO REGISTRADO</label>
            <input type="email" required value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="estudiante@stzrobotics.com" className="w-full p-2.5 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-red-600" />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2.5 rounded text-sm hover:bg-gray-800 uppercase transition-colors">
            Vincular a Curso
          </button>
        </form>
      </div>
      
      <div className="md:col-span-2">
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase">Estudiantes Inscritos ({enrolledStudents.length})</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {enrolledStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No hay alumnos en este curso.</div>
            ) : (
              enrolledStudents.map(student => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{student.last_name}, {student.first_name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{student.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}