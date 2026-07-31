/**
 * Parsea el contenido de un QR de factura peruana (formato SUNAT, campos separados por "|").
 * Orden esperado: rucEmisor|tipoComprobante|serie|numero|igv|importeTotal|fechaEmision|tipoDocReceptor|numDocReceptor
 *
 * Si tus QR de prueba no calzan con este orden, ajusta los índices aquí — el resto
 * del flujo (formulario, store, api) no depende del formato exacto del QR.
 */
export function parseFacturaQr(rawText) {
    const partes = rawText.split('|').map(p => p.trim());

    if (partes.length < 7) {
        throw new Error('El código QR no tiene el formato esperado de una factura.');
    }

    return {
        proveedorRuc: partes[0],
        serie: partes[2],
        numero: partes[3],
        montoTotal: Number(partes[5]),
        fechaEmision: partes[6],
    };
}