"use client";

import { useEffect, useState, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, ArrowLeft, ChevronDown, ChevronRight, PlayCircle } from "lucide-react";
import { LessonVideoUpload } from "@/components/admin/lesson-video-upload";

interface Course {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  course_id: string;
}

interface Lesson {
  id: string;
  title: string;
  sort_order: number;
  module_id: string;
  is_published: boolean;
  storage_path: string | null;
  video_url: string | null;
  bunny_video_id: string | null;
}

export default function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const t = useTranslations("admin.courseEdit");
  const tCommon = useTranslations("common");
  const supabase = createClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (courseData) setCourse(courseData);

      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order");
      if (modulesData) {
        setModules(modulesData);

        const moduleIds = modulesData.map((m) => m.id);
        if (moduleIds.length > 0) {
          const { data: lessonsData } = await supabase
            .from("lessons")
            .select("id, title, sort_order, module_id, is_published, storage_path, video_url, bunny_video_id")
            .in("module_id", moduleIds)
            .order("sort_order");

          if (lessonsData) setLessons(lessonsData);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [courseId, supabase]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!course) return;
    setSaving(true);
    setSaveMessage(null);

    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        description: course.description,
        is_published: course.is_published,
      })
      .eq("id", course.id);

    if (error) {
      setSaveMessage({ type: "error", text: t("errorSave", { message: error.message }) });
    } else {
      setSaveMessage({ type: "ok", text: t("successSave") });
      setTimeout(() => setSaveMessage(null), 3000);
    }
    setSaving(false);
  };

  const expandAll = () => setExpandedModules(new Set(modules.map((m) => m.id)));
  const collapseAll = () => setExpandedModules(new Set());

  const handleVideoUpdated = (lessonId: string, newPath: string | null) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, storage_path: newPath, video_url: newPath ? null : l.video_url } : l))
    );
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
        <p className="text-gray-text">{t("notFound")}</p>
        <Link href="/admin/cursos" className="text-gold hover:text-gold-light text-sm mt-2 inline-block">
          {t("backToCourses")}
        </Link>
      </div>
    );
  }

  const totalLessons = lessons.length;
  const lessonsWithVideo = lessons.filter((l) => l.storage_path || l.video_url || l.bunny_video_id).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/cursos" className="text-gray-text hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        </div>
      </div>

      <Card className="bg-dark-lighter border-white/5 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-text text-sm">{t("courseTitle")}</Label>
            <Input
              id="title"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              className="mt-1 bg-white/5 border-white/10 text-white focus:border-gold"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-text text-sm">{t("description")}</Label>
            <textarea
              id="description"
              value={course.description || ""}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-gray-text text-sm">{t("status")}</Label>
            <button onClick={() => setCourse({ ...course, is_published: !course.is_published })} className="flex items-center gap-2">
              {course.is_published ? (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 cursor-pointer">{tCommon("publish")}</Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 cursor-pointer">
                  {tCommon("draft")}
                </Badge>
              )}
            </button>
            <span className="text-gray-text text-xs">{t("toggleHint")}</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-light text-black font-medium">
              <Save className="w-4 h-4 mr-2" />
              {saving ? tCommon("saving") : t("saveChanges")}
            </Button>
            {saveMessage && (
              <span className={`text-sm ${saveMessage.type === "error" ? "text-red-400" : "text-green-400"}`}>
                {saveMessage.text}
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-dark-lighter border-white/5 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{t("modulesAndLessons")}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-text">
              {t("lessonsWithVideo", { withVideo: lessonsWithVideo, total: totalLessons })}
            </span>
            <button onClick={expandAll} className="text-xs text-gold hover:underline">
              {t("expandAll")}
            </button>
            <button onClick={collapseAll} className="text-xs text-gray-text hover:text-white">
              {t("collapseAll")}
            </button>
          </div>
        </div>

        {modules.length > 0 ? (
          <div className="space-y-2">
            {modules.map((mod) => {
              const moduleLessons = lessons.filter((l) => l.module_id === mod.id);
              const isExpanded = expandedModules.has(mod.id);
              const moduleWithVideo = moduleLessons.filter((l) => l.storage_path || l.video_url || l.bunny_video_id).length;

              return (
                <div key={mod.id} className="border border-white/5 rounded-lg overflow-hidden">
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
                        {mod.sort_order}. {mod.title}
                      </span>
                    </div>
                    <span className="text-gray-text text-xs">
                      {t("moduleWithVideo", { withVideo: moduleWithVideo, total: moduleLessons.length })}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 bg-white/[0.01]">
                      {moduleLessons.length > 0 ? (
                        moduleLessons.map((lesson, i) => {
                          const hasAnyVideo = lesson.storage_path || lesson.video_url || lesson.bunny_video_id;
                          return (
                            <div
                              key={lesson.id}
                              className={`flex flex-col gap-2 px-4 py-3 pl-12 sm:flex-row sm:items-center ${
                                i < moduleLessons.length - 1 ? "border-b border-white/5" : ""
                              }`}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <PlayCircle className={`h-4 w-4 shrink-0 ${hasAnyVideo ? "text-gold" : "text-gray-text/40"}`} />
                                <div className="min-w-0">
                                  <div className="text-sm text-white truncate">
                                    {lesson.sort_order}. {lesson.title}
                                  </div>
                                </div>
                              </div>
                              <div className="sm:ml-auto sm:w-auto">
                                <LessonVideoUpload
                                  lessonId={lesson.id}
                                  lessonTitle={lesson.title}
                                  initialStoragePath={lesson.storage_path}
                                  onUpdated={(newPath) => handleVideoUpdated(lesson.id, newPath)}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="px-4 py-3 pl-12 text-gray-text text-sm">{t("noLessons")}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-text text-sm">{t("noModules")}</p>
        )}
      </Card>
    </div>
  );
}
