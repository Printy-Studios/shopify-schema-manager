/**
 * Validate whether a variable is one of the specified types.
 * @param { any }               variable        - Variable to check.
 * @param { string }            variable_name   - Name of variable, used when throwing an error.
 * @param { string[] | string } types           - Types to check against.
 * @returns True if validation passed, throw error if not.
 */
export default function validateType( variable: any, variable_name: string, ...types) {

    //Error checking
    for ( const type of types ) {
        if ( typeof type != 'string' ) {
            throw new TypeError( "'types' arguments must be strings" );
        }
    } if ( types.length == 0 ) {
        throw new Error( "must pass at least one 'types' argument" );
    } if ( typeof variable_name != 'string' ) {
        throw new TypeError( "'variable_name' argument must be a string");
    }

    const var_type = typeof variable;

    if ( !types.includes( var_type ) ) {
        if ( types.length == 1 ) {
            throw new TypeError( `${variable_name} must be of type ${ types[0] }` );
        } else {
            throw new TypeError( `${variable_name} must be one of the following types - ${ types }` );
        }
    }

    return true;
}