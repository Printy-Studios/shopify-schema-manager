import IFileIO from './IFileIO';
import { Schema } from './Schema';

/**
 * Converter function, used by FileToSchemaConverter type. Takes file path, schema name and fileIO object as parameters
 * 
 * @param { string }    file_path   - path to file
 * @param { string }    schema_name - name of schema
 * @param { IFileIO }   fileIO      - FileIO object to use
 * 
 * @returns { Promise<Schema> } - Promise that resolves to a Schema object that got converted from the file.
 * the returned object should have its `name` property set to the `schema_name` param,
 */
type FileToSchemaConverterFunction = ( file_path: string, schema_name: string, fileIO: IFileIO ) => Promise<Schema>

/**
 * File to Schema Converter type. Used to convert different filetypes to a FnSchema/ObjSchema type
 * 
 * @param { ( 'fn' | 'obj' ) }              type            - type of Schema, either 'fn' or 'obj'.
 * @param { string }                        file_extension  - the extension which the converter can convert.
 * @param { FileToSchemaConverterFunction } convert         - The converter function that will be invoked when conversion is needed.
 */
type FileToSchemaConverter = {
    type: 'fn' | 'obj',
    file_extension: string,
    convert: FileToSchemaConverterFunction
}

export default FileToSchemaConverter;