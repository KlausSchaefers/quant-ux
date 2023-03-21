import Logger from './Logger'
import Core from './Core'

export function updateSelection(model, newId, selectedWidgetId, selectedGroupId) {
    Logger.log(1, 'SelectionUtil.updateSelection()', newId)
    const util = new Core()
    util.model = model

    /** 
     * If we have no selectedGroup, we select the the widget, or it's
     * top parent group.
     */
    if (!selectedGroupId) {
        if (selectedWidgetId === newId) {
            Logger.log(-1, 'SelectionUtil.updateSelection() > exit > Re-select widget', newId)
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
        Logger.log(1, 'SelectionUtil.updateSelection() > selected group ',pos,  groupHierarchy)
       
        if (pos === -1) {
             /**
              * If the element is not in the hierachy, we select the new top one\
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
            
        } else {
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
    }

    return [null, null, false]
}

