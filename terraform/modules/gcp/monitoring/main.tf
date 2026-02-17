resource "google_monitoring_notification_channel" "email" {
  for_each = toset(var.notification_emails)

  display_name = "${var.project_name}-${var.environment}-${each.value}"
  project      = var.project_id
  type         = "email"

  labels = {
    email_address = each.value
  }
}

resource "google_monitoring_alert_policy" "this" {
  for_each = var.alert_policies

  display_name = "${var.project_name}-${each.key}-${var.environment}"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = each.value.condition_display_name

    condition_threshold {
      filter          = each.value.filter
      comparison      = each.value.comparison
      threshold_value = each.value.threshold_value
      duration        = each.value.duration

      aggregations {
        alignment_period   = each.value.alignment_period
        per_series_aligner = each.value.per_series_aligner
      }
    }
  }

  notification_channels = [
    for ch in google_monitoring_notification_channel.email : ch.id
  ]

  user_labels = var.labels
}
