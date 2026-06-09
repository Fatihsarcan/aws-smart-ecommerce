const { PersonalizeRuntimeClient, GetRecommendationsCommand } = require("@aws-sdk/client-personalize-runtime");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, BatchGetCommand } = require("@aws-sdk/lib-dynamodb");

const personalizeClient = new PersonalizeRuntimeClient({ region: process.env.AWS_REGION });
const sesClient = new SESClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const CAMPAIGN_ARN = process.env.PERSONALIZE_CAMPAIGN_ARN;
const FROM_EMAIL = process.env.SES_FROM_EMAIL;

exports.handler = async (event) => {
  for (const record of event.Records) {
    const { userId, userEmail, productId } = JSON.parse(record.body);

    try {
      // Personalize henüz eğitilmediyse (REPLACE_AFTER_TRAINING) atla
      if (CAMPAIGN_ARN === "REPLACE_AFTER_TRAINING") {
        console.log("Personalize campaign not configured yet, skipping.");
        continue;
      }

      const recs = await personalizeClient.send(
        new GetRecommendationsCommand({ campaignArn: CAMPAIGN_ARN, userId, numResults: 5 })
      );

      const itemIds = recs.itemList.map((item) => item.itemId);
      if (!itemIds.length) continue;

      const productsResult = await docClient.send(
        new BatchGetCommand({
          RequestItems: { [PRODUCTS_TABLE]: { Keys: itemIds.map((id) => ({ productId: id })) } },
        })
      );

      const products = productsResult.Responses?.[PRODUCTS_TABLE] || [];
      if (!products.length) continue;

      await sesClient.send(
        new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: [userEmail] },
          Message: {
            Subject: { Data: "Bunları da beğenebilirsin! 🛍️" },
            Body: { Html: { Data: buildEmail(products) } },
          },
        })
      );

      console.log(`Recommendation email sent to ${userEmail}`);
    } catch (err) {
      console.error(`Error for user ${userId}:`, err);
    }
  }
};

function buildEmail(products) {
  const rows = products
    .map(
      (p) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;">
        <div style="font-weight:600;color:#111;">${p.name}</div>
        <div style="font-size:12px;color:#888;">${p.category || ""}</div>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#e47911;">
        €${p.price}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#232f3e;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Smart E-Commerce</h1>
            <p style="margin:6px 0 0;color:#aaa;font-size:14px;">Sadece senin için seçtik</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="margin:0 0 16px;color:#111;">Bunları da beğenebilirsin!</h2>
            <p style="color:#555;margin:0 0 20px;">Son alışverişine göre sana özel öneriler:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
              ${rows}
            </table>
            <div style="text-align:center;margin-top:24px;">
              <a href="#" style="background:#ff9900;color:#111;padding:12px 32px;text-decoration:none;border-radius:4px;font-weight:700;display:inline-block;">
                Hepsini Gör →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
