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

variable "release_label" {
  description = "EMR release label (e.g. emr-7.0.0)"
  type        = string
  default     = "emr-7.0.0"
}

variable "applications" {
  description = "List of EMR applications to install"
  type        = list(string)
  default     = ["Spark", "Hive", "Presto"]
}

variable "master_instance_type" {
  description = "EC2 instance type for master nodes"
  type        = string
  default     = "m5.xlarge"
}

variable "core_instance_type" {
  description = "EC2 instance type for core nodes"
  type        = string
  default     = "m5.xlarge"
}

variable "core_instance_count" {
  description = "Number of core instances"
  type        = number
  default     = 2
}

variable "core_ebs_size_gb" {
  description = "EBS volume size in GB for core instances"
  type        = number
  default     = 100
}

variable "service_role" {
  description = "IAM role for the EMR service"
  type        = string
}

variable "instance_profile" {
  description = "IAM instance profile for EC2 instances"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for the EMR cluster"
  type        = string
}

variable "master_security_group_id" {
  description = "Security group ID for master nodes"
  type        = string
}

variable "core_security_group_id" {
  description = "Security group ID for core nodes"
  type        = string
}

variable "log_uri" {
  description = "S3 URI for EMR logs"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
