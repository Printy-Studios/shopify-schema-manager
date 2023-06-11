import * as fs from 'fs';
import * as path from 'path';
import * as replace from 'replace';

import WriteModeEnum from '../types/WriteModeEnum';

export default function applySchemasToLiquid( schemas, liquid_path: string, mode: WriteModeEnum) {

    const full_liquid_path = path.join( process.cwd(), liquid_path);

    const all_liquid_files = fs.readdirSync( full_liquid_path );

    console.log(all_liquid_files);

    //Filter only those schemas that have a 'for' property
    schemas = schemas.filter( schema => schema.for && typeof schema.for == 'string' );

    console.log('schemas: ', schemas);

    for ( const schema of schemas ) {
        const target_file = schema.for + '.liquid';

        if( all_liquid_files.includes( target_file ) ) {
            console.log('modifying ' + target_file );
            const full_path = path.join( full_liquid_path, target_file );
            
            let file_contents = fs.readFileSync( full_path ).toString();

            if ( mode == WriteModeEnum.OverwriteAll ) {
                const schema_output = '{% schema %}\n' +
                JSON.stringify(schema.obj, null, 2) + '\n' +
                '{% endschema %}';

                file_contents = file_contents.replace( /{%\s*schema\s*%}.*{%\s*endschema\s*%}/gs, schema_output);
            }
            

            fs.writeFileSync(full_path, file_contents);
            
        }

    }
}