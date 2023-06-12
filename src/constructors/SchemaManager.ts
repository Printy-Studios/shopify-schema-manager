//Core
import * as path from 'path';

//Constructors
import FileIO from './FileIO'

//Functions
import getFunctionResult from '../functions/getFunctionResult';

//Types
import IFileIO from '../types/IFileIO';
import { Schema, FnSchema, ObjSchema, SchemasList } from '../types/Schema';
import { GenericObject } from '../types/MiscTypes';
import WriteModeEnum from '../types/WriteModeEnum';
import FileToSchemaConverter from '../types/FileToSchemaConverter';

/**
 * .js to schema converter function (FileToSchemaConverterFunction type)
 */
const jsToSchema = async ( file_path: string, schema_name: string, fileIO: IFileIO ): Promise<FnSchema> => {
    const full_path = path.join (process.cwd(), file_path);

    return {
        name: schema_name,
        fn: await import( full_path )
    }
}

/**
 * .json to schema converter function (FileToSchemaConverterFunction type)
 */
const jsonToSchema = async ( file_path: string, schema_name: string, fileIO: IFileIO ): Promise<ObjSchema> => {

    let json_str: string = fileIO.readFile( file_path );
    let obj = JSON.parse( json_str );
    const obj_for: string = obj.for;
    delete obj.for;

    let output: ObjSchema = {
        name: schema_name,
        obj: obj
    };

    if ( obj_for ) {
        output.for = obj_for;
    }

    return await Promise.resolve( output );
}

/**
 * Schema manager constructor
 * @param { IFileIO } fileIO                                    - fileIO constructor to use. Default FileIO.
 * @param { FileToSchemaConverter[] } fileToSchemaConverters    - FileToSchemaConverters. Default uses js and json converters 
 */
