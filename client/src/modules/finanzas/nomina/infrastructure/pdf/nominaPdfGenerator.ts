import PDFDocument from 'pdfkit';
import { Payroll, Employee } from '@shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Detalles para el desprendible de nómina
 */
interface DetallesDesprendible {
  empleado: {
    id: number;
    nombre: string;
    puesto: string;
    departamento: string;
    identificacion?: string;
    tipoContrato?: string;
  };
  nomina: {
    id: number;
    periodoInicio: Date;
    periodoFin: Date;
    fechaPago: Date | null;
    montoBruto: number;
    montoNeto: number;
    deducciones: number;
    beneficios: number;
    impuestos: number;
    estado: string;
  };
  conceptos: {
    ingresos: Array<{ concepto: string; monto: number }>;
    deducciones: Array<{ concepto: string; monto: number }>;
    beneficios: Array<{ concepto: string; monto: number }>;
  };
}

/**
 * Generador de PDF para desprendibles de nómina
 */
export class NominaPdfGenerator {
  /**
   * Genera un desprendible de nómina en formato PDF
   */
  generarDesprendible(
    nomina: Payroll,
    empleado: Employee,
    nombreEmpleado: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Desprendible de Nómina - ${nombreEmpleado}`,
            Author: 'XTask ERP',
            Subject: `Periodo ${format(nomina.periodStart, 'MMMM yyyy', { locale: es })}`
          }
        });

        // Buffer para almacenar el PDF
        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', err => reject(err));

        // Obtener datos de cálculo de la nómina
        const detallesCalculo = nomina.calculationDetails 
          ? JSON.parse(nomina.calculationDetails) 
          : null;

        // Preparar detalles para el desprendible
        const detalles: DetallesDesprendible = {
          empleado: {
            id: empleado.id,
            nombre: nombreEmpleado,
            puesto: empleado.position,
            departamento: empleado.department,
            identificacion: empleado.identification,
            tipoContrato: empleado.contractType
          },
          nomina: {
            id: nomina.id,
            periodoInicio: nomina.periodStart,
            periodoFin: nomina.periodEnd,
            fechaPago: nomina.paymentDate,
            montoBruto: parseFloat(nomina.grossSalary.toString()),
            montoNeto: parseFloat(nomina.netSalary.toString()),
            deducciones: parseFloat(nomina.deductions.toString()),
            beneficios: parseFloat(nomina.benefits.toString()),
            impuestos: parseFloat(nomina.taxes.toString()),
            estado: nomina.status
          },
          conceptos: detallesCalculo?.conceptos || {
            ingresos: [{ concepto: 'Sueldo Base', monto: parseFloat(nomina.grossSalary.toString()) }],
            deducciones: [
              { concepto: 'Deducciones Estándar', monto: parseFloat(nomina.deductions.toString()) - parseFloat(nomina.taxes.toString()) },
              { concepto: 'Impuestos', monto: parseFloat(nomina.taxes.toString()) }
            ],
            beneficios: [
              { concepto: 'Beneficios Estándar', monto: parseFloat(nomina.benefits.toString()) }
            ]
          }
        };

        // Diseñar el PDF
        this.diseñarDesprendible(doc, detalles);
        
        // Finalizar documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Diseña el contenido del desprendible de nómina
   */
  private diseñarDesprendible(doc: PDFKit.PDFDocument, detalles: DetallesDesprendible): void {
    // Colores
    const colores = {
      primario: '#251948',
      secundario: '#02BDEA',
      acento: '#623BA6',
      destacado: '#FFA41B',
      gris: '#DDDDDD',
      grisOscuro: '#999999'
    };

    // Encabezado
    doc.fontSize(20)
       .fillColor(colores.primario)
       .text('XTask ERP', { align: 'left' });
      
    doc.fontSize(14)
       .fillColor(colores.secundario)
       .text('DESPRENDIBLE DE PAGO', { align: 'center' })
       .moveDown(0.5);

    // Marco para el período
    doc.roundedRect(50, doc.y, doc.page.width - 100, 30, 5)
       .fillAndStroke(colores.acento, colores.acento);
    
    doc.fillColor('white')
       .fontSize(12)
       .text(
         `Período: ${format(detalles.nomina.periodoInicio, 'dd/MM/yyyy')} - ${format(detalles.nomina.periodoFin, 'dd/MM/yyyy')}`,
         50, doc.y - 23, { align: 'center', width: doc.page.width - 100 }
       )
       .moveDown(1);

    // Información del empleado
    doc.fillColor(colores.primario)
       .fontSize(12)
       .text('Información del Empleado', { underline: true })
       .moveDown(0.5);
    
    const tablaDatosEmpleado = {
      headers: ['Nombre', 'ID', 'Cargo', 'Departamento', 'Tipo Contrato'],
      rows: [[
        detalles.empleado.nombre,
        detalles.empleado.id.toString(),
        detalles.empleado.puesto,
        detalles.empleado.departamento,
        detalles.empleado.tipoContrato || 'N/A'
      ]]
    };
    
    this.dibujarTabla(doc, tablaDatosEmpleado, 10, colores);
    doc.moveDown(1);

    // Información de pago
    doc.fillColor(colores.primario)
       .fontSize(12)
       .text('Detalle de Pago', { underline: true })
       .moveDown(0.5);
    
    // Ingresos
    doc.fontSize(10)
       .fillColor(colores.acento)
       .text('Ingresos', { continued: true })
       .fillColor(colores.grisOscuro)
       .text('                                                                    Monto')
       .moveDown(0.25);
    
    detalles.conceptos.ingresos.forEach(item => {
      doc.fillColor('black')
         .text(item.concepto, { continued: true, width: 300 })
         .text(`$${item.monto.toFixed(2)}`, { align: 'right' });
    });
    
    doc.moveDown(0.5);
    
    // Beneficios
    doc.fillColor(colores.acento)
       .text('Beneficios', { continued: true })
       .fillColor(colores.grisOscuro)
       .text('                                                                   Monto')
       .moveDown(0.25);
    
    detalles.conceptos.beneficios.forEach(item => {
      doc.fillColor('black')
         .text(item.concepto, { continued: true, width: 300 })
         .text(`$${item.monto.toFixed(2)}`, { align: 'right' });
    });
    
    doc.moveDown(0.5);
    
    // Deducciones
    doc.fillColor(colores.acento)
       .text('Deducciones', { continued: true })
       .fillColor(colores.grisOscuro)
       .text('                                                                 Monto')
       .moveDown(0.25);
    
    detalles.conceptos.deducciones.forEach(item => {
      doc.fillColor('black')
         .text(item.concepto, { continued: true, width: 300 })
         .text(`$${item.monto.toFixed(2)}`, { align: 'right' });
    });
    
    // Línea divisoria
    doc.moveDown(0.5)
       .strokeColor(colores.gris)
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke()
       .moveDown(0.5);
    
    // Totales
    doc.fillColor(colores.primario)
       .fontSize(12)
       .text('Total Ingresos:', { continued: true, width: 300 })
       .text(`$${detalles.nomina.montoBruto.toFixed(2)}`, { align: 'right' })
       .text('Total Beneficios:', { continued: true, width: 300 })
       .text(`$${detalles.nomina.beneficios.toFixed(2)}`, { align: 'right' })
       .text('Total Deducciones:', { continued: true, width: 300 })
       .text(`$${(detalles.nomina.deducciones + detalles.nomina.impuestos).toFixed(2)}`, { align: 'right' })
       .moveDown(0.5);
    
    // Marco para el total neto
    doc.roundedRect(doc.page.width - 250, doc.y, 200, 40, 5)
       .fillAndStroke(colores.destacado, colores.destacado);
    
    doc.fillColor('black')
       .fontSize(14)
       .text('TOTAL NETO A PAGAR:', doc.page.width - 250, doc.y - 35, { width: 100 })
       .fontSize(16)
       .text(`$${detalles.nomina.montoNeto.toFixed(2)}`, doc.page.width - 135, doc.y - 35, { align: 'right', width: 80 });
    
    doc.moveDown(3);
    
    // Información adicional
    doc.fontSize(10)
       .fillColor(colores.grisOscuro);
    
    const estadoPago = detalles.nomina.estado === 'paid' 
      ? `PAGADO (${detalles.nomina.fechaPago ? format(detalles.nomina.fechaPago, 'dd/MM/yyyy') : 'Fecha no registrada'})`
      : 'PENDIENTE DE PAGO';
    
    doc.text(`Estado: ${estadoPago}`, { align: 'center' })
       .text(`Referencia: ${detalles.nomina.id}`, { align: 'center' })
       .text(`Documento generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, { align: 'center' });
    
