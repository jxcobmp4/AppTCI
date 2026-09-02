export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <div>
        <div className="mb-4 h-10 w-10 rounded-2xl bg-(--color-brand)" />
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido a Encuentro</h1>
        <p className="mt-1 text-sm text-(--color-fg-muted)">
          Inicia sesión con tu correo del equipo.
        </p>
      </div>

      <form className="space-y-3">
        <input
          type="email"
          placeholder="tu@correo.com"
          className="card w-full px-4 py-3 text-sm outline-none focus:border-(--color-brand)"
        />
        <button
          type="button"
          className="w-full rounded-xl bg-(--color-brand) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--color-brand-hover)"
        >
          Recibir enlace mágico
        </button>
      </form>

      <p className="text-center text-xs text-(--color-fg-subtle)">
        Autenticación real en la Fase 3.
      </p>
    </div>
  );
}
