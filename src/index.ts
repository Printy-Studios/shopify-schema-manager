//Functions
import getSchemaFiles from './functions/getSchemaFiles';
import schemaFilesToObjects from './functions/schemaFilesToObject';
import schemaObjApplyJS from './functions/schemaObjApply';
import applySchemasToLiquid from './functions/applySchemasToLiquid';

import { program } from 'commander';

//Types
import WriteModeEnum from './types/WriteModeEnum';



const schemas_dir = './schema';
const liquid_dir = './liquid/sections';



const schema_filenames = getSchemaFiles( schemas_dir );

console.log( schema_filenames );

schemaFilesToObjects( schemas_dir, schema_filenames )
.then( schemas => {
    //console.log( 'before JS: ', schemas );
    return schemaObjApplyJS(schemas.json, schemas.js);
})
.then( schemas => {
    applySchemasToLiquid( schemas, liquid_dir, WriteModeEnum.OverwriteAll );
    //console.log( 'after JS: ', util.inspect( schemas, false, null, true ) );
})