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

variable "image_version" {
  description = "Cloud Dataproc image version"
  type        = string
  default     = "2.1-debian11"
}

variable "master_num_instances" {
  description = "Number of master instances"
  type        = number
  default     = 1
}

variable "master_machine_type" {
  description = "Machine type for master nodes"
  type        = string
  default     = "n2-standard-4"
}

variable "master_disk_size_gb" {
  description = "Boot disk size in GB for master nodes"
  type        = number
  default     = 100
}

variable "worker_num_instances" {
  description = "Number of worker instances"
  type        = number
  default     = 2
}

variable "worker_machine_type" {
  description = "Machine type for worker nodes"
  type        = string
  default     = "n2-standard-4"
}

variable "worker_disk_size_gb" {
  description = "Boot disk size in GB for worker nodes"
  type        = number
  default     = 200
}

variable "staging_bucket" {
  description = "GCS bucket for staging data"
  type        = string
  default     = ""
}

variable "subnetwork" {
  description = "Subnetwork for the cluster"
  type        = string
  default     = ""
}

variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}
