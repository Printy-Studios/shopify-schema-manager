import validateType from './validateType';

/**
 * Get result of a function call. This is used to quickly call a function with dynamic parameters that could be either an 
 * array or a single variable such as an object.
 * 
 * @param { Function }  fn      - Function to call.
 * @param {any}         [args]  - arguments of function. If this is an array, then each array value is passed as a parameter.
 * Otherwise the whole variable is passed as a single param. If this parameter is undefined, it is not passed.
 * 
 * @returns { any } - Result of called function.
 */
 export default function getFunctionResult(  fn: Function, args?: any ) {

    validateType( fn, 'fn', 'function' );

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