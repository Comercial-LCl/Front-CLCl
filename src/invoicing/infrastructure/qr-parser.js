/**
 * Parsea el contenido de un QR de factura peruana (formato SUNAT, campos separados por "|").
 * Orden esperado: rucEmisor|tipoComprobante|serie|numero|igv|importeTotal|fechaEmision|tipoDocReceptor|numDocReceptor
 *
 * Si tus QR de prueba no calzan con este orden, ajusta los índices aquí — el resto
 * del flujo (formulario, store, api) no depende del formato exacto del QR.
 */

/**
 * Normaliza una fecha a yyyy-MM-dd (lo que el backend espera).
 * Acepta ISO (la deja igual) o dd/mm/yyyy - dd-mm-yyyy (la convierte).
 * Si no reconoce el formato, la devuelve tal cual para que el backend valide.
 */
export function normalizarFecha(valor) {
    if (!valor) return valor;

    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);

    const match = valor.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
    if (match) {
        const [, dia, mes, anio] = match;
        return `${anio}-${mes}-${dia}`;
    }

    return valor;
}

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
        fechaEmision: normalizarFecha(partes[6]),
    };
}