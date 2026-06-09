# SES Email Identity - zfatihed@mail.com adresine verification email gidecek
resource "aws_ses_email_identity" "sender" {
  email = var.ses_from_email
}
