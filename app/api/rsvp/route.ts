import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const name = String(body?.name ?? '').trim()
  const status = body?.status === 'not-going' ? 'not-going' : body?.status === 'going' ? 'going' : null
  const guests = Number(body?.guests ?? 1)
  const comment = String(body?.comment ?? '').trim() || null

  if (name.length < 2 || name.length > 120 || !status || !Number.isInteger(guests) || guests < 1 || guests > 4) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('rsvps').insert({ name, status, guests, comment })

    if (error) {
      return NextResponse.json({ error: 'No se pudo guardar la respuesta' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar la respuesta' }, { status: 500 })
  }
}
