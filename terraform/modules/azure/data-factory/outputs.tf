output "data_factory_id" {
  description = "The ID of the Data Factory"
  value       = azurerm_data_factory.this.id
}

output "data_factory_name" {
  description = "The name of the Data Factory"
  value       = azurerm_data_factory.this.name
}

output "identity_principal_id" {
  description = "The principal ID of the system-assigned managed identity"
  value       = azurerm_data_factory.this.identity[0].principal_id
}
