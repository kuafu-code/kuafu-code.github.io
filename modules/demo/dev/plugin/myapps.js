// ../open-kuafu-system/demo/plugins/myapps.ts
async function myapps_default() {
}

// build/modules/demo/plugin/myapps.ts
async function myapps_default2(event) {
  return await myapps_default(event, __buildContext(event));
}
export {
  myapps_default2 as default
};
