variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "GCP region for resource deployment"
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

variable "crypto_keys" {
  description = "Map of crypto key configurations"
  type = map(object({
    rotation_period  = optional(string, "7776000s")
    purpose          = optional(string, "ENCRYPT_DECRYPT")
    algorithm        = optional(string, "GOOGLE_SYMMETRIC_ENCRYPTION")
    protection_level = optional(string, "SOFTWARE")
  }))
  default = {
    data-key = {}
  }
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}
