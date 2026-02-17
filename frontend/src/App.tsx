import { useState, useEffect } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import { Moon, Sun, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { WizardLayout } from '@/components/Wizard'
import { ArchitectureVisualizer } from '@/components/Visualizer'
import { CostDashboard } from '@/components/CostEstimator'
import { TerraformPreview } from '@/components/TerraformPreview'
import { ConfigManager } from '@/components/ConfigManager'

const navLinks = [
  { to: '/', label: 'Configurator' },
  { to: '/architecture', label: 'Architectuur' },
  { to: '/costs', label: 'Kosten' },
  { to: '/terraform', label: 'Terraform' },
  { to: '/config', label: 'Beheer' },
]

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Title */}
            <div className="flex items-center gap-2 shrink-0">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-bold tracking-tight">
                Data Platform Configurator
              </span>
            </div>

            {/* Center nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode((prev) => !prev)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<WizardLayout />} />
          <Route path="/architecture" element={<ArchitectureVisualizer />} />
          <Route path="/costs" element={<CostDashboard />} />
          <Route path="/terraform" element={<TerraformPreview />} />
          <Route path="/config" element={<ConfigManager />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
