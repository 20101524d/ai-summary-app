import { createSupabaseServer } from '../../lib/supabaseServer'
import { generateSummary } from '../../lib/ai'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 获取现有总结
    const { file_id } = req.query

    if (!file_id) {
      return res.status(400).json({ error: 'file_id is required' })
    }

    try {
      const supabase = createSupabaseServer()
      const { data, error } = await supabase
        .from('summaries')
        .select('id, content, created_at, updated_at')
        .eq('file_id', file_id)
        .single()

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json(data || null)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'POST') {
    // 生成新总结
    const { file_id } = req.body

    if (!file_id) {
      return res.status(400).json({ error: 'file_id is required' })
    }

    try {
      const supabase = createSupabaseServer()

      // 1. 获取文件信息和已提取的文本内容
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('id, name, path, text')
        .eq('id', file_id)
        .single()

      if (fileError || !fileData) {
        return res.status(404).json({ error: 'File not found' })
      }

      // 使用数据库中存储的提取文本（对PDF已在上传时提取）
      let contentText = fileData.text || ''
      
      // 如果数据库中没有text，从storage读取（备用方案）
      if (!contentText) {
        const { data: fileContent, error: readError } = await supabase.storage
          .from('files')
          .download(fileData.path)

        if (readError || !fileContent) {
          return res.status(500).json({ error: 'Failed to read file content' })
        }

        try {
          const blob = fileContent
          contentText = await blob.text()
        } catch (err) {
          return res.status(500).json({ error: 'Failed to process file content' })
        }
      }

      // 2. 读取文件的自定义提示词，如果没有则使用默认提示词
      const { data: customPrompt } = await supabase
        .from('prompts')
        .select('prompt_text')
        .eq('file_id', file_id)
        .single()

      const { data: defaultPrompt } = await supabase
        .from('prompts')
        .select('prompt_text')
        .is('file_id', null)
        .eq('is_default', true)
        .single()

      console.log('[Summary API] File ID:', file_id)
      console.log('[Summary API] Custom Prompt found:', !!customPrompt)
      console.log('[Summary API] Custom Prompt text:', customPrompt?.prompt_text)
      console.log('[Summary API] Default Prompt found:', !!defaultPrompt)
      console.log('[Summary API] Default Prompt text:', defaultPrompt?.prompt_text)

      // 3. 调用 AI 生成总结
      const summary = await generateSummary(
        contentText,
        customPrompt?.prompt_text,
        defaultPrompt?.prompt_text
      )

      // 4. 查询是否已存在该文件的总结
      const { data: existingSummary } = await supabase
        .from('summaries')
        .select('id')
        .eq('file_id', file_id)
        .single()

      let result
      if (existingSummary) {
        // 更新现有总结
        const { error: updateError } = await supabase
          .from('summaries')
          .update({
            content: summary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSummary.id)

        if (updateError) {
          return res.status(500).json({ error: 'Failed to update summary' })
        }

        result = {
          summary_id: existingSummary.id,
          content: summary,
          updated: true,
        }
      } else {
        // 创建新总结
        const { data: newSummary, error: insertError } = await supabase
          .from('summaries')
          .insert([
            {
              file_id,
              content: summary,
              updated_at: new Date().toISOString(),
            },
          ])
          .select('id')
          .single()

        if (insertError) {
          return res.status(500).json({ error: 'Failed to save summary' })
        }

        result = {
          summary_id: newSummary.id,
          content: summary,
          updated: false,
        }
      }

      return res.status(200).json(result)
    } catch (error) {
      console.error('Summary API error:', error)
      return res.status(500).json({
        error: error.message || 'Failed to generate summary',
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

