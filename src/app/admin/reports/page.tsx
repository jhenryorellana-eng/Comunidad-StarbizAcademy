import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveReport } from "../actions";
import { DeleteButton, PageTitle } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function AdminReports() {
  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });

  // Resolve report targets for readable context.
  const postIds = reports.filter((r) => r.targetType === "POST").map((r) => r.targetId);
  const userIds = reports.filter((r) => r.targetType === "MEMBER").map((r) => r.targetId);
  const [posts, users] = await Promise.all([
    prisma.post.findMany({ where: { id: { in: postIds } }, select: { id: true, title: true } }),
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } }),
  ]);
  const postTitle = new Map(posts.map((p) => [p.id, p.title]));
  const userName = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div>
      <PageTitle>Reportes</PageTitle>
      <p className="-mt-4 mb-6 text-sm text-muted">
        Moderación humana activa: cada reporte se revisa y se resuelve a mano.
      </p>

      {reports.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-line bg-paper p-8 text-center text-sm text-muted">
          No hay reportes pendientes. La comunidad está tranquila. ✅
        </p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => {
            const target =
              r.targetType === "POST"
                ? postTitle.get(r.targetId) ?? "(publicación eliminada)"
                : userName.get(r.targetId) ?? "(miembro eliminado)";
            return (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-surface-line bg-paper px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={r.targetType === "POST" ? "cyan" : "navy"}>
                      {r.targetType === "POST" ? "Publicación" : "Miembro"}
                    </Badge>
                    <p className="truncate font-semibold text-navy">{target}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(r.createdAt, "es")}
                    {r.reason ? ` · ${r.reason}` : ""}
                  </p>
                  {r.targetType === "POST" && postTitle.has(r.targetId) && (
                    <Link
                      href="/admin/posts"
                      className="text-xs font-medium text-cyan hover:underline"
                    >
                      Ver en moderación de posts →
                    </Link>
                  )}
                </div>
                <DeleteButton action={resolveReport} id={r.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
