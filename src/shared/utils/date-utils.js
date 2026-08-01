/** Formatea una fecha ISO (con o sin hora) a dd/mm/yyyy para mostrar en la UI.
 *  Si el valor no es una fecha válida, lo devuelve tal cual en vez de romper la vista. */
export function formatearFecha(valorIso) {
    if (!valorIso) return '—';

    const fecha = new Date(valorIso);
    if (isNaN(fecha.getTime())) return valorIso;

    return fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC', // evita que la hora local del navegador corra el día hacia atrás/adelante
    });
}