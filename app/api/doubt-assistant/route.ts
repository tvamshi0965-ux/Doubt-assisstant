import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = typeof body.question === 'string' ? body.question.trim() : ''
    if (!question) return NextResponse.json({ error: 'Question is required.' }, { status: 400 })

    const result = await generateText({
      model: 'openai/gpt-5-mini',
      system: 'You are EDUTECH Doubt Assistant. Explain academic questions clearly and patiently. Use short steps, examples when helpful, and do not pretend to know uncertain facts.',
      prompt: question,
    })
    return NextResponse.json({ answer: result.text })
  } catch (error) {
    console.error('[v0] Doubt Assistant request failed:', error)
    return NextResponse.json({ error: 'The assistant is temporarily unavailable. Please try again.' }, { status: 500 })
  }
}
