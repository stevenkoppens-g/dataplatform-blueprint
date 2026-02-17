import type {
  CloudComponent,
  CostFactor,
  TerraformVar,
} from '@/types/config'

// ---------------------------------------------------------------------------
// Helper factories to reduce repetition when building cost-factor &
// terraform-variable arrays.
// ---------------------------------------------------------------------------

const cf = (
  name: string,
  unit: string,
  unitCost: number,
  description: string,
  defaultQuantity: number,
): CostFactor => ({ name, unit, unitCost, description, defaultQuantity })

const tv = (
  name: string,
  type: string,
  description: string,
  required: boolean,
  defaultValue?: string | number | boolean,
): TerraformVar => {
  const v: TerraformVar = { name, type, description, required }
  if (defaultValue !== undefined) {
    v.default = defaultValue
  }
  return v
}

// ---------------------------------------------------------------------------
// Icon mapping by category (lucide-react icon names)
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, string> = {
  compute: 'server',
  warehouse: 'database',
  orchestration: 'workflow',
  storage: 'hard-drive',
  networking: 'network',
  governance: 'shield',
  monitoring: 'activity',
  security: 'lock',
}

// =========================================================================
//  AZURE COMPONENTS
// =========================================================================

const azureDatabricks: CloudComponent = {
  id: 'azure-databricks',
  name: 'Azure Databricks',
  category: 'compute',
  cloud: 'azure',
  description:
    'Unified analytics platform based on Apache Spark, optimised for Azure. Provides collaborative notebooks, ML workflows, and Delta Lake integration.',
  icon: ICON_MAP.compute,
  monthlyBaseCost: 350,
  costFactors: [
    cf('Compute hours', 'DBU-hour', 0.55, 'Databricks Unit consumption per hour for interactive and job clusters', 400),
    cf('Storage', 'GB', 0.02, 'DBFS and managed Delta Lake storage', 500),
    cf('Data processed', 'TB', 5.0, 'Data read/written through Spark jobs', 2),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 7,
  dependencies: ['azure-vnet', 'azure-adls-gen2'],
  conflictsWith: [],
  terraformModule: 'modules/azure/databricks',
  terraformVariables: [
    tv('sku', 'string', 'Pricing tier for the Databricks workspace', true),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('enable_no_public_ip', 'bool', 'Deploy clusters with no public IP addresses', false, true),
    tv('managed_resource_group_name', 'string', 'Name of the managed resource group created by Databricks', false, 'databricks-managed-rg'),
  ],
  tier: 'premium',
}

const azureHdinsight: CloudComponent = {
  id: 'azure-hdinsight',
  name: 'Azure HDInsight',
  category: 'compute',
  cloud: 'azure',
  description:
    'Fully managed open-source analytics service supporting Hadoop, Spark, Hive, Kafka, and more.',
  icon: ICON_MAP.compute,
  monthlyBaseCost: 200,
  costFactors: [
    cf('Worker node hours', 'node-hour', 0.25, 'Compute hours for worker nodes in the cluster', 500),
    cf('Storage', 'GB', 0.018, 'Attached storage for cluster data', 1000),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 7,
  dependencies: ['azure-vnet', 'azure-adls-gen2'],
  conflictsWith: [],
  terraformModule: 'modules/azure/hdinsight',
  terraformVariables: [
    tv('cluster_type', 'string', 'Type of HDInsight cluster (hadoop, spark, hbase, kafka)', true),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('worker_node_count', 'number', 'Number of worker nodes', false, 3),
    tv('vm_size', 'string', 'VM size for worker nodes', false, 'Standard_D4_v3'),
  ],
  tier: 'standard',
}

const azureSynapse: CloudComponent = {
  id: 'azure-synapse',
  name: 'Azure Synapse Analytics',
  category: 'warehouse',
  cloud: 'azure',
  description:
    'Enterprise-grade analytics service that brings together big-data analytics and data warehousing with serverless and dedicated options.',
  icon: ICON_MAP.warehouse,
  monthlyBaseCost: 450,
  costFactors: [
    cf('DWU hours', 'DWU-hour', 1.2, 'Data Warehouse Unit hours for dedicated SQL pool', 300),
    cf('Serverless queries', 'TB scanned', 5.0, 'Data processed by serverless SQL pool', 5),
    cf('Storage', 'GB', 0.02, 'Managed storage for dedicated pools', 1000),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 7,
  dependencies: ['azure-adls-gen2'],
  conflictsWith: [],
  terraformModule: 'modules/azure/synapse',
  terraformVariables: [
    tv('sku', 'string', 'Performance level for the dedicated SQL pool (e.g. DW100c)', true),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('sql_admin_login', 'string', 'Administrator login name for the SQL pool', true),
    tv('enable_managed_vnet', 'bool', 'Enable managed virtual network for workspace', false, true),
  ],
  tier: 'premium',
}

const azureDataFactory: CloudComponent = {
  id: 'azure-data-factory',
  name: 'Azure Data Factory',
  category: 'orchestration',
  cloud: 'azure',
  description:
    'Cloud-based ETL and data integration service for creating data-driven workflows to orchestrate data movement and transformation.',
  icon: ICON_MAP.orchestration,
  monthlyBaseCost: 150,
  costFactors: [
    cf('Activity runs', 'thousand runs', 1.0, 'Number of pipeline activity executions', 50),
    cf('Data movement', 'DIU-hour', 0.25, 'Data integration unit hours for copy activities', 200),
    cf('Pipeline orchestration', 'thousand runs', 0.5, 'Pipeline orchestration and trigger runs', 30),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/data-factory',
  terraformVariables: [
    tv('region', 'string', 'Azure region for deployment', true),
    tv('enable_git', 'bool', 'Enable Git integration for version control', false, false),
    tv('public_network_enabled', 'bool', 'Allow public network access', false, true),
  ],
  tier: 'standard',
}

const azureAdlsGen2: CloudComponent = {
  id: 'azure-adls-gen2',
  name: 'Azure Data Lake Storage Gen2',
  category: 'storage',
  cloud: 'azure',
  description:
    'Scalable and cost-effective data lake solution built on Azure Blob Storage with hierarchical namespace for big data analytics.',
  icon: ICON_MAP.storage,
  monthlyBaseCost: 20,
  costFactors: [
    cf('Storage capacity', 'GB', 0.02, 'Hot tier storage per GB per month', 1000),
    cf('Transactions', 'ten-thousand ops', 0.05, 'Read and write operations', 100),
    cf('Data retrieval', 'GB', 0.01, 'Data read from the storage account', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/adls-gen2',
  terraformVariables: [
    tv('account_tier', 'string', 'Performance tier of the storage account', false, 'Standard'),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('replication_type', 'string', 'Storage replication strategy (LRS, GRS, ZRS)', false, 'LRS'),
    tv('enable_hierarchical_namespace', 'bool', 'Enable hierarchical namespace for Data Lake functionality', false, true),
  ],
  tier: 'standard',
}

const azureBlobStorage: CloudComponent = {
  id: 'azure-blob-storage',
  name: 'Azure Blob Storage',
  category: 'storage',
  cloud: 'azure',
  description:
    'Massively scalable object storage for unstructured data such as documents, images, and backups.',
  icon: ICON_MAP.storage,
  monthlyBaseCost: 15,
  costFactors: [
    cf('Storage capacity', 'GB', 0.018, 'Hot tier blob storage per GB per month', 500),
    cf('Transactions', 'ten-thousand ops', 0.04, 'Read and write operations', 80),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/blob-storage',
  terraformVariables: [
    tv('account_tier', 'string', 'Performance tier of the storage account', false, 'Standard'),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('access_tier', 'string', 'Default access tier for blobs (Hot, Cool, Archive)', false, 'Hot'),
  ],
  tier: 'basic',
}

const azureVnet: CloudComponent = {
  id: 'azure-vnet',
  name: 'Azure Virtual Network',
  category: 'networking',
  cloud: 'azure',
  description:
    'Logically isolated network in Azure for securely connecting resources, enabling private communication and network segmentation.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 0,
  costFactors: [
    cf('VNet peering', 'GB transferred', 0.01, 'Data transferred across peered virtual networks', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/vnet',
  terraformVariables: [
    tv('address_space', 'string', 'CIDR address space for the virtual network', false, '10.0.0.0/16'),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('subnet_count', 'number', 'Number of subnets to create within the VNet', false, 3),
  ],
  tier: 'standard',
}

const azurePrivateEndpoints: CloudComponent = {
  id: 'azure-private-endpoints',
  name: 'Azure Private Endpoints',
  category: 'networking',
  cloud: 'azure',
  description:
    'Network interface that connects privately and securely to Azure services using Azure Private Link.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 7,
  costFactors: [
    cf('Endpoints', 'endpoint', 7.3, 'Monthly cost per private endpoint', 1),
    cf('Data processed', 'GB', 0.01, 'Inbound data processed through private endpoints', 1000),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['azure-vnet'],
  conflictsWith: [],
  terraformModule: 'modules/azure/private-endpoints',
  terraformVariables: [
    tv('region', 'string', 'Azure region for deployment', true),
    tv('endpoint_count', 'number', 'Number of private endpoints to provision', false, 1),
    tv('subnet_id', 'string', 'Subnet ID where private endpoints will be created', true),
  ],
  tier: 'standard',
}

const azureFirewall: CloudComponent = {
  id: 'azure-firewall',
  name: 'Azure Firewall',
  category: 'networking',
  cloud: 'azure',
  description:
    'Cloud-native, intelligent network firewall security service providing threat protection for cloud workloads running in Azure.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 900,
  costFactors: [
    cf('Deployment hours', 'hour', 1.25, 'Firewall deployment cost per hour', 730),
    cf('Data processed', 'GB', 0.016, 'Data processed through the firewall', 5000),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['azure-vnet'],
  conflictsWith: [],
  terraformModule: 'modules/azure/firewall',
  terraformVariables: [
    tv('sku_tier', 'string', 'Firewall SKU tier (Standard or Premium)', false, 'Standard'),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('threat_intel_mode', 'string', 'Threat intelligence filtering mode (Off, Alert, Deny)', false, 'Alert'),
  ],
  tier: 'premium',
}

const azureVpnGateway: CloudComponent = {
  id: 'azure-vpn-gateway',
  name: 'Azure VPN Gateway',
  category: 'networking',
  cloud: 'azure',
  description:
    'Sends encrypted traffic between an Azure virtual network and an on-premises location over the public Internet or ExpressRoute.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 140,
  costFactors: [
    cf('Gateway hours', 'hour', 0.19, 'VPN gateway deployment cost per hour', 730),
    cf('Outbound data', 'GB', 0.035, 'Data transferred out through the VPN gateway', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['azure-vnet'],
  conflictsWith: [],
  terraformModule: 'modules/azure/vpn-gateway',
  terraformVariables: [
    tv('sku', 'string', 'Gateway SKU (VpnGw1, VpnGw2, VpnGw3)', false, 'VpnGw1'),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('vpn_type', 'string', 'VPN type (RouteBased or PolicyBased)', false, 'RouteBased'),
    tv('enable_bgp', 'bool', 'Enable BGP for dynamic routing', false, false),
  ],
  tier: 'standard',
}

const azurePurview: CloudComponent = {
  id: 'azure-purview',
  name: 'Microsoft Purview',
  category: 'governance',
  cloud: 'azure',
  description:
    'Unified data governance service that helps manage and govern on-premises, multi-cloud, and SaaS data with automated data discovery and classification.',
  icon: ICON_MAP.governance,
  monthlyBaseCost: 200,
  costFactors: [
    cf('Capacity units', 'CU', 0.411, 'Data map capacity units for metadata storage and processing', 200),
    cf('Scans', 'scan-hour', 0.63, 'Data source scanning costs per hour', 50),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/purview',
  terraformVariables: [
    tv('region', 'string', 'Azure region for deployment', true),
    tv('managed_resource_group_name', 'string', 'Name of the managed resource group', false, 'purview-managed-rg'),
    tv('public_network_enabled', 'bool', 'Allow public network access', false, true),
  ],
  tier: 'standard',
}

const azureMonitor: CloudComponent = {
  id: 'azure-monitor',
  name: 'Azure Monitor',
  category: 'monitoring',
  cloud: 'azure',
  description:
    'Full-stack monitoring service for collecting, analysing, and acting on telemetry from cloud and on-premises environments.',
  icon: ICON_MAP.monitoring,
  monthlyBaseCost: 50,
  costFactors: [
    cf('Metrics ingested', 'thousand metrics', 0.26, 'Custom and platform metrics ingested per month', 100),
    cf('Alerts', 'alert rule', 0.1, 'Active metric alert rules', 20),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/monitor',
  terraformVariables: [
    tv('region', 'string', 'Azure region for deployment', true),
    tv('retention_days', 'number', 'Number of days to retain monitoring data', false, 30),
  ],
  tier: 'standard',
}

const azureLogAnalytics: CloudComponent = {
  id: 'azure-log-analytics',
  name: 'Azure Log Analytics',
  category: 'monitoring',
  cloud: 'azure',
  description:
    'Service for querying and analysing log data collected by Azure Monitor, providing deep insights into application and infrastructure performance.',
  icon: ICON_MAP.monitoring,
  monthlyBaseCost: 75,
  costFactors: [
    cf('Data ingestion', 'GB', 2.76, 'Log data ingested per GB', 20),
    cf('Data retention', 'GB/month', 0.12, 'Data retained beyond the free 31-day period', 100),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/log-analytics',
  terraformVariables: [
    tv('region', 'string', 'Azure region for deployment', true),
    tv('sku', 'string', 'Pricing tier for the workspace (PerGB2018, Free, etc.)', false, 'PerGB2018'),
    tv('retention_in_days', 'number', 'Workspace data retention in days', false, 30),
  ],
  tier: 'standard',
}

const azureKeyVault: CloudComponent = {
  id: 'azure-key-vault',
  name: 'Azure Key Vault',
  category: 'security',
  cloud: 'azure',
  description:
    'Cloud service for securely storing and accessing secrets, keys, and certificates used by applications and services.',
  icon: ICON_MAP.security,
  monthlyBaseCost: 0,
  costFactors: [
    cf('Secret operations', 'ten-thousand ops', 0.03, 'Operations on secrets (get, set, list)', 100),
    cf('Key operations', 'ten-thousand ops', 0.03, 'Operations on keys (encrypt, decrypt, sign)', 50),
    cf('Certificate operations', 'certificate renewal', 3.0, 'Certificate creation and renewal', 2),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/key-vault',
  terraformVariables: [
    tv('sku_name', 'string', 'SKU for the Key Vault (standard or premium)', false, 'standard'),
    tv('region', 'string', 'Azure region for deployment', true),
    tv('enable_purge_protection', 'bool', 'Enable purge protection to prevent permanent deletion', false, true),
    tv('soft_delete_retention_days', 'number', 'Number of days to retain soft-deleted vaults', false, 90),
  ],
  tier: 'standard',
}

const azureManagedIdentity: CloudComponent = {
  id: 'azure-managed-identity',
  name: 'Azure Managed Identity',
  category: 'security',
  cloud: 'azure',
  description:
    'Automatically managed identity in Azure AD for authenticating to services without storing credentials in code.',
  icon: ICON_MAP.security,
  monthlyBaseCost: 0,
  costFactors: [
    cf('Identities', 'identity', 0, 'User-assigned managed identities (no additional cost)', 5),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/azure/managed-identity',
  terraformVariables: [
    tv('region', 'string', 'Azure region for deployment', true),
    tv('identity_name', 'string', 'Name of the user-assigned managed identity', true),
  ],
  tier: 'basic',
}

// =========================================================================
//  AWS COMPONENTS
// =========================================================================

const awsEmr: CloudComponent = {
  id: 'aws-emr',
  name: 'Amazon EMR',
  category: 'compute',
  cloud: 'aws',
  description:
    'Managed cluster platform for processing big data workloads using Apache Spark, Hadoop, Hive, Presto, and other open-source frameworks.',
  icon: ICON_MAP.compute,
  monthlyBaseCost: 300,
  costFactors: [
    cf('Instance hours', 'instance-hour', 0.27, 'EC2 instance hours for cluster nodes', 700),
    cf('EBS storage', 'GB', 0.1, 'Elastic Block Storage attached to cluster nodes', 500),
    cf('Data processed', 'TB', 4.0, 'Data processed through Spark or MapReduce jobs', 3),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 8,
  dependencies: ['aws-vpc', 'aws-s3'],
  conflictsWith: [],
  terraformModule: 'modules/aws/emr',
  terraformVariables: [
    tv('release_label', 'string', 'EMR release version (e.g. emr-6.10.0)', false, 'emr-6.10.0'),
    tv('region', 'string', 'AWS region for deployment', true),
    tv('instance_type', 'string', 'EC2 instance type for core nodes', false, 'm5.xlarge'),
    tv('core_instance_count', 'number', 'Number of core instances in the cluster', false, 3),
  ],
  tier: 'standard',
}

const awsDatabricks: CloudComponent = {
  id: 'aws-databricks',
  name: 'Databricks on AWS',
  category: 'compute',
  cloud: 'aws',
  description:
    'Unified analytics platform based on Apache Spark running on AWS, providing collaborative notebooks, ML workflows, and Delta Lake integration.',
  icon: ICON_MAP.compute,
  monthlyBaseCost: 350,
  costFactors: [
    cf('Compute hours', 'DBU-hour', 0.55, 'Databricks Unit consumption per hour for clusters', 400),
    cf('Storage', 'GB', 0.023, 'S3-backed storage for DBFS and Delta tables', 500),
    cf('Data processed', 'TB', 5.0, 'Data read/written through Spark jobs', 2),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 8,
  dependencies: ['aws-vpc', 'aws-s3'],
  conflictsWith: [],
  terraformModule: 'modules/aws/databricks',
  terraformVariables: [
    tv('pricing_tier', 'string', 'Databricks pricing tier (standard or premium)', true),
    tv('region', 'string', 'AWS region for deployment', true),
    tv('enable_private_link', 'bool', 'Deploy workspace with AWS PrivateLink connectivity', false, true),
    tv('instance_profile_arn', 'string', 'IAM instance profile ARN for cluster nodes', true),
  ],
  tier: 'premium',
}

const awsRedshift: CloudComponent = {
  id: 'aws-redshift',
  name: 'Amazon Redshift',
  category: 'warehouse',
  cloud: 'aws',
  description:
    'Fast, scalable cloud data warehouse that makes it simple and cost-effective to analyse all your data using standard SQL and BI tools.',
  icon: ICON_MAP.warehouse,
  monthlyBaseCost: 400,
  costFactors: [
    cf('Node hours', 'node-hour', 0.25, 'On-demand node hours for the Redshift cluster', 1460),
    cf('Redshift Spectrum', 'TB scanned', 5.0, 'Data scanned by Redshift Spectrum queries on S3', 5),
    cf('Concurrency scaling', 'second', 0.009, 'Per-second charge when concurrency scaling is active', 3600),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 8,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/redshift',
  terraformVariables: [
    tv('node_type', 'string', 'Redshift node type (e.g. ra3.xlplus, dc2.large)', false, 'ra3.xlplus'),
    tv('region', 'string', 'AWS region for deployment', true),
    tv('number_of_nodes', 'number', 'Number of nodes in the cluster', false, 2),
    tv('master_username', 'string', 'Master username for the Redshift cluster', true),
  ],
  tier: 'premium',
}

const awsGlue: CloudComponent = {
  id: 'aws-glue',
  name: 'AWS Glue',
  category: 'orchestration',
  cloud: 'aws',
  description:
    'Serverless data integration service for discovering, preparing, and combining data for analytics, ML, and application development.',
  icon: ICON_MAP.orchestration,
  monthlyBaseCost: 100,
  costFactors: [
    cf('DPU hours', 'DPU-hour', 0.44, 'Data Processing Unit hours for ETL jobs', 150),
    cf('Crawlers', 'DPU-hour', 0.44, 'DPU hours consumed by Glue crawlers', 30),
    cf('Data Catalog storage', 'hundred-thousand objects', 1.0, 'Storage for metadata objects beyond the free million', 5),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/glue',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('worker_type', 'string', 'Glue worker type (Standard, G.1X, G.2X)', false, 'G.1X'),
    tv('number_of_workers', 'number', 'Number of workers for Glue jobs', false, 5),
  ],
  tier: 'standard',
}

const awsStepFunctions: CloudComponent = {
  id: 'aws-step-functions',
  name: 'AWS Step Functions',
  category: 'orchestration',
  cloud: 'aws',
  description:
    'Serverless orchestration service to coordinate distributed applications and microservices using visual workflows.',
  icon: ICON_MAP.orchestration,
  monthlyBaseCost: 25,
  costFactors: [
    cf('State transitions', 'thousand transitions', 0.025, 'Number of state transitions per month', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/step-functions',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('type', 'string', 'State machine type (STANDARD or EXPRESS)', false, 'STANDARD'),
    tv('logging_level', 'string', 'CloudWatch log level (ALL, ERROR, FATAL, OFF)', false, 'ERROR'),
  ],
  tier: 'basic',
}

const awsS3: CloudComponent = {
  id: 'aws-s3',
  name: 'Amazon S3',
  category: 'storage',
  cloud: 'aws',
  description:
    'Highly scalable object storage service with industry-leading durability, availability, performance, and security.',
  icon: ICON_MAP.storage,
  monthlyBaseCost: 20,
  costFactors: [
    cf('Storage capacity', 'GB', 0.023, 'S3 Standard storage per GB per month', 1000),
    cf('PUT/COPY/POST requests', 'thousand requests', 0.005, 'Write requests to S3', 200),
    cf('GET/SELECT requests', 'thousand requests', 0.0004, 'Read requests from S3', 1000),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/s3',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('bucket_name', 'string', 'Globally unique name for the S3 bucket', true),
    tv('versioning_enabled', 'bool', 'Enable versioning for the bucket', false, true),
    tv('lifecycle_glacier_days', 'number', 'Days before transitioning objects to Glacier', false, 90),
  ],
  tier: 'standard',
}

const awsEfs: CloudComponent = {
  id: 'aws-efs',
  name: 'Amazon EFS',
  category: 'storage',
  cloud: 'aws',
  description:
    'Simple, serverless, set-and-forget elastic file system for use with AWS Cloud services and on-premises resources.',
  icon: ICON_MAP.storage,
  monthlyBaseCost: 30,
  costFactors: [
    cf('Storage capacity', 'GB', 0.3, 'EFS Standard storage per GB per month', 100),
    cf('Infrequent access storage', 'GB', 0.025, 'EFS Infrequent Access storage per GB', 200),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/efs',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('performance_mode', 'string', 'File system performance mode (generalPurpose, maxIO)', false, 'generalPurpose'),
    tv('throughput_mode', 'string', 'Throughput mode (bursting, provisioned, elastic)', false, 'bursting'),
  ],
  tier: 'standard',
}

const awsVpc: CloudComponent = {
  id: 'aws-vpc',
  name: 'Amazon VPC',
  category: 'networking',
  cloud: 'aws',
  description:
    'Logically isolated virtual network in AWS where you can launch resources in a defined address range with full control over networking.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 0,
  costFactors: [
    cf('VPC peering', 'GB transferred', 0.01, 'Data transferred across peered VPCs', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/vpc',
  terraformVariables: [
    tv('cidr_block', 'string', 'CIDR block for the VPC', false, '10.0.0.0/16'),
    tv('region', 'string', 'AWS region for deployment', true),
    tv('availability_zones', 'number', 'Number of availability zones to span', false, 3),
    tv('enable_dns_support', 'bool', 'Enable DNS resolution in the VPC', false, true),
  ],
  tier: 'standard',
}

const awsPrivatelink: CloudComponent = {
  id: 'aws-privatelink',
  name: 'AWS PrivateLink',
  category: 'networking',
  cloud: 'aws',
  description:
    'Provides private connectivity between VPCs, supported AWS services, and on-premises networks without exposing traffic to the public Internet.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 8,
  costFactors: [
    cf('Endpoint hours', 'endpoint-hour', 0.01, 'VPC endpoint interface hours per AZ', 730),
    cf('Data processed', 'GB', 0.01, 'Data processed through the endpoint', 1000),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['aws-vpc'],
  conflictsWith: [],
  terraformModule: 'modules/aws/privatelink',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('service_name', 'string', 'AWS service name for the VPC endpoint', true),
    tv('subnet_ids', 'string', 'Comma-separated list of subnet IDs for the endpoint', true),
  ],
  tier: 'standard',
}

const awsNatGateway: CloudComponent = {
  id: 'aws-nat-gateway',
  name: 'AWS NAT Gateway',
  category: 'networking',
  cloud: 'aws',
  description:
    'Managed network address translation service enabling instances in private subnets to connect to the Internet or other AWS services.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 35,
  costFactors: [
    cf('Gateway hours', 'hour', 0.045, 'NAT gateway hourly charge', 730),
    cf('Data processed', 'GB', 0.045, 'Data processed through the NAT gateway', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['aws-vpc'],
  conflictsWith: [],
  terraformModule: 'modules/aws/nat-gateway',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('subnet_id', 'string', 'Public subnet ID for the NAT gateway', true),
    tv('connectivity_type', 'string', 'Connectivity type (public or private)', false, 'public'),
  ],
  tier: 'standard',
}

const awsGlueCatalog: CloudComponent = {
  id: 'aws-glue-catalog',
  name: 'AWS Glue Data Catalog',
  category: 'governance',
  cloud: 'aws',
  description:
    'Centralized metadata repository for all data assets, enabling discovery and governance across analytics and ML workloads.',
  icon: ICON_MAP.governance,
  monthlyBaseCost: 50,
  costFactors: [
    cf('Objects stored', 'hundred-thousand objects', 1.0, 'Metadata objects stored beyond the free million', 10),
    cf('Requests', 'million requests', 1.0, 'API requests to the Data Catalog', 5),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/glue-catalog',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('database_name', 'string', 'Name of the default Glue database', false, 'default'),
    tv('enable_encryption', 'bool', 'Enable encryption at rest for the catalog', false, true),
  ],
  tier: 'standard',
}

const awsCloudwatch: CloudComponent = {
  id: 'aws-cloudwatch',
  name: 'Amazon CloudWatch',
  category: 'monitoring',
  cloud: 'aws',
  description:
    'Monitoring and observability service for AWS resources and applications, providing data and actionable insights.',
  icon: ICON_MAP.monitoring,
  monthlyBaseCost: 40,
  costFactors: [
    cf('Custom metrics', 'metric', 0.3, 'Custom metrics published per month', 50),
    cf('Log ingestion', 'GB', 0.5, 'Log data ingested into CloudWatch Logs', 50),
    cf('Dashboard count', 'dashboard', 3.0, 'Custom dashboards per month', 3),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/cloudwatch',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('log_retention_days', 'number', 'Number of days to retain CloudWatch log data', false, 30),
    tv('enable_detailed_monitoring', 'bool', 'Enable detailed monitoring (1-minute intervals)', false, false),
  ],
  tier: 'standard',
}

const awsKms: CloudComponent = {
  id: 'aws-kms',
  name: 'AWS KMS',
  category: 'security',
  cloud: 'aws',
  description:
    'Managed service for creating and controlling cryptographic keys used to encrypt data across AWS services and applications.',
  icon: ICON_MAP.security,
  monthlyBaseCost: 1,
  costFactors: [
    cf('Customer managed keys', 'key', 1.0, 'Monthly cost per customer managed key', 1),
    cf('API requests', 'ten-thousand requests', 0.03, 'Cryptographic API requests', 100),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/kms',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment', true),
    tv('key_spec', 'string', 'Key spec (SYMMETRIC_DEFAULT, RSA_2048, etc.)', false, 'SYMMETRIC_DEFAULT'),
    tv('enable_key_rotation', 'bool', 'Enable automatic key rotation', false, true),
  ],
  tier: 'standard',
}

const awsIam: CloudComponent = {
  id: 'aws-iam',
  name: 'AWS IAM',
  category: 'security',
  cloud: 'aws',
  description:
    'Identity and Access Management service for securely managing access to AWS services and resources through fine-grained policies.',
  icon: ICON_MAP.security,
  monthlyBaseCost: 0,
  costFactors: [
    cf('Roles', 'role', 0, 'IAM roles created (no additional cost)', 10),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/aws/iam',
  terraformVariables: [
    tv('region', 'string', 'AWS region for deployment (IAM is global but Terraform requires a region)', true),
    tv('create_instance_profile', 'bool', 'Create an EC2 instance profile', false, false),
    tv('policy_arns', 'string', 'Comma-separated list of managed policy ARNs to attach', false, ''),
  ],
  tier: 'basic',
}

// =========================================================================
//  GCP COMPONENTS
// =========================================================================

const gcpDataproc: CloudComponent = {
  id: 'gcp-dataproc',
  name: 'Google Cloud Dataproc',
  category: 'compute',
  cloud: 'gcp',
  description:
    'Managed Spark and Hadoop service for batch processing, querying, streaming, and machine learning on Google Cloud.',
  icon: ICON_MAP.compute,
  monthlyBaseCost: 250,
  costFactors: [
    cf('Cluster hours', 'vCPU-hour', 0.01, 'Dataproc premium per vCPU per hour (on top of Compute Engine)', 2000),
    cf('Persistent disk', 'GB', 0.04, 'Standard persistent disk attached to cluster nodes', 500),
    cf('Data processed', 'TB', 4.0, 'Data processed through Spark jobs', 2),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 7,
  dependencies: ['gcp-vpc', 'gcp-gcs'],
  conflictsWith: [],
  terraformModule: 'modules/gcp/dataproc',
  terraformVariables: [
    tv('region', 'string', 'GCP region for deployment', true),
    tv('machine_type', 'string', 'Compute Engine machine type for worker nodes', false, 'n2-standard-4'),
    tv('num_workers', 'number', 'Number of worker nodes in the cluster', false, 3),
    tv('image_version', 'string', 'Dataproc image version', false, '2.1-debian11'),
  ],
  tier: 'standard',
}

const gcpDatabricks: CloudComponent = {
  id: 'gcp-databricks',
  name: 'Databricks on GCP',
  category: 'compute',
  cloud: 'gcp',
  description:
    'Unified analytics platform based on Apache Spark running on Google Cloud, with collaborative notebooks, ML workflows, and Delta Lake.',
  icon: ICON_MAP.compute,
  monthlyBaseCost: 350,
  costFactors: [
    cf('Compute hours', 'DBU-hour', 0.55, 'Databricks Unit consumption per hour for clusters', 400),
    cf('Storage', 'GB', 0.02, 'GCS-backed storage for DBFS and Delta tables', 500),
    cf('Data processed', 'TB', 5.0, 'Data read/written through Spark jobs', 2),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 7,
  dependencies: ['gcp-vpc', 'gcp-gcs'],
  conflictsWith: [],
  terraformModule: 'modules/gcp/databricks',
  terraformVariables: [
    tv('pricing_tier', 'string', 'Databricks pricing tier (standard or premium)', true),
    tv('region', 'string', 'GCP region for deployment', true),
    tv('enable_private_google_access', 'bool', 'Enable Private Google Access for workspace nodes', false, true),
    tv('gke_node_pool_machine_type', 'string', 'Machine type for GKE node pool', false, 'n2-standard-4'),
  ],
  tier: 'premium',
}

const gcpBigquery: CloudComponent = {
  id: 'gcp-bigquery',
  name: 'Google BigQuery',
  category: 'warehouse',
  cloud: 'gcp',
  description:
    'Serverless, highly scalable multi-cloud data warehouse designed for business agility with built-in ML and BI capabilities.',
  icon: ICON_MAP.warehouse,
  monthlyBaseCost: 0,
  costFactors: [
    cf('Queries processed', 'TB scanned', 5.0, 'Data scanned by on-demand queries', 10),
    cf('Active storage', 'GB', 0.02, 'Active storage for tables modified in the last 90 days', 1000),
    cf('Streaming inserts', 'hundred-thousand rows', 0.01, 'Rows inserted via streaming API', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/bigquery',
  terraformVariables: [
    tv('region', 'string', 'GCP region for the BigQuery dataset', true),
    tv('dataset_id', 'string', 'Default dataset identifier', true),
    tv('delete_contents_on_destroy', 'bool', 'Delete all tables in the dataset when destroying', false, false),
    tv('default_table_expiration_ms', 'number', 'Default expiration time for tables in milliseconds', false, 0),
  ],
  tier: 'premium',
}

const gcpDataflow: CloudComponent = {
  id: 'gcp-dataflow',
  name: 'Google Cloud Dataflow',
  category: 'orchestration',
  cloud: 'gcp',
  description:
    'Fully managed streaming and batch data processing service based on Apache Beam, with autoscaling and minimal operational overhead.',
  icon: ICON_MAP.orchestration,
  monthlyBaseCost: 150,
  costFactors: [
    cf('Worker vCPU hours', 'vCPU-hour', 0.056, 'Compute cost per vCPU per hour for workers', 1500),
    cf('Worker memory', 'GB-hour', 0.003, 'Memory cost per GB per hour for workers', 6000),
    cf('Persistent disk', 'GB-month', 0.04, 'Storage for shuffle and state', 200),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/dataflow',
  terraformVariables: [
    tv('region', 'string', 'GCP region for deployment', true),
    tv('machine_type', 'string', 'Machine type for Dataflow workers', false, 'n2-standard-4'),
    tv('max_workers', 'number', 'Maximum number of workers for autoscaling', false, 10),
  ],
  tier: 'standard',
}

const gcpComposer: CloudComponent = {
  id: 'gcp-composer',
  name: 'Google Cloud Composer',
  category: 'orchestration',
  cloud: 'gcp',
  description:
    'Fully managed Apache Airflow service for authoring, scheduling, and monitoring data pipelines across clouds and on-premises.',
  icon: ICON_MAP.orchestration,
  monthlyBaseCost: 300,
  costFactors: [
    cf('Environment hours', 'hour', 0.35, 'Cloud Composer environment running cost per hour', 730),
    cf('Database storage', 'GB', 0.17, 'Cloud SQL storage for Airflow metadata database', 20),
    cf('Worker vCPUs', 'vCPU', 45.0, 'Monthly cost per additional worker vCPU', 2),
  ],
  requiresPrivateConnectivity: true,
  privateConnectivityCost: 7,
  dependencies: ['gcp-vpc'],
  conflictsWith: [],
  terraformModule: 'modules/gcp/composer',
  terraformVariables: [
    tv('region', 'string', 'GCP region for deployment', true),
    tv('environment_size', 'string', 'Composer environment size (small, medium, large)', false, 'small'),
    tv('image_version', 'string', 'Cloud Composer image version', false, 'composer-2.5.0-airflow-2.6.3'),
    tv('enable_private_environment', 'bool', 'Enable private IP for Composer environment', false, true),
  ],
  tier: 'premium',
}

const gcpGcs: CloudComponent = {
  id: 'gcp-gcs',
  name: 'Google Cloud Storage',
  category: 'storage',
  cloud: 'gcp',
  description:
    'Unified object storage for developers and enterprises with global edge caching, lifecycle management, and strong consistency.',
  icon: ICON_MAP.storage,
  monthlyBaseCost: 18,
  costFactors: [
    cf('Storage capacity', 'GB', 0.02, 'Standard class storage per GB per month', 1000),
    cf('Class A operations', 'ten-thousand ops', 0.05, 'Object creation, listing, and metadata operations', 100),
    cf('Class B operations', 'ten-thousand ops', 0.004, 'Object read operations', 200),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/gcs',
  terraformVariables: [
    tv('region', 'string', 'GCP region for the bucket', true),
    tv('bucket_name', 'string', 'Globally unique name for the GCS bucket', true),
    tv('storage_class', 'string', 'Default storage class (STANDARD, NEARLINE, COLDLINE, ARCHIVE)', false, 'STANDARD'),
    tv('versioning_enabled', 'bool', 'Enable object versioning', false, true),
  ],
  tier: 'standard',
}

const gcpVpc: CloudComponent = {
  id: 'gcp-vpc',
  name: 'Google VPC Network',
  category: 'networking',
  cloud: 'gcp',
  description:
    'Global virtual private cloud network providing scalable, flexible networking for Google Cloud resources.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 0,
  costFactors: [
    cf('Network egress', 'GB', 0.01, 'Data transferred between regions or to the Internet', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/vpc',
  terraformVariables: [
    tv('region', 'string', 'GCP region for subnet creation', true),
    tv('subnet_cidr', 'string', 'CIDR range for the primary subnet', false, '10.0.0.0/20'),
    tv('enable_private_google_access', 'bool', 'Enable Private Google Access on subnets', false, true),
  ],
  tier: 'standard',
}

const gcpPrivateServiceConnect: CloudComponent = {
  id: 'gcp-private-service-connect',
  name: 'GCP Private Service Connect',
  category: 'networking',
  cloud: 'gcp',
  description:
    'Private, secure connectivity to Google APIs and services, as well as third-party services, without leaving the Google network.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 7,
  costFactors: [
    cf('Forwarding rules', 'rule', 3.0, 'Monthly cost per forwarding rule', 2),
    cf('Data processed', 'GB', 0.01, 'Data processed through Private Service Connect', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['gcp-vpc'],
  conflictsWith: [],
  terraformModule: 'modules/gcp/private-service-connect',
  terraformVariables: [
    tv('region', 'string', 'GCP region for deployment', true),
    tv('target_service', 'string', 'Target service attachment URI', true),
    tv('subnet_id', 'string', 'Subnet for the Private Service Connect endpoint', true),
  ],
  tier: 'standard',
}

const gcpCloudNat: CloudComponent = {
  id: 'gcp-cloud-nat',
  name: 'Google Cloud NAT',
  category: 'networking',
  cloud: 'gcp',
  description:
    'Managed network address translation service enabling instances without external IP addresses to access the Internet.',
  icon: ICON_MAP.networking,
  monthlyBaseCost: 35,
  costFactors: [
    cf('NAT gateway hours', 'hour', 0.044, 'Cloud NAT gateway running cost per hour per VM', 730),
    cf('Data processed', 'GB', 0.045, 'Data processed through Cloud NAT', 500),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: ['gcp-vpc'],
  conflictsWith: [],
  terraformModule: 'modules/gcp/cloud-nat',
  terraformVariables: [
    tv('region', 'string', 'GCP region for deployment', true),
    tv('min_ports_per_vm', 'number', 'Minimum number of ports allocated per VM', false, 64),
    tv('enable_logging', 'bool', 'Enable logging for Cloud NAT', false, true),
  ],
  tier: 'standard',
}

const gcpDataCatalog: CloudComponent = {
  id: 'gcp-data-catalog',
  name: 'Google Data Catalog',
  category: 'governance',
  cloud: 'gcp',
  description:
    'Fully managed, scalable metadata management service for discovering, understanding, and managing data across the organisation.',
  icon: ICON_MAP.governance,
  monthlyBaseCost: 0,
  costFactors: [
    cf('API calls', 'million calls', 10.0, 'Catalog API calls beyond the free tier', 1),
    cf('Storage', 'GB', 0.03, 'Metadata storage for custom entries and tags', 10),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/data-catalog',
  terraformVariables: [
    tv('region', 'string', 'GCP region for deployment', true),
    tv('project_id', 'string', 'GCP project ID', true),
    tv('entry_group_id', 'string', 'Identifier for the default entry group', false, 'default'),
  ],
  tier: 'standard',
}

const gcpCloudMonitoring: CloudComponent = {
  id: 'gcp-cloud-monitoring',
  name: 'Google Cloud Monitoring',
  category: 'monitoring',
  cloud: 'gcp',
  description:
    'Monitoring service providing visibility into the performance, uptime, and health of cloud-powered applications.',
  icon: ICON_MAP.monitoring,
  monthlyBaseCost: 35,
  costFactors: [
    cf('Monitored resources', 'resource', 8.0, 'Monitoring charge per monitored resource per month beyond free tier', 5),
    cf('Custom metrics', 'thousand samples', 0.26, 'Custom metric samples ingested', 100),
    cf('Log-based metrics', 'thousand samples', 0.05, 'Log-based metrics extracted from Cloud Logging', 200),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/cloud-monitoring',
  terraformVariables: [
    tv('project_id', 'string', 'GCP project ID', true),
    tv('notification_channels', 'string', 'Comma-separated list of notification channel types (email, sms, pagerduty)', false, 'email'),
    tv('alert_policy_count', 'number', 'Number of alert policies to create', false, 5),
  ],
  tier: 'standard',
}

const gcpKms: CloudComponent = {
  id: 'gcp-kms',
  name: 'Google Cloud KMS',
  category: 'security',
  cloud: 'gcp',
  description:
    'Cloud-hosted key management service for managing cryptographic keys and performing encryption operations for cloud services.',
  icon: ICON_MAP.security,
  monthlyBaseCost: 1,
  costFactors: [
    cf('Active key versions', 'key version', 0.06, 'Monthly cost per active software key version', 5),
    cf('Cryptographic operations', 'ten-thousand ops', 0.03, 'Encrypt, decrypt, and sign operations', 100),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/kms',
  terraformVariables: [
    tv('region', 'string', 'GCP region for the key ring', true),
    tv('key_ring_name', 'string', 'Name of the Cloud KMS key ring', true),
    tv('rotation_period', 'string', 'Automatic key rotation period (e.g. 7776000s for 90 days)', false, '7776000s'),
  ],
  tier: 'standard',
}

const gcpIam: CloudComponent = {
  id: 'gcp-iam',
  name: 'Google Cloud IAM',
  category: 'security',
  cloud: 'gcp',
  description:
    'Identity and Access Management for fine-grained access control and visibility for centrally managing Google Cloud resources.',
  icon: ICON_MAP.security,
  monthlyBaseCost: 0,
  costFactors: [
    cf('Service accounts', 'account', 0, 'Service accounts created (no additional cost)', 10),
  ],
  requiresPrivateConnectivity: false,
  privateConnectivityCost: 0,
  dependencies: [],
  conflictsWith: [],
  terraformModule: 'modules/gcp/iam',
  terraformVariables: [
    tv('project_id', 'string', 'GCP project ID', true),
    tv('service_account_id', 'string', 'Identifier for the primary service account', true),
    tv('roles', 'string', 'Comma-separated list of IAM roles to bind', false, ''),
  ],
  tier: 'basic',
}

// =========================================================================
//  EXPORTED ARRAY
// =========================================================================

export const cloudComponents: CloudComponent[] = [
  // Azure
  azureDatabricks,
  azureHdinsight,
  azureSynapse,
  azureDataFactory,
  azureAdlsGen2,
  azureBlobStorage,
  azureVnet,
  azurePrivateEndpoints,
  azureFirewall,
  azureVpnGateway,
  azurePurview,
  azureMonitor,
  azureLogAnalytics,
  azureKeyVault,
  azureManagedIdentity,

  // AWS
  awsEmr,
  awsDatabricks,
  awsRedshift,
  awsGlue,
  awsStepFunctions,
  awsS3,
  awsEfs,
  awsVpc,
  awsPrivatelink,
  awsNatGateway,
  awsGlueCatalog,
  awsCloudwatch,
  awsKms,
  awsIam,

  // GCP
  gcpDataproc,
  gcpDatabricks,
  gcpBigquery,
  gcpDataflow,
  gcpComposer,
  gcpGcs,
  gcpVpc,
  gcpPrivateServiceConnect,
  gcpCloudNat,
  gcpDataCatalog,
  gcpCloudMonitoring,
  gcpKms,
  gcpIam,
]
