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

variable "node_type" {
  description = "The node type for the Redshift cluster"
  type        = string
  default     = "dc2.large"
}

variable "number_of_nodes" {
  description = "Number of nodes in the cluster"
  type        = number
  default     = 2
}

variable "database_name" {
  description = "Name of the default database"
  type        = string
  default     = "datawarehouse"
}

variable "master_username" {
  description = "Master username for the cluster"
  type        = string
  default     = "admin"
}

variable "master_password" {
  description = "Master password for the cluster"
  type        = string
  sensitive   = true
}

variable "vpc_security_group_ids" {
  description = "List of VPC security group IDs"
  type        = list(string)
  default     = []
}

variable "cluster_subnet_group_name" {
  description = "Name of the Redshift subnet group"
  type        = string
  default     = ""
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
