import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { TabBar, type Tab } from './components/TabBar'
import { PlanScreen } from './screens/PlanScreen'
import { RecipesScreen } from './screens/RecipesScreen'
import { ShoppingScreen } from './screens/ShoppingScreen'

const paths: Record<Tab, string> = { plan: '/', recipes: '/recipes', shopping: '/shopping' }

export default function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active: Tab = pathname.startsWith('/recipes')
    ? 'recipes'
    : pathname.startsWith('/shopping')
      ? 'shopping'
      : 'plan'

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <main className="mx-auto max-w-xl px-4 pb-[calc(76px+1.5rem)] pt-6">
        <Routes>
          <Route path="/" element={<PlanScreen />} />
          <Route path="/recipes" element={<RecipesScreen />} />
          <Route path="/shopping" element={<ShoppingScreen />} />
        </Routes>
      </main>
      <TabBar active={active} onChange={(t) => navigate(paths[t])} />
    </div>
  )
}
