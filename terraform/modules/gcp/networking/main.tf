resource "google_compute_network" "this" {
  name                    = "${var.project_name}-vpc-${var.environment}"
  project                 = var.project_id
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "this" {
  for_each = var.subnets

  name          = "${var.project_name}-${each.key}-${var.environment}"
  project       = var.project_id
  region        = var.region
  network       = google_compute_network.this.id
  ip_cidr_range = each.value.ip_cidr_range

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
  }
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.project_name}-allow-internal-${var.environment}"
  project = var.project_id
  network = google_compute_network.this.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [for s in var.subnets : s.ip_cidr_range]
}

resource "google_compute_firewall" "deny_all_ingress" {
  name     = "${var.project_name}-deny-all-ingress-${var.environment}"
  project  = var.project_id
  network  = google_compute_network.this.name
  priority = 65534

  deny {
    protocol = "all"
  }

  source_ranges = ["0.0.0.0/0"]
}
