/**
 * Write mode.
 * 
 * @param OverwriteAll - overwrite completely
 * @param OverwriteSome - overwrite where necessary
 * @param Append - only append, don't overwrite
 */
enum WriteModeEnum {
    OverwriteAll = 'overwrite_all',
    OverwriteSome = 'overwrite_some',
    Append = 'append'
}

export default WriteModeEnum;