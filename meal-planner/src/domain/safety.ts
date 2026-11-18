import type { Ingredient, SafetyResult } from './types'

export type { SafetyResult } from './types'

// Matching works on normalised text: lower-case, diacritics stripped
// (c/s/z for č/š/ž), split into tokens on anything that is not a letter or
// digit. A keyword is a space-separated list of tokens that must appear as
// consecutive tokens; a trailing '*' on a keyword token means "prefix".
// Blocked and check lists are evaluated before the known-ok list, and an
// ingredient is only 'ok' when EVERY meaningful word is a known-ok word.

export const BLOCKED_MEAT: string[] = [
  'chicken*', 'hen', 'poultry*', 'piscan*', 'perutnin*',
  'pork*', 'porchetta', 'svinj*',
  'beef*', 'govedin*', 'govej*',
  'turkey*', 'puran*',
  'ham', 'hamburger*', 'prsut*', 'sunk*', 'gammon',
  'sausage*', 'klobas*', 'bacon*', 'slanin*',
  'lamb*', 'jagnje*', 'jagnjet*', 'mutton',
  'duck*', 'goose', 'rabbit*', 'veal', 'ribs', 'rib eye', 'steak*',
  'salami*', 'prosciutto', 'pancetta', 'mortadella', 'pate', 'liver*',
  'chorizo', 'venison', 'kebab*', 'burger*', 'meatball*', 'meat*', 'mince',
  'hot dog*', 'frankfurter*', 'wiener*',
  'raca', 'race', 'racj*', 'gos', 'gosji*', 'zajec', 'zajc*', 'teletin*',
  'rebra', 'rebrc*', 'salam*', 'pasteta*', 'jetra', 'jetr*', 'divjacin*',
  'cevapcic*', 'polpet*', 'mesn*', 'mesne kroglice', 'meso', 'mesa', 'mesu',
]

export const BLOCKED_UNSAFE: string[] = [
  'surovo mleko', 'surovega mleka', 'nepasteriziran*', 'nepasterizirano',
  'raw milk', 'unpasteuris*', 'unpasteuriz*',
  'raw sprouts', 'alfalfa', 'kalck*', 'surovi kalcki',
  'surova riba', 'surove ribe', 'raw fish', 'sushi', 'sashimi',
]

export const CHECK_KEYWORDS: string[] = [
  'smoked salmon', 'smoked trout', 'dimljen*', 'dimljeni losos',
  'tuna', 'tune', 'tuno', 'swordfish', 'mecaric*',
  'brie', 'camembert', 'blue cheese', 'gorgonzola', 'roquefort',
  'modri sir', 'plesniv*',
  'raw egg*', 'surovo jajce', 'surova jajca', 'soft boiled', 'runny',
  'mehko kuhan*', 'mehko kuhano jajce', 'bean sprouts', 'mung',
]

// Rule words: "raw" + fish/milk-product is blocked, "raw" + egg is check.
const RAW_WORDS = ['raw', 'surov*', 'ceviche']
const FISH_WORDS = [
  'fish*', 'riba', 'ribe', 'ribo', 'ribji*', 'salmon*', 'losos*', 'tuna', 'tune',
  'trout*', 'postrv*', 'cod', 'polenovk*', 'sardine*', 'sardel*', 'haddock',
  'bass', 'brancin*', 'mackerel', 'skusa', 'skuse', 'herring*', 'haring*',
  'shrimp*', 'prawn*', 'kozic*', 'oyster*', 'ostrig*', 'mussel*', 'skoljk*',
  'seafood', 'crab*', 'lobster*', 'octopus', 'hobotnic*', 'squid', 'lignj*',
  'anchov*',
]
const MILK_WORDS = ['milk', 'mlek*', 'cream', 'smetan*', 'cheese*', 'sir', 'sira', 'sirom', 'siri']
const EGG_WORDS = ['egg*', 'jajc*']

const BEEF_WORDS = ['beef*', 'govedin*', 'govej*']
const MINCE_WORDS = ['minced', 'mince', 'ground', 'mlet*', 'mleto*']
const BEEF_EXTRA = ['meat', 'meso', 'mesa', 'mesu']
const BEEF_DISHES = ['bolognese', 'bolonjsk*', 'lasagna', 'lasagne', 'lazanj*']

// Neutral words ignored by the every-word rule.
export const FILLER_WORDS: string[] = [
  'and', 'with', 'in', 'of', 'the', 'a', 'fresh', 'chopped', 'sliced', 'diced',
  'grated', 'cooked', 'canned', 'tinned', 'dried', 'frozen', 'organic', 'small',
  'large', 'medium', 'big', 'finely', 'roughly', 'peeled', 'rinsed', 'drained',
  'to', 'taste', 'optional', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'pcs',
  'in', 'z', 'iz', 'ali', 'sveze', 'sveza', 'svez', 'svezi', 'narezan', 'narezana',
  'narezano', 'narezani', 'naribano', 'naribana', 'nariban', 'kuhan', 'kuhana',
  'kuhano', 'kuhani', 'sesekljan', 'sesekljana', 'sesekljano', 'mala', 'majhna',
  'majhen', 'velika', 'velik', 'zlicka', 'zlicke', 'kos', 'kosi', 'po', 'okusu',
]

