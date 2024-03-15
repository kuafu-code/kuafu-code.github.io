// ../../open-kuafu-system/src/table/action/table.ts
async function findOne(params) {
  return await TableActions.findOne(params);
}

// ../build/modules/table/api/findOne.ts
async function findOne_default(event) {
  return await findOne(event.data, __buildContext(event));
}
export {
  findOne_default as default
};
