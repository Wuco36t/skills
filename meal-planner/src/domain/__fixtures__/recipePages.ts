// Small hand-written HTML pages used by importRecipe.test.ts.

const page = (...blocks: string[]) =>
  `<!doctype html><html><head><title>Test page</title>${blocks.join('\n')}</head><body><h1>Hi</h1></body></html>`

const ld = (json: string) => `<script type="application/ld+json">${json}</script>`

export const plainRecipe = page(
  ld(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: 'Lentil soup',
      totalTime: 'PT1H15M',
      recipeCategory: 'Kosilo',
      recipeIngredient: ['200 g red lentils', '1 l vegetable stock', '2 tbsp olive oil', '1 onion'],
      recipeInstructions: ['Fry the onion.', '  Add lentils and stock. ', '', 'Simmer.'],
    }),
  ),
)

export const graphRecipe = page(
  ld(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: 'Site' },
        {
          '@type': ['Recipe', 'Thing'],
          name: 'Oat porridge',
          cookTime: 'PT10M',
          prepTime: 'PT5M',
          recipeCategory: ['Breakfast'],
          recipeIngredient: ['50 g oats', '250 ml milk'],
          recipeInstructions: 'Cook the oats in the milk.',
        },
      ],
    }),
  ),
)

export const noRecipe = page(ld(JSON.stringify({ '@type': 'WebSite', name: 'Blog' })), '<p>Nothing</p>')

export const noLd = '<html><body><p>plain</p></body></html>'

export const malformedThenGood = page(
  ld('{ this is not json'),
  ld(
    JSON.stringify([
      { '@type': 'Organization' },
      {
        '@type': 'Recipe',
        name: 'Toast',
        recipeIngredient: ['2 slices bread'],
        recipeInstructions: 'Toast it.',
      },
    ]),
  ),
)

export const noIngredients = page(ld(JSON.stringify({ '@type': 'Recipe', name: 'Empty' })))
export const noName = page(
  ld(JSON.stringify({ '@type': 'Recipe', recipeIngredient: ['1 egg'] })),
)

export const chickenRecipe = page(
  ld(
    JSON.stringify({
      '@type': 'Recipe',
      name: 'Chicken rice',
      recipeIngredient: ['300 g chicken breast', '200 g rice'],
      recipeInstructions: 'Cook.',
    }),
  ),
)

export const howToRecipe = page(
  ld(
    JSON.stringify({
      '@type': 'Recipe',
      name: 'Pancakes',
      totalTime: 'P0DT2H',
      recipeIngredient: ['1 1/2 kg flour', '2,5 dl milk', '½ tsp salt', 'a pinch of love', '3 žlice olja'],
      recipeInstructions: [
        { '@type': 'HowToStep', text: 'Mix.' },
        {
          '@type': 'HowToSection',
          name: 'Cook',
          itemListElement: [
            { '@type': 'HowToStep', text: 'Heat pan.' },
            { '@type': 'HowToStep', text: ' Fry. ' },
          ],
        },
      ],
    }),
  ),
)
