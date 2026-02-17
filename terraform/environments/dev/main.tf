terraform {
  required_version = ">= 1.5.0"

  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stdataplatformtfstate"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "this" {
  name     = "${var.project_name}-rg-${var.environment}"
  location = var.location
  tags     = var.tags
}

module "networking" {
  source = "../../modules/azure/networking"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  project_name        = var.project_name
  tags                = var.tags
}

module "storage" {
  source = "../../modules/azure/storage"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  project_name        = var.project_name
  account_tier        = "Standard"
  account_replication_type = "LRS"
  tags                = var.tags
}

module "key_vault" {
  source = "../../modules/azure/key-vault"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  project_name        = var.project_name
  sku_name            = "standard"
  tags                = var.tags
}

module "databricks" {
  source = "../../modules/azure/databricks"

  environment                 = var.environment
  location                    = var.location
  resource_group_name         = azurerm_resource_group.this.name
  project_name                = var.project_name
  sku                         = "premium"
  managed_resource_group_name = "${var.project_name}-dbw-managed-rg-${var.environment}"
  tags                        = var.tags
}

module "monitor" {
  source = "../../modules/azure/monitor"

  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  project_name        = var.project_name
  retention_in_days   = 30
  tags                = var.tags
}
