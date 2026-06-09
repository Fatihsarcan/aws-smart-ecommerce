# ─── AWS Personalize ────────────────────────────────────────────────────────
# NOT: Dataset Group ve Schema'lar Terraform ile oluşturuluyor.
# Solution ve Campaign oluşturmak için önce interaction verisi yüklenmesi gerekiyor.
# Adımlar:
#   1. terraform apply (bu dosya)
#   2. Kullanıcılar alışveriş yaptıkça interactions verisi birikir
#   3. Dataset import job çalıştır
#   4. Solution + Solution Version oluştur (AWS Console veya CLI)
#   5. Campaign oluştur ve ARN'ı lambda.tf'deki PERSONALIZE_CAMPAIGN_ARN'a yaz

resource "aws_personalize_dataset_group" "main" {
  name = "${local.prefix}-dataset-group"
}

resource "aws_personalize_schema" "users" {
  name = "${local.prefix}-users-schema"

  schema = jsonencode({
    type      = "record"
    name      = "Users"
    namespace = "com.amazonaws.personalize.schema"
    fields = [
      { name = "USER_ID", type = "string" },
      { name = "AGE", type = ["null", "int"], categorical = false },
      { name = "INTERESTS", type = ["null", "string"], categorical = true }
    ]
    version = "1.0"
  })
}

resource "aws_personalize_schema" "items" {
  name = "${local.prefix}-items-schema"

  schema = jsonencode({
    type      = "record"
    name      = "Items"
    namespace = "com.amazonaws.personalize.schema"
    fields = [
      { name = "ITEM_ID", type = "string" },
      { name = "CATEGORY", type = ["null", "string"], categorical = true },
      { name = "PRICE", type = ["null", "float"], categorical = false }
    ]
    version = "1.0"
  })
}

resource "aws_personalize_schema" "interactions" {
  name = "${local.prefix}-interactions-schema"

  schema = jsonencode({
    type      = "record"
    name      = "Interactions"
    namespace = "com.amazonaws.personalize.schema"
    fields = [
      { name = "USER_ID", type = "string" },
      { name = "ITEM_ID", type = "string" },
      { name = "TIMESTAMP", type = "long" },
      { name = "EVENT_TYPE", type = "string" }
    ]
    version = "1.0"
  })
}

resource "aws_personalize_dataset" "users" {
  name              = "${local.prefix}-users-dataset"
  dataset_group_arn = aws_personalize_dataset_group.main.arn
  dataset_type      = "Users"
  schema_arn        = aws_personalize_schema.users.arn
}

resource "aws_personalize_dataset" "items" {
  name              = "${local.prefix}-items-dataset"
  dataset_group_arn = aws_personalize_dataset_group.main.arn
  dataset_type      = "Items"
  schema_arn        = aws_personalize_schema.items.arn
}

resource "aws_personalize_dataset" "interactions" {
  name              = "${local.prefix}-interactions-dataset"
  dataset_group_arn = aws_personalize_dataset_group.main.arn
  dataset_type      = "Interactions"
  schema_arn        = aws_personalize_schema.interactions.arn
}
