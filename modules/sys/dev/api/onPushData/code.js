// ../open-kuafu-system/src/abs/push2Github.ts
async function push2Github_default(target, name, code, moduleId, version, context) {
  let path = "";
  switch (target) {
    case "module":
      path = `modules/${moduleId}/${version}/module.json`;
      break;
    case "plugin":
      path = `modules/${moduleId}/${version}/${target}/${name}.json`;
      break;
    case "api-code":
      path = `modules/${moduleId}/${version}/api/${name}/code.js`;
      break;
    default:
      throw new Error();
  }
  const UserAgent = "kuafu-code";
  const githubToken = process.env.github_token;
  const url = `https://api.github.com/repos/kuafu-code/kuafu-code.github.io/contents/${path}`;
  if (!githubToken)
    throw new Error("Without githubToken");
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
    contentBlobSha = getFileResponse.sha;
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
  if (updateFileResponse.download_url) {
    return { code: 0 };
  }
  return { code: 1 };
}

// ../open-kuafu-system/src/action/onPushData.ts
async function onPushData_default(event, context) {
  let body = event;
  if (event.requestContext) {
    body = JSON.parse(event.body);
  }
  return await push2Github_default(body.key, body.id, body.code, body.module, "dev", context);
}

// build/sys/api/onPushData.ts
async function onPushData_default2(event) {
  return await onPushData_default(event, __buildContext(event));
}
export {
  onPushData_default2 as default
};
