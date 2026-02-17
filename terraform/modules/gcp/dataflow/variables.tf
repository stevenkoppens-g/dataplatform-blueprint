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

variable "template_gcs_path" {
  description = "GCS path to the Dataflow template"
  type        = string
}

variable "temp_gcs_location" {
  description = "GCS path for temporary files"
  type        = string
}

variable "parameters" {
  description = "Key-value parameters passed to the Dataflow template"
  type        = map(string)
  default     = {}
}

variable "machine_type" {
  description = "Machine type for Dataflow workers"
  type        = string
  default     = "n1-standard-4"
}

variable "max_workers" {
  description = "Maximum number of workers"
  type        = number
  default     = 10
}

variable "network" {
  description = "VPC network for the Dataflow job"
  type        = string
  default     = ""
}

variable "subnetwork" {
  description = "Subnetwork for the Dataflow job"
  type        = string
  default     = ""
}

variable "service_account_email" {
  description = "Service account email for the Dataflow job"
  type        = string
  default     = ""
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}
