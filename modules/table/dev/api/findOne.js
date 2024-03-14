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

// ../open-kuafu-system/src/table/abs/Access.ts
var error_no_table_permission_insert = "error_no_table_permission_insert";
var error_no_table_permission_query = "error_no_table_permission_query";
var error_no_table_permission_update = "error_no_table_permission_update";
var error_no_table_permission_delete = "error_no_table_permission_delete";
var TableAccess = class {
  access;
  constructor(meta, roles) {
    if (!meta.access) {
      this.access = ["insert", "delete", "find", "update"];
    } else {
      this.access = [];
      roles.forEach((role) => {
        if (meta.access[role]) {
          this.access.push(meta.access[role]);
        }
      });
    }
  }
  checkDelete(throwAble = true) {
    if (!this.access.includes("delete")) {
      if (throwAble)
        throw new Error(error_no_table_permission_delete);
      return false;
    }
    return true;
  }
  checkInsert(throwAble = true) {
    if (!this.access.includes("insert")) {
      if (throwAble)
        throw new Error(error_no_table_permission_insert);
      return false;
    }
    return true;
  }
  checkFindKeys(keys, throwAble = true) {
    return this.filterKeys(keys, "find", throwAble);
  }
  checkUpdateValues(values, throwAble = true) {
    const keys = Object.keys(values);
    const _keys = this.filterKeys(keys, "update", throwAble);
    if (_keys.length == keys.length) {
      return values;
    }
    const _values = {};
    _keys.forEach((key) => _values[key] = values[key]);
    return _values;
  }
  filterKeys(keys, action, throwAble = true) {
    if (!this.access.includes(action)) {
      const viewKeys = [];
      for (let a of this.access) {
        if (Array.isArray(a)) {
          if (a[0] == action) {
            a[1].forEach((key) => {
              if (!viewKeys.includes(key) && keys.includes(key)) {
                viewKeys.push(key);
              }
            });
          }
        }
      }
      if (viewKeys.length == 0 && throwAble) {
        throw new Error(action == "find" ? error_no_table_permission_query : error_no_table_permission_update);
      }
      return viewKeys;
    }
    return keys;
  }
};

// ../open-kuafu-system/src/sys/abs/config.ts
var AWS_REGION = "us-east-1";

