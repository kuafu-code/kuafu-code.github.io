// ../../open-kuafu-system/src/table/action/table.ts
async function findMany(params) {
  return await TableActions.findMany(params);
}

// ../build/modules/table/api/findMany.ts
async function findMany_default(event) {
  return await findMany(event.data, __buildContext(event));
}
export {
  findMany_default as default
};
