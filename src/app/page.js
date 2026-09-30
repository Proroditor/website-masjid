'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import JADWAL_FALLBACK from '@/data/jadwal.json'
import MITRA from '@/data/mitra.json'
import MIMBAR_JUMAT from '@/data/mimbar-jumat.json'
import PENGURUS from '@/data/pengurus.json'
import BERITA_ALL from '@/data/berita.json'
import DataStatus from '@/components/data-status'
import {useSiteSettings} from '@/components/site-settings-provider'
import {useSanityData} from '@/hooks/use-sanity-data'

const LAYANAN = [
  { icon: 'mosque', judul: 'Sholat Berjamaah',  desc: 'Lima waktu setiap hari, terbuka untuk seluruh jamaah.' },
  { icon: 'book', judul: 'Kajian & Pengajian', desc: 'Rutin setiap pekan, berbagai tema ilmu agama.' },
  { icon: 'child', judul: 'TPA / TPQ',          desc: 'Bimbingan Al-Qur\'an untuk anak-anak di lingkungan masjid.' },
  { icon: 'heart', judul: 'Sosial & Zakat',     desc: 'Pengelolaan zakat, infaq, sedekah, dan santunan dhuafa.' },
]

const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/4qac5V8LgmyhVQk87'
const GOOGLE_MAPS_EMBED_URL = 'https://www.google.com/maps?q=-6.4231169,106.8405725&output=embed'
const JADWAL_NAMES = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya']

function normalizeWaktu(waktu) {
  const match = String(waktu || '').match(/(\d{1,2})[:.](\d{2})/)
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '--:--'
}

function FeatureIcon({ name, className = 'h-6 w-6' }) {
  const paths = {
    mosque: <><path d="M4 20h16M6 20v-7h12v7M4 13l8-7 8 7M9 20v-4h6v4M12 3v3" /><path d="M3 13h18" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 11h6" /></>,
    child: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-3.5a6 6 0 0 1 12 0V21M8 14h8M4 21h16" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    newspaper: <><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" /><path d="M6 4v16" /></>,
    phone: <path d="M6.5 3.5 9 3l2 5-2.5 1.7a15 15 0 0 0 5.3 5.3l1.7-2.5 5 2-.5 2.5a2.5 2.5 0 0 1-2.7 2A16.5 16.5 0 0 1 4.5 6.2a2.5 2.5 0 0 1 2-2.7Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    sunrise: <><path d="M12 2v6m-7.07-3.07 1.42 1.42M2 17h20M4 21h16" /><path d="M5 17a7 7 0 0 1 14 0" /><path d="m16 8 1.42-1.42" /></>,
    sunset: <><path d="M12 10V2m-7.07 3.07 1.42 1.42M2 17h20M4 21h16" /><path d="M5 17a7 7 0 0 1 14 0" /><path d="m16 8 1.42-1.42" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  }
  return <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.mosque}</svg>
}

