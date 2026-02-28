import { createSupabaseServer } from '../../../lib/supabaseServer'

export default async function handler(req, res) {
  const supabase = createSupabaseServer()
  const { id } = req.query
  if (req.method === 'DELETE') {
    // first fetch record to know path
    const { data: existing, error: selErr } = await supabase.from('files').select('path').eq('id', id).single()
    if (selErr) return res.status(500).json({ error: selErr.message })
    if (!existing) return res.status(404).json({ error: 'not found' })
    const { error: delErr } = await supabase.storage.from('files').remove([existing.path])
    if (delErr) {
      // continue even if file removal fails
      console.warn('storage remove error', delErr)
    }
    const { error } = await supabase.from('files').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ deleted: true })
  }
  res.setHeader('Allow', ['DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
