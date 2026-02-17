import { useMemo, useState, useCallback } from 'react'
import { useConfigStore } from '@/store/configStore'
import { cloudComponents } from '@/data/components'
import { generateTerraform } from '@/engine/terraform'
import Editor from '@monaco-editor/react'
import { saveAs } from 'file-saver'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CloudComponent, TerraformOutput } from '@/types/config'

const FILE_NAMES = [
  'main.tf',
  'variables.tf',
  'outputs.tf',
  'terraform.tfvars',
  'providers.tf',
] as const

type FileName = (typeof FILE_NAMES)[number]

function getEditorLanguage(fileName: string): string {
  if (fileName.endsWith('.tf') || fileName.endsWith('.tfvars')) {
    return 'hcl'
  }
  return 'plaintext'
}

export function TerraformPreview() {
  const cloud = useConfigStore((s) => s.cloud)
  const selectedComponentIds = useConfigStore((s) => s.selectedComponentIds)
  const componentConfigs = useConfigStore((s) => s.componentConfigs)
  const networking = useConfigStore((s) => s.networking)
  const environment = useConfigStore((s) => s.environment)
  const tags = useConfigStore((s) => s.tags)

  const [activeFile, setActiveFile] = useState<FileName>('main.tf')
  const [copySuccess, setCopySuccess] = useState(false)

  const selectedComponents: CloudComponent[] = useMemo(() => {
    return selectedComponentIds
      .map((id) => cloudComponents.find((c) => c.id === id))
      .filter((c): c is CloudComponent => c !== undefined)
  }, [selectedComponentIds])

  const terraformOutput: TerraformOutput | null = useMemo(() => {
    if (!cloud || selectedComponents.length === 0) {
      return null
    }
    return generateTerraform(
      cloud,
      selectedComponents,
      componentConfigs,
      networking,
      environment,
      tags,
    )
  }, [cloud, selectedComponents, componentConfigs, networking, environment, tags])

  const fileNames = useMemo<FileName[]>(() => {
    if (!terraformOutput) return []
    return FILE_NAMES.filter((name) => name in terraformOutput.files)
  }, [terraformOutput])

  const activeFileContent = useMemo(() => {
    if (!terraformOutput) return ''
    return terraformOutput.files[activeFile] ?? ''
  }, [terraformOutput, activeFile])

  const handleCopy = useCallback(async () => {
    if (!activeFileContent) return
    try {
      await navigator.clipboard.writeText(activeFileContent)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, [activeFileContent])

  const handleDownloadFile = useCallback(
    (fileName: FileName) => {
      if (!terraformOutput) return
      const content = terraformOutput.files[fileName]
      if (!content) return
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, fileName)
    },
    [terraformOutput],
  )

  const handleDownloadAll = useCallback(() => {
    if (!terraformOutput) return
    const sections: string[] = []
    for (const [fileName, content] of Object.entries(terraformOutput.files)) {
      sections.push(
        `${'#'.repeat(80)}\n# File: ${fileName}\n${'#'.repeat(80)}\n\n${content}`,
      )
    }
    const combined = sections.join('\n\n')
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `terraform-${environment}.tf`)
  }, [terraformOutput, environment])

  if (!cloud) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecteer eerst een cloud provider om de Terraform preview te zien.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!terraformOutput || selectedComponents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecteer componenten om de Terraform configuratie te genereren.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Terraform Preview</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedComponents.length}{' '}
                {selectedComponents.length === 1 ? 'component' : 'componenten'}
              </Badge>
              <Badge variant="outline">
                {fileNames.length} bestanden
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {terraformOutput.summary.split('\n')[0]}
          </p>
        </CardContent>
      </Card>

      {/* Editor with tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs
            defaultValue="main.tf"
            value={activeFile}
            onValueChange={(value) => setActiveFile(value as FileName)}
          >
            <div className="flex items-center justify-between gap-2">
              <TabsList className="flex-wrap">
                {fileNames.map((fileName) => (
                  <TabsTrigger key={fileName} value={fileName}>
                    {fileName}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    'min-w-[80px]',
                    copySuccess && 'text-green-600 border-green-600',
                  )}
                >
                  {copySuccess ? 'Gekopieerd!' : 'Kopieer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadFile(activeFile)}
                >
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadAll}
                >
                  Download Alles
                </Button>
              </div>
            </div>

            {fileNames.map((fileName) => (
              <TabsContent key={fileName} value={fileName}>
                <div className="mt-2 overflow-hidden rounded-lg border">
                  <Editor
                    height="500px"
                    language={getEditorLanguage(fileName)}
                    value={terraformOutput.files[fileName] ?? ''}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