// Known-ok whole words (diacritics stripped). English plurals ending in
// 's'/'es' are accepted automatically; Slovenian forms are listed explicitly.
export const KNOWN_OK: string[] = [
  // vegetables
  'spinach', 'spinaca', 'tomato', 'paradiznik', 'paradiznika', 'onion', 'cebula',
  'cebule', 'garlic', 'cesen', 'carrot', 'korenje', 'korencek', 'korenck',
  'potato', 'krompir', 'broccoli', 'brokoli', 'cauliflower', 'cvetaca', 'zucchini',
  'courgette', 'bucka', 'bucke', 'pepper', 'paprika', 'paprike', 'cucumber',
  'kumara', 'kumare', 'lettuce', 'solata', 'kale', 'ohrovt', 'cabbage', 'zelje',
  'mushroom', 'champignon', 'gobe', 'goba', 'sampinjoni', 'leek', 'por',
  'celery', 'zelena', 'beetroot', 'pesa', 'pumpkin', 'buca', 'squash',
  'asparagus', 'sparglji', 'pea', 'peas', 'grah', 'corn', 'sweetcorn', 'koruza',
  'avocado', 'avokado', 'eggplant', 'aubergine', 'jajcevec', 'brussels',
  'sprouts', 'rukola', 'arugula', 'fennel', 'koromac', 'radicchio', 'radic',
  'olive', 'olivo',
  // fruit
  'apple', 'jabolko', 'jabolka', 'banana', 'banane', 'orange', 'pomaranca',
  'pomarance', 'lemon', 'limona', 'limone', 'lime', 'berry', 'berries', 'jagode',
  'strawberry', 'blueberry', 'borovnice', 'raspberry', 'maline', 'pear', 'hruska',
  'hruske', 'peach', 'breskev', 'mango', 'kiwi', 'kivi', 'grape', 'grozdje',
  'raisin', 'rozine', 'date', 'datlji', 'fig', 'smokve', 'plum', 'slive',
  'cherry', 'cesnje', 'melon', 'lubenica', 'watermelon',
  // legumes
  'lentil', 'lentils', 'leca', 'lece', 'chickpea', 'cicerika', 'bean', 'fizol',
  'tofu', 'hummus', 'humus', 'tempeh', 'soy', 'soja', 'sojina', 'sojin',
  // grains
  'rice', 'riz', 'pasta', 'testenine', 'spaghetti', 'spageti', 'lasagna',
  'lasagne', 'lazanja', 'lazanje', 'penne', 'fusilli', 'noodle', 'noodles', 'oat',
  'oats', 'oatmeal', 'ovseni', 'ovsene', 'kosmici', 'flour', 'moka', 'bread',
  'kruh', 'toast', 'tortilla', 'tortilje', 'quinoa', 'kvinoja', 'couscous',
  'kuskus', 'bulgur', 'barley', 'jecmen', 'polenta', 'cornmeal', 'buckwheat',
  'ajda', 'wrap', 'muesli', 'granola', 'cereal', 'breadcrumbs', 'drobtine',
  'wholemeal', 'wholegrain', 'polnozrnat', 'polnozrnata', 'polnozrnate',
  'polnozrnati', 'sheets', 'listi',
  // dairy and eggs
  'milk', 'mleko', 'yoghurt', 'yogurt', 'jogurt', 'kefir', 'feta', 'ricotta',
  'mozzarella', 'skuta', 'cottage', 'cheese', 'sir', 'parmesan', 'parmezan',
  'cheddar', 'gouda', 'edam', 'trapist', 'butter', 'maslo', 'cream', 'smetana',
  'egg', 'eggs', 'jajce', 'jajca', 'greek', 'grski',
  // fish
  'salmon', 'losos', 'cod', 'polenovka', 'trout', 'postrv', 'sardine', 'sardele',
  'haddock', 'fillet', 'fillets', 'file', 'fileji', 'brancin', 'skusa',
  'prawn', 'shrimp', 'kozice',
  // nuts and seeds
  'almond', 'mandlji', 'mandelj', 'walnut', 'orehi', 'orah', 'cashew', 'hazelnut',
  'lesniki', 'peanut', 'arasidi', 'pistachio', 'nut', 'nuts', 'seed', 'seeds',
  'seme', 'semena', 'chia', 'flax', 'flaxseed', 'laneno', 'sesame', 'sezam',
  'sunflower', 'suncnicno', 'suncnicna', 'tahini',
  // oils and condiments
  'oil', 'olje', 'oljcno', 'vinegar', 'kis', 'sauce', 'omaka', 'honey', 'med',
  'sugar', 'sladkor', 'maple', 'syrup', 'mustard', 'gorcica', 'paste', 'passata',
  'pelati', 'stock', 'juha', 'broth', 'osnova', 'coconut', 'kokos', 'kokosovo',
  'juice', 'sok', 'extra', 'virgin', 'tomatoes', 'concentrate', 'koncentrat',
  // herbs and spices
  'basil', 'bazilika', 'parsley', 'petersilj', 'oregano', 'origano', 'thyme',
  'timijan', 'rosemary', 'rozmarin', 'dill', 'koper', 'mint', 'meta', 'coriander',
  'cilantro', 'koriander', 'cumin', 'kumina', 'cinnamon', 'cimet', 'turmeric',
  'kurkuma', 'ginger', 'ingver', 'nutmeg', 'muskat', 'chili', 'cili', 'salt', 'sol',
  'black', 'crni', 'crna', 'poper', 'bay', 'leaf', 'leaves', 'lovor', 'chives',
  'drobnjak', 'vanilla', 'vanilija', 'curry', 'water', 'voda', 'baking', 'powder',
  'pecilni', 'prasek', 'yeast', 'kvas', 'cocoa', 'kakav', 'chocolate', 'cokolada',
  'herbs', 'spice', 'spices', 'zacimbe',
  // adjectives
  'red', 'green', 'yellow', 'white', 'brown', 'sweet', 'baby', 'plain', 'natural',
  'whole', 'low', 'fat', 'light', 'sea', 'rdeca', 'rdeci', 'rdece', 'zelen',
  'zeleni', 'zelene', 'rumena', 'rumeni', 'bela', 'beli', 'sladki', 'sladka',
  'sladko', 'naravni', 'naravna', 'olivno', 'kisla', 'kisle', 'kisli', 'polnomastno',
  'polnomastna', 'zrna', 'zrnat',
]

