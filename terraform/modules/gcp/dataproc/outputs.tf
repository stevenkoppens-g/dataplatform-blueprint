output "cluster_name" {
  description = "The name of the Dataproc cluster"
  value       = google_dataproc_cluster.this.name
}

output "cluster_id" {
  description = "The ID of the Dataproc cluster"
  value       = google_dataproc_cluster.this.id
}

output "master_instance_names" {
  description = "List of master instance names"
  value       = google_dataproc_cluster.this.cluster_config[0].master_config[0].instance_names
}
