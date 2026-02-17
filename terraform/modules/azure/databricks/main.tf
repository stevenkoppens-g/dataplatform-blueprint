resource "azurerm_databricks_workspace" "this" {
  name                        = "${var.project_name}-dbw-${var.environment}"
  resource_group_name         = var.resource_group_name
  location                    = var.location
  sku                         = var.sku
  managed_resource_group_name = var.managed_resource_group_name

  custom_parameters {
    no_public_ip = var.no_public_ip
  }

  tags = var.tags
}
