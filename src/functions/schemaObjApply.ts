import getFunctionFromJSSchema from './getFunctionFromJSSchema';
import getObjFromJSONSchema from './getObjFromJSONSchema';

import getFunctionResult from './getFunctionResult';



/**
 * Apply js and json schemas to other json schemas
 */
export default function schemaObjApplyJS(json_schemas, js_schemas) {

    //Iterate through each json schema
    for ( const json_schema of json_schemas ) {

        const schema = json_schema.obj;

        // If schema has 'settings' property
        if ( schema.settings && Array.isArray( schema.settings ) ) {

            // Iterate through each setting and check if there is a 'from' property
            for ( const setting_key in schema.settings ) {

                const setting = schema.settings[setting_key];
                if( setting.from && typeof setting.from === 'string' ) {
                    //console.log('has "from": ' + setting.from);
                    // If there is a 'from' property, find the corresponding function/object
                    const fn = getFunctionFromJSSchema( js_schemas, setting.from);
                    let obj = null;
                    if ( !fn ) {
                        obj = getObjFromJSONSchema( json_schemas, setting.from);
                    }

                    const result = fn ? getFunctionResult(setting.args, fn) : obj;

                    //Set the schema setting to the result of the function
                    json_schema.obj.settings[setting_key] = result;

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
                    const fn = getFunctionFromJSSchema( js_schemas, block.from );
                    let obj = null;
                    if ( !fn ) {
                        obj = getObjFromJSONSchema( json_schemas, block.from);
                    }


                    const result = fn ? getFunctionResult( block.args, fn ) : obj;
                    //console.log("BLOCK RESULT: ", result);
                    block = result;

                }

                //Check if block has a 'settings' property
                if ( block.settings && Array.isArray( block.settings ) ) {
                    for ( const setting_key in block.settings ) {
                        const setting = block.settings[ setting_key ];
                        if( setting.from && typeof setting.from == 'string' ) {
                            //(' HAS FROM ');
                            // If there is a 'from' property, find the corresponding function from js_schemas
                            const fn = getFunctionFromJSSchema( js_schemas, setting.from);
                            let obj = null;
                            if ( !fn ) {
                                obj = getObjFromJSONSchema( json_schemas, setting.from);
                            }

                            const result = fn ? getFunctionResult(setting.args, fn) : obj;

                            //Set the schema setting to the result of the function
                            block.settings[ setting_key ] = result;
                         } 
                    }
                }

                json_schema.obj.blocks[ block_key ] = block;
            }
        }
    }

    return json_schemas;
}