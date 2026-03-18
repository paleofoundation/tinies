import { redirect } from "next/navigation";
import { getOrCreateConversation } from "../../actions";

type Props = { params: Promise<{ userId: string }> };

export default async function WithUserPage({ params }: Props) {
  const { userId } = await params;
  const { conversationId, error } = await getOrCreateConversation(userId);
  if (error || !conversationId) {
    redirect("/dashboard/messages");
  }
  redirect(`/dashboard/messages/${conversationId}`);
}
