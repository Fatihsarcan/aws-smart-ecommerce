resource "aws_sqs_queue" "orders_dlq" {
  name                      = "${local.prefix}-orders-dlq"
  message_retention_seconds = 1209600 # 14 days
}

resource "aws_sqs_queue" "orders" {
  name                       = "${local.prefix}-orders"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400 # 1 day

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.orders_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_lambda_event_source_mapping" "orders_to_recommendations" {
  event_source_arn = aws_sqs_queue.orders.arn
  function_name    = aws_lambda_function.recommendations.arn
  batch_size       = 10
  enabled          = true
}
