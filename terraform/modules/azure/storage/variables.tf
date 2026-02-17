variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

variable "account_tier" {
  description = "Storage account tier (Standard, Premium)"
  type        = string
  default     = "Standard"
}

variable "account_replication_type" {
  description = "Storage replication type (LRS, GRS, RAGRS, ZRS)"
  type        = string
  default     = "LRS"
}

variable "is_hns_enabled" {
  description = "Enable hierarchical namespace for ADLS Gen2"
  type        = bool
  default     = true
}

variable "adls_filesystem_name" {
  description = "Name of the ADLS Gen2 filesystem"
  type        = string
  default     = "datalake"
}

variable "soft_delete_retention_days" {
  description = "Number of days for blob soft delete retention"
  type        = number
  default     = 7
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
