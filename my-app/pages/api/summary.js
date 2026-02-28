const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY env vars')
}

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { content } = req.body
      if (!content) return res.status(400).json({ error: 'Missing content' })
      const { data, error } = await supabase.from('summaries').insert([{ content }]).select()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ inserted: data })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('summaries').select('*').order('created_at', { ascending: false }).limit(50)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ summaries: data })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
