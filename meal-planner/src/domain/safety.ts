import type { Ingredient, SafetyResult } from './types'

export type { SafetyResult } from './types'

// Keywords are lowercase and matched case-insensitively at the START of a word
// (so Slovenian inflections like "piščančje" match "piščanec"-style stems,
// while "champignon" does not match "ham").

export const BLOCKED_MEAT: string[] = [
  'chicken', 'piščan', 'piščanc',
  'pork', 'svinjin', 'svinjsk',
  'beef', 'govedin', 'goveje', 'govejo',
  'turkey', 'puran',
  'ham', 'pršut', 'šunk',
  'sausage', 'klobas',
  'bacon', 'slanin',
  'lamb', 'jagnjetin',
]

export const BLOCKED_UNSAFE: string[] = [
  'surovo mleko', 'nepasteriziran',
  'raw milk', 'unpasteurised', 'unpasteurized',
  'raw sprouts', 'alfalfa', 'kalčk', 'surovi kalčk',
  'surova riba', 'surove ribe', 'raw fish', 'sushi',
]

export const CHECK_KEYWORDS: string[] = [
  'smoked salmon', 'dimljen losos', 'dimljeni losos',
  'tuna', 'swordfish', 'mečaric',
  'brie', 'camembert', 'blue cheese', 'gorgonzola', 'roquefort',
  'modri sir', 'plesniv sir',
  'raw egg', 'surovo jajce', 'surova jajca',
]

export const KNOWN_OK: string[] = [
  // vegetables
  'spinach', 'špinač', 'tomato', 'paradižnik', 'onion', 'čebul', 'garlic', 'česen',
  'carrot', 'korenj', 'potato', 'krompir', 'sweet potato', 'sladki krompir',
  'broccoli', 'brokoli', 'cauliflower', 'cvetač', 'zucchini', 'courgette', 'bučk',
  'pepper', 'paprik', 'cucumber', 'kumar', 'lettuce', 'solata', 'kale', 'ohrovt',
  'cabbage', 'zelj', 'mushroom', 'champignon', 'gob', 'šampinjon', 'leek', 'por',
  'celery', 'zelen', 'beetroot', 'rdeča pesa', 'pesa', 'pumpkin', 'buča', 'squash',
  'asparagus', 'beljak', 'peas', 'grah', 'pea', 'corn', 'koruz', 'avocado', 'avokado',
  'eggplant', 'aubergine', 'jajčevec', 'brussels', 'rukola', 'arugula', 'radič',
  'fennel', 'koromač',
  // fruit
  'apple', 'jabolk', 'banana', 'banan', 'orange', 'pomaranč', 'lemon', 'limon',
  'lime', 'berries', 'berry', 'jagod', 'strawberr', 'blueberr', 'borovnic',
  'raspberr', 'malin', 'pear', 'hrušk', 'peach', 'breskev', 'mango', 'kiwi',
  'grape', 'grozdj', 'raisin', 'rozin', 'date', 'datelj', 'fig', 'figa', 'smokv',
  'plum', 'sliv', 'cherr', 'češnj', 'melon', 'lubenic',
  // legumes
  'lentil', 'leča', 'leče', 'chickpea', 'čičerik', 'bean', 'fižol', 'tofu', 'hummus',
  'humus', 'tempeh',
  // grains
  'rice', 'riž', 'pasta', 'testenin', 'spaghetti', 'špagete', 'lasagna sheets',
  'lasagne sheets', 'lazanja', 'lazanj', 'penne', 'fusilli', 'noodle', 'oat', 'oves',
  'ovsen', 'flour', 'moka', 'bread', 'kruh', 'toast', 'tortilla', 'quinoa', 'kvinoja',
  'couscous', 'kuskus', 'bulgur', 'barley', 'ječmen', 'polenta', 'cornmeal',
  'buckwheat', 'ajda', 'wrap', 'muesli', 'granola', 'cereal', 'kosmič', 'breadcrumb',
  'drobtin',
  // dairy and eggs
  'milk', 'mleko', 'yoghurt', 'yogurt', 'jogurt', 'kefir', 'feta', 'ricotta',
  'mozzarella', 'cottage cheese', 'skuta', 'parmesan', 'parmezan', 'cheddar',
  'gouda', 'edam', 'trapist', 'cream cheese', 'butter', 'maslo', 'cream', 'smetan',
  'egg', 'jajc', 'jajce', 'jajca',
  // fish
  'salmon', 'losos', 'cod', 'polenovk', 'trout', 'postrv', 'sardine', 'sardel',
  'haddock', 'sea bass', 'brancin', 'orada', 'mackerel', 'skuš', 'prawn', 'shrimp',
  'kozic', 'canned tuna light',
  // nuts and seeds
  'almond', 'mandelj', 'walnut', 'orah', 'cashew', 'indijski oreh', 'hazelnut',
  'lešnik', 'peanut', 'arašid', 'pistachio', 'pistači', 'nuts', 'oreh', 'seed',
  'seme', 'semen', 'chia', 'flax', 'lan', 'sesame', 'sezam', 'sunflower',
  'sončnic', 'tahini', 'peanut butter',
  // oils and condiments
  'oil', 'olje', 'olive', 'oliv', 'vinegar', 'kis', 'soy sauce', 'sojina omaka',
  'honey', 'med', 'sugar', 'sladkor', 'maple', 'mustard', 'gorčic', 'tomato paste',
  'passata', 'stock', 'juha', 'broth', 'osnova', 'coconut', 'kokos',
  // herbs and spices
  'basil', 'bazilik', 'parsley', 'peteršilj', 'oregano', 'origano', 'thyme', 'timijan',
  'rosemary', 'rožmarin', 'dill', 'koper', 'mint', 'meta', 'coriander', 'cilantro',
  'koriander', 'cumin', 'kumin', 'paprika', 'cinnamon', 'cimet', 'turmeric',
  'kurkuma', 'ginger', 'ingver', 'nutmeg', 'muškat', 'chili', 'čili', 'salt', 'sol',
  'black pepper', 'poper', 'bay leaf', 'lovor', 'chives', 'drobnjak', 'vanilla',
  'vanilij', 'curry', 'water', 'voda', 'baking', 'pecilni', 'yeast', 'kvas', 'cocoa',
  'kakav', 'chocolate', 'čokolad',
]

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matches(text: string, keywords: string[]): string | undefined {
  return keywords.find((k) =>
    new RegExp(`(^|[^\\p{L}])${escapeRegex(k)}`, 'iu').test(text),
  )
}

