// ../open-kuafu-system/src/sys/abs/config.ts
var AWS_REGION = "us-east-1";

// ../open-kuafu-system/src/table/action/table.ts
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
async function insertOne(params, context) {
  console.log("params", params);
  console.log("context", context);
  const dbclient = new DynamoDBClient({ region: AWS_REGION });
  const paramsTemp = {
    TableName: "YourTableName",
    // 把YourTableName替换为你的表名
    Item: {
      "column1": { S: "value1" },
      // 把column1和value1替换为你需要添加的属性和值
      "column2": { N: "111" }
      // 把column2和value2替换为你需要添加的属性和值
    }
  };
  try {
    await dbclient.send(new PutItemCommand(paramsTemp));
    console.log("Data inserted successfully");
    return { code: 1 };
  } catch (error) {
    console.error("An error occurred while inserting data", error);
    return { code: 2 };
  }
}

// build/modules/table/api/insertOne.ts
async function insertOne_default(event) {
  return await insertOne(event.data, __buildContext(event));
}
export {
  insertOne_default as default
};