// ../open-kuafu-system/src/table/abs/table.ts
var hasOwnProperty = Object.hasOwnProperty;
function boxValue(value) {
  return typeof value == "number" ? { N: (value || 0).toString() } : { S: value || "" };
}
var RawTable = class {
  constructor(meta, appId) {
    this.meta = meta;
    this.appId = appId;
    if (!this.appId || !this.meta.module) {
      throw new Error();
    }
    this.name = `${[this.appId, this.meta.module].join(".")}.${this.meta.id}`;
    let config = { region: AWS_REGION };
    if (process.env.AWS_ENDPOINT) {
      config.endpoint = process.env.AWS_ENDPOINT;
    }
    this.dbclient = new DynamoDBClient(config);
  }
  name;
  dbclient;
  keys() {
    let keys = [];
    for (let key in this.meta.columns) {
      keys.push(key);
    }
    return keys;
  }
  async create() {
    const AttributeDefinitions = [];
    const KeySchema = [];
    for (let key in this.meta.columns) {
      let def = this.meta.columns[key];
      if (key == this.meta.hashKey) {
        KeySchema.push({
          AttributeName: key,
          KeyType: "HASH"
        });
      } else if (key == this.meta.sortKey) {
        KeySchema.push({
          AttributeName: key,
          KeyType: "RANGE"
        });
      } else {
        continue;
      }
      AttributeDefinitions.push({
        AttributeName: key,
        AttributeType: def.type == "string" ? "S" : "N"
      });
    }
    await this.dbclient.send(
      new CreateTableCommand({
        TableName: this.name,
        AttributeDefinitions,
        KeySchema,
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      })
    );
  }
  async drop() {
    try {
      const command = new DeleteTableCommand({ TableName: this.name });
      const response = await this.dbclient.send(command);
      console.log("Table deleted successfully", response);
    } catch (err) {
      console.error(err);
    }
  }
  keysHandler() {
    const hashKey = this.meta.hashKey;
    const sortKey = this.meta.sortKey;
    const keys = [hashKey];
    if (sortKey) {
      keys.push(sortKey);
    }
    return {
      keys,
      box(item) {
        const keysValue = { [hashKey]: boxValue(item[hashKey]) };
        if (sortKey) {
          keysValue[sortKey] = boxValue(item[sortKey]);
        }
        return keysValue;
      }
    };
  }
  async update(keysValue, values) {
    let UpdateExpression = [];
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    for (let key in values) {
      ExpressionAttributeNames["#" + key] = key;
      ExpressionAttributeValues[":" + key] = boxValue(values[key]);
      UpdateExpression.push(`set #${key} = :${key}`);
    }
    const params = {
      TableName: this.name,
      Key: keysValue,
      UpdateExpression: UpdateExpression.join(","),
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "UPDATED_NEW"
    };
    console.log("UpdateItemCommandInput", params);
    const resp = await this.dbclient.send(new UpdateItemCommand(params));
    console.log("UpdateItemCommand Resp", resp);
    return resp;
  }
  async delete(keysValue) {
    const params = {
      TableName: this.name,
      Key: keysValue
    };
    const resp = await this.dbclient.send(new DeleteItemCommand(params));
    console.log("DeleteItemCommand Resp", resp);
    return resp;
  }
  transform(rows) {
    const result = [];
    for (let row of rows) {
      let item = {};
      for (let key in row) {
        let _value = row[key];
        if (hasOwnProperty.call(_value, "S")) {
          item[key] = _value.S;
        } else if (hasOwnProperty.call(_value, "N")) {
          item[key] = parseFloat(_value.N);
        } else {
          throw new Error();
        }
      }
      result.push(item);
    }
    return result;
  }
  async deleteOne(condition) {
    const handler = this.keysHandler();
    const item = await this.findOne(condition, { keys: handler.keys });
    if (!item)
      return 0;
    await this.delete(handler.box(item));
    return 1;
  }
  async deleteMany(condition) {
    const handler = this.keysHandler();
    const items = await this.findAll(condition, { keys: handler.keys });
    let count = 0;
    for (let item of items) {
      await this.delete(handler.box(item));
      count++;
    }
    return count;
  }
  async updateOne(values, condition) {
    const handler = this.keysHandler();
    const item = await this.findOne(condition, { keys: handler.keys });
    if (!item)
      return 0;
    await this.update(handler.box(item), values);
    return 1;
  }
  async updateMany(values, condition) {
    const handler = this.keysHandler();
    const items = await this.findAll(condition, { keys: handler.keys });
    let count = 0;
    for (let item of items) {
      await this.update(handler.box(item), values);
      count++;
    }
    return count;
  }
  // 如果 hashKey & sortKey 冲突，会默认是更新
  async insertOne(record, options) {
    const Item = {};
    for (let key in record) {
      const def = this.meta.columns[key];
      if (!def)
        continue;
      Item[key] = boxValue(record[key]);
    }
    const command = { TableName: this.name, Item };
    try {
      const resp = await this.dbclient.send(new PutItemCommand(command));
      console.log("insertOne resp", resp);
      return 1;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        await this.create();
        await this.dbclient.send(new PutItemCommand(command));
        return 2;
      }
      throw error;
    }
  }
  async findOne(condition, options) {
    return (await this.findMany(condition, { keys: options?.keys || this.keys(), limit: 1 }))[0];
  }
  async findMany(condition, options) {
    const keys = options?.keys || this.keys();
    const params = {
      TableName: this.name,
      ...translate(condition)
    };
    let isScan = false;
    let ActionCommand = QueryCommand;
    const tableKeys = [this.meta.hashKey];
    this.meta.sortKey && tableKeys.push(this.meta.sortKey);
    for (let key in params.ExpressionAttributeNames) {
      if (!tableKeys.includes(params.ExpressionAttributeNames[key])) {
        isScan = true;
        break;
      }
    }
    const hasScanIndexForward = options && hasOwnProperty.call(options, "ScanIndexForward");
    const hasUseEvaluatedKey = options && hasOwnProperty.call(options, "useEvaluatedKey");
    if (isScan) {
      ActionCommand = ScanCommand;
      params.FilterExpression = params.KeyConditionExpression;
      delete params.KeyConditionExpression;
      if (hasScanIndexForward) {
        throw new Error();
      }
    } else if (hasScanIndexForward) {
      params.ScanIndexForward = options.ScanIndexForward;
    }
    if (options?.limit) {
      params.Limit = options.limit;
    }
    if (hasUseEvaluatedKey && typeof options.useEvaluatedKey != "boolean") {
      params.ExclusiveStartKey = options.useEvaluatedKey;
    }
    let ProjectionExpression = [];
    for (let key of keys) {
      const keyExp = `#${key}`;
      if (!params.ExpressionAttributeNames[keyExp]) {
        params.ExpressionAttributeNames[keyExp] = key;
      }
      ProjectionExpression.push(keyExp);
    }
    params.ProjectionExpression = ProjectionExpression.join(",");
    console.log("findMany", params);
    const data = await this.dbclient.send(new ActionCommand(params));
    console.log(data);
    const res = this.transform(data.Items || []);
    if (res.length && data.LastEvaluatedKey && hasUseEvaluatedKey && options.useEvaluatedKey) {
      res[res.length - 1].__NextEvaluatedKey__ = data.LastEvaluatedKey;
    }
    return res;
  }
  async findAll(condition, options) {
    const values = [];
    let _options = {
      limit: options?.batchSize || 1e3,
      ScanIndexForward: options?.ScanIndexForward === false ? false : true,
      useEvaluatedKey: true,
      keys: options?.keys
    };
    while (true) {
      const res = await this.findMany(condition, _options);
      if (res.length == 0)
        break;
      values.push(...res);
      const __NextEvaluatedKey__ = res.length && res[res.length - 1].__NextEvaluatedKey__;
      if (!__NextEvaluatedKey__)
        break;
      _options.useEvaluatedKey = __NextEvaluatedKey__;
    }
    return values;
  }
};
var Table = class extends RawTable {
  constructor(meta, appId, roles) {
    super(meta, appId);
    this.meta = meta;
    this.appId = appId;
    this.roles = roles;
    this.access = new TableAccess(meta, roles);
  }
  access;
  async insertOne(record, options) {
    this.access.checkInsert();
    return await super.insertOne(record, options);
  }
  async deleteOne(condition) {
    this.access.checkDelete();
    return await super.deleteOne(condition);
  }
  async deleteMany(condition) {
    this.access.checkDelete();
    return await super.deleteMany(condition);
  }
  async updateOne(values, condition) {
    return await super.updateOne(this.access.checkUpdateValues(values), condition);
  }
  async updateMany(values, condition) {
    return await super.updateMany(this.access.checkUpdateValues(values), condition);
  }
  async findOne(condition, options) {
    const keys = options?.keys || this.keys();
    return await super.findOne(condition, { keys: this.access.checkFindKeys(keys) });
  }
  async findMany(condition, options) {
    const keys = options?.keys || this.keys();
    return await super.findMany(condition, {
      ...options || {},
      keys: this.access.checkFindKeys(keys)
    });
  }
  async findAll(condition, options) {
    const keys = options?.keys || this.keys();
    return await super.findAll(condition, {
      ...options || {},
      keys: this.access.checkFindKeys(keys)
    });
  }
};
function translate(condition) {
  function _translate(condition2, cache) {
    if (condition2[0] == "|" || condition2[0] == "&") {
      const op = condition2[0] === "&" ? "AND" : "OR";
      const conditions = condition2.slice(1);
      const expressions = conditions.map((condition3) => _translate(condition3, cache));
      return {
        KeyConditionExpression: `(${expressions.map((e) => e.KeyConditionExpression).join(` ${op} `)})`,
        ExpressionAttributeNames: expressions.reduce((result, e) => ({ ...result, ...e.ExpressionAttributeNames }), {}),
        ExpressionAttributeValues: expressions.reduce((result, e) => ({ ...result, ...e.ExpressionAttributeValues }), {})
      };
    } else {
      let [keyName, operator, value] = condition2;
      switch (operator) {
        case "=":
        case "<":
        case ">":
        case "<=":
        case ">=":
          break;
        case "!=":
          operator = "<>";
          break;
        case "in":
          operator = "IN";
          break;
        default:
          throw new Error(`Unsupported operator ${operator}`);
      }
      let tagName;
      while (cache.tagNames.includes(tagName = `:${keyName}_${cache.index++}`))
        ;
      cache.tagNames.push(tagName);
      return {
        KeyConditionExpression: `#${keyName} ${operator} ${tagName}`,
        ExpressionAttributeNames: { [`#${keyName}`]: keyName },
        ExpressionAttributeValues: { [tagName]: boxValue(value) }
      };
    }
  }
  return _translate(condition, { index: 0, tagNames: [] });
}

