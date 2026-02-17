output "key_ring_id" {
  description = "The ID of the KMS key ring"
  value       = google_kms_key_ring.this.id
}

output "key_ring_name" {
  description = "The name of the KMS key ring"
  value       = google_kms_key_ring.this.name
}

output "crypto_key_ids" {
  description = "Map of crypto key names to their IDs"
  value       = { for k, v in google_kms_crypto_key.this : k => v.id }
}
