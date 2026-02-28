import ModelClient, { isUnexpected } from '@azure-rest/ai-inference'
import { AzureKeyCredential } from '@azure/core-auth'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

/**
 * 生成文件总结
 * @param {string} fileContent - 文件内容
 * @param {string} customPrompt - 用户自定义的提示词（可选）
 * @param {string} defaultPrompt - 默认提示词
 * @returns {Promise<string>} 生成的总结
 */
export async function generateSummary(fileContent, customPrompt, defaultPrompt) {
  const prompt = customPrompt || defaultPrompt || '请用中文生成一份简洁的文档总结，包括主要内容、关键点和结论。'
  
  console.log('[generateSummary] Custom Prompt:', customPrompt)
  console.log('[generateSummary] Default Prompt:', defaultPrompt)
  console.log('[generateSummary] Used Prompt:', prompt)
  
  // 限制输入长度以避免超过 token 限制
  const maxInputLength = 8000
  const truncatedContent = fileContent.length > maxInputLength 
    ? fileContent.substring(0, maxInputLength) + '...'
    : fileContent

  const systemPrompt = prompt

  try {
    // 优先使用 GitHub token，其次使用 OpenAI key
    const githubToken = process.env.GITHUB_TOKEN
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (githubToken) {
      // 使用 GitHub Models API with Azure REST SDK
      const endpoint = 'https://models.github.ai/inference'
      const model = 'openai/gpt-4.1-mini'
      
      const client = ModelClient(
        endpoint,
        new AzureKeyCredential(githubToken),
      )

      const response = await client.path('/chat/completions').post({
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请总结以下文档内容：\n\n${truncatedContent}` }
          ],
          temperature: 0.7,
          top_p: 1.0,
          max_tokens: 1000,
          model: model
        }
      })

      if (isUnexpected(response)) {
        throw response.body.error || new Error('GitHub Models API error')
      }

      return response.body.choices[0].message.content
    } else if (openaiKey) {
      // 使用 OpenAI（API key 从环境变量自动读取）
      const model = openai('gpt-4o-mini')
      const { text } = await generateText({
        model,
        system: systemPrompt,
        prompt: `请总结以下文档内容：\n\n${truncatedContent}`,
        max_tokens: 1000,
      })
      return text
    } else {
      throw new Error('Neither GITHUB_TOKEN nor OPENAI_API_KEY is configured')
    }
  } catch (error) {
    console.error('AI Summary generation error:', error)
    throw new Error(`Failed to generate summary: ${error.message}`)
  }
}

/**
 * 建议的默认提示词
 */
export const DEFAULT_PROMPTS = {
  general: '请用中文生成一份简洁的文档总结，包括主要内容、关键点和结论。',
  technical: '请用中文总结以下技术文档，重点突出技术架构、核心概念和实现要点。',
  business: '请用中文总结以下商业文档，重点包括目标、关键指标和行动plan。',
  academic: '请用中文总结以下学术文档，重点突出研究问题、方法论和主要发现。'
}
