import UserService from 'services/UserService'
import ModelService from 'services/ModelService'
import PublicModelService from 'services/PublicModelService'
import CommentService from 'services/CommentService'
import SymbolService from 'services/SymbolService'

class Services {

    getUserService () {
        return UserService
    }

    getSymbolService () {
        return SymbolService
    }

    getModelService (route) {
        if (route && route.meta && route.meta.isPublic) {
            return PublicModelService
        }
        return ModelService
    }

    getPublicModelService () {
        return PublicModelService
    }
    
    getCommentService () {
        return CommentService
    }

}
export default new Services()