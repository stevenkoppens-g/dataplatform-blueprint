output "log_group_name" {
  description = "The name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.this.name
}

output "log_group_arn" {
  description = "The ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.this.arn
}

output "alarm_arns" {
  description = "Map of alarm names to their ARNs"
  value       = { for k, v in aws_cloudwatch_metric_alarm.this : k => v.arn }
}
