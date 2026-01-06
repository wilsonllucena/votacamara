'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * UTILS & HELPERS
 */

const LORA_REG_URL = "https://github.com/google/fonts/raw/main/ofl/lora/static/Lora-Regular.ttf"
const LORA_BOLD_URL = "https://github.com/google/fonts/raw/main/ofl/lora/static/Lora-Bold.ttf"

function formatCNPJ(cnpj: string) {
    if (!cnpj) return '---'
    const clean = cnpj.replace(/\D/g, '')
    if (clean.length !== 14) return cnpj
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

async function getBase64(url: string) {
    if (!url) return null
    try {
        const res = await fetch(url)
        if (!res.ok) return null
        const arrayBuffer = await res.arrayBuffer()
        return Buffer.from(arrayBuffer).toString('base64')
    } catch { return null }
}

async function setupPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const { format } = await import('date-fns')
    const { ptBR } = await import('date-fns/locale')

    const doc = new jsPDF() as any
    const pageWidth = doc.internal.pageSize.width

    // Load Fonts - Using Static versions to avoid jsPDF variable font crashes
    const reg64 = await getBase64(LORA_REG_URL)
    const bold64 = await getBase64(LORA_BOLD_URL)

    let loraLoaded = false
    try {
        if (reg64 && bold64) {
            doc.addFileToVFS("Lora-Regular.ttf", reg64)
            doc.addFont("Lora-Regular.ttf", "Lora", "normal")
            doc.addFileToVFS("Lora-Bold.ttf", bold64)
            doc.addFont("Lora-Bold.ttf", "Lora", "bold")
            loraLoaded = true
        }
    } catch (e) {
        console.error("Error loading Lora font:", e)
    }

    const setAppFont = (target: any, style: string = 'normal') => {
        const fontName = loraLoaded ? "Lora" : "helvetica"
        if (typeof target.setFont === 'function') {
            target.setFont(fontName, style)
        } else {
            target.font = fontName
            target.fontStyle = style
        }
    }

    return { doc, autoTable, format, ptBR, pageWidth, setAppFont, getBase64 }
}

function drawCommonHeader(doc: any, camara: any, logo64: string | null, pageWidth: number, setAppFont: any) {
    if (logo64) {
        doc.addImage(`data:image/png;base64,${logo64}`, 'PNG', 15, 10, 25, 25)
    }
    setAppFont(doc, "bold")
    doc.setFontSize(14)
    doc.text(camara.nome.toUpperCase(), pageWidth / 2 + 10, 20, { align: 'center' })
    
    setAppFont(doc, "normal")
    doc.setFontSize(11)
    doc.text("Poder Legislativo", pageWidth / 2 + 10, 26, { align: 'center' })
    
    doc.setFontSize(9)
    doc.text(`CNPJ: ${formatCNPJ(camara.cnpj)}`, pageWidth / 2 + 10, 32, { align: 'center' })
    
    doc.setLineWidth(0.5)
    doc.line(15, 38, pageWidth - 15, 38)
}

function drawCommonFooter(doc: any, camara: any, pageWidth: number, setAppFont: any) {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setLineWidth(0.5)
        doc.line(15, doc.internal.pageSize.height - 20, pageWidth - 15, doc.internal.pageSize.height - 20)
        doc.setFontSize(8)
        setAppFont(doc, "normal")
        const endereco = `${camara.endereco || ''}, ${camara.cidade || ''} - ${camara.uf || ''}`
        doc.text(endereco, pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' })
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 15, doc.internal.pageSize.height - 10, { align: 'right' })
    }
}

/**
 * SESSION REPORT ACTION
 */
