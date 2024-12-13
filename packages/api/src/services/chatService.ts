export async function startNewChat(): Promise<string> {
  return "Welcome to the I Ching consultation. How may I assist you today?";
}

export async function processMessage(content: string): Promise<string> {
  // Basic message processing - can be enhanced later
  return `Processing your message: ${content}`;
} 