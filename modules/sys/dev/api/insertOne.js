// ../../open-kuafu-system/src/sys/action/table.ts
async function insertOne(params) {
  return await TableActions.insertOne(params);
}

// ../build/modules/sys/api/insertOne.ts
var insertOne_default = insertOne;
export {
  insertOne_default as default
};
