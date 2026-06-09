data "archive_file" "products" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/products/index.js"
  output_path = "${path.module}/../../lambda/products/products.zip"
}

data "archive_file" "orders" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/orders/index.js"
  output_path = "${path.module}/../../lambda/orders/orders.zip"
}

data "archive_file" "recommendations" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/recommendations/index.js"
  output_path = "${path.module}/../../lambda/recommendations/recommendations.zip"
}

data "archive_file" "cognito_trigger" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/cognito-trigger/index.js"
  output_path = "${path.module}/../../lambda/cognito-trigger/cognito-trigger.zip"
}

# ─── Products Lambda ────────────────────────────────────────────────────────
resource "aws_lambda_function" "products" {
  function_name    = "${local.prefix}-products"
  role             = aws_iam_role.lambda_products.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.products.output_path
  source_code_hash = data.archive_file.products.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      PRODUCTS_TABLE = aws_dynamodb_table.products.name
    }
  }
}

resource "aws_cloudwatch_log_group" "products" {
  name              = "/aws/lambda/${aws_lambda_function.products.function_name}"
  retention_in_days = 14
}

# ─── Orders Lambda ──────────────────────────────────────────────────────────
resource "aws_lambda_function" "orders" {
  function_name    = "${local.prefix}-orders"
  role             = aws_iam_role.lambda_orders.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.orders.output_path
  source_code_hash = data.archive_file.orders.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      ORDERS_TABLE     = aws_dynamodb_table.orders.name
      ORDERS_QUEUE_URL = aws_sqs_queue.orders.url
    }
  }
}

resource "aws_cloudwatch_log_group" "orders" {
  name              = "/aws/lambda/${aws_lambda_function.orders.function_name}"
  retention_in_days = 14
}

# ─── Recommendations Lambda ─────────────────────────────────────────────────
resource "aws_lambda_function" "recommendations" {
  function_name    = "${local.prefix}-recommendations"
  role             = aws_iam_role.lambda_recommendations.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.recommendations.output_path
  source_code_hash = data.archive_file.recommendations.output_base64sha256
  timeout          = 60

  environment {
    variables = {
      PRODUCTS_TABLE           = aws_dynamodb_table.products.name
      USERS_TABLE              = aws_dynamodb_table.users.name
      SES_FROM_EMAIL           = var.ses_from_email
      PERSONALIZE_CAMPAIGN_ARN = "REPLACE_AFTER_TRAINING"
    }
  }
}

resource "aws_cloudwatch_log_group" "recommendations" {
  name              = "/aws/lambda/${aws_lambda_function.recommendations.function_name}"
  retention_in_days = 14
}

# ─── Cognito Trigger Lambda ──────────────────────────────────────────────────
resource "aws_lambda_function" "cognito_trigger" {
  function_name    = "${local.prefix}-cognito-trigger"
  role             = aws_iam_role.lambda_cognito_trigger.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  filename         = data.archive_file.cognito_trigger.output_path
  source_code_hash = data.archive_file.cognito_trigger.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      USERS_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_cloudwatch_log_group" "cognito_trigger" {
  name              = "/aws/lambda/${aws_lambda_function.cognito_trigger.function_name}"
  retention_in_days = 14
}
