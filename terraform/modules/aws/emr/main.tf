resource "aws_emr_cluster" "this" {
  name          = "${var.project_name}-emr-${var.environment}"
  release_label = var.release_label
  applications  = var.applications
  service_role  = var.service_role

  ec2_attributes {
    instance_profile                  = var.instance_profile
    subnet_id                         = var.subnet_id
    emr_managed_master_security_group = var.master_security_group_id
    emr_managed_slave_security_group  = var.core_security_group_id
  }

  master_instance_group {
    instance_type  = var.master_instance_type
    instance_count = 1
  }

  core_instance_group {
    instance_type  = var.core_instance_type
    instance_count = var.core_instance_count

    ebs_config {
      size                 = var.core_ebs_size_gb
      type                 = "gp3"
      volumes_per_instance = 1
    }
  }

  log_uri = var.log_uri

  tags = merge(var.tags, {
    Environment = var.environment
  })
}
