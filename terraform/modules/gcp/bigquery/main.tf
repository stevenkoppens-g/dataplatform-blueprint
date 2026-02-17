resource "google_bigquery_dataset" "this" {
  dataset_id    = replace("${var.project_name}_${var.environment}", "-", "_")
  friendly_name = "${var.project_name} ${var.environment} dataset"
  description   = "BigQuery dataset for ${var.project_name} ${var.environment}"
  project       = var.project_id
  location      = var.region

  default_table_expiration_ms    = var.default_table_expiration_ms
  delete_contents_on_destroy     = var.environment != "prod"

  labels = var.labels
}

resource "google_bigquery_table" "example" {
  count = var.create_example_table ? 1 : 0

  dataset_id          = google_bigquery_dataset.this.dataset_id
  table_id            = "example_events"
  project             = var.project_id
  deletion_protection = var.environment == "prod"

  time_partitioning {
    type  = "DAY"
    field = "event_timestamp"
  }

  schema = jsonencode([
    { name = "event_id", type = "STRING", mode = "REQUIRED" },
    { name = "event_timestamp", type = "TIMESTAMP", mode = "REQUIRED" },
    { name = "event_type", type = "STRING", mode = "NULLABLE" },
    { name = "payload", type = "JSON", mode = "NULLABLE" }
  ])

  labels = var.labels
}
