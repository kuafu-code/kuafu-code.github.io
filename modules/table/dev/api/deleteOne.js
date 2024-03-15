// ../../open-kuafu-system/src/table/action/table.ts
async function deleteOne(params) {
  return await TableActions.deleteOne(params);
}

// ../build/modules/table/api/deleteOne.ts
async function deleteOne_default(event) {
  return await deleteOne(event.data, __buildContext(event));
}
export {
  deleteOne_default as default
};
