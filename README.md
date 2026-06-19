# Smart E-Commerce — AWS Serverless Portfolio Project

A fully serverless e-commerce platform built on AWS, managed entirely with Terraform and deployed via GitHub Actions CI/CD.

---

## Architecture Overview

```mermaid
graph TB
    User(["👤 User"])

    subgraph Frontend ["Frontend"]
        CF["CloudFront CDN\n(OAC)"]
        S3F["S3 Static Hosting\nReact App"]
    end

    subgraph Auth ["Authentication"]
        Cognito["Amazon Cognito\nUser Pool"]
    end

    subgraph API ["API Layer"]
        APIGW["API Gateway\nHTTP API v2"]
    end

    subgraph Compute ["Lambda Functions — Node.js 18.x"]
        LProducts["λ products"]
        LOrders["λ orders"]
        LRec["λ recommendations"]
        LCognito["λ cognito-trigger"]
    end

    subgraph Data ["Database — DynamoDB (PAY_PER_REQUEST)"]
        DBProducts["products table"]
        DBOrders["orders table"]
        DBUsers["users table"]
    end

    subgraph Messaging ["Messaging & Email"]
        SQS["Amazon SQS\nOrder Queue"]
        SES["Amazon SES\nOrder Email"]
    end

    subgraph Security ["Security & Observability"]
        GD["GuardDuty\nThreat Detection"]
        SH["Security Hub\nCIS Benchmark"]
        CT["CloudTrail\nAudit Logs"]
        CW["CloudWatch Logs\n14-day retention"]
    end

    subgraph CICD ["CI/CD — GitHub Actions"]
        GH["GitHub push\nto master"]
        OIDC["OIDC Federation\n(no stored keys)"]
        TF["Terraform Apply\n+ S3 Sync"]
    end

    User -->|"HTTPS"| CF
    CF --> S3F
    S3F -->|"API calls"| APIGW
    User -->|"login/register"| Cognito
    Cognito -->|"post-confirmation"| LCognito
    APIGW --> LProducts
    APIGW --> LOrders
    APIGW --> LRec
    LProducts --> DBProducts
    LOrders --> DBOrders
    LOrders -->|"async"| SQS
    LRec --> DBUsers
    SQS --> LCognito
    LCognito -->|"confirmation email"| SES

    GH -->|"OIDC token"| OIDC
    OIDC -->|"AssumeRoleWithWebIdentity"| TF
    TF -->|"deploy"| APIGW
```

---

## AWS Services

### Compute
| Service | Usage |
|---------|-------|
| **AWS Lambda** | 4 functions: `products`, `orders`, `recommendations`, `cognito-trigger` (Node.js 18.x) |

### API & Networking
| Service | Usage |
|---------|-------|
| **Amazon API Gateway** | HTTP API (v2) — exposes all Lambda functions as REST endpoints |
| **Amazon CloudFront** | CDN for frontend, secure S3 access via Origin Access Control (OAC) |

### Database
| Service | Usage |
|---------|-------|
| **Amazon DynamoDB** | 3 tables: `users`, `products`, `orders` — on-demand (PAY_PER_REQUEST) |

### Authentication & Authorization
| Service | Usage |
|---------|-------|
| **Amazon Cognito** | User registration, login, JWT token management |
| **AWS IAM + OIDC** | Passwordless GitHub Actions → AWS authentication via OIDC federation |

### Storage
| Service | Usage |
|---------|-------|
| **Amazon S3** | Frontend static hosting, CloudTrail audit logs, Terraform remote state |

### Messaging & Email
| Service | Usage |
|---------|-------|
| **Amazon SQS** | Decoupled order processing queue |
| **Amazon SES** | Transactional order confirmation emails |

### Security & Compliance
| Service | Usage |
|---------|-------|
| **Amazon GuardDuty** | Threat detection with S3 log monitoring |
| **AWS Security Hub** | CIS Benchmark + AWS Foundational Security Best Practices standards |
| **AWS CloudTrail** | Multi-region API audit trail (S3 and Lambda data event logging) |

### Observability
| Service | Usage |
|---------|-------|
| **Amazon CloudWatch Logs** | Lambda and API Gateway logs with 14-day retention |

### CI/CD & Infrastructure as Code
| Tool | Usage |
|------|-------|
| **Terraform** | All infrastructure defined as code; remote state in S3, locking via DynamoDB |
| **GitHub Actions** | Push to `master` → automatic Terraform apply + React frontend deploy |

---

## Infrastructure Layout

```
terraform/
├── bootstrap/    # S3 state bucket + DynamoDB lock table
├── management/   # IAM roles, OIDC provider for GitHub Actions
├── security/     # GuardDuty, Security Hub
├── log/          # CloudTrail, audit log S3 bucket
└── workload/     # Lambda, API Gateway, DynamoDB, Cognito, SQS, SES, S3, CloudFront

frontend/         # React app (AWS Amplify v6 for Cognito auth)
lambda/           # Node.js Lambda function source code
.github/
└── workflows/
    ├── terraform-plan.yml   # Runs on pull request
    ├── terraform-apply.yml  # Runs on push to master (terraform/**)
    └── frontend-deploy.yml  # Runs on push to master (frontend/**)
```

---

## CI/CD Pipeline

Authentication uses **OIDC federation** — no AWS access keys stored in GitHub. GitHub Actions assumes an IAM role directly via a short-lived token.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Actions
    participant STS as AWS STS
    participant IAM as IAM Role
    participant TF as Terraform
    participant S3 as S3 / CloudFront

    Dev->>GH: git push to master
    GH->>STS: OIDC token request
    STS-->>GH: short-lived credentials
    GH->>IAM: AssumeRoleWithWebIdentity
    IAM-->>GH: temporary credentials
    GH->>TF: terraform apply
    TF-->>GH: infrastructure updated
    GH->>S3: aws s3 sync (frontend)
    S3-->>GH: deploy complete
```

---

<img width="1913" height="868" alt="Ekran görüntüsü 2026-06-09 173657" src="https://github.com/user-attachments/assets/3f21e2dc-cbf2-4d41-ad2d-965cf54820ad" />
<img width="1910" height="858" alt="Ekran görüntüsü 2026-06-09 173641" src="https://github.com/user-attachments/assets/7596a860-2ca2-402f-8ab6-6c564d6e9806" />

## Features

- Product listing with category filters and search
- Product detail page with "Similar Products" recommendations
- Personalized "Recommended for You" spotlight section on product listing
- User registration and login via Cognito
- Order placement with SQS-based async processing
- Order confirmation email via SES
- Fully automated infrastructure provisioning and frontend deployment

---

## Region

All resources deployed in **eu-central-1** (Frankfurt).
