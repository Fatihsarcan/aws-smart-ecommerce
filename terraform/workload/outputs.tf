output "api_gateway_url" {
  value = aws_apigatewayv2_stage.prod.invoke_url
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "personalize_dataset_group_arn" {
  value = aws_personalize_dataset_group.main.arn
}
