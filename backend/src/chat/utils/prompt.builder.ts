export function buildPrompt(
  recentMessages: { prompt: string; response: string }[],
  relevantDocs: string[],
  userPrompt: string
): string {
  const history = recentMessages.map(m => `User: ${m.prompt}\nAssistant: ${m.response}`).join('\n');
  const context = relevantDocs.join('\n');

  return `${context}\n\n${history}\n\nUser: ${userPrompt}\nAssistant:`;
}
