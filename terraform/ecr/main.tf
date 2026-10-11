
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "catalog" {
  name                 = "furnimart-catalog"
  image_tag_mutability = "IMMUTABLE"
  force_delete          = true

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Project     = "FurniMart"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}
