'use client';

export default function AccountWindowContent({
  session,
  account,
  labels,
  onLogin,
  onLogout,
  onUpdateApiKey,
  onUpdateSetting,
  onUpdateSheetSetting,
}) {
  if (!session?.user) {
    return (
      <div className="h-full bg-[linear-gradient(180deg,rgba(10,14,25,0.98),rgba(7,9,16,1))] px-6 py-6 text-white">
        <h2 className="text-[24px] font-semibold text-white">Cuenta</h2>
        <p className="mt-2 max-w-[520px] text-[14px] leading-7 text-white/68">
          Inicia sesion con Google para guardar perfil, creditos, permisos y configuracion por usuario.
        </p>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[13px] text-white/75">
            El acceso usa Google Login. Revisa GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET si aun no funciona en tu dominio.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-4 rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-slate-950"
          >
            {labels.signinGoogle}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[linear-gradient(180deg,rgba(10,14,25,0.98),rgba(7,9,16,1))] px-6 py-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <img src={session.user.image} alt={session.user.name || 'Usuario'} className="h-14 w-14 rounded-full border border-white/10 object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[20px]">
              {session.user.name?.[0] || 'U'}
            </div>
          )}
          <div>
            <h2 className="text-[24px] font-semibold text-white">{account.settings.displayName || session.user.name || 'Cuenta'}</h2>
            <p className="mt-1 text-[14px] text-white/62">{session.user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] text-white/72"
        >
          {labels.signout}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/85">Uso y creditos</p>
          <div className="mt-4 space-y-3">
            <MetricRow label="Credito disponible" value={`$${account.creditsUsd.toFixed(4)}`} />
            <MetricRow label="Consumo acumulado" value={`$${account.totalUsageUsd.toFixed(4)}`} />
            <MetricRow label="Prompts enviados" value={String(account.promptCount)} />
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-violet-300/85">Plan actual</p>
          <div className="mt-4 space-y-3">
            <MetricRow label="Plan" value={account.planName} />
            <MetricRow label="Estado" value={account.planStatus} />
            <p className="text-[12px] leading-6 text-white/48">{labels.readyForSaas}</p>
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/85">API Keys</p>
          <div className="mt-4 space-y-4">
            <ApiKeyField
              label="OpenAI API Key"
              value={account.apiKeys.openai}
              onChange={(value) => onUpdateApiKey('openai', value)}
            />
            <ApiKeyField
              label="Anthropic API Key"
              value={account.apiKeys.anthropic}
              onChange={(value) => onUpdateApiKey('anthropic', value)}
            />
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300/85">Configuracion basica</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/78">Nombre visible</span>
              <input
                value={account.settings.displayName}
                onChange={(event) => onUpdateSetting('displayName', event.target.value)}
                placeholder="Como quieres aparecer en la plataforma"
                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/78">{labels.sheetId}</span>
              <input
                value={account.settings.sheets.sheetId}
                onChange={(event) => onUpdateSheetSetting('sheetId', event.target.value)}
                placeholder="1AbC..."
                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] text-white/78">{labels.sheetTab}</span>
              <input
                value={account.settings.sheets.sheetTab}
                onChange={(event) => onUpdateSheetSetting('sheetTab', event.target.value)}
                placeholder="Historial"
                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <span className="text-[13px] text-white/78">Avisarme cuando el credito baje</span>
              <input
                type="checkbox"
                checked={account.settings.notifyCredits}
                onChange={(event) => onUpdateSetting('notifyCredits', event.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
      <span className="text-[13px] text-white/62">{label}</span>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  );
}

function ApiKeyField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] text-white/78">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="sk-..."
        className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
      />
    </label>
  );
}
