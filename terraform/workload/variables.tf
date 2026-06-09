variable "region" {
  default = "eu-central-1" # Frankfurt
}

variable "github_repo" {
  default = "Fatihsarcan/aws-smart-ecommerce"
}

variable "ses_from_email" {
  description = "SES verified sender email"
  default     = "zfatihed@mail.com"
}

locals {
  prefix = "smart-ecommerce"
}
