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

variable "subnets" {
  description = "Map of subnet configurations"
  type = map(object({
    ip_cidr_range = string
  }))
  default = {
    data = {
      ip_cidr_range = "10.0.1.0/24"
    }
    compute = {
      ip_cidr_range = "10.0.2.0/24"
    }
  }
}
