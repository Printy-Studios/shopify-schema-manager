import * as fs from 'fs';
import * as path from 'path';

type Schema = {
    
}

export default async function schemaFilesToObjects( schemas_dir: string , filenames: string[]) {

    const full_path = path.join( process.cwd(), schemas_dir );

    let schemas = {
        js: [],
        json: []
    };

    for ( const filename of filenames ) {

        const file_path = path.join( full_path, filename );

        const file_ext = path.extname( file_path );

        if( file_ext == '.js' ) {
            //const fn = await import( file_path );
            schemas.js.push( {
                name: path.parse( filename ).name,
                fn: await import ( file_path )
            } );

        } else if ( file_ext == '.json') {

            const raw = fs.readFileSync( file_path ).toString();
            let obj = JSON.parse( raw );
            let obj_for = obj.for;//obj.for;
            delete obj.for;
            schemas.json.push( {
                for: obj_for,
                name: path.parse( filename ).name,
                obj: obj
            } );

        }
        
    }

    return schemas;

}