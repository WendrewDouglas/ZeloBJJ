export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { Sidebar } from "@/components/shared/sidebar";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
