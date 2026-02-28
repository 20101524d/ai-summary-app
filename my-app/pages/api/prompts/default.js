import { createSupabaseServer } from '../../../lib/supabaseServer'

export default async function handler(req, res) {
  const supabase = createSupabaseServer()

  if (req.method === 'GET') {
    // 获取默认提示词
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, prompt_text, created_at, updated_at')
        .is('file_id', null)
        .eq('is_default', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json(data || null)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'POST' || req.method === 'PUT') {
    // 创建或更新默认提示词
    const { prompt_text } = req.body

    if (!prompt_text || !prompt_text.trim()) {
      return res.status(400).json({ error: 'prompt_text is required and cannot be empty' })
    }

    try {
      // 检查是否已存在默认提示词
      const { data: existingDefault } = await supabase
        .from('prompts')
        .select('id')
        .is('file_id', null)
        .eq('is_default', true)
        .single()

      if (existingDefault) {
        // 更新现有默认提示词
        const { data, error } = await supabase
          .from('prompts')
          .update({
            prompt_text: prompt_text.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDefault.id)
          .select('id, prompt_text, created_at, updated_at')
          .single()

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({
          ...data,
          message: 'Default prompt updated successfully',
        })
      } else {
        // 创建新的默认提示词
        const { data, error } = await supabase
          .from('prompts')
          .insert([
            {
              file_id: null,
              prompt_text: prompt_text.trim(),
              is_default: true,
            },
          ])
          .select('id, prompt_text, created_at, updated_at')
          .single()

        if (error) {
          return res.status(500).json({ error: error.message })
        }

        return res.status(201).json({
          ...data,
          message: 'Default prompt created successfully',
        })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'DELETE') {
    // 删除默认提示词
    try {
      const { data: existingDefault } = await supabase
        .from('prompts')
        .select('id')
        .is('file_id', null)
        .eq('is_default', true)
        .single()

      if (!existingDefault) {
        return res.status(404).json({ error: 'Default prompt not found' })
      }

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', existingDefault.id)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ message: 'Default prompt deleted successfully' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
