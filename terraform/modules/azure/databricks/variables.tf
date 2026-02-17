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

variable "sku" {
  description = "The SKU of the Databricks workspace (standard, premium, trial)"
  type        = string
  default     = "premium"
}

variable "managed_resource_group_name" {
  description = "Name of the managed resource group for Databricks"
  type        = string
}

variable "no_public_ip" {
  description = "Whether public IPs are disallowed for the workspace"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
