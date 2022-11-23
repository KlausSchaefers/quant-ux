import Logger from './Logger'

class LayerUtil {


    getGroupChanges (from, to) {
		//Logger.log(-1,"getGroupChanges() ", from, to);
        const newGroup = [];
        const oldGroup = [];
        
        /**
		 * We have the following cases
		 * 
		 * 1) Widget movement without groups (under screen)
		 * 2) Widget movement in same group
		 * 2.a) Move before group
		 * 3) Widget movement from screen to group
		 * 3.a) Widget movement before other group
		 * 4) Widget movement from group to screen
		 * 5) Widget movement between groups
		 * 6) Group movement to other groups (make child)
		 * 7) Group before group
		 * 8) Group out of group to screen
		 * 
		 */

		// 1) Widget movement without groups (under screen) 
		// => not need for changes in group structure
		if (!from.groupID && !to.groupID) {
			Logger.log(-1,"getGroupChanges() > 1) Widget movement without groups (under screen)");
		}



		// 2) Widget movement without same group
		// => no need for channge in group structure
		if (from.groupID && to.groupID && from.groupID === to.groupID) {
			// Logger.log(-1,"createChangeLayerCommand() > 2) Widget movement without same group!");
			// 5)  Widget movement before group
			if (to.type === 'group') {
				Logger.log(1,"getGroupChanges() > 2.a) Widget movement before group");
			}
		}

		// 3) Widget movement from screen to group
		if (!from.groupID && to.groupID && to.widgetID != undefined && from.type === 'widget'){
			if (to.type === 'widget') {
				Logger.log(-1,"getGroupChanges() >  3) Widget movement from screen to group!");
				newGroup.push({
					type: "add",
					groupID: to.groupID,
					widgetID: from.widgetID
				});
				oldGroup.push({
					type: "remove",
					groupID: to.groupID,
					widgetID: from.widgetID
				})
			} else {
				Logger.log(1,"getGroupChanges() >  3a) Move above group!");
			}
			
		}

		// 4) Widget movement from group to screen
		if (from.groupID && !to.groupID && from.type === 'widget'){
			Logger.log(1,"getGroupChanges() > 4) Widget movement from group to screen!");
			newGroup.push({
				type: "remove",
				groupID: from.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "add",
				groupID: from.groupID,
				widgetID: from.widgetID
			})
		}
			
		// 5)  Widget movement between group
		if (from.groupID && to.groupID && from.groupID !== to.groupID && from.type === 'widget'){
			Logger.log(1,"getGroupChanges() > 5) Widget movement between group", from.groupID , to.groupID);
		
			newGroup.push({
				type: "remove",
				groupID: from.groupID,
				widgetID: from.widgetID
			});
			newGroup.push({
				type: "add",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "add",
				groupID: from.groupID,
				widgetID: from.widgetID
			})
			oldGroup.push({
				type: "remove",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
		
		}

		//* 6) Group movement to other group (make child)
		if (from.type === 'group' && (to.type === 'widget' ) && from.groupID !== to.groupID && to.groupID) {
            Logger.log(-1,"getGroupChanges() > 6)  Group movement in other groups");
            
			// FIXME we fire here too many channges

            newGroup.push({
				type: "removeSubGroup",
				groupID: from.groupID,
				subGroupID: from.source
            });
            newGroup.push({
				type: "addSubGroup",
				groupID: to.groupID,
				subGroupID: from.source
            });
            
			oldGroup.push({
				type: "addSubGroup",
				groupID: from.groupID,
                subGroupID: from.source
            })
            oldGroup.push({
				type: "removeSubGroup",
                groupID: to.groupID,
				subGroupID: from.source
			})
		}

		//* 7) Group before group
		if (from.type === 'group' && to.type === 'group' && from.groupID && to.groupID && from.groupID !== to.groupID) {
            Logger.log(1,"getGroupChanges() > 7)  Group movement before group");
            // some how handled well be the bz case 8
		}

	    /**
		 * 8) Group out of group to screen
		 */
		if (from.type === 'group'  && !to.groupID && from.groupID && from.source) {
            Logger.log(1,"getGroupChanges() > 8)  Group out of group to screen");
            newGroup.push({
				type: "removeSubGroup",
				groupID: from.groupID,
				subGroupID: from.source
			});
			oldGroup.push({
				type: "addSubGroup",
				groupID: from.groupID,
                subGroupID: from.source
			})
        }
        
        return {
            newGroup: newGroup,
            oldGroup: oldGroup
        }

    }

    getNewZValuePositions (beforePosition, selection, oldZValues, before = true){

        const insertZ = oldZValues[beforePosition]
        const offset = before ? selection.length : 0
        const selectedZ = selection.map(id => {
            return {
                id: id,
                z: oldZValues[id]
            }
        }).sort((a,b) => {
            return a.z - b.z
        })
	
        Logger.log(2, 'LayerUtil.getNewZValuePositions()', `insertZ : ${insertZ}, offset: ${offset}, before: ${before}`)


        /**
         * 1) move all the seclted stuff above the insertZ. Make sure we 
         * keep the order of the selection! We just move by 
		 * fractions to avoid stupid overflow issues
         */
		const zValues = []
		const f = before? 1: -1 // if we are before we substract...
        selectedZ.forEach((value, i) => {
            zValues.push({
                id: value.id,
                z: insertZ + ((i+1) * 0.001 * f)
            })
        })


        /**
         * 2) Now move all the widgets (that are not selected) 
         * under down bythe offset!
         */
        for (let id in oldZValues) {
            const isSelected = selection.indexOf(id) > -1
            if (!isSelected) {
                const oldZ = oldZValues[id]
                if (oldZ <= insertZ) {
                    zValues.push({
                        id: id,
                        z:  oldZ - offset
                    })
                } else {
                    zValues.push({
                        id: id,
                        z:  oldZ
                    })
                }
            } 
        }

        
        /**
         * 3) we build the final result with nice ints starting from 1
         */
        const result = {}
        zValues.sort((a,b) => a.z - b.z)
        zValues.forEach((zPos, i) => {
			const newZ = i + 1	
			const oldZ = oldZValues[zPos.id]
			if (oldZ !== newZ) {
				result[zPos.id] = newZ
			}
        })

        return result
    }
}
export default new LayerUtil()