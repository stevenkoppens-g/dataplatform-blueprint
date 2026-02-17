output "job_id" {
  description = "The unique ID of the Dataflow job"
  value       = google_dataflow_job.this.id
}

output "job_name" {
  description = "The name of the Dataflow job"
  value       = google_dataflow_job.this.name
}

output "state" {
  description = "The current state of the Dataflow job"
  value       = google_dataflow_job.this.state
}
