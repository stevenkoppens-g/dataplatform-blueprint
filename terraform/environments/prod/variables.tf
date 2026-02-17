variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
  default     = "eastus2"
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

variable "synapse_sql_password" {
  description = "Password for the Synapse SQL administrator"
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
