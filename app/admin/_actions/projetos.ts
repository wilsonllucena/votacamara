'use server'

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { generateSummary, generateEmbeddings } from "@/lib/ai"

function chunkText(text: string, size: number = 1000): string[] {
    const chunks: string[] = []
    const words = text.split(/\s+/)
    let currentChunk = ""

    for (const word of words) {
        if ((currentChunk + word).length > size) {
            chunks.push(currentChunk.trim())
            currentChunk = ""
        }
        currentChunk += word + " "
    }
    
    if (currentChunk) {
        chunks.push(currentChunk.trim())
    }
    
    return chunks
}

// Tenta carregar o pdf-parse-fork que é mais estável no Node
const pdf = require('pdf-parse-fork');

export async function summarizeProject(fileUrl: string, projetoId?: string) {
    const supabase = await createClient()
    
    // Pequeno delay para garantir que o storage propagou o arquivo
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    try {
        let buffer: ArrayBuffer
        
        // Tenta baixar via cliente Supabase primeiro (mais confiável em Server Actions)
        // A URL agora é no formato .../camara/slug/projetos/filename.pdf
        const urlParts = fileUrl.split('/camara/')
        const fullPath = urlParts[1]
        
        console.log(`Iniciando processamento IA para arquivo: ${fullPath} (URL: ${fileUrl})`)
        
        const { data: fileBlob, error: downloadError } = fullPath 
            ? await supabase.storage.from('camara').download(fullPath)
            : { data: null, error: new Error("Caminho do arquivo não encontrado na URL") }

        if (downloadError || !fileBlob) {
            const errorMsg = downloadError ? (downloadError as any).message || JSON.stringify(downloadError) : "Arquivo não encontrado";
            console.warn(`Falha no download direto (${errorMsg}), tentando fetch fallback...`);
            
            const response = await fetch(fileUrl)
            if (!response.ok) {
                throw new Error(`Erro ao baixar arquivo (${response.status}): ${errorMsg}. Verifique as permissões do bucket 'camara'.`)
            }
            buffer = await response.arrayBuffer()
        } else {
            buffer = await fileBlob.arrayBuffer()
        }
        if (buffer.byteLength === 0) {
            throw new Error("O arquivo baixado está vazio.")
        }

        const nodeBuffer = Buffer.from(buffer)
        
        // Diagnóstico: verificar se os primeiros bytes batem com o cabeçalho PDF
        const header = nodeBuffer.slice(0, 5).toString()
        console.log(`Diagnóstico Supabase Storage - Cabeçalho recebido: "${header}"`)
        
        if (header !== "%PDF-") {
            console.error("Conteúdo recebido não é um PDF válido:", nodeBuffer.slice(0, 50).toString())
            throw new Error(`O arquivo baixado do Supabase não é um PDF válido (recebido: ${header}). Verifique se o bucket é público.`)
        }

        const data = await pdf(nodeBuffer)
        const fullText = data.text
        
        // 1. Gerar Sumário e Título
        const aiResult = await generateSummary(fullText)

        // 2. Processar Embeddings se tivermos um ID de projeto (materia)
        if (projetoId) {
            const supabase = await createClient()
            
            // Limpar embeddings antigos desse projeto
            await supabase.from("projeto_documentos").delete().eq("projeto_id", projetoId)

            const chunks = chunkText(fullText)
            
            for (const chunk of chunks) {
                try {
                    const embedding = await generateEmbeddings(chunk)
                    await supabase.from("projeto_documentos").insert({
                        projeto_id: projetoId,
                        content: chunk,
                        embedding: embedding,
                        metadata: { source: fileUrl }
                    })
                } catch (embedError) {
                    console.error("Erro ao gerar/salvar embedding:", embedError)
                }
            }
        }
        
        return { success: true, ...aiResult }
    } catch (error: any) {
        console.error("Erro ao resumir materia:", error)
        return { error: error.message || "Erro desconhecido ao processar IA" }
    }
}

const projetoSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  ementa: z.string().min(10, "Ementa deve ser detalhada"),
  autor: z.string().optional(),
  autores_ids: z.array(z.string().uuid("Vereador selecionado inválido")).min(1, "Selecione pelo menos um autor"),
  texto_url: z.string().url("URL do texto deve ser válida").optional().or(z.literal("")),
  status: z.string().optional(),
  categoria_id: z.string().uuid("Categoria selecionada inválida").optional().or(z.literal("")),
  situacao: z.string().optional(),
  tipo_materia_id: z.string().uuid("Tipo de matéria selecionado inválido").optional().or(z.literal("")),
})

