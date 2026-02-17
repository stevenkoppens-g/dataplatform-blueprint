variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "AWS region for resource deployment"
  type        = string
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

variable "description" {
  description = "Description of the KMS key"
  type        = string
  default     = "Data platform encryption key"
}

variable "key_usage" {
  description = "Intended use of the key (ENCRYPT_DECRYPT or SIGN_VERIFY)"
  type        = string
  default     = "ENCRYPT_DECRYPT"
}

variable "key_alias" {
  description = "Alias suffix for the KMS key"
  type        = string
  default     = "data-key"
}

variable "deletion_window_in_days" {
  description = "Waiting period before key deletion (7-30 days)"
  type        = number
  default     = 30
}

variable "enable_key_rotation" {
  description = "Whether automatic key rotation is enabled"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
