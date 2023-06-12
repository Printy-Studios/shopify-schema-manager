/**
 * Write mode.
 * 
 * @param OverwriteAll  - Overwrite completely.
 * @param OverwriteSome - Overwrite where necessary.
 * @param Append        - Only append, don't overwrite.
 */
enum WriteModeEnum {
    OverwriteAll = 'overwrite_all',
    OverwriteSome = 'overwrite_some',
    Append = 'append'
}

export default WriteModeEnum;