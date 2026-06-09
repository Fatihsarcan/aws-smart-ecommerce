resource "aws_cognito_user_pool" "main" {
  name = "${local.prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "age"
    attribute_data_type = "Number"
    required            = false
    mutable             = true

    number_attribute_constraints {
      min_value = "0"
      max_value = "150"
    }
  }

  schema {
    name                = "interests"
    attribute_data_type = "String"
    required            = false
    mutable             = true

    string_attribute_constraints {
      min_length = "0"
      max_length = "500"
    }
  }

  lambda_config {
    post_confirmation = aws_lambda_function.cognito_trigger.arn
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.prefix}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}

resource "aws_lambda_permission" "cognito_trigger" {
  statement_id  = "AllowCognitoInvocation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_trigger.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
