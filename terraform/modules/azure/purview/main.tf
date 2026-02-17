resource "azurerm_purview_account" "this" {
  name                = "${var.project_name}-pva-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location

  identity {
    type = "SystemAssigned"
  }

  public_network_enabled = var.public_network_enabled

  tags = var.tags
}
