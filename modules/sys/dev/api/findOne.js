// ../../open-kuafu-system/src/sys/action/table.ts
async function findOne(params) {
  return await TableActions.findOne(params);
}

// ../build/modules/sys/api/findOne.ts
var findOne_default = findOne;
export {
  findOne_default as default
};