const FILLER = new Set(FILLER_WORDS)
const OK = new Set(KNOWN_OK)

export function normalise(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function tokenise(text: string): string[] {
  return normalise(text).split(/[^a-z0-9]+/).filter(Boolean)
}

function tokenMatches(pattern: string, token: string): boolean {
  return pattern.endsWith('*') ? token.startsWith(pattern.slice(0, -1)) : token === pattern
}

function matchesAt(kw: string[], tokens: string[], i: number): boolean {
  return kw.every((p, j) => i + j < tokens.length && tokenMatches(p, tokens[i + j]))
}

function matchKeyword(keywords: string[], tokens: string[]): string | undefined {
  return keywords.find((k) => {
    const kw = k.split(' ')
    return tokens.some((_, i) => matchesAt(kw, tokens, i))
  })
}

function hasAny(words: string[], tokens: string[]): boolean {
  return tokens.some((t) => words.some((w) => tokenMatches(w, t)))
}

function isOkWord(t: string): boolean {
  if (FILLER.has(t) || /^\d+[a-z]{0,3}$/.test(t)) return true
  if (OK.has(t)) return true
  if (t.endsWith('es') && OK.has(t.slice(0, -2))) return true
  if (t.endsWith('s') && OK.has(t.slice(0, -1))) return true
  return false
}

function mincedBeefExemption(tokens: string[], titleTokens: string[]): boolean {
  return (
    hasAny(BEEF_WORDS, tokens) &&
    hasAny(MINCE_WORDS, tokens) &&
    hasAny(BEEF_DISHES, titleTokens)
  )
}

export function checkSafety(title: string, ingredients: Ingredient[]): SafetyResult {
  const blocked: string[] = []
  const check: string[] = []
  const titleTokens = tokenise(title)

  for (const { name } of ingredients) {
    let tokens = tokenise(name)
    let exempted = false

    // Exempts ONLY the beef/mince words of this ingredient; every other rule
    // still runs on the remaining words.
    if (mincedBeefExemption(tokens, titleTokens)) {
      exempted = true
      tokens = tokens.filter(
        (t) => !hasAny([...BEEF_WORDS, ...MINCE_WORDS, ...BEEF_EXTRA], [t]),
      )
    }

    const unsafe = matchKeyword(BLOCKED_UNSAFE, tokens)
    const raw = hasAny(RAW_WORDS, tokens)
    if (unsafe || (raw && hasAny(FISH_WORDS, tokens)) || (raw && hasAny(MILK_WORDS, tokens)) ||
      (raw && tokens.some((t) => t.startsWith('sprout')))) {
      blocked.push(`${name}: unsafe in pregnancy`)
      continue
    }
    const meat = matchKeyword(BLOCKED_MEAT, tokens)
    if (meat) {
      blocked.push(`${name}: meat is not eaten at the moment`)
      continue
    }
    if (matchKeyword(CHECK_KEYWORDS, tokens) || (raw && hasAny(EGG_WORDS, tokens))) {
      check.push(`${name}: check cooking or pasteurisation before eating`)
      continue
    }
    const meaningful = tokens.filter((t) => !FILLER.has(t) && !/^\d+[a-z]{0,3}$/.test(t))
    if ((meaningful.length === 0 && !exempted) || !meaningful.every(isOkWord)) {
      check.push(`${name}: not recognised, check it is pregnancy-safe`)
    }
  }

  if (blocked.length > 0) return { status: 'blocked', reasons: [...blocked, ...check] }
  if (check.length > 0) return { status: 'check', reasons: check }
  return { status: 'ok', reasons: [] }
}
