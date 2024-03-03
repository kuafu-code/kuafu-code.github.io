// packages/open-kuafu-system/src/abs/push2Github.ts
async function push2Github_default(key, name, code, moduleId, context) {
  let path = "";
  switch (key) {
    case "module":
      path = `dev/${moduleId}/module.json`;
      break;
    case "role":
    case "table":
    case "plugin":
      path = `dev/${moduleId}/${key}/${name}.json`;
      break;
    case "api":
      path = `dev/${moduleId}/${key}/${name}.js`;
      break;
    default:
      throw new Error();
  }
  const UserAgent = "kuafu-code";
  const githubToken = "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";
  const url = `https://api.github.com/repos/kuafu-code/kuafu-code.github.io/contents/${path}`;
  let contentBlobSha = "";
  try {
    const getFileResponse = await context.fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${githubToken}`,
        "User-Agent": UserAgent
      }
    });
    console.log("getFileResponse", getFileResponse);
    const getFileResponseJson = JSON.parse(getFileResponse);
    contentBlobSha = getFileResponseJson.sha;
  } catch (e) {
  }
  const body = {
    message: "commit",
    content: Buffer.from(code).toString("base64")
  };
  if (contentBlobSha) {
    body.sha = contentBlobSha;
  }
  const updateFileResponse = await context.fetch(
    url,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${githubToken}`,
        "User-Agent": UserAgent
      },
      body
    }
  );
  console.log("updateFileResponse", updateFileResponse);
  return updateFileResponse;
}

// packages/open-kuafu-system/src/action/onPushData.ts
async function onPushData_default(event, context) {
  let body = event;
  if (event.requestContext) {
    body = JSON.parse(event.body);
  }
  return await push2Github_default(body.key, body.id, body.code, body.module, context);
}

// packages/open-kuafu-dev/build/sys/api/onPushData.ts
async function onPushData_default2(event) {
  return await onPushData_default(event, __buildContext(event));
}
export {
  onPushData_default2 as default
};
