import { createSupabaseServer } from '../../../lib/supabaseServer'

export default async function handler(req, res) {
  const supabase = createSupabaseServer()

  if (req.method === 'GET') {
    // 获取所有提示词
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, file_id, prompt_text, is_default')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ prompts: data })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
