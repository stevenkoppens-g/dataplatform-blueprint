resource "google_dataproc_cluster" "this" {
  name    = "${var.project_name}-dataproc-${var.environment}"
  region  = var.region
  project = var.project_id

  cluster_config {
    staging_bucket = var.staging_bucket

    master_config {
      num_instances = var.master_num_instances
      machine_type  = var.master_machine_type

      disk_config {
        boot_disk_type    = "pd-ssd"
        boot_disk_size_gb = var.master_disk_size_gb
      }
    }

    worker_config {
      num_instances = var.worker_num_instances
      machine_type  = var.worker_machine_type

      disk_config {
        boot_disk_type    = "pd-standard"
        boot_disk_size_gb = var.worker_disk_size_gb
      }
    }

    software_config {
      image_version = var.image_version
    }

    gce_cluster_config {
      subnetwork = var.subnetwork
      tags       = ["dataproc", var.environment]
    }
  }

  labels = var.labels
}
