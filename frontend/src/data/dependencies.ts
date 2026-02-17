import type { Archetype, CloudProvider } from '@/types/config'

// Which components are pre-selected for each archetype per cloud
export const archetypeComponents: Record<Archetype, Record<CloudProvider, string[]>> = {
  lakehouse: {
    azure: ['azure-databricks', 'azure-adls-gen2', 'azure-data-factory', 'azure-key-vault', 'azure-purview', 'azure-vnet', 'azure-monitor'],
    aws: ['aws-databricks', 'aws-s3', 'aws-glue', 'aws-kms', 'aws-glue-catalog', 'aws-vpc', 'aws-cloudwatch'],
    gcp: ['gcp-databricks', 'gcp-gcs', 'gcp-dataflow', 'gcp-kms', 'gcp-data-catalog', 'gcp-vpc', 'gcp-cloud-monitoring'],
  },
  'modern-dw': {
    azure: ['azure-synapse', 'azure-adls-gen2', 'azure-data-factory', 'azure-key-vault', 'azure-vnet', 'azure-monitor'],
    aws: ['aws-redshift', 'aws-s3', 'aws-glue', 'aws-kms', 'aws-vpc', 'aws-cloudwatch'],
    gcp: ['gcp-bigquery', 'gcp-gcs', 'gcp-dataflow', 'gcp-kms', 'gcp-vpc', 'gcp-cloud-monitoring'],
  },
  hybrid: {
    azure: ['azure-databricks', 'azure-synapse', 'azure-adls-gen2', 'azure-data-factory', 'azure-key-vault', 'azure-purview', 'azure-vnet', 'azure-monitor'],
    aws: ['aws-databricks', 'aws-redshift', 'aws-s3', 'aws-glue', 'aws-kms', 'aws-glue-catalog', 'aws-vpc', 'aws-cloudwatch'],
    gcp: ['gcp-databricks', 'gcp-bigquery', 'gcp-gcs', 'gcp-dataflow', 'gcp-kms', 'gcp-data-catalog', 'gcp-vpc', 'gcp-cloud-monitoring'],
  },
  custom: {
    azure: [],
    aws: [],
    gcp: [],
  },
}

// Descriptions for archetypes
export const archetypeDescriptions: Record<Archetype, { title: string; description: string; recommended: boolean }> = {
  lakehouse: {
    title: 'Lakehouse',
    description: 'Databricks-centrische architectuur die data lake en data warehouse combineert. Ideaal voor grote data volumes en ML workloads.',
    recommended: true,
  },
  'modern-dw': {
    title: 'Modern Data Warehouse',
    description: 'Traditionele data warehouse met cloud-native services. Geschikt voor BI-intensieve workloads met gestructureerde data.',
    recommended: false,
  },
  hybrid: {
    title: 'Hybrid',
    description: 'Combinatie van lakehouse en warehouse. Maximale flexibiliteit maar hogere kosten. Voor organisaties met diverse workloads.',
    recommended: false,
  },
  custom: {
    title: 'Custom',
    description: 'Start met een leeg canvas en kies zelf welke componenten je wilt. Volledige controle over de architectuur.',
    recommended: false,
  },
}

// Cloud provider descriptions
export const cloudProviderInfo: Record<CloudProvider, { name: string; description: string; strengths: string[] }> = {
  azure: {
    name: 'Microsoft Azure',
    description: 'Sterk geïntegreerd met Microsoft ecosysteem. Uitgebreide enterprise governance.',
    strengths: ['Enterprise integratie', 'Databricks partnership', 'Purview governance', 'Active Directory'],
  },
  aws: {
    name: 'Amazon Web Services',
    description: 'Grootste cloud provider met meeste services. Sterk in schaalbaarheid en innovatie.',
    strengths: ['Breedste service aanbod', 'Marktleider', 'Sterke community', 'Innovatiesnelheid'],
  },
  gcp: {
    name: 'Google Cloud Platform',
    description: 'Sterk in data analytics en machine learning. BigQuery is marktleidend voor analytics.',
    strengths: ['BigQuery analytics', 'AI/ML leadership', 'Kostenefficiënt', 'Open source friendly'],
  },
}
