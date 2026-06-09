const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

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
  const { routeKey, pathParameters } = event;

  try {
    if (routeKey === "GET /products/{id}") {
      const result = await docClient.send(
        new GetCommand({ TableName: PRODUCTS_TABLE, Key: { productId: pathParameters.id } })
      );
      if (!result.Item) return resp(404, { message: "Ürün bulunamadı" });
      return resp(200, result.Item);
    }

    if (routeKey === "GET /products") {
      const result = await docClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE }));
      return resp(200, { products: result.Items || [] });
    }

    return resp(405, { message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return resp(500, { message: "Sunucu hatası" });
  }
};
