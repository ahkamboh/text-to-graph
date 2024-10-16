import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function sanitizeMermaidCode(code: string): string {
  let sanitized = code
    .replace(/```mermaid\n?/, '')
    .replace(/```\n?$/, '')
    .trim();

  if (!sanitized.startsWith('graph')) {
    sanitized = 'graph LR\n' + sanitized;
  }

  sanitized = sanitized
    .replace(/\|>/g, '|')
    .replace(/-->/g, ' --> ')
    .replace(/(\w+)\s*\[/g, '$1[')  // Ensure space before [
    .replace(/\]\s*-->/g, '] -->')  // Ensure space after ]
    .replace(/\|\s*(\w)/g, '|$1')   // Remove space after |
    .replace(/(\w)\s*\|/g, '$1|')   // Remove space before |
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  return sanitized;
}

export async function POST(request: Request) {
  const { prompt } = await request.json();

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Generate a Mermaid graph based on the user's description. Use 'graph LR' for left-to-right graphs. Use proper Mermaid syntax with --> for arrows and |text| for labels. Do not use |>. Respond only with the graph code, no explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
    });

    let mermaidCode = chatCompletion.choices[0]?.message?.content || "";
    mermaidCode = sanitizeMermaidCode(mermaidCode);

    return NextResponse.json({ mermaidCode });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate graph' }, { status: 500 });
  }
}
