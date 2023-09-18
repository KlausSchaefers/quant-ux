import Logger from './Logger'
import Core from './Core'

export function updateSelection(model, newId, selectedWidgetId, selectedGroupId) {
    Logger.log(1, 'SelectionUtil.updateSelection()', `${newId}, ${selectedWidgetId}, ${selectedGroupId}`)
    const util = new Core()
    util.model = model

    /** 
     * If we have no selectedGroup, we select the the widget, or it's
     * top parent group.
     */
    if (!selectedGroupId) {
        if (selectedWidgetId === newId) {
            Logger.log(1, 'SelectionUtil.updateSelection() > exit > Re-select widget', newId)
            return [newId, null, false]
        }

        // Check here if they have the same parent group, and if so,
        // just select the other widget. So we stay in the same level
        const newParentGroup =  util.getParentGroup(newId);
        const oldParentGroup = util.getParentGroup(selectedWidgetId)
        if (newParentGroup &&  oldParentGroup && oldParentGroup.id === newParentGroup.id) {
            Logger.log(1, 'SelectionUtil.updateSelection() > exit > Same parent group', newId)
            return [newId, null, false]
        }
             
        const topGroup = util.getTopParentGroup(newId);
        if (topGroup) {
            Logger.log(1, 'SelectionUtil.updateSelection() > exit > Top Groupd', topGroup)
            return [null, topGroup.id, false]
        } else {
            Logger.log(1, 'SelectionUtil.updateSelection() > exit > Single widget', newId)
            return [newId, null, false]
        }
    }

    /**
     * If we have a group selected, we want to step down in the group
     * hiearchy, unless it is a different group
     */
    if (selectedGroupId) {
        const groupHierarchy = util.getGroupHierarchy(newId)

        const pos = groupHierarchy.indexOf(selectedGroupId)
        Logger.log(-1, 'SelectionUtil.updateSelection() > selected group ',pos)
        

        if (pos === -1) {

            /**
             * We could check if there is there are in the same hiearchy,
             * and if so, select the common element
             */
            // const oldGroupHierarchy = util.getGroupHierarchy(selectedGroupId)
            // const commonGroupId = getCommonGroup(groupHierarchy, oldGroupHierarchy)
            // if (commonGroupId) {
            //     Logger.log(1, 'SelectionUtil.updateSelection() > exit > Commond ansestor group', commonGroupId)
            //     return [null, commonGroupId, false]
            // }

             /**
              * If the element is not in the hierachy, we select the new top one
              * if it exist. Otherwise, just the plain widget
              */
            const topGroup = util.getTopParentGroup(newId);
            if (topGroup) {
                Logger.log(1, 'SelectionUtil.updateSelection() > exit > Other Top Group', topGroup)
                return [null, topGroup.id, false]
            } else {
                Logger.log(1, 'SelectionUtil.updateSelection() > exit > WTF', newId)
                return [newId, null, false]
            }
            
        } 
        /**
         * If the group is the last one, we select widget
         */
        if (pos === groupHierarchy.length - 1) {
            Logger.log(1, 'SelectionUtil.updateSelection() > exit > Last widget in group', newId)
            return [newId, null, false]
        } else {
            const newGroupId = groupHierarchy[pos+1]
            Logger.log(1, 'SelectionUtil.updateSelection() > exit > Step down group level', newGroupId)
            return [null, newGroupId, true]
        }
         
    }

    return [null, null, false]
}


export function getCommonGroup(newHierachy, oldGroupHierarchy) {
    for (let i=newHierachy.length-1; i >=0 ; i--) {
        const newGroupId = newHierachy[i]
        if (oldGroupHierarchy.indexOf(newGroupId) > -1) {
            return newGroupId
        }
    }
}
