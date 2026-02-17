resource "azurerm_storage_account" "this" {
  name                     = replace("${var.project_name}st${var.environment}", "-", "")
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = var.account_tier
  account_replication_type = var.account_replication_type
  account_kind             = "StorageV2"
  is_hns_enabled           = var.is_hns_enabled

  min_tls_version = "TLS1_2"

  blob_properties {
    delete_retention_policy {
      days = var.soft_delete_retention_days
    }
  }

  tags = var.tags
}

resource "azurerm_storage_data_lake_gen2_filesystem" "this" {
  count = var.is_hns_enabled ? 1 : 0

  name               = var.adls_filesystem_name
  storage_account_id = azurerm_storage_account.this.id
}