export async function generateSessionReportAction(slug: string, sessaoId: string) {
    const supabase = await createClient()

    // 1. Data Fetching
    const { data: sessao, error: sError } = await supabase
        .from("sessoes")
        .select(`
            *,
            camaras (*),
            sessao_presencas (
                status,
                vereador_id,
                vereadores (id, nome, partido)
            ),
            votacoes (
                id,
                status,
                projeto_id,
                projetos (titulo, numero, ementa, autor),
                votos (valor, vereador_id)
            )
        `)
        .eq("id", sessaoId)
        .single()

    if (sError || !sessao) return { error: sError?.message || "Sessão não encontrada" }

    const { data: mesaRoles } = await supabase
        .from("mesa_diretora")
        .select("vereador_id, cargos(nome)")
        .eq("camara_id", sessao.camara_id)

    const rolesMap = new Map()
    mesaRoles?.forEach((m: any) => rolesMap.set(m.vereador_id, m.cargos?.nome))
    const presidenteId = mesaRoles?.find((m: any) => m.cargos?.nome === 'Presidente')?.vereador_id

    // 2. Setup PDF
    const { doc, autoTable, format, ptBR, pageWidth, setAppFont, getBase64: g64 } = await setupPDF()
    const camara = sessao.camaras as any
    const logo64 = await g64(camara.logo_url)

    // 3. Document Body
    drawCommonHeader(doc, camara, logo64, pageWidth, setAppFont)

    // Title
    doc.setFillColor(240, 240, 240)
    doc.rect(15, 42, pageWidth - 30, 10, 'F')
    doc.setFontSize(12)
    setAppFont(doc, "bold")
    doc.text("BOLETIM DE VOTAÇÃO NOMINAL", pageWidth / 2, 49, { align: 'center' })

    // Session Info
    doc.setDrawColor(200, 200, 200)
    doc.rect(15, 54, pageWidth - 30, 10)
    const ssData = format(new Date(sessao.iniciou_em), "dd 'DE' MMMM 'DE' yyyy", { locale: ptBR }).toUpperCase()
    doc.text(`${sessao.titulo.toUpperCase()} - ${ssData}`, pageWidth / 2, 61, { align: 'center' })

    let currentY = 70

    // Loop through Votations
    for (const votacao of sessao.votacoes) {
        if (currentY > 210) {
            doc.addPage()
            drawCommonHeader(doc, camara, logo64, pageWidth, setAppFont)
            currentY = 45
        }

        const projeto = votacao.projetos
        doc.setFillColor(252, 252, 252)
        doc.rect(15, currentY, pageWidth - 30, 8, 'F')
        doc.setFontSize(10)
        setAppFont(doc, "bold")
        doc.text(`${projeto.numero} - ${projeto.titulo}`.toUpperCase(), 20, currentY + 5.5)
        
        currentY += 10
        setAppFont(doc, "normal")
        doc.setFontSize(9)
        const emLines = doc.splitTextToSize(projeto.ementa || "", pageWidth - 40)
        doc.text(emLines, 20, currentY)
        currentY += (emLines.length * 4.5) + 2
        
        setAppFont(doc, "bold")
        doc.text(`Autoria: ${projeto.autor || "Não informado"}`, 20, currentY)
        currentY += 8

        const presencas = sessao.sessao_presencas
        const votos = votacao.votos || []
        const rows = presencas.map((p: any) => {
            const v = votos.find((vt: any) => vt.vereador_id === p.vereador_id)
            const isPresidente = p.vereador_id === presidenteId
            const role = rolesMap.get(p.vereador_id) || "Vereador(a)"
            const row = [`${p.vereadores.nome}\n${role}`]
            if (isPresidente) {
                row.push("N/A", "N/A", "N/A", "N/A")
            } else {
                const val = v?.valor
                row.push(
                    ['SIM', 'FAVORAVEL'].includes(val) ? "X" : "",
                    ['NAO', 'CONTRA'].includes(val) ? "X" : "",
                    val === 'ABSTENCAO' ? "X" : "",
                    p.status === 'ausente' ? "X" : ""
                )
            }
            return row
        })

        autoTable(doc, {
            startY: currentY,
            head: [["PARLAMENTARES", "Favor", "Contrário", "Abstenção", "Ausente"]],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1 },
            styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
            columnStyles: { 0: { cellWidth: 'auto', halign: 'left' }, 1: { cellWidth: 22 }, 2: { cellWidth: 22 }, 3: { cellWidth: 22 }, 4: { cellWidth: 22 } },
            margin: { left: 15, right: 15 },
            didParseCell: (data: any) => {
                // Ensure we use the right font in autotable
                setAppFont(data.cell.styles)
            }
        })

        currentY = (doc as any).lastAutoTable.finalY + 6
        const sim = votos.filter((v: any) => ['SIM', 'FAVORAVEL'].includes(v.valor)).length
        const nao = votos.filter((v: any) => ['NAO', 'CONTRA'].includes(v.valor)).length
        const abst = votos.filter((v: any) => v.valor === 'ABSTENCAO').length
        const aus = presencas.filter((p: any) => p.status === 'ausente').length
        const result = sim > nao ? "APROVADO" : "REJEITADO"

        autoTable(doc, {
            startY: currentY,
            body: [[
                { content: `DATA\n\n${format(new Date(sessao.iniciou_em), "dd/MM/yyyy")}\n${format(new Date(sessao.iniciou_em), "HH:mm")}`, styles: { halign: 'center', fontStyle: 'bold' } },
                { content: `APURAÇÃO\n\nFavoráveis: ${sim}   Contrários: ${nao}   Abstenções: ${abst}\nAusências: ${aus}   Votantes: ${sim+nao+abst}   Presentes: ${presencas.length - aus}`, styles: { halign: 'center' } },
                { content: `RESULTADO\n\n${result}`, styles: { halign: 'center', fontStyle: 'bold', fontSize: 10 } }
            ]],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 4, minCellHeight: 22 },
            margin: { left: 15, right: 15 },
            didParseCell: (data: any) => setAppFont(data.cell.styles)
        })

        currentY = (doc as any).lastAutoTable.finalY + 18
    }

    // Signatures
    if (currentY > 220) {
        doc.addPage()
        drawCommonHeader(doc, camara, logo64, pageWidth, setAppFont)
        currentY = 50
    }
    setAppFont(doc, "bold")
    doc.setFontSize(10).text("ASSINATURAS:", 15, currentY)
    currentY += 15
    
    const sigPresencas = sessao.sessao_presencas
    for (let i = 0; i < sigPresencas.length; i += 3) {
        if (currentY > 265) {
            doc.addPage()
            drawCommonHeader(doc, camara, logo64, pageWidth, setAppFont)
            currentY = 50
        }
        const chunk = sigPresencas.slice(i, i + 3)
        chunk.forEach((p: any, idx: number) => {
            const xPos = 15 + (idx * 60)
            const role = rolesMap.get(p.vereador_id) || "Vereador(a)"
            doc.setLineWidth(0.2)
            doc.line(xPos, currentY + 10, xPos + 50, currentY + 10)
            setAppFont(doc, "normal")
            doc.setFontSize(8).text(p.vereadores.nome, xPos + 25, currentY + 15, { align: 'center', maxWidth: 50 })
            doc.setFontSize(7).text(role, xPos + 25, currentY + 19, { align: 'center', maxWidth: 50 })
        })
        currentY += 30
    }

    drawCommonFooter(doc, camara, pageWidth, setAppFont)

    // Save and Upload
    const pdfArrayBuffer = doc.output('arraybuffer')
    const fileName = `boletim_consolidado_${sessaoId}_${Date.now()}.pdf`
    const filePath = `${slug}/relatorios/${fileName}`

    await supabase.storage.from('camara').upload(filePath, pdfArrayBuffer, { contentType: 'application/pdf' })
    const { data: { publicUrl } } = supabase.storage.from('camara').getPublicUrl(filePath)

    await supabase.from('relatorios_sessao').insert({
        sessao_id: sessaoId,
        tipo: 'SESSAO',
        url_pdf: publicUrl,
        camara_id: sessao.camara_id
    })

    revalidatePath(`/admin/${slug}/sessoes/relatorios`)
    return { success: true, url: publicUrl }
}

