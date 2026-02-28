import { createSupabaseServer } from '../../../lib/supabaseServer'
import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parsePdf(buffer) {
  try {
    console.log('[PDF Parse] Starting PDF text extraction...')
    
    // pdf-parse is Node.js optimized library for PDF text extraction
    const { PDFParse } = require('pdf-parse')
    
    // Create parser instance and load PDF (must be Uint8Array, not Buffer)
    const uint8Array = new Uint8Array(buffer)
    const parser = new PDFParse(uint8Array)
    await parser.load()
    
    // Get text from all pages
    const result = await parser.getText()
    const data = { text: result.text, numpages: result.pages?.length || 1 }
    
    console.log('[PDF Parse] PDF parsed, pages:', data.numpages)
    console.log('[PDF Parse] Extracted text length:', data.text.length)
    
    return data.text || ''
    
  } catch (e) {
    console.error('[PDF Parse] Error:', e.message)
    return ''
  }
}

export default async function handler(req, res) {
  const supabase = createSupabaseServer()
  try {
    if (req.method === 'POST') {
      const form = new IncomingForm()
      
      // Wrap formidable callback in Promise
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err)
          else resolve({ fields, files })
        })
      })
      
      const fileArray = files.file || []
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray
      
      if (!file) return res.status(400).json({ error: 'no file provided' })
      
      const data = fs.readFileSync(file.filepath)
      const fileName = file.originalFilename || file.newFilename
      const contentType = file.mimetype || 'application/octet-stream'
      const path = `${Date.now()}_${fileName}`
      
      const { error: uploadError } = await supabase.storage.from('files').upload(path, data, { contentType })
      if (uploadError) return res.status(500).json({ error: uploadError.message })
      
      let text = ''
      if (contentType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        text = await parsePdf(data)
      } else if (fileName.toLowerCase().endsWith('.md')) {
        text = data.toString('utf-8')
      } else if (fileName.toLowerCase().endsWith('.txt')) {
        text = data.toString('utf-8')
      }
      
      const { data: dbData, error: dbError } = await supabase
        .from('files')
        .insert([{ name: fileName, type: contentType, path, text }])
        .select()
      
      if (dbError) return res.status(500).json({ error: dbError.message })
      
      const inserted = dbData[0]
      
      // Generate signed URL for PDF access (works with private buckets too)
      const { data: signedUrlData } = await supabase.storage
        .from('files')
        .createSignedUrl(path, 60 * 60 * 24) // 24 hours expiry
      
      const url = signedUrlData?.signedUrl || '' // Fallback to empty string
      
      return res.status(200).json({ file: { ...inserted, url } })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('files').select('*').order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      
      const list = await Promise.all(data.map(async (f) => {
        // Generate signed URL for each file (valid for 24 hours)
        const { data: signedUrlData } = await supabase.storage
          .from('files')
          .createSignedUrl(f.path, 60 * 60 * 24)
        
        return { 
          ...f, 
          url: signedUrlData?.signedUrl || '' 
        }
      }))
      
      return res.status(200).json({ files: list })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