/* ── HELPER: animasi muncul pas discroll ── */
function Reveal({ children, delay = 0 }) {
  const elRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (elRef.current) obs.observe(elRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={elRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}

/* ── HELPER: pattern dekoratif islami ── */
function IslamicPattern({ className = '' }) {
  return (
    <svg className={`absolute pointer-events-none ${className}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="islamic-star" width="60" height="60" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M30 5 L38 22 L55 22 L41 33 L47 50 L30 39 L13 50 L19 33 L5 22 L22 22 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-star)" />
    </svg>
  )
}

function Navbar({ onDonasi }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const MENU = ['Beranda','Jadwal','Tentang','Layanan','Berita','Galeri','Lokasi']

  const mobileMenuId = 'mobile-navigation'

  return (
    <nav aria-label="Navigasi utama" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-[var(--brand-primary)]/95 backdrop-blur shadow-lg' : 'bg-[var(--brand-primary)]/40 backdrop-blur-md'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo Masjid Lathifah" width={44} height={44} loading="eager" className="rounded-full" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">Masjid Lathifah</p>
            <p className="text-[var(--brand-accent)] text-xs">DKM Lathifah</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {MENU.map(m => (
            <a key={m} href={`#${m.toLowerCase()}`}
               className="text-white/100 hover:text-[var(--brand-accent)] text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)] rounded-full">
              {m}
            </a>
          ))}
          <button type="button" onClick={onDonasi}
            className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg shadow-[var(--brand-accent)]/20 hover:shadow-xl hover:shadow-[var(--brand-accent)]/30 hover:scale-105 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]">
            Donasi
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]"
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          aria-controls={mobileMenuId}
        >
          {menuOpen ? (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div id={mobileMenuId} className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-[calc(100vh-5rem)] overflow-y-auto' : 'max-h-0'}`}>
        <div className="px-6 pb-4 flex flex-col gap-1">
          {MENU.map(m => (
            <a key={m} href={`#${m.toLowerCase()}`}
               onClick={() => setMenuOpen(false)}
               className="text-white/90 hover:text-[var(--brand-accent)] text-base font-medium py-2.5 border-b border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)] rounded-md">
              {m}
            </a>
          ))}
          <button type="button" onClick={() => { onDonasi(); setMenuOpen(false) }}
            className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]">
            Donasi
          </button>
        </div>
      </div>
    </nav>
  )
}

