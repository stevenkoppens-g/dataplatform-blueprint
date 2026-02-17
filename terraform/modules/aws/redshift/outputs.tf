output "cluster_id" {
  description = "The ID of the Redshift cluster"
  value       = aws_redshift_cluster.this.id
}

output "cluster_endpoint" {
  description = "The endpoint of the Redshift cluster"
  value       = aws_redshift_cluster.this.endpoint
}

output "cluster_dns_name" {
  description = "The DNS name of the Redshift cluster"
  value       = aws_redshift_cluster.this.dns_name
}

output "database_name" {
  description = "The name of the default database"
  value       = aws_redshift_cluster.this.database_name
}
