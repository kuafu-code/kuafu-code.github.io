// ../../open-kuafu-system/src/sys/action/table.ts
async function findMany(params) {
  return await TableActions.findMany(params);
}

// ../build/modules/sys/api/findMany.ts
var findMany_default = findMany;
export {
  findMany_default as default
};
