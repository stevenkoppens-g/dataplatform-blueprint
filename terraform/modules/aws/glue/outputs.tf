output "catalog_database_name" {
  description = "The name of the Glue catalog database"
  value       = aws_glue_catalog_database.this.name
}

output "catalog_database_arn" {
  description = "The ARN of the Glue catalog database"
  value       = aws_glue_catalog_database.this.arn
}

output "crawler_names" {
  description = "Map of crawler names"
  value       = { for k, v in aws_glue_crawler.this : k => v.name }
}
