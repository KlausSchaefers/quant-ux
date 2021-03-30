/**
 * As we do not have multiple inheritence in here, we cascade the the inheritence down
 *
 * Controller -> DesignToken -> Widget -> Screen -> CopyPaste -> Group -> Layer -> Templates ->BaseController
 */
import DesignToken from './DesignToken'

export default class Controller extends DesignToken {

}