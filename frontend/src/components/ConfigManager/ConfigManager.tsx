import { useState, useCallback, useRef } from 'react'
import { useConfigStore } from '@/store/configStore'
import { saveAs } from 'file-saver'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import type { SavedConfig } from '@/types/config'

interface ImportStatus {
  type: 'success' | 'error'
  message: string
}

export function ConfigManager() {
  const exportConfig = useConfigStore((s) => s.exportConfig)
  const importConfig = useConfigStore((s) => s.importConfig)
  const saveConfig = useConfigStore((s) => s.saveConfig)
  const loadConfig = useConfigStore((s) => s.loadConfig)
  const deleteSavedConfig = useConfigStore((s) => s.deleteSavedConfig)
  const savedConfigs = useConfigStore((s) => s.savedConfigs)

  const [saveName, setSaveName] = useState('')
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(() => {
    const json = exportConfig()
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const timestamp = new Date().toISOString().slice(0, 10)
    saveAs(blob, `dataplatform-config-${timestamp}.json`)
  }, [exportConfig])

  const handleImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content !== 'string') {
          setImportStatus({
            type: 'error',
            message: 'Kon het bestand niet lezen.',
          })
          return
        }

        const success = importConfig(content)
        if (success) {
          setImportStatus({
            type: 'success',
            message: 'Configuratie succesvol geimporteerd!',
          })
        } else {
          setImportStatus({
            type: 'error',
            message:
              'Ongeldig configuratiebestand. Controleer of het een geldig JSON-bestand is.',
          })
        }

        // Clear the file input so the same file can be re-imported
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }

      reader.onerror = () => {
        setImportStatus({
          type: 'error',
          message: 'Er is een fout opgetreden bij het lezen van het bestand.',
        })
      }

      reader.readAsText(file)
    },
    [importConfig],
  )

  const handleSave = useCallback(() => {
    const trimmedName = saveName.trim()
    if (!trimmedName) return
    saveConfig(trimmedName)
    setSaveName('')
  }, [saveName, saveConfig])

  const handleLoad = useCallback(
    (id: string) => {
      loadConfig(id)
    },
    [loadConfig],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteSavedConfig(id)
    },
    [deleteSavedConfig],
  )

  const formatDate = (isoString: string): string => {
    try {
      return new Intl.DateTimeFormat('nl-NL', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(isoString))
    } catch {
      return isoString
    }
  }

  return (
    <div className="space-y-4">
      {/* Export section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exporteer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Download de huidige configuratie als JSON-bestand om later opnieuw
            te importeren.
          </p>
          <Button onClick={handleExport}>Exporteer Configuratie</Button>
        </CardContent>
      </Card>

      {/* Import section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Importeer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Laad een eerder geexporteerd configuratiebestand (.json).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className={cn(
              'block w-full text-sm text-muted-foreground',
              'file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2',
              'file:text-sm file:font-medium file:text-primary-foreground',
              'hover:file:bg-primary/90 file:cursor-pointer',
            )}
          />
          {importStatus && (
            <Alert
              variant={
                importStatus.type === 'error' ? 'destructive' : 'default'
              }
            >
              <AlertTitle>
                {importStatus.type === 'success' ? 'Succes' : 'Fout'}
              </AlertTitle>
              <AlertDescription>{importStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Save current configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Huidige configuratie opslaan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Sla de huidige configuratie op in de browser voor later gebruik.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
              placeholder="Naam voor configuratie..."
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1',
                'text-sm shadow-sm transition-colors placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
            />
            <Button
              onClick={handleSave}
              disabled={saveName.trim().length === 0}
            >
              Opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved configurations list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Opgeslagen configuraties</CardTitle>
            <Badge variant="secondary">
              {savedConfigs.length}{' '}
              {savedConfigs.length === 1 ? 'configuratie' : 'configuraties'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {savedConfigs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Geen opgeslagen configuraties gevonden.
            </p>
          ) : (
            <div className="space-y-3">
              {savedConfigs.map((config: SavedConfig) => (
                <div
                  key={config.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    'transition-colors hover:bg-muted/50',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{config.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(config.savedAt)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {config.config.cloud.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {config.config.components.length}{' '}
                        {config.config.components.length === 1
                          ? 'component'
                          : 'componenten'}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoad(config.id)}
                    >
                      Laden
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                    >
                      Verwijderen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
