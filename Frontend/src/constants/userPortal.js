export const USER_PORTAL_CATEGORIES = [
  {
    slug: 'laptops',
    label: 'Laptops',
    blurb: 'Creator rigs, gaming setups, and ultraportables tuned for graph-first shoppers.',
  },
  {
    slug: 'phones',
    label: 'Phones',
    blurb: 'Flagship mobiles and foldables with cameras primed for social graph capture.',
  },
  {
    slug: 'apparel',
    label: 'Apparel',
    blurb: 'Graph-branded hoodies, jackets, and athleisure with reflective trims.',
  },
  {
    slug: 'mugs',
    label: 'Mugs',
    blurb: 'Ceramic drinkware etched with graph nodes for your daily brew.',
  },
  {
    slug: 'home',
    label: 'Home',
    blurb: 'Adaptive lighting and decor that reacts to your interaction history.',
  },
  {
    slug: 'utensils',
    label: 'Utensils',
    blurb: 'Kitchen and brewing accessories with precision graph styling.',
  },
]

export const DEFAULT_USER_CATEGORY = USER_PORTAL_CATEGORIES[0].slug

export function getCategoryMeta(slug) {
  const normalized = (slug || '').toLowerCase()
  return USER_PORTAL_CATEGORIES.find((entry) => entry.slug === normalized) || {
    slug,
    label: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Catalog',
    blurb: 'Browse curated recommendations sourced from the interaction graph.',
  }
}