/**
 * MATTER REPORT ACTION
 */
export async function generateMatterReportAction(slug: string, sessaoId: string, materiaId: string) {
    const supabase = await createClient()

    const { data: sessao, error: sError } = await supabase
        .from("sessoes")
        .select(`
            *,
            camaras (*),
            sessao_presencas (status, vereador_id, vereadores (nome)),
            votacoes (id, projeto_id, projetos (*), votos (valor, vereador_id))
        `)
        .eq("id", sessaoId)
        .single()

    if (sError || !sessao) return { error: "Sessão não encontrada" }
    const votacaoItem = sessao.votacoes.find((v: any) => v.projeto_id === materiaId)
    if (!votacaoItem) return { error: "Votação não encontrada" }

    const { data: mesaRoles } = await supabase
        .from("mesa_diretora")
        .select("vereador_id, cargos(nome)")
        .eq("camara_id", sessao.camara_id)

    const rolesMap = new Map()
    mesaRoles?.forEach((m: any) => rolesMap.set(m.vereador_id, m.cargos?.nome))
    const presidenteId = mesaRoles?.find((m: any) => m.cargos?.nome === 'Presidente')?.vereador_id

    const { doc, autoTable, format, pageWidth, setAppFont, getBase64: g64 } = await setupPDF()
    const camara = sessao.camaras as any
    const logo64 = await g64(camara.logo_url)

    drawCommonHeader(doc, camara, logo64, pageWidth, setAppFont)

    doc.setFillColor(240, 240, 240).rect(15, 42, pageWidth - 30, 8, 'F')
    setAppFont(doc, "bold")
    doc.setFontSize(10).text("BOLETIM DE VOTAÇÃO NOMINAL", pageWidth / 2, 47, { align: 'center' })

    const p = votacaoItem.projetos as any
    setAppFont(doc, "bold")
    doc.text(`${p.numero} - ${p.titulo}`.toUpperCase(), 15, 58)
    const emLines = doc.splitTextToSize(p.ementa || "", pageWidth - 30)
    setAppFont(doc, "normal")
    doc.setFontSize(9).text(emLines, 15, 64)
    
    let currentY = 66 + (emLines.length * 4.5)

    const tableRows = sessao.sessao_presencas.map((pr: any) => {
        const v = votacaoItem.votos.find((v: any) => v.vereador_id === pr.vereador_id)
        const isPres = pr.vereador_id === presidenteId
        const role = rolesMap.get(pr.vereador_id) || "Vereador(a)"
        const row = [pr.vereadores.nome + "\n" + role]
        if (isPres) {
            row.push("N/A", "N/A", "N/A", "N/A")
        } else {
            row.push(
                ['SIM', 'FAVORAVEL'].includes(v?.valor) ? "X" : "",
                ['NAO', 'CONTRA'].includes(v?.valor) ? "X" : "",
                v?.valor === 'ABSTENCAO' ? "X" : "",
                pr.status === 'ausente' ? "X" : ""
            )
        }
        return row
    })

    autoTable(doc, {
        startY: currentY,
        head: [["PARLAMENTARES", "Favor", "Contrário", "Abstenção", "Ausente"]],
        body: tableRows,
        theme: 'grid',
        headStyles: { halign: 'center', fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
        didParseCell: (data: any) => setAppFont(data.cell.styles)
    })

    currentY = (doc as any).lastAutoTable.finalY + 15
    if (currentY > 230) { doc.addPage(); drawCommonHeader(doc, camara, logo64, pageWidth, setAppFont); currentY = 50; }
    setAppFont(doc, "bold")
    doc.setFontSize(10).text("ASSINATURAS:", 15, currentY);
    currentY += 15;
    
    sessao.sessao_presencas.forEach((p: any, idx: number) => {
        const rowIdx = Math.floor(idx / 3);
        const colIdx = idx % 3;
        const xPos = 15 + (colIdx * 60);
        const yPos = currentY + (rowIdx * 30);
        doc.setLineWidth(0.2)
        doc.line(xPos, yPos + 10, xPos + 50, yPos + 10);
        setAppFont(doc, "normal")
        doc.setFontSize(8).text(p.vereadores.nome, xPos + 25, yPos + 15, { align: 'center', maxWidth: 50 });
        doc.setFontSize(7).text(rolesMap.get(p.vereador_id) || "Vereador(a)", xPos + 25, yPos + 19, { align: 'center', maxWidth: 50 });
    });

    drawCommonFooter(doc, camara, pageWidth, setAppFont)

    const pdfBuffer = doc.output('arraybuffer')
    const fileName = `materia_${materiaId}_${Date.now()}.pdf`
    const filePath = `${slug}/relatorios/${fileName}`

    await supabase.storage.from('camara').upload(filePath, pdfBuffer, { contentType: 'application/pdf' })
    const { data: { publicUrl } } = supabase.storage.from('camara').getPublicUrl(filePath)

    await supabase.from('relatorios_sessao').insert({
        sessao_id: sessaoId,
        materia_id: materiaId,
        tipo: 'MATERIA',
        url_pdf: publicUrl,
        camara_id: sessao.camara_id
    })

    revalidatePath(`/admin/${slug}/sessoes/relatorios`)
    return { success: true, url: publicUrl }
}
