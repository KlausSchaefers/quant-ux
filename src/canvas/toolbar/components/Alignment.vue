
<template>
     <div class="MatcAlignment">	
        <QIcon icon="AlignTop" @click="onAlign('top', $event)"/>
        <QIcon icon="AlignBottom" @click="onAlign('bottom', $event)"/>
        <QIcon icon="AlignLeft" @click="onAlign('left', $event)"/>
        <QIcon icon="AlignRight" @click="onAlign('right', $event)" />
        <QIcon icon="AlignMiddle" @click="onAlign('horizontal', $event)"/>
        <QIcon icon="AlignCenter" @click="onAlign('vertical', $event)"/>
        <QIcon icon="AlignHorizontal" @click="onDist('vertical', $event)" :class="{'MatcQIconPassive': !hasVertical}"/>
        <QIcon icon="AlignVertical" @click="onDist('horizontal', $event)" :class="{'MatcQIconPassive': !hasHorizontal}"/>
        <QIcon icon="AlignGrid" @click="onDist('horizontal', $event)" :class="{'MatcQIconPassive': !hasHorizontal}" v-if="hasMulti"/>
	</div>
</template>


<script>
import DojoWidget from 'dojo/DojoWidget'
import _Tooltip from 'common/_Tooltip'
import QIcon from 'page/QIcon'
import * as DistributionUtil from 'core/DistributionUtil'

export default {
    name: 'Alignment',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
            hasMulti: false,
            hasHorizontal: false,
            hasVertical: false
        }
    },
    components: {
        'QIcon': QIcon
    },
    methods: {
        hideDistribution () {
            this.hasHorizontal = false
            this.hasVertical = false
        },
        showDistribution (ids) {
	        const matrix = DistributionUtil.getDistributionMatrix(this.model, ids, false)       
            this.hasHorizontal = matrix.horizontal > 1
            this.hasVertical = matrix.vertical > 1
        },
        setModel (m) {
            this.model = m
        },
        onDist (o, e) {
            this.emit('dist', o, e)
        },
        onAlign (o,e ) {
            this.emit('align', o, e)
        }
    }, 
    mounted () {
    }
}
</script>