output "storage_account_id" {
  description = "The ID of the storage account"
  value       = azurerm_storage_account.this.id
}

output "storage_account_name" {
  description = "The name of the storage account"
  value       = azurerm_storage_account.this.name
}

output "primary_dfs_endpoint" {
  description = "The primary DFS endpoint for the storage account"
  value       = azurerm_storage_account.this.primary_dfs_endpoint
}

output "adls_filesystem_id" {
  description = "The ID of the ADLS Gen2 filesystem"
  value       = var.is_hns_enabled ? azurerm_storage_data_lake_gen2_filesystem.this[0].id : null
}
