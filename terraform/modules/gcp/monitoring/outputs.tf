output "notification_channel_ids" {
  description = "Map of email addresses to notification channel IDs"
  value       = { for k, v in google_monitoring_notification_channel.email : k => v.id }
}

output "alert_policy_ids" {
  description = "Map of alert policy names to their IDs"
  value       = { for k, v in google_monitoring_alert_policy.this : k => v.id }
}
