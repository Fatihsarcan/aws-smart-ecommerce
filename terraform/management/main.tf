data "aws_caller_identity" "current" {}

# ─── GitHub Actions OIDC Provider (Management) ─────────────────────────────
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# ─── Terraform Execution Role (Management) ─────────────────────────────────
resource "aws_iam_role" "github_actions_management" {
  name = "GitHubActionsManagementRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_management_admin" {
  role       = aws_iam_role.github_actions_management.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
