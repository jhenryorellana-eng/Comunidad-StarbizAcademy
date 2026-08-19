"use client";

import { Icon } from "@/components/icons";

/**
 * Descarga las filas como CSV.
 *
 * Se genera en el navegador con un Blob en vez de pedirlo a una ruta del
 * servidor: los datos ya están en la página, así que un viaje extra sólo
 * añadiría latencia y otro sitio donde equivocarse con los permisos.
 *
 * El BOM del principio no es adorno. Sin él, Excel en Windows abre el archivo
 * en la codificación del sistema y "Acompañante" sale como "AcompaÃ±ante" —
 * que en una lista de nombres de pasaporte es justo lo que no puede pasar.
 */
export function ExportCsv({
  rows,
  filename,
}: {
  rows: Array<Record<string, string>>;
  filename: string;
}) {
  function descargar() {
    if (rows.length === 0) return;
    const cols = Object.keys(rows[0]);
    // Comillas dobladas y campo entrecomillado: un nombre con coma o con
    // comilla no debe partir la fila.
    const esc = (s: string) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const csv = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => esc(r[c])).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={descargar}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-1.5 rounded-full border border-surface-line bg-paper px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-cyan/40 hover:text-cyan-700 disabled:opacity-40"
    >
      <Icon name="fileText" size={13} />
      Descargar CSV ({rows.length})
    </button>
  );
}
