import 'source-map-support/register'

//Constructors
import SchemaManager from './constructors/SchemaManager';

//Functions
import getSchemaFiles from './functions/getSchemaFiles';
import schemaFilesToObjects from './functions/schemaFilesToObject';
import schemaObjApplyJS from './functions/schemaObjApply';
import applySchemasToLiquid from './functions/applySchemasToLiquid';


//Types
import WriteModeEnum from './types/WriteModeEnum';

const test = true;

const schemas_dir = test ? './example/schema' : './schema';
const liquid_dir = test ? './example/liquid/sections' : './sections';

const schema_manager = new SchemaManager();

schema_manager.run( schemas_dir, liquid_dir );

// console.log("Running Schema Manager");

// const schema_filenames = getSchemaFiles( schemas_dir );

// console.log(`Found ${ schema_filenames.length } schema files: `);
// console.log( schema_filenames );

// schemaFilesToObjects( schemas_dir, schema_filenames )
// .then( schemas => {
//     //console.log( 'before JS: ', schemas );
//     return schemaObjApplyJS(schemas.json, schemas.js);
// })
// .then( schemas => {
//     applySchemasToLiquid( schemas, liquid_dir, WriteModeEnum.OverwriteAll );
//     //console.log( 'after JS: ', util.inspect( schemas, false, null, true ) );
// })