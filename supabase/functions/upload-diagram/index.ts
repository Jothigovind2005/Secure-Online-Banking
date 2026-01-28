import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.user.id

    // Parse multipart form data
    const formData = await req.formData()
    const snippetId = formData.get('snippet_id') as string
    const imageFile = formData.get('image') as File
    const base64Image = formData.get('base64_image') as string

    if (!snippetId) {
      return new Response(
        JSON.stringify({ error: 'Missing snippet_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify snippet ownership
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('id')
      .eq('id', snippetId)
      .eq('owner', userId)
      .single()

    if (snippetError || !snippet) {
      return new Response(
        JSON.stringify({ error: 'Snippet not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let fileBuffer: ArrayBuffer
    let fileName: string
    let contentType: string

    if (imageFile) {
      // Handle file upload
      fileBuffer = await imageFile.arrayBuffer()
      fileName = `${snippetId}-${Date.now()}.${imageFile.name.split('.').pop()}`
      contentType = imageFile.type
    } else if (base64Image) {
      // Handle base64 image
      const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) {
        return new Response(
          JSON.stringify({ error: 'Invalid base64 image format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      contentType = matches[1]
      const base64Data = matches[2]
      
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      fileBuffer = bytes.buffer
      
      const extension = contentType.split('/')[1]
      fileName = `${snippetId}-${Date.now()}.${extension}`
    } else {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('diagrams')
      .upload(fileName, fileBuffer, {
        contentType,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('diagrams')
      .getPublicUrl(fileName)

    const diagramUrl = urlData.publicUrl

    // Update snippet with diagram URL
    const { error: updateError } = await supabase
      .from('snippets')
      .update({ diagram_url: diagramUrl })
      .eq('id', snippetId)

    if (updateError) {
      console.error('Update snippet error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update snippet with diagram URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        diagram_url: diagramUrl,
        file_path: uploadData.path
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Upload diagram function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})