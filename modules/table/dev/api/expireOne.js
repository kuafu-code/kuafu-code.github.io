// ../open-kuafu-system/src/table/abs/table.ts
import {
  DynamoDBClient,
  PutItemCommand,
  CreateTableCommand,
  ResourceNotFoundException,
  DeleteTableCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
var hasOwnProperty = Object.hasOwnProperty;

// ../open-kuafu-system/src/table/action/table.ts
async function expireOne() {
}

// build/modules/table/api/expireOne.ts
async function expireOne_default(event) {
  return await expireOne(event.data, __buildContext(event));
}
export {
  expireOne_default as default
};
