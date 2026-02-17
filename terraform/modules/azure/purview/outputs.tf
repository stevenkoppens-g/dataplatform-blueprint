output "purview_account_id" {
  description = "The ID of the Purview account"
  value       = azurerm_purview_account.this.id
}

output "catalog_endpoint" {
  description = "The catalog endpoint of the Purview account"
  value       = azurerm_purview_account.this.catalog_endpoint
}

output "identity_principal_id" {
  description = "The principal ID of the system-assigned managed identity"
  value       = azurerm_purview_account.this.identity[0].principal_id
}
