import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function CharityDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const charity = await prisma.charity.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!charity) {
    redirect("/");
  }
  return <>{children}</>;
}
