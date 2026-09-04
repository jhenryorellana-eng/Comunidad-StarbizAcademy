"use client";

/**
 * Abre el diálogo de impresión del navegador.
 *
 * Desde ahí se guarda como PDF. Se evaluó generar el PDF en el servidor, pero
 * eso obliga a meter un navegador headless en el despliegue —decenas de megas
 * en una función serverless— para producir un documento de una página que
 * alguien va a revisar de todos modos antes de enviarlo.
 */
export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-cyan px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-700"
    >
      Imprimir o guardar PDF
    </button>
  );
}
