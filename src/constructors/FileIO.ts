import * as fs from 'fs';

export default function FileIO() {

    this.replaceInFile = ( regex: RegExp, replacement: string, file_path: string ): boolean => {
        let file_contents = fs.readFileSync( file_path ).toString();

        file_contents = file_contents.replace( regex, replacement);

        fs.writeFileSync(file_path, file_contents);

        return true;
    }

    this.readDir = ( path: string, filter_fn?: ( filename: string ) => string[]): string[] => {

        let all_files = fs.readdirSync( path );

        if ( filter_fn ) {
            all_files = all_files.filter( filename => filter_fn );
        }
        

        return all_files;
    }

    this.readFile = ( path: string ) => {
        return fs.readFileSync( path ).toString();
    }

}