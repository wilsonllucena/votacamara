'use server'

import { createClient } from "@/utils/supabase/server"
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
        const fileName = fileUrl.split('/').pop()
        console.log(`Iniciando processamento IA para arquivo: ${fileName} (URL: ${fileUrl})`)
        
        const { data: fileBlob, error: downloadError } = fileName 
            ? await supabase.storage.from('projetos').download(fileName)
            : { data: null, error: new Error("Nome de arquivo não encontrado na URL") }

        if (downloadError || !fileBlob) {
            const errorMsg = downloadError ? (downloadError as any).message || JSON.stringify(downloadError) : "Arquivo não encontrado";
            console.warn(`Falha no download direto (${errorMsg}), tentando fetch fallback...`);
            
            const response = await fetch(fileUrl)
            if (!response.ok) {
                throw new Error(`Erro ao baixar arquivo (${response.status}): ${errorMsg}. Verifique as permissões do bucket 'projetos'.`)
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

        // 2. Processar Embeddings se tivermos um ID de projeto
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
        console.error("Erro ao resumir projeto:", error)
        return { error: error.message || "Erro desconhecido ao processar IA" }
    }
}

const projetoSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  ementa: z.string().min(10, "Ementa deve ser detalhada"),
  autor: z.string().min(2, "Autor é obrigatório"),
  autor_id: z.string().uuid("Vereador selecionado inválido").optional().or(z.literal("")),
  texto_url: z.string().url("URL do texto deve ser válida").optional().or(z.literal("")),
  status: z.enum(["Rascunho", "Em Pauta", "Votado"]),
})

export async function createProjeto(slug: string, prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const { data: camara } = await supabase
    .from("camaras")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!camara) {
      return { message: "Câmara não encontrada" }
  }

  const validatedFields = projetoSchema.safeParse({
    numero: formData.get("numero"),
    titulo: formData.get("titulo"),
    ementa: formData.get("ementa"),
    autor: formData.get("autor"),
    autor_id: formData.get("autor_id"),
    texto_url: formData.get("texto_url"),
    status: formData.get("status"),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { numero, titulo, ementa, autor, autor_id, texto_url, status } = validatedFields.data

  const { data: newProjeto, error } = await supabase.from("projetos").insert({
    camara_id: camara.id,
    numero,
    titulo,
    ementa,
    autor,
    autor_id: autor_id || null,
    texto_url: texto_url || null,
    status: status === "Em Pauta" ? "em_pauta" : status.toLowerCase()
  }).select("id").single()

  if (error) {
    return { error: "Erro ao criar projeto: " + error.message }
  }

  // Se houver PDF, processar embeddings em background (opcionalmente)
  if (texto_url && newProjeto?.id) {
    summarizeProject(texto_url, newProjeto.id).catch(console.error)
  }

  revalidatePath(`/admin/${slug}/projetos`)
  return { success: true }
}

export async function updateProjeto(slug: string, id: string, data: z.infer<typeof projetoSchema>) {
    const supabase = await createClient()

    const validatedFields = projetoSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: validatedFields.error.message }
    }

    const { numero, titulo, ementa, autor, autor_id, texto_url, status } = validatedFields.data

    const { error } = await supabase
        .from("projetos")
        .update({
            numero,
            titulo,
            ementa,
            autor,
            autor_id: autor_id || null,
            texto_url: texto_url || null,
            status: status === "Em Pauta" ? "em_pauta" : status.toLowerCase()
        })
        .eq("id", id)

    if (error) {
        return { error: "Erro ao atualizar projeto: " + error.message }
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
        return { error: "Não é possível excluir um projeto que está vinculado a uma sessão (pauta)." }
    }

    // 1. Buscar o projeto para obter a URL do arquivo
    const { data: projeto } = await supabase
        .from("projetos")
        .select("texto_url")
        .eq("id", id)
        .single()

    // 2. Apagar do banco
    const { error } = await supabase
        .from("projetos")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: "Erro ao excluir projeto: " + error.message }
    }

    // 3. Se houver arquivo no Storage, apagar
    if (projeto?.texto_url && projeto.texto_url.includes('projetos')) {
        const fileName = projeto.texto_url.split('/').pop()
        if (fileName) {
            await supabase.storage
                .from('projetos')
                .remove([fileName])
        }
    }

    revalidatePath(`/admin/${slug}/projetos`)
    return { success: true }
}
