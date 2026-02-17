resource "google_kms_key_ring" "this" {
  name     = "${var.project_name}-keyring-${var.environment}"
  project  = var.project_id
  location = var.region
}

resource "google_kms_crypto_key" "this" {
  for_each = var.crypto_keys

  name            = "${var.project_name}-${each.key}-${var.environment}"
  key_ring        = google_kms_key_ring.this.id
  rotation_period = each.value.rotation_period
  purpose         = each.value.purpose

  version_template {
    algorithm        = each.value.algorithm
    protection_level = each.value.protection_level
  }

  labels = var.labels
}
