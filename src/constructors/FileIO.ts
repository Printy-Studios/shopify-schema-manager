import * as fs from 'fs';

/**
 * This is a fairly generic file IO constructor that uses the fs module. If you want to implement your own FileIO,
 * you can pass one as a parameter to the SchemaManager constructor. You must then implement in your custom fileIO
 * all the methods that are present in this FileIO.
 */
export default function FileIO() {

    /**
     * Replace a regex match in a file with a string.
     * 
     * @param regex { RegExp } regex to search for.
     * @param replacement { string } string to replace with
     * @param file_path { string } path to file
     * 
     * @return { boolean } true if regex was found and replaced, false otherwise.
     */
    this.replaceInFile = ( regex: RegExp, replacement: string, file_path: string ): boolean => {
        //Get contents of file as string
        let file_contents = fs.readFileSync( file_path ).toString();

        //Replace string that matches regex and store new string
        const new_file_contents = file_contents.replace( regex, replacement);

        //If there wasn't any replacement, return false 
        if ( file_contents == new_file_contents ) {
            return false;
        }

        //Otherwise, write the new string to file and return true
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