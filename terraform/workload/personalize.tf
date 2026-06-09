# ─── AWS Personalize ────────────────────────────────────────────────────────
# NOT: aws_personalize_* kaynakları Terraform AWS provider tarafından
# desteklenmediğinden bu kaynaklar AWS CLI ile oluşturulmalıdır.
#
# Adım 1 — Dataset Group:
#   aws personalize create-dataset-group --name smart-ecommerce-dataset-group
#
# Adım 2 — Schema'lar (users, items, interactions):
#   aws personalize create-schema --name smart-ecommerce-users-schema \
#     --schema file://personalize-schemas/users.json
#   (diğerleri benzer şekilde)
#
# Adım 3 — Dataset'ler oluştur ve veri yükle
#
# Adım 4 — Solution + Campaign oluştur, ARN'ı lambda.tf'ye yaz:
#   PERSONALIZE_CAMPAIGN_ARN = "arn:aws:personalize:..."
