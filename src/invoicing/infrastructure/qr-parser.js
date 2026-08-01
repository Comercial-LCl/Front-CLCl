/**
 * Parsea el contenido de un QR de factura peruana (formato SUNAT, campos separados por "|").
 * Orden esperado: rucEmisor|tipoComprobante|serie(+numero opcional)|numero|igv|importeTotal|fechaEmision|tipoDocReceptor|numDocReceptor
 *
 * El formato real varía entre facturas:
 * - Serie y número a veces vienen juntos en un solo campo con guion (ej. "F004-0000518"),
 *   a veces separados en dos campos (ej. "FE03" y "00000330").
 * - La fecha puede venir como yyyy-MM-dd, dd/mm/yyyy, dd-mm-yyyy, o ddMMyyyy sin separadores.
 *
 * Si aparece un QR con un formato distinto a estos, ajustar aquí — el resto del flujo
 * (formulario, store, api) no depende del formato exacto del QR.
 */

const LARGO_MAXIMO_SERIE_NUMERO = 20;

/** Recorta un campo al máximo que acepta el backend, por si aparece un QR todavía más raro */
function truncar(valor, maximo = LARGO_MAXIMO_SERIE_NUMERO) {
    if (!valor) return valor;
    return valor.slice(0, maximo);
}

/**
 * Separa serie y número desde los campos crudos del QR.
 * Si el campo de serie trae un guion (ej. "F004-0000518"), se divide ahí y se
 * ignora el campo de número por separado (suele venir en "0" o vacío en ese caso).
 * Si no trae guion, se usan ambos campos tal cual vienen del QR.
 */
function extraerSerieYNumero(campoSerie, campoNumero) {
    if (campoSerie && campoSerie.includes('-')) {
        const [serie, ...resto] = campoSerie.split('-');
        return {
            serie: truncar(serie),
            numero: truncar(resto.join('-')),
        };
    }

    return {
        serie: truncar(campoSerie),
        numero: truncar(campoNumero),
    };
}

/**
 * Normaliza una fecha a yyyy-MM-dd (lo que el backend espera).
 * Acepta ISO (la deja igual), dd/mm/yyyy, dd-mm-yyyy, o ddMMyyyy sin separadores.
 * Si no reconoce el formato, la devuelve tal cual para que el backend valide y falle
 * de forma explícita, en vez de mandar una fecha inventada.
 */
export function normalizarFecha(valor) {
    if (!valor) return valor;

    // Ya viene en ISO (o con hora pegada, ej. "2026-07-22T00:00:00")
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);

    // dd/mm/yyyy o dd-mm-yyyy
    const conSeparador = valor.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
    if (conSeparador) {
        const [, dia, mes, anio] = conSeparador;
        return `${anio}-${mes}-${dia}`;
    }

    // ddMMyyyy, sin separadores (8 dígitos seguidos)
    const sinSeparador = valor.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (sinSeparador) {
        const [, dia, mes, anio] = sinSeparador;
        return `${anio}-${mes}-${dia}`;
    }

    return valor;
}

export function parseFacturaQr(rawText) {
    const partes = rawText.split('|').map(p => p.trim());

    if (partes.length < 7) {
        throw new Error('El código QR no tiene el formato esperado de una factura.');
    }

    const { serie, numero } = extraerSerieYNumero(partes[2], partes[3]);

    return {
        proveedorRuc: partes[0],
        serie,
        numero,
        montoTotal: Number(partes[5]),
        fechaEmision: normalizarFecha(partes[6]),
    };
}