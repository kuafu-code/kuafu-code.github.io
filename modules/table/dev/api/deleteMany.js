// ../../open-kuafu-system/src/table/action/table.ts
async function deleteMany(params) {
  return await TableActions.deleteMany(params);
}

// ../build/modules/table/api/deleteMany.ts
async function deleteMany_default(event) {
  return await deleteMany(event.data, __buildContext(event));
}
export {
  deleteMany_default as default
};
