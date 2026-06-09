const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { randomUUID } = require("crypto");

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

const ORDERS_TABLE = process.env.ORDERS_TABLE;
const ORDERS_QUEUE_URL = process.env.ORDERS_QUEUE_URL;

const resp = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  const { routeKey, requestContext, body } = event;
  const claims = requestContext.authorizer?.jwt?.claims || {};
  const userId = claims.sub;
  const userEmail = claims.email;

  try {
    if (routeKey === "POST /orders") {
      const { productId, productName, price } = JSON.parse(body);

      const orderId = randomUUID();
      const createdAt = new Date().toISOString();

      const order = { orderId, userId, userEmail, productId, productName, price, status: "COMPLETED", createdAt };

      await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: order }));

      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: ORDERS_QUEUE_URL,
          MessageBody: JSON.stringify({ userId, userEmail, productId, orderId, timestamp: Date.now() }),
        })
      );

      return resp(201, { order });
    }

    if (routeKey === "GET /orders") {
      const result = await docClient.send(
        new QueryCommand({
          TableName: ORDERS_TABLE,
          IndexName: "userId-index",
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
        })
      );
      return resp(200, { orders: result.Items || [] });
    }

    return resp(405, { message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return resp(500, { message: "Sunucu hatası" });
  }
};
