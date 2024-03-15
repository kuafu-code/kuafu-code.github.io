// ../../open-kuafu-system/src/table/action/table.ts
async function updateOne(params) {
  return await TableActions.updateOne(params);
}

// ../build/modules/table/api/updateOne.ts
async function updateOne_default(event) {
  return await updateOne(event.data, __buildContext(event));
}
export {
  updateOne_default as default
};
