

export default async function(params){

  return await onTableRequest({"id":"table_export_demo","columns":{"id":{"key":true,"type":"string"},"num":{"type":"number"},"time":{"type":"number"},"data":{"type":"string"}}}, params);

}
