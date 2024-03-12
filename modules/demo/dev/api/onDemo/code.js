// ../open-kuafu-system/demo/action/onDemo.ts
async function demo(params, context) {
  console.log("context", context);
  return { "statusCode": 200, "body": "Hello from auto Lambda!" };
}

// build/demo/api/onDemo.ts
async function onDemo_default(event) {
  return await demo(event, __buildContext(event));
}
export {
  onDemo_default as default
};
