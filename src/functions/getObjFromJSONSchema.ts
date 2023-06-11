export default function getObjFromJSONSchema( all_json_schemas, schema_name ) {
    const target_schema = all_json_schemas.find( schema => schema_name == schema.name);

    if ( target_schema == undefined ) {
        throw new Error(`Could not find schema ${ schema_name }.json`);
    } else if ( target_schema.obj == undefined ) {
        throw new Error(`Could not find obj in ${ schema_name }.json`);
    }

    return target_schema.obj;
}