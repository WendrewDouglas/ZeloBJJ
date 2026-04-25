"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface LessonProgressButtonProps {
  lessonId: string;
  completed: boolean;
}

export function LessonProgressButton({
  lessonId,
  completed: initialCompleted,
}: LessonProgressButtonProps) {
  const t = useTranslations("member.lesson");
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggleProgress() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const newCompleted = !completed;

    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

    setCompleted(newCompleted);
    setLoading(false);
  }

  return (
    <Button
      onClick={toggleProgress}
      disabled={loading}
      variant={completed ? "default" : "outline"}
      className={
        completed
          ? "bg-green-600 text-white hover:bg-green-700"
          : "border-white/20 text-white hover:border-gold hover:text-gold"
      }
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : completed ? (
        <CheckCircle className="mr-2 h-4 w-4" />
      ) : (
        <Circle className="mr-2 h-4 w-4" />
      )}
      {completed ? t("completed") : t("markCompleted")}
    </Button>
  );
}
