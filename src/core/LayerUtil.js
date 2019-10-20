
class LayerUtil {


    getGroupChanges (from, to) {
        var newGroup = [];
        var oldGroup = [];
        
        /**
		 * We have the following cases
		 * 
		 * 1) Widget movement without groups (under screen)
		 * 2) Widget movement in same group
		 * 2.a) Move before group
		 * 3) Widget movement from screen to group
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
			console.debug("createChangeLayerCommand() > 1) Widget movement without groups (under screen)");
		}



		// 2) Widget movement without same group
		// => no need for channge in group structure
		if (from.groupID && to.groupID && from.groupID === to.groupID) {
			// console.debug("createChangeLayerCommand() > 2) Widget movement without same group!");
			// 5)  Widget movement before group
			if (to.type === 'group') {
				console.debug("createChangeLayerCommand() > 2.a) Widget movement before group");

			}
		}

		// 3) Widget movement from screen to group
		if (!from.groupID && to.groupID && to.widgetID != undefined && from.type === 'widget'){
			// console.debug("createChangeLayerCommand() >  3) Widget movement from screen to group!");
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
		}

		// 4) Widget movement from group to screen
		if (from.groupID && !to.groupID && from.type === 'widget'){
			// console.debug("createChangeLayerCommand() > 4) Widget movement from group to screen!");
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
			// console.debug("createChangeLayerCommand() > 5) Widget movement between group", from.groupID , to.groupID);
			newGroup.push({
				type: "add",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
			newGroup.push({
				type: "remove",
				groupID: from.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "remove",
				groupID: to.groupID,
				widgetID: from.widgetID
			});
			oldGroup.push({
				type: "add",
				groupID: from.groupID,
				widgetID: from.widgetID
			})
		}

		//* 6) Group movement to other groups (make child)
		if (from.type === 'group' && to.type === 'widget' && from.groupID !== to.groupID && to.groupID) {
            // console.debug("createChangeLayerCommand() > 6)  Group movement in other groups");
            
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
            // console.debug("createChangeLayerCommand() > 7)  Group movement before group");
            // some how handled well be the bz case 8
		}

		/**
		 * 8) Group out of group to screen
		 */
		if (from.type === 'group' && to.type === 'group' && !to.groupID && from.groupID && from.source) {
            // console.debug("createChangeLayerCommand() > 8)  Group out of group to screen");
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

    getNewZValuePositions (beforePosition, selection, oldZValues){
        //console.debug('getNewZValuePositions()',`enter > ${selection.join(',')}' before ${beforePosition}`)
   
        let insertZ = oldZValues[beforePosition]
        let offset = selection.length
        let selectedZ = selection.map(id => {
            return {
                id: id,
                z: oldZValues[id]
            }
        }).sort((a,b) => {
            return a.z - b.z
        })
        // this.logger.log(2, 'getNewZValuePositions()', `insertZ : ${insertZ}, offset: ${offset}`)

        var zValues = []

        /**
         * 1) move all the seclted stuff above the insertZ. Make sure we 
         * keep the order of the selection!
         */
        selectedZ.forEach((value, i) => {
            zValues.push({
                id: value.id,
                z: insertZ + i
            })
        })

        /**
         * 2) Now move all the widgets (that are not selected) 
         * under down bythe offset!
         */
        for (let id in oldZValues) {
            let isSelected = selection.indexOf(id) > -1
            if (!isSelected) {
                let oldZ = oldZValues[id]
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
        let result = {}
        zValues.sort((a,b) => a.z - b.z)
        zValues.forEach((zPos, i) => {
            result[zPos.id] = i + 1
        })
        return result
    }
}
export default new LayerUtil()