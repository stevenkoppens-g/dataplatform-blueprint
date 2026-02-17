resource "azurerm_synapse_workspace" "this" {
  name                                 = "${var.project_name}-syn-${var.environment}"
  resource_group_name                  = var.resource_group_name
  location                             = var.location
  storage_data_lake_gen2_filesystem_id = var.storage_data_lake_gen2_filesystem_id
  sql_administrator_login              = var.sql_administrator_login
  sql_administrator_login_password     = var.sql_administrator_login_password

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}
