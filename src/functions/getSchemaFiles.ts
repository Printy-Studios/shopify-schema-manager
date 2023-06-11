import * as fs from 'fs';
import * as path from 'path';

export default function getSchemaFiles( schemas_path: string ) {
    const full_path = path.join( process.cwd(), schemas_path);

    let all_files = fs.readdirSync( full_path );

    all_files = all_files.filter( filename => filename.endsWith( '-schema.json' ) || filename.endsWith( '-schema.js' ) );

    return all_files;
}