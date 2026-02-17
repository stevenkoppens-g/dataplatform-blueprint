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

variable "storage_data_lake_gen2_filesystem_id" {
  description = "The ID of the ADLS Gen2 filesystem for the Synapse workspace"
  type        = string
}

variable "sql_administrator_login" {
  description = "The SQL administrator login name"
  type        = string
  default     = "sqladmin"
}

variable "sql_administrator_login_password" {
  description = "The SQL administrator login password"
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
