terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # DEĞIŞTIR: ACCOUNT_ID → Gerçek hesap ID'niz (bootstrap ile oluşturulan bucket)
  backend "s3" {
    bucket         = "smart-ecommerce-tfstate-ACCOUNT_ID"
    key            = "management/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "smart-ecommerce-tfstate-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "eu-central-1"

  default_tags {
    tags = {
      Project     = "smart-ecommerce"
      Environment = "management"
      ManagedBy   = "terraform"
    }
  }
}