// ../open-kuafu-system/src/table/abs/SystemAppTables.ts
var sys_app_tables_meta = {
  id: "sys_app_tables",
  module: "sys",
  version: "1.0.0",
  hashKey: "_id",
  columns: {
    _id: {
      type: "string"
    },
    version: {
      type: "string"
    },
    moduleId: {
      type: "string"
    },
    tableId: {
      type: "string"
    },
    content: {
      type: "string"
    },
    time: {
      type: "number"
    }
  }
};
var SystemAppTables = class extends RawTable {
  constructor() {
    super(sys_app_tables_meta, "sys");
  }
  id(version, moduleId, tableId) {
    return [version, moduleId, tableId].join("*");
  }
  async updateTable(moduleId, version, tableId, content) {
    const _id = this.id(moduleId, version, tableId);
    await this.updateOne({ content }, ["_id", "=", _id]);
  }
  async findTable(moduleId, version, tableId) {
    const _id = this.id(moduleId, version, tableId);
    const item = await this.findOne(["_id", "=", _id], { keys: ["content"] });
    if (item) {
      return JSON.parse(item.content);
    }
    let content = "";
    await this.insertOne({
      _id,
      moduleId,
      version,
      tableId,
      content
    });
    return JSON.parse(content);
  }
};
async function findTableMeta(moduleId, version, tableId) {
  return await new SystemAppTables().findTable(moduleId, version, tableId);
}

// ../open-kuafu-system/src/table/action/table.ts
async function findTable(params, context) {
  const { moduleId, tableId, version } = params.table;
  const tableMeta = await findTableMeta(moduleId, version, tableId);
  return new Table(tableMeta, context.appId, context.roles);
}
async function findOne(params, context) {
  const table = await findTable(params, context);
  return await table.findOne(params.data.condition, params.data.options);
}

// build/modules/table/api/findOne.ts
async function findOne_default(event) {
  return await findOne(event.data, __buildContext(event));
}
export {
  findOne_default as default
};
