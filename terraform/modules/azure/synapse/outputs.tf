output "workspace_id" {
  description = "The ID of the Synapse workspace"
  value       = azurerm_synapse_workspace.this.id
}

output "connectivity_endpoints" {
  description = "The connectivity endpoints for the Synapse workspace"
  value       = azurerm_synapse_workspace.this.connectivity_endpoints
}

output "identity_principal_id" {
  description = "The principal ID of the system-assigned managed identity"
  value       = azurerm_synapse_workspace.this.identity[0].principal_id
}
