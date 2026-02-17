output "cluster_id" {
  description = "The ID of the EMR cluster"
  value       = aws_emr_cluster.this.id
}

output "cluster_name" {
  description = "The name of the EMR cluster"
  value       = aws_emr_cluster.this.name
}

output "master_public_dns" {
  description = "The public DNS name of the master node"
  value       = aws_emr_cluster.this.master_public_dns
}
