variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

variable "address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnets" {
  description = "Map of subnet configurations"
  type = map(object({
    address_prefixes = list(string)
  }))
  default = {
    default = {
      address_prefixes = ["10.0.1.0/24"]
    }
    databricks-public = {
      address_prefixes = ["10.0.2.0/24"]
    }
    databricks-private = {
      address_prefixes = ["10.0.3.0/24"]
    }
  }
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
