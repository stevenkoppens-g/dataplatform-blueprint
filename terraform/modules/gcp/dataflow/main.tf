resource "google_dataflow_job" "this" {
  name              = "${var.project_name}-dataflow-${var.environment}"
  project           = var.project_id
  region            = var.region
  template_gcs_path = var.template_gcs_path
  temp_gcs_location = var.temp_gcs_location

  parameters      = var.parameters
  machine_type    = var.machine_type
  max_workers     = var.max_workers
  network         = var.network
  subnetwork      = var.subnetwork
  service_account_email = var.service_account_email

  on_delete = "cancel"

  labels = var.labels
}
