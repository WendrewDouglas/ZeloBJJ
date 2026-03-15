"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  course_id: string;
}

interface Lesson {
  id: string;
  title: string;
  order_index: number;
  module_id: string;
}

export default function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const supabase = createClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [courseRes, modulesRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).single(),
        supabase
          .from("modules")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index"),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (modulesRes.data) {
        setModules(modulesRes.data);

        const moduleIds = modulesRes.data.map((m) => m.id);
        if (moduleIds.length > 0) {
          const { data: lessonsData } = await supabase
            .from("lessons")
            .select("*")
            .in("module_id", moduleIds)
            .order("order_index");

          if (lessonsData) setLessons(lessonsData);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!course) return;
    setSaving(true);
    setSaveMessage("");

    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        description: course.description,
        published: course.published,
      })
      .eq("id", course.id);

    if (error) {
      setSaveMessage("Erro ao salvar: " + error.message);
    } else {
      setSaveMessage("Curso salvo com sucesso!");
      setTimeout(() => setSaveMessage(""), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-text">Curso não encontrado.</p>
        <Link
          href="/admin/cursos"
          className="text-gold hover:text-gold-light text-sm mt-2 inline-block"
        >
          Voltar aos cursos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/cursos"
          className="text-gray-text hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-white">Editar Curso</h1>
        </div>
      </div>

      {/* Course Details */}
      <Card className="bg-dark-lighter border-white/5 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-text text-sm">
              Título do Curso
            </Label>
            <Input
              id="title"
              value={course.title}
              onChange={(e) =>
                setCourse({ ...course, title: e.target.value })
              }
              className="mt-1 bg-white/5 border-white/10 text-white focus:border-gold"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-text text-sm">
              Descrição
            </Label>
            <textarea
              id="description"
              value={course.description || ""}
              onChange={(e) =>
                setCourse({ ...course, description: e.target.value })
              }
              rows={4}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-gray-text text-sm">Status:</Label>
            <button
              onClick={() =>
                setCourse({ ...course, published: !course.published })
              }
              className="flex items-center gap-2"
            >
              {course.published ? (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 cursor-pointer">
                  Publicado
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 cursor-pointer"
                >
                  Rascunho
                </Badge>
              )}
            </button>
            <span className="text-gray-text text-xs">
              (clique para alternar)
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold hover:bg-gold-light text-black font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
            {saveMessage && (
              <span
                className={`text-sm ${
                  saveMessage.includes("Erro")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Modules & Lessons */}
      <Card className="bg-dark-lighter border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Módulos e Aulas
        </h2>

        {modules.length > 0 ? (
          <div className="space-y-2">
            {modules.map((mod) => {
              const moduleLessons = lessons.filter(
                (l) => l.module_id === mod.id
              );
              const isExpanded = expandedModules.has(mod.id);

              return (
                <div
                  key={mod.id}
                  className="border border-white/5 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-text" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-text" />
                      )}
                      <span className="text-white text-sm font-medium">
                        {mod.title}
                      </span>
                    </div>
                    <span className="text-gray-text text-xs">
                      {moduleLessons.length} aula(s)
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 bg-white/[0.01]">
                      {moduleLessons.length > 0 ? (
                        moduleLessons.map((lesson, i) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-3 px-4 py-2.5 pl-12 ${
                              i < moduleLessons.length - 1
                                ? "border-b border-white/5"
                                : ""
                            }`}
                          >
                            <span className="text-gray-text text-xs w-6">
                              {lesson.order_index + 1}.
                            </span>
                            <span className="text-gray-text text-sm">
                              {lesson.title}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="px-4 py-3 pl-12 text-gray-text text-sm">
                          Nenhuma aula neste módulo.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-text text-sm">
            Nenhum módulo encontrado para este curso.
          </p>
        )}
      </Card>
    </div>
  );
}
