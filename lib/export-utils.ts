import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ExportData {
    title: string
    camaraName: string
    date: string
    columns: string[]
    rows: any[][]
    fileName: string
}

export const exportToPDF = (data: ExportData) => {
    const { title, camaraName, date, columns, rows, fileName } = data
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text(camaraName, 105, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text(title, 105, 30, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`Data: ${date}`, 105, 38, { align: 'center' })

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 45, 190, 45)

    // Table
    autoTable(doc, {
        startY: 50,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
            `Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })} - VotaCâmara`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    doc.save(`${fileName}.pdf`)
}

export const exportToExcel = (data: ExportData) => {
    const { title, camaraName, date, columns, rows, fileName } = data
    
    // Preparar dados para o Excel
    const worksheetData = [
        [camaraName],
        [title],
        [`Data: ${date}`],
        [], // Linha vazia
        columns,
        ...rows
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Presença")

    // Salvar
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
