import {NextResponse} from 'next/server'
import FALLBACK_SETTINGS from '@/data/site-settings.json'
import {trustedSanityAssetUrl} from '@/lib/sanity-assets'
import {client} from '@/sanity/lib/client'
import {siteSettingsQuery} from '@/sanity/lib/queries'

function colorOrFallback(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}

function mapSiteSettings(settings) {
  const colors = settings?.warna
  const about = settings?.tentang

  return {
    colors: {
      primary: colorOrFallback(colors?.utama, FALLBACK_SETTINGS.colors.primary),
      primaryHover: colorOrFallback(colors?.utamaHover, FALLBACK_SETTINGS.colors.primaryHover),
      accent: colorOrFallback(colors?.aksen, FALLBACK_SETTINGS.colors.accent),
      accentHover: colorOrFallback(colors?.aksenHover, FALLBACK_SETTINGS.colors.accentHover),
      accentLight: colorOrFallback(colors?.aksenTerang, FALLBACK_SETTINGS.colors.accentLight),
      categories: {
        BERITA: colorOrFallback(colors?.kategori?.berita, FALLBACK_SETTINGS.colors.categories.BERITA),
        KEGIATAN: colorOrFallback(colors?.kategori?.kegiatan, FALLBACK_SETTINGS.colors.categories.KEGIATAN),
        PENGUMUMAN: colorOrFallback(colors?.kategori?.pengumuman, FALLBACK_SETTINGS.colors.categories.PENGUMUMAN),
        SOSIAL: colorOrFallback(colors?.kategori?.sosial, FALLBACK_SETTINGS.colors.categories.SOSIAL),
      },
    },
    heroDescription: settings?.heroDeskripsi || FALLBACK_SETTINGS.heroDescription,
    about: {
      label: about?.label || FALLBACK_SETTINGS.about.label,
      title: about?.judul || FALLBACK_SETTINGS.about.title,
      paragraph1: about?.paragrafPertama || FALLBACK_SETTINGS.about.paragraph1,
      paragraph2: about?.paragrafKedua || FALLBACK_SETTINGS.about.paragraph2,
      image: trustedSanityAssetUrl(about?.gambar?.asset?.url, FALLBACK_SETTINGS.about.image),
      imageAlt: about?.gambar?.alt || FALLBACK_SETTINGS.about.imageAlt,
    },
    qris: {
      image: trustedSanityAssetUrl(settings?.qris?.asset?.url),
      alt: settings?.qris?.alt || FALLBACK_SETTINGS.qris.alt,
    },
  }
}

export async function GET() {
  try {
    const settings = await client.fetch(siteSettingsQuery)
    return NextResponse.json(mapSiteSettings(settings), {
      headers: {'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'},
    })
  } catch (error) {
    console.error('Failed to load site settings from Sanity', error)
    return NextResponse.json({error: 'Pengaturan website sedang tidak tersedia.'}, {status: 503})
  }
}
