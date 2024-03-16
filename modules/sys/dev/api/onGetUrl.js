// ../open-kuafu-system/server-sys/abs/config.ts
var AWS_REGION = "ap-east-1";
var functionName = (moduleId, api, version) => `${moduleId}_s_${api}`;

// ../open-kuafu-system/server-sys/action/onGetUrl.ts
import { Lambda } from "@aws-sdk/client-lambda";
async function onGetUrl_default(params) {
  const FunctionName = functionName(params.moduleId, params.api, params.version);
  const lambdaClient = new Lambda({ region: AWS_REGION });
  const urlConfig = await lambdaClient.getFunctionUrlConfig({ FunctionName });
  return { url: urlConfig.FunctionUrl };
}

// build/modules/sys/api/onGetUrl.ts
var onGetUrl_default2 = onGetUrl_default;
export {
  onGetUrl_default2 as default
};
