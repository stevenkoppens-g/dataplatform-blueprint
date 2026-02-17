variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "GCP region (or multi-region like US, EU)"
  type        = string
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

variable "default_table_expiration_ms" {
  description = "Default expiration time for tables in milliseconds (null for no expiry)"
  type        = number
  default     = null
}

variable "create_example_table" {
  description = "Whether to create the example events table"
  type        = bool
  default     = false
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}
