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

variable "log_retention_days" {
  description = "Number of days to retain log events"
  type        = number
  default     = 30
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for log encryption"
  type        = string
  default     = null
}

variable "metric_alarms" {
  description = "Map of CloudWatch metric alarm configurations"
  type = map(object({
    description         = string
    comparison_operator = string
    evaluation_periods  = number
    metric_name         = string
    namespace           = string
    period              = number
    statistic           = string
    threshold           = number
  }))
  default = {}
}

variable "alarm_actions" {
  description = "List of ARNs for alarm state actions (e.g. SNS topic)"
  type        = list(string)
  default     = []
}

variable "ok_actions" {
  description = "List of ARNs for OK state actions"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
