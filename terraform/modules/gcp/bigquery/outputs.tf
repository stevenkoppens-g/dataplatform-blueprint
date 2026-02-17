output "dataset_id" {
  description = "The ID of the BigQuery dataset"
  value       = google_bigquery_dataset.this.dataset_id
}

output "dataset_self_link" {
  description = "The self link of the BigQuery dataset"
  value       = google_bigquery_dataset.this.self_link
}

output "example_table_id" {
  description = "The ID of the example table (if created)"
  value       = var.create_example_table ? google_bigquery_table.example[0].table_id : null
}
