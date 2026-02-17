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

variable "bucket_name" {
  description = "Name suffix for the GCS bucket"
  type        = string
  default     = "datalake"
}

variable "storage_class" {
  description = "Storage class for the bucket"
  type        = string
  default     = "STANDARD"
}

variable "versioning_enabled" {
  description = "Whether versioning is enabled"
  type        = bool
  default     = true
}

variable "lifecycle_archive_age_days" {
  description = "Number of days before transitioning objects to NEARLINE"
  type        = number
  default     = 90
}

variable "lifecycle_delete_age_days" {
  description = "Number of days before deleting objects"
  type        = number
  default     = 365
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}