    // Pie de página
    doc.fontSize(8)
       .text('Este documento es un comprobante de pago y no requiere firma. Para cualquier aclaración, favor de comunicarse con el departamento de Recursos Humanos.', {
         align: 'center',
         width: doc.page.width - 100
       });
  }

  /**
   * Dibuja una tabla en el documento PDF
   */
  private dibujarTabla(
    doc: PDFKit.PDFDocument, 
    tabla: { headers: string[]; rows: string[][] }, 
    padding: number,
    colores: Record<string, string>
  ): void {
    const { headers, rows } = tabla;
    const rowHeight = 20;
    const colWidths = this.calcularAnchoColumnas(doc, tabla);
    let y = doc.y;
    
    // Dibujar encabezados
    let x = 50;
    doc.fillColor(colores.primario)
       .fontSize(10);
    
    headers.forEach((header, i) => {
      doc.text(header, x + padding, y + padding, { width: colWidths[i] - (padding * 2) });
      x += colWidths[i];
    });
    
    y += rowHeight;
    
    // Dibujar filas
    doc.fillColor('black');
    
    rows.forEach(row => {
      x = 50;
      row.forEach((cell, i) => {
        doc.text(cell, x + padding, y + padding, { width: colWidths[i] - (padding * 2) });
        x += colWidths[i];
      });
      y += rowHeight;
    });
    
    // Actualizar posición actual
    doc.y = y + padding;
  }

  /**
   * Calcula el ancho proporcional de las columnas
   */
  private calcularAnchoColumnas(
    doc: PDFKit.PDFDocument, 
    tabla: { headers: string[]; rows: string[][] }
  ): number[] {
    const numCols = tabla.headers.length;
    const pageWidth = doc.page.width - 100; // Márgenes
    
    // Proporciones para cada columna (ajustar según necesidad)
    const proporciones = [0.3, 0.1, 0.2, 0.2, 0.2]; // Nombre, ID, Cargo, Departamento, Tipo
    
    return proporciones.map(p => p * pageWidth);
  }
}