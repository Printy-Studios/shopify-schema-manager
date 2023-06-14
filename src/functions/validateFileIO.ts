import IFileIO from '../types/IFileIO';

/**
 * Validates whether a FileIO constructor is valid and has all the required properties/methods
 * 
 * @param { IFileIO } fileIO - Constructor to check
 */
export default function validateFileIO(fileIO: IFileIO) {
    if ( typeof fileIO.replaceInFile != 'function' ) {
        throw new TypeError( "FileIO constructor must implement replaceInFile() method" );
    } if ( typeof fileIO.readFile != 'function' ) {
        throw new TypeError( "FileIO constructor must implement readFile() method" );
    } if ( typeof fileIO.readDir != 'function' ) {
        throw new TypeError( "FileIO constructor must implement readDir() method" );
    }
    return true;
}