const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

exports.handler = async (event) => {
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event;
  }

  const attrs = event.request.userAttributes;

  await docClient.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        userId: attrs.sub,
        email: attrs.email,
        name: attrs.name || "",
        age: attrs["custom:age"] ? parseInt(attrs["custom:age"]) : null,
        interests: attrs["custom:interests"]
          ? attrs["custom:interests"].split(",").map((s) => s.trim())
          : [],
        createdAt: new Date().toISOString(),
      },
    })
  );

  return event;
};
