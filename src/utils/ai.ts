import { Transaction, Settings, ChatMessage, AIAction } from '../types';

export async function sendMessageToAI(
  message: string,
  chatHistory: ChatMessage[],
  settings: Settings,
  recentTransactions: Transaction[]
): Promise<{ response: string; action?: AIAction }> {
  try {
    if (!settings.aiApiKey || !settings.aiEndpoint) {
      throw new Error('AI configuration not set. Please configure your API key and endpoint in Settings.');
    }

    const systemPrompt = `You are a helpful financial assistant for SpendingAgain, a personal expense tracker. 

Context:
- User's recent transactions: ${JSON.stringify(recentTransactions.slice(-10))}
- Current date: ${new Date().toISOString().split('T')[0]}

You can help users with:
1. Adding transactions (expenses/income)
2. Analyzing spending patterns
3. Providing financial advice
4. Answering questions about their data

When users want to add a transaction, respond with a JSON object in this format:
{
  "action": "add_transaction",
  "payload": {
    "type": "expense" | "income",
    "amount": number,
    "description": "string",
    "category": "string",
    "currency": "string (default to USD if not specified)"
  }
}

For regular conversation, just respond normally without JSON.

Chat history:
${chatHistory.slice(-5).map(msg => `${msg.type}: ${msg.content}`).join('\n')}

Current message: ${message}`;

    const response = await fetch(settings.aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.aiApiKey}`
      },
      body: JSON.stringify({
        model: settings.aiModel || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    // Try to parse JSON action from response
    let action: AIAction | undefined;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        action = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Not a JSON response, treat as regular text
    }

    return {
      response: action ? 'I\'ll help you add that transaction!' : aiResponse,
      action
    };
  } catch (error) {
    console.error('AI API Error:', error);
    return {
      response: `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI service'}`
    };
  }
}