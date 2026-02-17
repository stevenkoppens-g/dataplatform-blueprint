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

variable "crawler_role_arn" {
  description = "IAM role ARN for the Glue crawler"
  type        = string
}

variable "crawlers" {
  description = "Map of crawler configurations"
  type = map(object({
    s3_target_path = string
    schedule       = optional(string, "")
  }))
  default = {}
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
