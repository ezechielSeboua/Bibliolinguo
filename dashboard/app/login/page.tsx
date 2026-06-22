'use client'

import { useActionState, useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react'
import { loginAction, resetPasswordAction, type LoginState } from './actions'

const initialState: LoginState = { error: null }

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [resetState, setResetState] = useState<{ status: 'idle' | 'sent' | 'error'; message?: string }>({ status: 'idle' })
  const [resetPending, startResetTransition] = useTransition()
  const emailRef = useRef<HTMLInputElement>(null)

  return (
    <div className="min-h-screen flex bg-white">
      {/* ---------- Panneau gauche : immersion & branding ---------- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
        {/* Cercles lumineux décoratifs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/10 to-transparent rounded-full blur-2xl" />

        {/* Motif discret de lignes courbes */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <path
            d="M0 400 Q300 200 600 400 T1200 400"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M0 500 Q400 700 800 500 T1200 500"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>

        {/* Contenu centré */}
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center px-8 py-16 text-center">
          {/* Logo avec halo lumineux */}
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300/40 via-indigo-400/30 to-transparent rounded-full blur-2xl scale-150" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Bibliolinguo_logo.png"
              alt="Bibliolinguo"
              width={280}
              height={280}
              className="relative drop-shadow-[0_0_35px_rgba(168,85,247,0.5)] hover:drop-shadow-[0_0_50px_rgba(168,85,247,0.7)] transition-all duration-700"
            />
          </div>

          {/* Citation biblique */}
          <blockquote className="mb-6 max-w-sm">
            <p className="text-2xl font-serif italic text-white/90 leading-relaxed">
              « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. »
            </p>
            <footer className="mt-3 text-sm text-indigo-300 font-medium tracking-wide">
              — Psaume 119:105
            </footer>
          </blockquote>

          {/* Séparateur décoratif */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-400/60" />
            <BookOpen className="h-5 w-5 text-indigo-300" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-400/60" />
          </div>

          {/* Nom de la plateforme */}
          <h2 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            Bibliolingo
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Apprentissage biblique pour la communauté évangélique francophone
          </p>
        </div>
      </div>

      {/* ---------- Panneau droit : formulaire ---------- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 lg:hidden text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Bibliolinguo_logo.png"
              alt="Bibliolinguo"
              width={150}
              height={150}
              className="mx-auto mb-4 rounded-2xl drop-shadow-lg"
            />
            <h2 className="text-2xl font-bold text-slate-900">Bibliolingo</h2>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
            <p className="text-slate-500 text-sm mt-1">Accès réservé aux administrateurs.</p>
          </div>

          {/* Formulaire */}
          <form action={action} className="space-y-5">
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={pending}
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@exemple.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe avec toggle visibilité */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={pending}
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-12 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={pending}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <button
                  type="button"
                  disabled={pending || resetPending}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const email = emailRef.current?.value ?? ''
                    setResetState({ status: 'idle' })
                    startResetTransition(async () => {
                      const result = await resetPasswordAction(email)
                      if (result.error) {
                        setResetState({ status: 'error', message: result.error })
                      } else {
                        setResetState({ status: 'sent', message: `Un lien de réinitialisation a été envoyé à ${email || 'votre adresse'}.` })
                      }
                    })
                  }}
                >
                  {resetPending ? 'Envoi…' : 'Mot de passe oublié ?'}
                </button>
              </div>
            </div>

            {/* Message d'erreur connexion */}
            {state.error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-[slideDown_0.3s_ease-out]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Feedback reset mot de passe */}
            {resetState.status === 'sent' && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm animate-[slideDown_0.3s_ease-out]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{resetState.message}</span>
              </div>
            )}
            {resetState.status === 'error' && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-[slideDown_0.3s_ease-out]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{resetState.message}</span>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          {/* Retour au site */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>
          </div>
        </div>
      </div>

      {/* Animation slideDown pour l'alerte d'erreur */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}