export async function createProjeto(slug: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return { message: "Câmara não encontrada" }
  }

  // Pegar múltiplos autores do formData
  const autores_ids = formData.getAll("autores_ids") as string[]

  const validatedFields = projetoSchema.safeParse({
    numero: formData.get("numero"),
    titulo: formData.get("titulo"),
    ementa: formData.get("ementa"),
    autores_ids: autores_ids,
    texto_url: formData.get("texto_url"),
    status: formData.get("status"),
    categoria_id: formData.get("categoria_id"),
    situacao: formData.get("situacao"),
    tipo_materia_id: formData.get("tipo_materia_id"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { numero, titulo, ementa, autores_ids: autores, texto_url, status, categoria_id, situacao, tipo_materia_id } = validatedFields.data

  let finalStatus = status ? (status === "Em Pauta" ? "em_pauta" : status.toLowerCase()) : "rascunho"

  // Sincronização básica baseada no texto da situação para compatibilidade
  if (situacao?.toUpperCase() === 'EM PAUTA') {
      finalStatus = "em_pauta"
  } else if (['VOTADA', 'APROVADA', 'REJEITADA'].includes(situacao?.toUpperCase() || "")) {
      finalStatus = "votado"
  }

  const { data: newProjeto, error } = await supabase.from("projetos").insert({
    camara_id: camara.id,
    numero,
    titulo,
    ementa,
    texto_url: texto_url || null,
    status: finalStatus,
    categoria_id: categoria_id || null,
    situacao: situacao || null,
    tipo_materia_id: tipo_materia_id || null
  }).select("id").single()

  if (error) {
    return { error: "Erro ao criar materia: " + error.message }
  }

  // Inserir autores na tabela de junção
  if (newProjeto?.id) {
    const authorsToInsert = autores.map(vereador_id => ({
        projeto_id: newProjeto.id,
        vereador_id
    }))

    const { error: authorsError } = await adminClient.from("projeto_autores").insert(authorsToInsert)
    if (authorsError) {
        console.error("Erro ao inserir autores:", authorsError)
    }
  }

  // Se houver PDF, processar embeddings em background
  if (texto_url && newProjeto?.id) {
    summarizeProject(texto_url, newProjeto.id).catch(console.error)
  }

  revalidatePath(`/admin/${slug}/projetos`)
  return { success: true }
}

export async function updateProjeto(slug: string, id: string, data: z.infer<typeof projetoSchema>) {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const validatedFields = projetoSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: validatedFields.error.message }
    }

    const { numero, titulo, ementa, autores_ids: autores, texto_url, status, categoria_id, situacao, tipo_materia_id } = validatedFields.data

    let finalStatus = status ? (status === "Em Pauta" ? "em_pauta" : status.toLowerCase()) : undefined

    // Sincronização básica baseada no texto da situação para compatibilidade
    if (situacao?.toUpperCase() === 'EM PAUTA') {
        finalStatus = "em_pauta"
    } else if (['VOTADA', 'APROVADA', 'REJEITADA'].includes(situacao?.toUpperCase() || "")) {
        finalStatus = "votado"
    }

    const { error } = await supabase
        .from("projetos")
        .update({
            numero,
            titulo,
            ementa,
            texto_url: texto_url || null,
            status: finalStatus,
            categoria_id: categoria_id || null,
            situacao: situacao || null,
            tipo_materia_id: tipo_materia_id || null
        })
        .eq("id", id)

    if (error) {
        return { error: "Erro ao atualizar materia: " + error.message }
    }

    // Atualizar autores (deletar antigos e inserir novos)
    await adminClient.from("projeto_autores").delete().eq("projeto_id", id)
    
    const authorsToInsert = autores.map(vereador_id => ({
        projeto_id: id,
        vereador_id
    }))

    const { error: authorsError } = await adminClient.from("projeto_autores").insert(authorsToInsert)
    if (authorsError) {
        console.error("Erro ao atualizar autores:", authorsError)
    }

    // Processar embeddings se a URL mudou ou for a primeira vez
    if (texto_url) {
        summarizeProject(texto_url, id).catch(console.error)
    }

    revalidatePath(`/admin/${slug}/projetos`)
    return { success: true }
}

export async function deleteProjeto(slug: string, id: string) {
    const supabase = await createClient()

    // Check if linked to pauta_itens (sessions)
    const { data: pautaItems, error: pautaError } = await supabase
        .from("pauta_itens")
        .select("id")
        .eq("projeto_id", id)
        .limit(1)

    if (pautaError) {
        return { error: "Erro ao verificar vínculos: " + pautaError.message }
    }

    if (pautaItems && pautaItems.length > 0) {
        return { error: "Não é possível excluir uma materia que está vinculada a uma sessão (pauta)." }
    }

    // 1. Buscar a materia para obter a URL do arquivo
    const { data: projeto } = await supabase
        .from("projetos")
        .select("texto_url")
        .eq("id", id)
        .single()

    // 2. Apagar do banco (projeto_autores será apagado via cascade se configurado, senão apagamos manualmente)
    // Na migration eu usei on delete cascade, mas por segurança podemos apagar.
    
    const { error } = await supabase
        .from("projetos")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: "Erro ao excluir materia: " + error.message }
    }

    // 3. Se houver arquivo no Storage, apagar
    if (projeto?.texto_url && projeto.texto_url.includes('camara')) {
        const urlParts = projeto.texto_url.split('/camara/')
        const fullPath = urlParts[1]
        if (fullPath) {
            await supabase.storage
                .from('camara')
                .remove([fullPath])
        }
    }

    revalidatePath(`/admin/${slug}/projetos`)
    return { success: true }
}

export async function getTiposMateria() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("tipos_materia")
        .select("*")
        .order("nome")
    
    if (error) {
        console.error("Erro ao buscar tipos de matéria:", error)
        return []
    }
    
    return data || []
}
