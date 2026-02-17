resource "aws_kms_key" "this" {
  description             = var.description
  key_usage               = var.key_usage
  deletion_window_in_days = var.deletion_window_in_days
  enable_key_rotation     = var.enable_key_rotation

  tags = merge(var.tags, {
    Environment = var.environment
  })
}

resource "aws_kms_alias" "this" {
  name          = "alias/${var.project_name}-${var.key_alias}-${var.environment}"
  target_key_id = aws_kms_key.this.key_id
}
