variable "region" {
  default = "eu-central-1"
}

variable "github_repo" {
  default = "Fatihsarcan/aws-smart-ecommerce"
}

variable "ses_from_email" {
  description = "SES verified sender email"
  default     = "zfatihed@gmail.com"
}

locals {
  prefix = "smart-ecommerce"
}
