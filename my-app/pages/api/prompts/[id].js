import { createSupabaseServer } from '../../../lib/supabaseServer'

export default async function handler(req, res) {
  const supabase = createSupabaseServer()
  const { file_id } = req.query

  if (req.method === 'GET') {
    // 获取指定文件的提示词，如果没有则获取默认提示词
    try {
      if (file_id && file_id !== 'default') {
        const { data: filePrompt, error } = await supabase
          .from('prompts')
          .select('id, prompt_text, file_id')
          .eq('file_id', parseInt(file_id))
          .single()

        if (error && error.code !== 'PGRST116') {
          return res.status(500).json({ error: error.message })
        }

        if (filePrompt) {
          return res.status(200).json(filePrompt)
        }

        // 如果没有文件特定的提示词，返回默认提示词
        const { data: defaultPrompt, error: defaultError } = await supabase
          .from('prompts')
          .select('id, prompt_text')
          .eq('file_id', null)
          .eq('is_default', true)
          .single()

        if (defaultError && defaultError.code !== 'PGRST116') {
          return res.status(500).json({ error: defaultError.message })
        }

        return res.status(200).json(defaultPrompt || null)
      } else {
        // 获取默认提示词
        const { data: defaultPrompt, error } = await supabase
          .from('prompts')
          .select('id, prompt_text')
          .eq('file_id', null)
          .eq('is_default', true)
          .single()

        if (error && error.code !== 'PGRST116') {
          return res.status(500).json({ error: error.message })
        }

        return res.status(200).json(defaultPrompt || null)
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'PUT' || req.method === 'POST') {
    // 更新或创建提示词
    const { prompt_text } = req.body

    if (!prompt_text) {
      return res.status(400).json({ error: 'prompt_text is required' })
    }

    try {
      if (file_id && file_id !== 'default') {
        // 更新或创建文件特定的提示词
        const { data: existing } = await supabase
          .from('prompts')
          .select('id')
          .eq('file_id', parseInt(file_id))
          .single()

        if (existing) {
          const { data, error } = await supabase
            .from('prompts')
            .update({ prompt_text, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) return res.status(500).json({ error: error.message })
          return res.status(200).json(data)
        } else {
          const { data, error } = await supabase
            .from('prompts')
            .insert([
              {
                file_id: parseInt(file_id),
                prompt_text,
                is_default: false,
              },
            ])
            .select()
            .single()

          if (error) return res.status(500).json({ error: error.message })
          return res.status(201).json(data)
        }
      } else {
        // 更新或创建默认提示词
        const { data: existing } = await supabase
          .from('prompts')
          .select('id')
          .eq('file_id', null)
          .eq('is_default', true)
          .single()

        if (existing) {
          const { data, error } = await supabase
            .from('prompts')
            .update({ prompt_text, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) return res.status(500).json({ error: error.message })
          return res.status(200).json(data)
        } else {
          const { data, error } = await supabase
            .from('prompts')
            .insert([
              {
                prompt_text,
                is_default: true,
              },
            ])
            .select()
            .single()

          if (error) return res.status(500).json({ error: error.message })
          return res.status(201).json(data)
        }
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'DELETE') {
    // 删除文件特定的提示词
    if (!file_id || file_id === 'default') {
      return res.status(400).json({ error: 'file_id is required for deletion' })
    }

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('file_id', parseInt(file_id))

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ deleted: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
