import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const bookId = searchParams.get('bookId')
  const chapter = Number(searchParams.get('chapter'))

  if (!bookId || !chapter || isNaN(chapter)) {
    return NextResponse.json({ error: 'bookId and chapter are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('verses')
    .select('verse_number, text')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse_number')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