export default function SchemaManager(
    fileIO: IFileIO = new FileIO(),
    fileToSchemaConverters: FileToSchemaConverter[] = [
        {
            type: 'fn',
            file_extension: '.js',
            convert: jsToSchema
        },
        {
            type: 'obj',
            file_extension: '.json',
            convert: jsonToSchema
        }
    ]
) {

    //Main function that runs the script, parses the schema files and applies them to .liquid files
    this.run = async ( schemas_path: string, liquid_path: string) => {

        console.log("Running Shopify Schema Manager")

        //Get all schema files from path
        const schema_files = this.getSchemaFiles( schemas_path );

        console.log(`Found ${ schema_files.length } schema files`);
        console.log(schema_files);

        //Create a SchemasList object from retrieved schema files
        const schemas_list: SchemasList = await this.schemaFilesToSchemasList( schemas_path, schema_files );

        //Resolve schemas and store resolved schemas in a var
        const resolved_schemas: ObjSchema[] = this.resolveSchemas( schemas_list );

        console.log( 'Applying schemas to .liquid files' );

        //Write schemas to .liquid files
        this.applySchemasToLiquid( resolved_schemas, liquid_path );
    };

    //FileIO object to be used in methods
    this.fileIO = fileIO;

    /**
     * Get all schema files from the specified directory (non-recursive).
     * Lists all files in directory that end with 'schema.(json|js)'
     * 
     * @param { string } schemas_dir_path path to schemas directory
     * 
     * @returns { string[] } - array of schema filenames in specified directory
     */
    this.getSchemaFiles = ( schemas_dir_path: string ): string[] => {
        //Get filenames and filter them, then store in var
        const filenames = this.fileIO.readDir( schemas_dir_path, ( filename ) => filename.endsWith( '-schema.json' ) || filename.endsWith( '-schema.js' ))

        //Return the filtered filenames
        return filenames;
    }

    /**
     * Write schema objects to .liquid files. Schemas must be resolved before running this function
     * 
     * @param { ObjSchema[] }   resolved_schemas    - array of resolved ObjSchema objects
     * @param { string }        liquid_files_path   - path to liquid sections directory
     * 
     * @returns { boolean } true on success, throws error otherwise.
     */
    this.applySchemasToLiquid = ( resolved_schemas: ObjSchema[], liquid_files_path: string): boolean => {


        //Get all liquid files in specified directory
        const all_liquid_files = this.fileIO.readDir( liquid_files_path, ( filename: string ) => filename.endsWith('.liquid') );

        //Filter only those schemas that have a 'for' property
        const schemas: ObjSchema[] = resolved_schemas.filter( schema => schema.for && typeof schema.for == 'string' );

        //Loop through filtered schemas
        for ( const schema of schemas ) {

            //Get target liquid filename according to `schema.for` property 
            const target_file = schema.for + ".liquid";

            //If such a file exists
            if( all_liquid_files.includes( target_file ) ) {
                //Write the schema into this file
                this.applySchemaToLiquidFile(schema, liquid_files_path, target_file);
            }

        }

        //Return true on success
        return true;
    }

    /**
     * Write a single schema to a single liquid file. Schema must be resolved before running this function
     * 
     * @param { ObjSchema }     schema                          - schema to apply
     * @param { string }        liquid_files_path               - path to liquid sections folder
     * @param { string }        target_file                     - filename of the .liquid file to write to
     * @param { WriteModeEnum } [ WriteModeEnum.OverwriteAll ]  - write mode. See WriteModeEnum comments
     * 
     * @return { boolean } - true on success, throws error on failure
     */
    this.applySchemaToLiquidFile = ( schema: ObjSchema, liquid_files_path: string, target_file: string, mode: WriteModeEnum = WriteModeEnum.OverwriteAll): boolean => {

        console.log('modifying ' + target_file );
        //Get full path to file
        const full_path = path.join( liquid_files_path, target_file );


        if ( mode == WriteModeEnum.OverwriteAll ) {
            //If mode is OverwriteAll

            //Make a liquid schema string from schema.obj 
            const schema_output = '{% schema %}\n' +
            JSON.stringify(schema.obj, null, 2) + '\n' +
            '{% endschema %}';

            //Replace the current .liquid file's schema with the new schema
            this.fileIO.replaceInFile(/{%\s*schema\s*%}.*{%\s*endschema\s*%}/gs, schema_output, full_path)
        }
        
        //Return true on success
        return true;
        
            
    }

    /**
     * Get the function of a specific FnSchema
     * 
     * @param { SchemasList } all_schemas   - All schemas
     * @param { string } schema_name        - Name of schema for which to find function
     * 
     * @returns { Function | null } - function of found schema, or null if either schema or function was not found.
     */
    this.getFunctionFromFnSchema = (all_schemas: SchemasList, schema_name: string): Function | null => {
        //Get schema by name from list of all schemas
        const target_schema = all_schemas.fn.find( schema => schema_name == schema.name);

        //If schema not found, or function in schema not found, return null
        if ( target_schema == undefined || target_schema.fn == undefined ) {
            return null;
        }

        //Otherwise, return found function
        return target_schema.fn;
    }

    /**
     * Get the obj of a specific ObjSchema
     * 
     * @param { SchemasList } all_schemas   - All schemas
     * @param { string } schema_name        - Name of schema for which to find the object
     * 
     * @returns { GenericObject | null } - object of found schema, or null if either schema or object was not found.
     */
    this.getObjFromObjSchema = (all_schemas: SchemasList, schema_name: string): GenericObject | null => {

        //Get schema by name from list of all schemas
        const target_schema = all_schemas.obj.find( schema => schema_name == schema.name);

        //If schema or schema.obj was not found, throw error
        if ( target_schema == undefined ) {
            throw new Error(`Could not find schema ${ schema_name }.json`);
        } else if ( target_schema.obj == undefined ) {
            throw new Error(`Could not find obj in ${ schema_name }.json`);
        }

        //Otherwise, return the schema.obj
        return target_schema.obj;
    }

    /**
     * Parse schema, meaning return the .obj of schema if it's a ObjSchema, and result of .fn of schema if it's a FnSchema
     * 
     * @param { SchemasList }   all_schemas - List of all schemas
     * @param { string }        schema_name - Name of schema to parse
     * @param { any[] }         schema_args - Arguments for schema, if any
     * 
     * @returns { GenericObject } - parsed schema .obj or result of .fn
     */
    this.parseSchema = (all_schemas: SchemasList, schema_name: string, schema_args: any[]): GenericObject => {

        //Find .obj or .fn of schema
        const fn = this.getFunctionFromFnSchema( all_schemas, schema_name);
        let obj = null;
        if ( !fn ) {
            //If .fn not found, store .obj in var
            obj = this.getObjFromObjSchema( all_schemas, schema_name);
        }

        //If .fn was found, return result of the .fn and pass schema_args, otherwise return .obj
        const result = fn ? getFunctionResult(fn, schema_args) : obj;
        return result;
    }

    /**
     * Resolve schemas, meaning that schema's dependency references will be replaced by the values of the dependecies
     * 
     * @param { SchemasList } schemas_list  - List of all schemas
     * 
     * @return { ObjSchema[] }  - Resolved schemas as an array of ObjSchemas
     */
    this.resolveSchemas = ( schemas_list: SchemasList ): ObjSchema[] => {

        const obj_schemas = schemas_list.obj;

        //Iterate through each obj schema
        for ( let obj_schema of obj_schemas ) {

            const schema = obj_schema.obj;

            // If schema has 'settings' property
            if ( schema.settings && Array.isArray( schema.settings ) ) {

                // Iterate through each setting and check if there is a 'from' property
                for ( const setting_key in schema.settings ) {

                    const setting = schema.settings[setting_key];
                    if( setting.from && typeof setting.from === 'string' ) {

                        //If setting has a 'from' property, resolve the dependency and replace the setting
                        //with the schema that has the name of the 'from' property
                        const parsed_setting = this.parseSchema(schemas_list, setting.from, setting.args);
                        obj_schema.obj.settings[setting_key] = parsed_setting;

                    }
                }
            }

            //If schema has 'blocks' property
            if ( schema.blocks && Array.isArray( schema.blocks ) ) {
                for ( const block_key in schema.blocks ) {
                    let block = schema.blocks[ block_key ];

                    //Check if block has a 'from' property
                    if ( block.from && typeof block.from == 'string' ) {
                        //If yes, apply the schema which's name corresponds to the 'from' property's value
                        const parsed_schema = this.parseSchema( schemas_list, block.from, block.args);

                        block = parsed_schema;

                    }

                    //Check if block has a 'settings' property
                    if ( block.settings && Array.isArray( block.settings ) ) {
                        for ( const setting_key in block.settings ) {
                            const setting = block.settings[ setting_key ];
                            if( setting.from && typeof setting.from == 'string' ) {
                                
                                //If yes, apply the schema which's name corresponds to the 'from' property's value
                                const parsed_setting = this.parseSchema( schemas_list, setting.from, setting.args );

                                //Set the schema setting to the result of the function
                                block.settings[ setting_key ] = parsed_setting;
                            } 
                        }
                    }
                    
                    //Set the block's value to the resolved block
                    obj_schema.obj.blocks[ block_key ] = block;
                }
            }
        }

        //Return all schemas, now resolved.
        return obj_schemas;
    }

    /**
     * Create a SchemasList object from schema files list.
     * 
     * @param { string }    schemas_path    - Path to schemas folder
     * @param { string[] }  filenames       - Array of schema filenames
     * 
     * @returns { Promise<SchemasList> }    - Promise that resolves to a SchemasList
     */
    this.schemaFilesToSchemasList = async ( schemas_path: string, filenames: string[]): Promise<SchemasList> => {

        //Create empty object for output
        let output: SchemasList = {
            fn: [],
            obj: []
        }


        //Iterate on all filenames
        for ( const filename of filenames) {

            //Convert schema file to a Schema object
            const schema_obj = await this.schemaFileToObj( path.join( schemas_path, filename ) );
            if ( schema_obj.fn ) {
                //If Schema object is a FnSchema, push to 'fn'
                output.fn.push( schema_obj );
            } else if ( schema_obj.obj ) {
                //If Schema object is an ObjSchema, push to 'obj
                output.obj.push( schema_obj );
            }
            
        }

        //Resolve with the SchemasList
        return await Promise.resolve(output);

    }

    this.schemaFileToObj = async ( file_path: string): Promise<Schema> => {

        const file_ext = path.extname( file_path );

        //let output: Schema | null;

        let name:string = path.parse( file_path ).name;

        //Get converter that supports given file extension
        const converter = fileToSchemaConverters.find( (converter: FileToSchemaConverter) => converter.file_extension == file_ext);

        //Throw error if no converter was found.
        if ( ! converter ) {
            throw new Error( `No converter was found for filetype ${ file_ext }` );
        }

        const output = converter.convert( file_path, name, this.fileIO);

        return output;
        
        // if ( file_ext == '.js' ) {
        //     output = {
        //         name: name,
        //         fn: await import( file_path )
        //     }
        // } else if ( file_ext == '.json' ) {

        //     let json_str: string = fileIO.readFile( file_path );
        //     let obj = JSON.parse( json_str );
        //     const obj_for: string = obj.for;
        //     delete obj.for;

        //     output = {
        //         name: name,
        //         for: obj_for,
        //         obj: obj
        //     }
        // }

        return output;

    }

    

}