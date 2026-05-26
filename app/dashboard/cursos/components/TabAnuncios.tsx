"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default function TabAnuncios({ courseId }: { courseId: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .or(`course_id.eq.${courseId},course_id.is.null`)
        .order('created_at', { ascending: false });
      if (data) setAnnouncements(data);
    };
    fetchAnnouncements();
  }, [courseId]);

  const getIcon = (type: string) => {
    if (type === 'alert') return <AlertCircle size={20} className="text-red-600" />;
    if (type === 'success') return <CheckCircle size={20} className="text-green-600" />;
    return <Info size={20} className="text-blue-600" />;
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {announcements.map(ann => (
        <div key={ann.id} className={`p-4 rounded-lg border flex gap-4 ${
          ann.type === 'alert' ? 'bg-red-50 border-red-200' : 
          ann.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="mt-0.5 flex-shrink-0">{getIcon(ann.type)}</div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mercantile whitespace-pre-wrap leading-relaxed">{ann.content}</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">
              Publicado el: {new Date(ann.created_at).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>
      ))}
      {announcements.length === 0 && (
        <p className="text-sm text-gray-500 italic p-4 bg-white border border-gray-200 rounded-lg">No hay avisos publicados en esta materia.</p>
      )}
    </div>
  );
}