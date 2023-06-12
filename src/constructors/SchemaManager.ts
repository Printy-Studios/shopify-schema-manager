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

        //Apply schemas to each other ( meaning resolve schema dependencies, basically ) and store them in a var
        const applied_schemas: ObjSchema[] = this.applySchemasToSchemas( schemas_list );

        console.log( 'Applying schemas to .liquid files' );

        //Write schemas to .liquid files
        this.applySchemasToLiquid( applied_schemas, liquid_path );
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
     * Write schema objects to .liquid files
     */
    this.applySchemasToLiquid = ( parsed_schemas: ObjSchema[], liquid_files_path: string) => {


        const all_liquid_files = this.fileIO.readDir( liquid_files_path );

        //Filter only those schemas that have a 'for' property
        const schemas: ObjSchema[] = parsed_schemas.filter( schema => schema.for && typeof schema.for == 'string' );


        for ( const schema of schemas ) {

            const target_file = schema.for + ".liquid";

            if( all_liquid_files.includes( target_file ) ) {
                this.applySchemaToLiquidFile(schema, liquid_files_path, target_file);
            }

        }
    }

    this.applySchemaToLiquidFile = ( schema: ObjSchema, liquid_files_path: string, target_file: string, mode: WriteModeEnum = WriteModeEnum.OverwriteAll) => {

        console.log('modifying ' + target_file );
        const full_path = path.join( liquid_files_path, target_file );
        
        let file_contents = this.fileIO.readFile( full_path );

        if ( mode == WriteModeEnum.OverwriteAll ) {

            

            const schema_output = '{% schema %}\n' +
            JSON.stringify(schema.obj, null, 2) + '\n' +
            '{% endschema %}';

            this.fileIO.replaceInFile(/{%\s*schema\s*%}.*{%\s*endschema\s*%}/gs, schema_output, full_path)
        }
        

        
            
    }

    this.getFunctionFromFnSchema = (all_schemas: SchemasList, schema_name: string) => {
        const target_schema = all_schemas.fn.find( schema => schema_name == schema.name);

        if ( target_schema == undefined || target_schema.fn == undefined ) {
            return null;
        }

        return target_schema.fn;
    }

    this.getObjFromObjSchema = (all_schemas: SchemasList, schema_name: string) => {
        const target_schema = all_schemas.obj.find( schema => schema_name == schema.name);

        if ( target_schema == undefined ) {
            throw new Error(`Could not find schema ${ schema_name }.json`);
        } else if ( target_schema.obj == undefined ) {
            throw new Error(`Could not find obj in ${ schema_name }.json`);
        }

        return target_schema.obj;
    }

    this.parseSchema = (all_schemas: SchemasList, setting_schema_name: string, schema_args: any[]): GenericObject => {

        // If there is a 'from' property, find the corresponding function/object
        const fn = this.getFunctionFromFnSchema( all_schemas, setting_schema_name);
        let obj = null;
        if ( !fn ) {
            obj = this.getObjFromObjSchema( all_schemas, setting_schema_name);
        }

        const result = fn ? getFunctionResult(fn, schema_args) : obj;

        //Set the schema setting to the result of the function
        return result;
    }

    this.applySchemasToSchemas = ( schemas_list: SchemasList ): ObjSchema[] => {

        const obj_schemas = schemas_list.obj;

        //Iterate through each json schema
        for ( let obj_schema of obj_schemas ) {

            const schema = obj_schema.obj;

            // If schema has 'settings' property
            if ( schema.settings && Array.isArray( schema.settings ) ) {

                // Iterate through each setting and check if there is a 'from' property
                for ( const setting_key in schema.settings ) {

                    const setting = schema.settings[setting_key];
                    if( setting.from && typeof setting.from === 'string' ) {


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
                        //If yes, apply the function that corresponds to the 'from' property's value
                        const parsed_schema = this.parseSchema( schemas_list, block.from, block.args);

                        block = parsed_schema;

                    }

                    //Check if block has a 'settings' property
                    if ( block.settings && Array.isArray( block.settings ) ) {
                        for ( const setting_key in block.settings ) {
                            const setting = block.settings[ setting_key ];
                            if( setting.from && typeof setting.from == 'string' ) {
                                
                                const parsed_setting = this.parseSchema( schemas_list, setting.from, setting.args );

                                //Set the schema setting to the result of the function
                                block.settings[ setting_key ] = parsed_setting;
                            } 
                        }
                    }

                    obj_schema.obj.blocks[ block_key ] = block;
                }
            }
        }

        return obj_schemas;
    }

    this.schemaFilesToSchemasList = async ( schemas_path: string, filenames: string[]): Promise<SchemasList> => {

        let output: SchemasList = {
            fn: [],
            obj: []
        }


        for ( const filename of filenames) {

            const schema_obj = await this.schemaFileToObj( path.join( schemas_path, filename ) );
            if ( schema_obj.fn ) {
                output.fn.push( schema_obj );
            } else if ( schema_obj.obj ) {
                output.obj.push( schema_obj );
            }
            
        }

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