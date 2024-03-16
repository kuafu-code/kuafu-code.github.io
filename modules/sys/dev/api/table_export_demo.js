

export default async function(params){

  return await onTableRequest({"id":"table_export_demo","hashKey":"id","columns":{"id":{"type":"string"},"num":{"type":"number"},"time":{"type":"number"},"data":{"type":"string"}}}, params);

}
