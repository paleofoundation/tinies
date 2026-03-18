/** Deterministic conversation id from two user ids (sorted). */
export function getConversationId(userId1: string, userId2: string): string {
  const [a, b] = [userId1, userId2].sort();
  return `conv_${a}_${b}`;
}
