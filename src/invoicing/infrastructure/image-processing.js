import QrScanner from 'qr-scanner';

/** Carga un archivo de imagen como <img> lista para dibujar en un canvas */
export function cargarImagenComoElemento(archivo) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(archivo);
    });
}

/** Dibuja cualquier fuente (imagen, video, canvas) en un canvas nuevo, a su tamaño original */
export function dibujarEnCanvas(fuente, ancho, alto) {
    const canvas = document.createElement('canvas');
    canvas.width = ancho ?? fuente.naturalWidth ?? fuente.videoWidth ?? fuente.width;
    canvas.height = alto ?? fuente.naturalHeight ?? fuente.videoHeight ?? fuente.height;
    canvas.getContext('2d').drawImage(fuente, 0, 0, canvas.width, canvas.height);
    return canvas;
}

function clonarCanvas(origen) {
    const copia = document.createElement('canvas');
    copia.width = origen.width;
    copia.height = origen.height;
    copia.getContext('2d').drawImage(origen, 0, 0);
    return copia;
}

/** Escala de grises + binarización por umbral (blanco/negro puro) */
export function binarizar(canvasOrigen, umbral = 150) {
    const canvas = clonarCanvas(canvasOrigen);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gris = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const valor = gris > umbral ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = valor;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/** Aumenta el contraste alrededor del punto medio, sin llegar a blanco/negro puro — útil contra reflejos suaves */
export function aumentarContraste(canvasOrigen, factor = 1.6) {
    const canvas = clonarCanvas(canvasOrigen);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const valor = (data[i + c] - 128) * factor + 128;
            data[i + c] = Math.min(255, Math.max(0, valor));
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/** Nitidez (kernel de realce 3x3) — ayuda con fotos ligeramente movidas o de bajo detalle */
export function enfocar(canvasOrigen) {
    const canvas = clonarCanvas(canvasOrigen);
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const origData = ctx.getImageData(0, 0, width, height);
    const src = origData.data;
    const salida = ctx.createImageData(width, height);
    const dst = salida.data;
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                dst[idx] = src[idx]; dst[idx + 1] = src[idx + 1]; dst[idx + 2] = src[idx + 2]; dst[idx + 3] = src[idx + 3];
                continue;
            }
            for (let c = 0; c < 3; c++) {
                let suma = 0, k = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        suma += src[((y + ky) * width + (x + kx)) * 4 + c] * kernel[k];
                        k++;
                    }
                }
                dst[idx + c] = Math.min(255, Math.max(0, suma));
            }
            dst[idx + 3] = src[idx + 3];
        }
    }
    ctx.putImageData(salida, 0, 0);
    return canvas;
}

/**
 * Intenta decodificar un QR probando la imagen original y varias versiones
 * procesadas (contraste, nitidez, binarizado en distintos umbrales), hasta
 * que alguna funcione. Sirve para QR pequeños, arrugados o con reflejos,
 * donde una sola técnica no siempre alcanza.
 */
export async function decodificarConVariantes(canvasOriginal) {
    const variantes = [
        canvasOriginal,
        aumentarContraste(canvasOriginal, 1.6),
        enfocar(canvasOriginal),
        binarizar(canvasOriginal, 120),
        binarizar(canvasOriginal, 150),
        binarizar(canvasOriginal, 180),
    ];

    for (const variante of variantes) {
        try {
            return await QrScanner.scanImage(variante, { returnDetailedScanResult: true });
        } catch {
            // probamos la siguiente variante
        }
    }

    throw new Error('No se pudo leer el QR en ninguna de las variantes probadas.');
}