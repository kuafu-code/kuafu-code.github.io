async function demo(params, context) { return { "statusCode": 200, "body": "xxxHello from auto Lambda!" }; } async function onDemo_default(event) { return await demo(event, __buildContext(event)); } export {  onDemo_default as default };