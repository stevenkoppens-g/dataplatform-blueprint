import type { CloudProvider } from '@/types/config'

export interface NetworkingPricing {
  name: string
  description: string
  monthlyCost: number
  perUnit: string
}

export const networkingPricing: Record<CloudProvider, NetworkingPricing[]> = {
  azure: [
    { name: 'Private Endpoint', description: 'Per service private endpoint', monthlyCost: 7.50, perUnit: 'per endpoint' },
    { name: 'VPN Gateway Basic', description: 'Basic VPN gateway', monthlyCost: 27, perUnit: 'per gateway' },
    { name: 'VPN Gateway VpnGw1', description: 'Production VPN gateway', monthlyCost: 140, perUnit: 'per gateway' },
    { name: 'ExpressRoute Local', description: 'ExpressRoute local peering', monthlyCost: 43, perUnit: 'per circuit' },
    { name: 'ExpressRoute Standard', description: 'ExpressRoute standard peering', monthlyCost: 340, perUnit: 'per circuit' },
    { name: 'Azure Firewall', description: 'Azure Firewall Standard', monthlyCost: 912, perUnit: 'per firewall' },
  ],
  aws: [
    { name: 'PrivateLink Endpoint', description: 'VPC endpoint per service', monthlyCost: 7.50, perUnit: 'per endpoint' },
    { name: 'NAT Gateway', description: 'NAT Gateway per AZ', monthlyCost: 35, perUnit: 'per gateway' },
    { name: 'Direct Connect 1Gbps', description: 'Dedicated connection', monthlyCost: 220, perUnit: 'per connection' },
    { name: 'Transit Gateway', description: 'AWS Transit Gateway', monthlyCost: 36, perUnit: 'per attachment' },
  ],
  gcp: [
    { name: 'Private Service Connect', description: 'PSC endpoint', monthlyCost: 7, perUnit: 'per endpoint' },
    { name: 'Cloud NAT', description: 'Cloud NAT per gateway', monthlyCost: 35, perUnit: 'per gateway' },
    { name: 'Cloud Interconnect Partner', description: 'Partner Interconnect', monthlyCost: 150, perUnit: 'per connection' },
    { name: 'Cloud VPN', description: 'HA VPN tunnel', monthlyCost: 36, perUnit: 'per tunnel' },
  ],
}

// Storage pricing per TB
export interface StoragePricing {
  tier: string
  costPerTBMonth: number
}

export const storagePricing: Record<CloudProvider, StoragePricing[]> = {
  azure: [
    { tier: 'Hot', costPerTBMonth: 18.40 },
    { tier: 'Cool', costPerTBMonth: 10 },
    { tier: 'Archive', costPerTBMonth: 1 },
  ],
  aws: [
    { tier: 'Standard', costPerTBMonth: 23 },
    { tier: 'Infrequent Access', costPerTBMonth: 12.50 },
    { tier: 'Glacier', costPerTBMonth: 4 },
  ],
  gcp: [
    { tier: 'Standard', costPerTBMonth: 20 },
    { tier: 'Nearline', costPerTBMonth: 10 },
    { tier: 'Coldline', costPerTBMonth: 4 },
  ],
}
