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

variable "bucket_name" {
  description = "Name suffix for the S3 bucket"
  type        = string
  default     = "datalake"
}

variable "versioning_enabled" {
  description = "Whether versioning is enabled on the bucket"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for server-side encryption (empty for AES256)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
