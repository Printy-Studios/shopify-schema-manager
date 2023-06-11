/**
 * Get function from a JS schema
 * @param all_js_schemas 
 * @param schema_name 
 * @returns function of schema, or null if not found.
 */
export default function getFunctionFromJSSchema(all_js_schemas: {name: string, fn: Function}[], schema_name) {
    const target_schema = all_js_schemas.find( schema => schema_name == schema.name);

    if ( target_schema == undefined || target_schema.fn == undefined ) {
        return null;
    }

    return target_schema.fn;
}