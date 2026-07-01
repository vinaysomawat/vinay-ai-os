import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const error = params.error
  const message = params.message

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Vinay AI OS</h1>
          <p className="text-sm text-slate-500 mt-1">Your personal AI operating system</p>
        </div>

        {/* Alerts */}
        {error === 'invalid_credentials' && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            Invalid email or password.
          </div>
        )}
        {error === 'signup_failed' && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            Signup failed. Try a stronger password (min 6 chars).
          </div>
        )}
        {message === 'check_email' && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
            Check your email to confirm your account, then sign in.
          </div>
        )}

        {/* Form */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
          <form className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                formAction={login}
                className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
              >
                Sign in
              </button>
              <button
                formAction={signup}
                className="flex-1 py-2.5 rounded-lg bg-surface-2 border border-surface-3 text-slate-300 text-sm font-medium hover:bg-surface-3 transition-colors"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
