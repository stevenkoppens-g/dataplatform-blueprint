resource "aws_redshift_cluster" "this" {
  cluster_identifier = "${var.project_name}-redshift-${var.environment}"
  database_name      = var.database_name
  master_username    = var.master_username
  master_password    = var.master_password
  node_type          = var.node_type
  number_of_nodes    = var.number_of_nodes
  cluster_type       = var.number_of_nodes > 1 ? "multi-node" : "single-node"

  vpc_security_group_ids    = var.vpc_security_group_ids
  cluster_subnet_group_name = var.cluster_subnet_group_name

  encrypted  = true
  kms_key_id = var.kms_key_id

  skip_final_snapshot = var.environment != "prod"

  tags = merge(var.tags, {
    Environment = var.environment
  })
}
