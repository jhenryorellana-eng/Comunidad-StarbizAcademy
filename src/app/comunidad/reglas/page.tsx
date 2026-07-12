import { getDict } from "@/lib/i18n/server";
import { SpaceHeader } from "@/components/community/SpaceHeader";
import { Icon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";

/**
 * Reglas — infraestructura de confianza. Una sola columna, legible, sin
 * distracciones. Debe verse seria, no legal: un padre entra aquí a decidir
 * si deja entrar a su hijo.
 */
export default async function RulesPage() {
  const { dict } = await getDict();
  const R = dict.community.rules;

  return (
    <div className="mx-auto max-w-2xl">
      <SpaceHeader icon="shieldCheck" title={R.title} subtitle={R.subtitle} />

      <p className="mb-8 rounded-2xl border border-cyan/25 bg-cyan-50/50 p-5 text-[0.95rem] leading-relaxed text-ink/85">
        {R.intro}
      </p>

      <Stagger className="space-y-4">
        {R.items.map((rule, i) => (
          <StaggerItem
            key={rule.title}
            className="relative rounded-2xl border border-surface-line bg-paper p-6"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy font-display text-lg font-extrabold text-cyan-bright shadow-[0_0_14px_rgba(26,39,68,0.25)]">
                {i + 1}
              </span>
              <div>
                <h2 className="font-bold leading-snug text-navy">{rule.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{rule.body}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 rounded-2xl border border-surface-line bg-paper p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan ring-1 ring-cyan/25">
            <Icon name="members" size={20} />
          </span>
          <div>
            <h2 className="font-bold text-navy">{R.privacyTitle}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{R.privacyBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
