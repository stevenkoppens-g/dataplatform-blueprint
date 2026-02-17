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

variable "notification_emails" {
  description = "List of email addresses for alert notifications"
  type        = list(string)
  default     = []
}

variable "alert_policies" {
  description = "Map of alert policy configurations"
  type = map(object({
    condition_display_name = string
    filter                 = string
    comparison             = string
    threshold_value        = number
    duration               = string
    alignment_period       = optional(string, "300s")
    per_series_aligner     = optional(string, "ALIGN_RATE")
  }))
  default = {}
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}
