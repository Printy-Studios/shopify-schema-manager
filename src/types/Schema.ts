import { GenericObject } from './MiscTypes';

/**
 * Schema types
 */


/**
 * Base for all derived schema types.
 * 
 * @param { string } name Name of schema. Should be equal to schema's filename without extension.
 */
type SchemaBase = {
    name: string
}

/**
 * Function Schema. A schema that stores a function. Derived from SchemaBase.
 * 
 * @param { Function } fn - Function of the schema.
 */
type FnSchema = SchemaBase & {
    fn: Function,
}

/**
 * Object Schema. A schema that stores an object. Derived from SchemaBase
 * 
 * @param { string } [for] - Name of liquid section to which this schema should be applied.
 */
type ObjSchema = SchemaBase & {
    for?: string,
    obj: GenericObject
}

/**
 * List of Schemas, sorted by FnSchemas and ObjSchemas.
 * 
 * @param { FnSchema[] }    fn  - Function Schemas.
 * @param { ObjSchema[] }   obj - Object Schemas.
 */
type SchemasList = {
    fn: FnSchema[],
    obj: ObjSchema[]
}

/**
 * A Schema that could be either an ObjSchema or a FnSchema.
 */
type Schema = ObjSchema | FnSchema;

export { Schema, ObjSchema, FnSchema, SchemasList };