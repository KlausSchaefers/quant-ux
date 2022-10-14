/**
 * As we do not have multiple inheritence in here, we cascade the the inheritence down
 *
 * Controller -> SVgController -> DesignToken -> Widget -> Screen -> CopyPaste -> Group -> Layer -> Templates ->BaseController
 */
import SVGController from './SVGController'

export default class Controller extends SVGController {

}