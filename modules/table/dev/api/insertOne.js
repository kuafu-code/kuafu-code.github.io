// ../open-kuafu-system/src/table/action/table.ts
async function insertOne(params, context) {
  console.log("params", params);
  console.log("context", context);
}

// build/modules/table/api/insertOne.ts
async function insertOne_default(event) {
  return await insertOne(event.data, __buildContext(event));
}
export {
  insertOne_default as default
};
