/**
 * Get result of a function call.
 * @param args {any} arguments of function. If this is an array, then each array value is passed as a parameter.
 * Otherwise the whole variable is passed as a single param. If this parameter is undefined, it is not passed.
 * @param fn Function to call.
 */
 export default function getFunctionResult( args, fn ) {

    let fn_result = null;
    if ( args && Array.isArray( args ) ) {
        //If args is an array, apply the arg's array values as parameters using spread operator
        fn_result = fn(...args);
    } else {
        //Otherwise pass the args variable itself as the parameter
        fn_result = fn(args)
    }

    return fn_result;
}