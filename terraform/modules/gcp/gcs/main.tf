resource "google_storage_bucket" "this" {
  name          = "${var.project_name}-${var.bucket_name}-${var.environment}"
  project       = var.project_id
  location      = var.region
  storage_class = var.storage_class

  uniform_bucket_level_access = true

  versioning {
    enabled = var.versioning_enabled
  }

  lifecycle_rule {
    condition {
      age = var.lifecycle_archive_age_days
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = var.lifecycle_delete_age_days
    }
    action {
      type = "Delete"
    }
  }

  labels = var.labels
}