function SectionJadwal() {
  const [now, setNow] = useState(null)
  const [timings, setTimings] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const initialUpdate = setTimeout(() => setNow(new Date()), 0)
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => {
      clearTimeout(initialUpdate)
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      const fallbackUpdate = setTimeout(() => setStatus('fallback'), 0)
      return () => clearTimeout(fallbackUpdate)
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const today = new Date()
          const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`
          const response = await fetch(
            `https://api.aladhan.com/v1/timings/${date}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=20`
          )
          if (!response.ok) throw new Error(`Aladhan returned ${response.status}`)
          const json = await response.json()
          const apiTimings = json.data?.timings
          const nextTimings = {
            Subuh: normalizeWaktu(apiTimings?.Fajr),
            Dzuhur: normalizeWaktu(apiTimings?.Dhuhr),
            Ashar: normalizeWaktu(apiTimings?.Asr),
            Maghrib: normalizeWaktu(apiTimings?.Maghrib),
            Isya: normalizeWaktu(apiTimings?.Isha),
          }
          if (Object.values(nextTimings).some((waktu) => waktu === '--:--')) throw new Error('Invalid prayer time response')
          setTimings(nextTimings)
          setStatus('online')
        } catch {
          // Aladhan can fail intermittently or be blocked on some networks.
          // The page already has a bundled fallback schedule, so we keep the UI stable without noisy console errors.
          setStatus('fallback')
        }
      },
      () => setStatus('fallback'),
      { timeout: 8000 }
    )
  }, [])

  const currentNow = now || new Date(2000, 0, 1)
  const jamDesimal = currentNow.getHours() + currentNow.getMinutes() / 60 + currentNow.getSeconds() / 3600
  const nowMenit = currentNow.getHours() * 60 + currentNow.getMinutes()
  const sky = jamDesimal >= 4 && jamDesimal < 6.5
    ? '/langit-fajar.svg'
    : jamDesimal >= 6.5 && jamDesimal < 17
      ? '/langit-siang.svg'
      : jamDesimal >= 17 && jamDesimal < 19
        ? '/langit-senja.svg'
        : '/langit-malam.svg'
  const waktuSholat = JADWAL_NAMES.map((nama) => ({
    nama,
    waktu: timings?.[nama] || normalizeWaktu(JADWAL_FALLBACK.find((item) => item.nama === nama)?.waktu),
  }))
  const ikonSholat = ['sunrise', 'sun', 'sun', 'sunset', 'moon']
  let nextIndex = waktuSholat.findIndex(({ waktu }) => {
    const [hour, minute] = waktu.split(':').map(Number)
    return hour * 60 + minute > nowMenit
  })
  if (nextIndex === -1) nextIndex = 0
  const berikutnya = waktuSholat[nextIndex]
  const [nextHour, nextMinute] = berikutnya.waktu.split(':').map(Number)
  const currentSeconds = currentNow.getHours() * 3600 + currentNow.getMinutes() * 60 + currentNow.getSeconds()
  let targetSeconds = nextHour * 3600 + nextMinute * 60
  if (targetSeconds <= currentSeconds) targetSeconds += 24 * 60 * 60
  const selisih = targetSeconds - currentSeconds
  const countdown = [
    Math.floor(selisih / 3600),
    Math.floor((selisih % 3600) / 60),
    selisih % 60,
  ].map((value) => String(value).padStart(2, '0')).join(':')

  return (
    <section id="jadwal" className="relative overflow-hidden bg-white px-6 py-16 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--brand-accent-rgb),.12),transparent_42%)]" />
      <div className="card relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[var(--brand-primary)] text-white shadow-[0_16px_50px_rgba(var(--brand-primary-rgb),.2)]">
        <div className="relative aspect-[478/300] w-full">
          <Image src={sky} alt="" fill unoptimized aria-hidden="true" className="object-contain" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_50%,rgba(var(--brand-accent-rgb),.10),transparent_35%),radial-gradient(ellipse_at_85%_15%,rgba(107,213,141,.12),transparent_30%)]" />
        <div className="relative z-20 bg-[var(--brand-primary)]/95 p-5 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-start justify-between gap-3 sm:mb-10 sm:gap-6">
            <div className="min-w-0">
              <p className="text-[clamp(30px,8vw,76px)] font-bold leading-none tracking-[-2px] text-white tabular-nums sm:tracking-[-3px]">
                {now ? now.toLocaleTimeString('id-ID') : '--:--:--'}
              </p>
              <p className="mt-2 text-[clamp(11px,2.5vw,18px)] text-white/75">
                {now ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Memuat waktu...'}
              </p>
              <p className="mt-2 text-[clamp(10px,2.2vw,16px)] text-[var(--brand-accent-light)]">Jadwal sholat hari ini</p>
            </div>
            <div className="card relative w-[42%] max-w-[320px] shrink-0 overflow-hidden rounded-2xl border border-[var(--brand-accent)]/30 bg-white/[.06] p-3 sm:w-[36%] sm:rounded-[24px] sm:p-6">
              <div aria-hidden="true" className="absolute -right-2 -top-2 opacity-[.14]">
                <FeatureIcon name="mosque" className="h-20 w-20 text-[var(--brand-accent-light)] sm:h-32 sm:w-32" />
              </div>
              <div className="relative">
                <p className="mb-2 text-[clamp(8px,1.8vw,14px)] font-semibold uppercase tracking-[.12em] text-[var(--brand-accent-light)]">Berikutnya</p>
                <p className="text-[clamp(14px,3.5vw,28px)] font-bold leading-tight text-white">{berikutnya.nama}</p>
                <p className="mt-1 text-[clamp(18px,5vw,34px)] font-bold leading-tight tracking-[-1px] text-[var(--brand-accent-light)] tabular-nums">{countdown}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4">
            {waktuSholat.map((sholat, index) => {
              const isNext = index === nextIndex
              return (
                <div key={sholat.nama} aria-current={isNext ? 'time' : undefined} className={`card min-w-0 items-center justify-center gap-2 rounded-xl border p-2 text-center sm:gap-4 sm:rounded-[22px] sm:p-5 lg:rounded-[28px] lg:p-6 ${isNext ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)]/15 shadow-[0_0_24px_rgba(var(--brand-accent-rgb),.12)]' : 'border-white/10 bg-white/[.05]'}`}>
                  <FeatureIcon name={ikonSholat[index]} className={`h-5 w-5 sm:h-8 sm:w-8 ${isNext ? 'text-[var(--brand-accent-light)]' : 'text-white/65'}`} />
                  <p className={`text-[clamp(9px,2.5vw,18px)] font-semibold leading-tight ${isNext ? 'text-white' : 'text-white/85'}`}>{sholat.nama}</p>
                  <p className={`text-[clamp(10px,2.8vw,22px)] tabular-nums ${isNext ? 'font-bold text-[var(--brand-accent-light)]' : 'text-white/80'}`}>{sholat.waktu}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-3 text-[clamp(10px,2vw,15px)] text-white/65 sm:mt-8 sm:gap-4">
            <FeatureIcon name="pin" className="h-5 w-5 shrink-0 text-[var(--brand-accent-light)] sm:h-7 sm:w-7" />
            <p>
              {status === 'online' ? 'Jadwal berdasarkan lokasi Anda' : status === 'loading' ? 'Memuat jadwal berdasarkan lokasi...' : 'Menampilkan jadwal default masjid'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function DonasiOverlay({ onClose }) {
  const closeButtonRef = useRef(null)
  const {qris} = useSiteSettings()

  useEffect(() => {
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={onClose}
         role="presentation">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
           onClick={e => e.stopPropagation()}
           role="dialog"
           aria-modal="true"
           aria-labelledby="donation-title"
           tabIndex="-1">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] flex items-center justify-center mx-auto mb-4">
          <FeatureIcon name="mosque" className="h-6 w-6 text-[var(--brand-accent)]" />
        </div>
        <h2 id="donation-title" className="text-[var(--brand-primary)] font-bold text-xl mb-1">Infaq & Sedekah</h2>
        <p className="text-gray-500 text-sm mb-5">Scan QRIS di bawah untuk berdonasi</p>
        <div className="bg-gray-100 rounded-2xl h-52 flex items-center justify-center mb-5">
          {qris.image
            ? <Image src={qris.image} alt={qris.alt} width={208} height={208} className="h-full w-full object-contain p-2" />
            : <div className="text-center">
                <FeatureIcon name="phone" className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                <p className="text-gray-600 text-sm">Gambar QRIS</p>
                <p className="text-gray-500 text-xs">QRIS belum diunggah melalui Admin</p>
              </div>
          }
        </div>
        <p className="text-xs text-gray-600 mb-4">Jazakumullah khairan atas kebaikan Bapak/Ibu</p>
        <button type="button" onClick={onClose}
          ref={closeButtonRef}
          className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold py-3 rounded-xl transition-colors">
          Tutup
        </button>
      </div>
    </div>
  )
}

function SectionMimbarJumat() {
  const {data: mimbar, isLoading, hasError} = useSanityData('/api/mimbar-jumat', MIMBAR_JUMAT)

  return (
    <section id="mimbar-jumat" className="relative bg-white py-20 px-6 overflow-hidden">
      <IslamicPattern className="inset-0 text-[var(--brand-primary)] opacity-[0.025]" />
      <div className="max-w-6xl mx-auto relative">
        <Reveal>
          <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">Khutbah Jumat</p>
          <h2 className="text-[var(--brand-primary)] text-3xl font-bold mb-10">Mimbar Jumat</h2>
          <DataStatus isLoading={isLoading} hasError={hasError} />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mimbar.map((m, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  i === 0
                    ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary)]/20'
                    : 'bg-gray-50 border-gray-100 hover:border-[var(--brand-accent)]/40 hover:shadow-lg'
                }`}>
                {i === 0 && (
                  <span className="inline-block bg-[var(--brand-accent)] text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                    JUMAT TERDEKAT
                  </span>
                )}
                <p className={`text-xs mb-2 ${i === 0 ? 'text-white/50' : 'text-gray-400'}`}>{m.tanggal}</p>
                <h3 className={`font-bold text-base leading-snug mb-2 ${i === 0 ? 'text-white' : 'text-[var(--brand-primary)]'}`}>
                  {m.judul}
                </h3>
                <p className={`text-sm leading-relaxed mb-4 ${i === 0 ? 'text-white/70' : 'text-gray-500'}`}>
                  {m.ringkasan}
                </p>
                <div className={`pt-3 border-t ${i === 0 ? 'border-white/10' : 'border-gray-100'}`}>
                  <p className="text-xs uppercase tracking-widest mb-0.5 text-[var(--brand-accent)]">Khatib</p>
                  <p className={`text-sm font-semibold ${i === 0 ? 'text-white' : 'text-[var(--brand-primary)]'}`}>{m.khatib}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionPengurus() {
  const {data: pengurus, isLoading, hasError} = useSanityData('/api/pengurus', PENGURUS)

  return (
    <section id="pengurus" className="relative bg-gray-50 py-20 px-6 overflow-hidden">
      <IslamicPattern className="inset-0 text-[var(--brand-primary)] opacity-[0.03]" />
      <div className="max-w-6xl mx-auto relative">
        <Reveal>
          <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">Struktur Organisasi</p>
          <h2 className="text-[var(--brand-primary)] text-3xl font-bold mb-10">Pengurus DKM Lathifah</h2>
          <DataStatus isLoading={isLoading} hasError={hasError} />
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {pengurus.map((p, i) => (
            <Reveal key={p.nama} delay={i * 80}>
              <div className="text-center group">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-[var(--brand-primary)] flex items-center justify-center mb-4 border-4 border-white shadow-md group-hover:shadow-xl group-hover:border-[var(--brand-accent)]/40 group-hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {p.foto ? (
                    <Image src={p.foto} alt={p.nama} fill className="object-cover" />
                  ) : (
                    <span className="text-[var(--brand-accent)] font-extrabold text-xl">{p.inisial}</span>
                  )}
                </div>
                <p className="font-bold text-[var(--brand-primary)] text-sm leading-snug">{p.nama}</p>
                <p className="text-gray-400 text-xs mt-1">{p.jabatan}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionBerita() {
  const {data: semuaBerita, isLoading, hasError} = useSanityData('/api/berita', BERITA_ALL)

  const featured = semuaBerita[0]
  const smalls   = semuaBerita.slice(1, 4)
  return (
    <section id="berita" className="relative bg-white py-20 px-6 overflow-hidden">
      <IslamicPattern className="inset-0 text-[var(--brand-primary)] opacity-[0.025]" />
      <div className="max-w-6xl mx-auto relative">
        <Reveal>
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">Informasi</p>
              <h2 className="text-[var(--brand-primary)] text-3xl font-bold">Berita Terbaru</h2>
              <DataStatus isLoading={isLoading} hasError={hasError} />
            </div>
            <Link href="/berita" className="text-[var(--brand-primary)] text-sm font-semibold hover:text-[var(--brand-accent)] transition-colors">
              Semua Berita →
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {featured && (
            <Reveal>
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-80 group cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300">
                <Image src={featured.img} alt={featured.judul} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="bg-[var(--brand-accent)] text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                    {featured.kategori}
                  </span>
                  <h3 className="text-white font-bold text-lg leading-snug mb-2">{featured.judul}</h3>
                  <p className="text-white/70 text-sm line-clamp-2">{featured.ringkasan}</p>
                </div>
              </div>
            </Reveal>
          )}

          <div className="flex flex-col gap-4">
            {smalls.map((b, i) => (
              <Reveal key={b.id} delay={i * 100}>
                <div className="relative rounded-2xl overflow-hidden h-[calc((320px-16px)/3)] group cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <Image src={b.img} alt={b.judul} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="bg-[var(--brand-accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                      {b.kategori}
                    </span>
                    <p className="text-white font-semibold text-sm line-clamp-2 leading-snug">{b.judul}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionMitra() {
  const {data: mitra, isLoading, hasError} = useSanityData('/api/mitra', MITRA)

  return (
    <section className="bg-gray-50 py-12 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto mb-6 text-center">
        <p className="text-[var(--brand-primary)]/40 text-xs uppercase tracking-widest font-bold">Mitra & Kolaborasi</p>
        <DataStatus isLoading={isLoading} hasError={hasError} />
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10" />
        <div className="flex gap-6 animate-[marquee_20s_linear_infinite] w-max">
          {[...mitra, ...mitra].map((m, i) => (
            <div key={i}
              className="flex-shrink-0 w-32 h-16 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--brand-accent)]/30 transition-all flex flex-col items-center justify-center gap-1 px-3">
              <span className="text-[var(--brand-primary)] font-extrabold text-sm">{m.inisial}</span>
              <span className="text-gray-400 text-[10px] text-center leading-tight">{m.nama}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [showDonasi, setShowDonasi] = useState(false)
  const {heroDescription, about} = useSiteSettings()
  const {data: galeri, isLoading: galeriLoading, hasError: galeriError} = useSanityData('/api/galeri', [
    {id: 'hero', judul: 'Masjid Lathifah', img: '/hero-bg.jpg'},
    {id: 'masjid-2', judul: 'Masjid Lathifah', img: '/masjid-2.jpg'},
    {id: 'masjid-3', judul: 'Masjid Lathifah', img: '/masjid-3.jpg'},
  ])

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-[var(--brand-primary)] focus:shadow-lg">
        Lewati ke konten utama
      </a>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Navbar onDonasi={() => setShowDonasi(true)} />
      {showDonasi && <DonasiOverlay onClose={() => setShowDonasi(false)} />}

      <main id="main-content" className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section id="beranda" className="relative min-h-screen flex items-center">
        <Image src="/hero-bg.jpg" alt="Masjid Lathifah" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/95 via-[var(--brand-primary)]/70 to-[var(--brand-primary)]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/90 via-transparent to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full pt-24 pb-16">
          <div className="max-w-2xl">
            <Reveal>
              <p className="text-[var(--brand-accent)] text-sm tracking-widest uppercase mb-3">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              <p className="text-white/60 text-sm tracking-widest uppercase mb-4">Selamat Datang di</p>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="block text-white">Masjid</span>
                <span className="block text-[var(--brand-accent)]">Lathifah</span>
              </h1>
              <p className="text-white/70 text-base max-w-md leading-relaxed mb-8">{heroDescription}</p>
              <div className="flex gap-4">
                <a href="#tentang" className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-[var(--brand-accent)]/30 hover:shadow-xl hover:shadow-[var(--brand-accent)]/40 hover:scale-105 transition-all duration-300">
                  Kenal Masjid
                </a>
                <a href="#jadwal" className="border border-white/40 hover:border-white hover:bg-white/10 text-white font-semibold px-5 sm:px-6 py-3 rounded-full backdrop-blur-sm hover:scale-105 transition-all duration-300 text-center">
                  Jadwal Sholat
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'mosque', judul: 'Tentang Masjid', sub: 'Profil & informasi', href: '#tentang' },
            { icon: 'calendar', judul: 'Kegiatan',        sub: 'Agenda & program',   href: '#layanan' },
            { icon: 'newspaper', judul: 'Berita',           sub: 'Info terkini',       href: '#berita' },
          ].map((item, i) => (
            <Reveal key={item.judul} delay={i * 100}>
              <a href={item.href}
                 className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-[var(--brand-accent)]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-[var(--brand-accent)]/20 transition-colors">
                  <FeatureIcon name={item.icon} className="h-5 w-5 text-[var(--brand-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--brand-primary)] text-sm">{item.judul}</p>
                  <p className="text-gray-400 text-xs">{item.sub}</p>
                </div>
                <span className="text-gray-300 group-hover:text-[var(--brand-accent)] group-hover:translate-x-1 transition-all">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TENTANG ── */}
      <section id="tentang" className="relative bg-gray-50 py-20 px-6 overflow-hidden">
        <IslamicPattern className="inset-0 text-[var(--brand-primary)] opacity-[0.03]" />
        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">{about.label}</p>
            <h2 className="text-[var(--brand-primary)] text-3xl font-bold mb-10">{about.title}</h2>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <p className="text-gray-600 leading-relaxed mb-4">{about.paragraph1}</p>
                <p className="text-gray-600 leading-relaxed">{about.paragraph2}</p>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <Image src={about.image} alt={about.imageAlt} fill className="object-cover" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="relative bg-white py-20 px-6 overflow-hidden">
        <IslamicPattern className="inset-0 text-[var(--brand-primary)] opacity-[0.03]" />
        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">Layanan Kami</p>
            <h2 className="text-[var(--brand-primary)] text-3xl font-bold mb-10">Kegiatan & Fasilitas</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LAYANAN.map((l, i) => (
              <Reveal key={l.judul} delay={i * 100}>
                <div className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-[var(--brand-accent)]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-4 text-[var(--brand-primary)]"><FeatureIcon name={l.icon} className="h-8 w-8" /></div>
                  <h3 className="font-bold text-[var(--brand-primary)] mb-2">{l.judul}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{l.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MIMBAR JUMAT ── */}
      <SectionMimbarJumat />

      {/* ── BERITA ── */}
      <SectionBerita />

      {/* ── GALERI ── */}
      <section id="galeri" className="relative bg-gray-50 py-20 px-6 overflow-hidden">
        <IslamicPattern className="inset-0 text-[var(--brand-primary)] opacity-[0.03]" />
        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">Galeri</p>
                <h2 className="text-[var(--brand-primary)] text-3xl font-bold">Dokumentasi Masjid</h2>
              </div>
              <Link href="/galeri" className="text-[var(--brand-primary)] text-sm font-semibold hover:text-[var(--brand-accent)] transition-colors whitespace-nowrap">
                Lihat Semua →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galeri.slice(0, 3).map((item, i) => (
              <Reveal key={item.id} delay={i * 100}>
                <div className="relative h-56 rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <Image src={item.img} alt={item.judul || `Foto masjid ${i+1}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <DataStatus isLoading={galeriLoading} hasError={galeriError} />
      </section>

      {/* ── JADWAL SHOLAT ── */}
      <SectionJadwal />

      {/* ── PENGURUS DKM ── */}
      <SectionPengurus />

      {/* ── MITRA ── */}
      <SectionMitra />

      {/* ── LOKASI ── */}
      <section id="lokasi" className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-[var(--brand-accent)] text-sm uppercase tracking-widest mb-2">Lokasi</p>
            <h2 className="text-[var(--brand-primary)] text-3xl font-bold">Temukan Masjid Lathifah</h2>
            <p className="text-gray-500 text-sm mt-2">Masjid Jami&apos; Lathifah GSA</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
            <iframe
              title="Lokasi Masjid Jami' Lathifah GSA"
              src={GOOGLE_MAPS_EMBED_URL}
              className="w-full h-[320px] md:h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold px-5 py-3 rounded-full transition-colors"
          >
            Buka navigasi Google Maps <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      </main>

      <footer className="bg-[var(--brand-primary)] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Logo Masjid Lathifah" width={36} height={36} className="rounded-full" />
              <p className="font-bold">Masjid Lathifah</p>
            </div>
            <p className="text-white/50 text-sm max-w-xs">Pusat ibadah dan kegiatan keagamaan masyarakat.</p>
          </div>
          <div>
            <p className="font-semibold mb-3 text-[var(--brand-accent)]">Kontak</p>
            <p className="text-white/60 text-sm">Masjid Jami&apos; Lathifah GSA</p>
            <p className="text-white/60 text-sm">Gunung Sindur, Jawa Barat</p>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-[var(--brand-accent)] hover:text-white text-sm font-semibold transition-colors"
            >
              Lihat lokasi di Google Maps <span aria-hidden="true">→</span>
            </a>
          </div>
          <div>
            <p className="font-semibold mb-3 text-[var(--brand-accent)]">Menu</p>
            {['Beranda','Tentang','Layanan','Berita','Galeri','Lokasi'].map(m => (
              <a key={m} href={`#${m.toLowerCase()}`}
                 className="block text-white/60 hover:text-white text-sm mb-1 transition-colors">{m}</a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-8 pt-6 text-center text-white/30 text-xs">
          © 2026 DKM Masjid Lathifah. Semua hak dilindungi.
        </div>
      </footer>
    </>
  )
}