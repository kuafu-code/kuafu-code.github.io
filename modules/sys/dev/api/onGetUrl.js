// ../open-kuafu-system/server-sys/abs/config.ts
var AWS_REGION = "ap-east-1";

// ../open-kuafu-system/server-sys/action/onPushCode.ts
import fs from "fs";

// ../open-kuafu-system/server-sys/abs/templates.ts
var CommonExports = `
  fetch,
  Table,
  string,
  STRING,
  number,
  NUMBER,
  onTableRequest,`.trim();

// ../open-kuafu-system/server-sys/abs/pushCode.ts
import { Lambda } from "@aws-sdk/client-lambda";

// ../open-kuafu-system/server-sys/action/onPushCode.ts
var functionName = (moduleId, api, version) => `${moduleId}_s_${api}`;

// ../open-kuafu-system/server-sys/action/onGetUrl.ts
import { Lambda as Lambda2 } from "@aws-sdk/client-lambda";
async function onGetUrl_default(params) {
  const FunctionName = functionName(params.moduleId, params.api, params.version);
  const lambdaClient = new Lambda2({ region: AWS_REGION });
  const urlConfig = await lambdaClient.getFunctionUrlConfig({ FunctionName });
  return { url: urlConfig.FunctionUrl };
}

// build/modules/sys/api/onGetUrl.ts
var onGetUrl_default2 = onGetUrl_default;
export {
  onGetUrl_default2 as default
};
