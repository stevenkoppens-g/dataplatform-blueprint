resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/${var.project_name}/${var.environment}"
  retention_in_days = var.log_retention_days
  kms_key_id        = var.kms_key_arn

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_cloudwatch_metric_alarm" "this" {
  for_each = var.metric_alarms

  alarm_name          = "${var.project_name}-${each.key}-${var.environment}"
  alarm_description   = each.value.description
  comparison_operator = each.value.comparison_operator
  evaluation_periods  = each.value.evaluation_periods
  metric_name         = each.value.metric_name
  namespace           = each.value.namespace
  period              = each.value.period
  statistic           = each.value.statistic
  threshold           = each.value.threshold
  treat_missing_data  = "notBreaching"

  alarm_actions = var.alarm_actions
  ok_actions    = var.ok_actions

  tags = merge(var.tags, {
    Environment = var.environment
  })
}
