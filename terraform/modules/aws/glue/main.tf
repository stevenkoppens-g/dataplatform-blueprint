resource "aws_glue_catalog_database" "this" {
  name = "${var.project_name}_${var.environment}"

  description = "Glue catalog database for ${var.project_name} ${var.environment}"
}

resource "aws_glue_crawler" "this" {
  for_each = var.crawlers

  database_name = aws_glue_catalog_database.this.name
  name          = "${var.project_name}-${each.key}-${var.environment}"
  role          = var.crawler_role_arn
  schedule      = each.value.schedule

  s3_target {
    path = each.value.s3_target_path
  }

  schema_change_policy {
    delete_behavior = "LOG"
    update_behavior = "UPDATE_IN_DATABASE"
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}
