//Core
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
     * @param { RegExp } regex          - Regex to search for.
     * @param { string } replacement    - String to replace with.
     * @param { string } file_path      - Path to file.
     * 
     * @returns { boolean } - True if regex was found and replaced, false if regex wasn't found.
     */
    this.replaceInFile = ( regex: RegExp, replacement: string, file_path: string ): boolean => {

        //Error checking
        if( ! ( regex instanceof RegExp ) ) {
            throw new TypeError( "'regex' param must be a RegExp object" )
        } if( typeof replacement != 'string' ) {
            throw new TypeError( "'replacement' param must be a string" );
        } if( typeof file_path != 'string' ) {
            throw new TypeError( "'file_path' param must be a string" );
        }

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

    /**
     * Output contents of a directory (non-recursively).
     * 
     * @param { string }    path        - Path to directory.
     * @param { function }  [filterFn]  - Optional filter function that will be applied with Array.prototype.filter to the results.
     * 
     * @returns { string[] } - Array of file/directory names
     */
    this.readDir = ( path: string, filterFn?: ( filename: string ) => string[]): string[] => {

        if ( typeof path != 'string' ) {
            throw new TypeError( "'path' argument must be a string" );
        } if ( filterFn && ! ( filterFn instanceof Function ) ) {
            throw new TypeError( "'filterFn' argument must be a function!")
        }

        //Get all files in specified directory
        let all_files = fs.readdirSync( path );

        //If filter function is passed, filter all found files according to it
        if ( filterFn ) {
            all_files = all_files.filter( filename => filterFn );
        }

        //Return (possibly filtered) list of files in directory
        return all_files;
    }

    /**
     * Output contents of a file as string.
     * 
     * @param { string } path - Path to file.
     * 
     * @returns { string } - Contents of file as string
     */
    this.readFile = ( path: string ): string => {

        if ( typeof path != 'string' ) {
            throw new TypeError( "'path' argument must be a string" );
        }

        return fs.readFileSync( path ).toString();
    }

}