// ../../open-kuafu-system/src/table/action/table.ts
async function updateMany(params) {
  return await TableActions.updateMany(params);
}

// ../build/modules/table/api/updateMany.ts
async function updateMany_default(event) {
  return await updateMany(event.data, __buildContext(event));
}
export {
  updateMany_default as default
};