const MINCED = ['minced', 'ground', 'mlet', 'mleto', 'mleti']
const BEEF_DISHES = ['bolognese', 'bolonjsk', 'lasagna', 'lasagne', 'lazanj']

function isAllowedMincedBeef(name: string, title: string): boolean {
  return (
    matches(name, ['beef', 'govedin', 'goveje', 'govejo']) !== undefined &&
    matches(name, MINCED) !== undefined &&
    matches(title, BEEF_DISHES) !== undefined
  )
}

export function checkSafety(title: string, ingredients: Ingredient[]): SafetyResult {
  const blocked: string[] = []
  const check: string[] = []

  for (const { name } of ingredients) {
    const n = name.toLowerCase()
    const t = title.toLowerCase()

    if (isAllowedMincedBeef(n, t)) continue

    const unsafe = matches(n, BLOCKED_UNSAFE)
    if (unsafe) {
      blocked.push(`${name}: unsafe in pregnancy (${unsafe})`)
      continue
    }
    const meat = matches(n, BLOCKED_MEAT)
    if (meat) {
      blocked.push(`${name}: meat is not eaten at the moment (${meat})`)
      continue
    }
    if (matches(n, CHECK_KEYWORDS)) {
      check.push(`${name}: check cooking or pasteurisation before eating`)
      continue
    }
    if (!matches(n, KNOWN_OK)) {
      check.push(`${name}: not recognised, check it is pregnancy-safe`)
    }
  }

  if (blocked.length > 0) return { status: 'blocked', reasons: [...blocked, ...check] }
  if (check.length > 0) return { status: 'check', reasons: check }
  return { status: 'ok', reasons: [] }
}
