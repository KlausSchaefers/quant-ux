<template>
  <div 
    ref="container" 
    class="zoomable-canvas-container"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div 
      ref="canvas"
      class="zoomable-canvas"
      :style="canvasStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZoomableCanvas',
  props: {
    minZoom: {
      type: Number,
      default: 0.1
    },
    maxZoom: {
      type: Number,
      default: 5
    },
    zoomSensitivity: {
      type: Number,
      default: 0.02
    },
    initialZoom: {
      type: Number,
      default: 1
    },
    initialX: {
      type: Number,
      default: 0
    },
    initialY: {
      type: Number,
      default: 0
    },
    gridSize: {
      type: Number,
      default: 10
    },
    gridGap: {
      type: String,
      default: '40px'
    },
    cellWidth: {
      type: Number,
      default: 200
    },
    cellHeight: {
      type: Number,
      default: 400
    }
  },
  data() {
    return {
      zoom: this.initialZoom,
      panX: this.initialX,
      panY: this.initialY,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartPanX: 0,
      dragStartPanY: 0
    }
  },
  computed: {
    canvasStyle() {
      return {
        transform: `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`,
        transformOrigin: '0 0',
        display: 'grid',
        gridTemplateColumns: `repeat(${this.gridSize}, ${this.cellWidth}px)`,
        gridTemplateRows: `repeat(${this.gridSize}, ${this.cellHeight}px)`,
        gap: this.gridGap,
        padding: this.gridGap
      }
    }
  },
  methods: {
    handleWheel(event) {
      event.preventDefault()
      
      // Zoom when Shift, Ctrl, or Cmd (Meta) is pressed
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        const container = this.$refs.container
        const rect = container.getBoundingClientRect()
        
        // Get mouse position relative to container
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        
        // Calculate zoom delta
        const delta = -event.deltaY * this.zoomSensitivity
        const newZoom = Math.min(Math.max(this.zoom + delta, this.minZoom), this.maxZoom)
        
        if (newZoom !== this.zoom) {
          // Calculate the point under the mouse before zoom
          const beforeZoomPointX = (mouseX - this.panX) / this.zoom
          const beforeZoomPointY = (mouseY - this.panY) / this.zoom
          
          // Update zoom
          this.zoom = newZoom
          
          // Calculate the point under the mouse after zoom
          const afterZoomPointX = beforeZoomPointX * this.zoom
          const afterZoomPointY = beforeZoomPointY * this.zoom
          
          // Adjust pan to keep the point under the mouse
          this.panX = mouseX - afterZoomPointX
          this.panY = mouseY - afterZoomPointY
          
          this.$emit('zoom-change', {
            zoom: this.zoom,
            panX: this.panX,
            panY: this.panY
          })
        }
      } else {
        // Pan when no modifier keys are pressed
        this.panX -= event.deltaX
        this.panY -= event.deltaY
        
        this.$emit('pan-change', {
          zoom: this.zoom,
          panX: this.panX,
          panY: this.panY
        })
      }
    },
    
    handleMouseDown(event) {
      // Only start dragging on left mouse button
      if (event.button !== 0) return
      
      this.isDragging = true
      this.dragStartX = event.clientX
      this.dragStartY = event.clientY
      this.dragStartPanX = this.panX
      this.dragStartPanY = this.panY
      
      // Prevent text selection
      event.preventDefault()
      
      // Change cursor
      this.$refs.container.style.cursor = 'grabbing'
    },
    
    handleMouseMove(event) {
      if (!this.isDragging) return
      
      const deltaX = event.clientX - this.dragStartX
      const deltaY = event.clientY - this.dragStartY
      
      this.panX = this.dragStartPanX + deltaX
      this.panY = this.dragStartPanY + deltaY
      
      this.$emit('pan-change', {
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      })
    },
    
    handleMouseUp() {
      if (this.isDragging) {
        this.isDragging = false
        this.$refs.container.style.cursor = 'grab'
      }
    },
    
    // Public methods for programmatic control
    setZoom(zoom, centerX = null, centerY = null) {
      const newZoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom)
      
      if (centerX !== null && centerY !== null) {
        // Zoom to specific point
        const beforeZoomPointX = (centerX - this.panX) / this.zoom
        const beforeZoomPointY = (centerY - this.panY) / this.zoom
        
        this.zoom = newZoom
        
        const afterZoomPointX = beforeZoomPointX * this.zoom
        const afterZoomPointY = beforeZoomPointY * this.zoom
        
        this.panX = centerX - afterZoomPointX
        this.panY = centerY - afterZoomPointY
      } else {
        this.zoom = newZoom
      }
      
      this.$emit('zoom-change', {
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      })
    },
    
    setPan(x, y) {
      this.panX = x
      this.panY = y
      
      this.$emit('pan-change', {
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      })
    },
    
    resetView() {
      this.zoom = this.initialZoom
      this.panX = this.initialX
      this.panY = this.initialY
      
      this.$emit('view-reset', {
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      })
    },
    
    fitToContainer() {
      const container = this.$refs.container
      const canvas = this.$refs.canvas
      
      if (!container || !canvas) return
      
      const containerRect = container.getBoundingClientRect()
      const canvasRect = canvas.getBoundingClientRect()
      
      const scaleX = containerRect.width / (canvasRect.width / this.zoom)
      const scaleY = containerRect.height / (canvasRect.height / this.zoom)
      const scale = Math.min(scaleX, scaleY, this.maxZoom)
      
      this.zoom = Math.max(scale, this.minZoom)
      
      // Center the canvas
      this.panX = (containerRect.width - (canvasRect.width / this.zoom * scale)) / 2
      this.panY = (containerRect.height - (canvasRect.height / this.zoom * scale)) / 2
      
      this.$emit('fit-to-container', {
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      })
    }
  },
  
  mounted() {
    // Set initial cursor
    this.$refs.container.style.cursor = 'grab'
  }
}
</script>

<style scoped>
.zoomable-canvas-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  cursor: grab;
  user-select: none;
}

.zoomable-canvas-container:active {
  cursor: grabbing;
}

.zoomable-canvas {
  width: fit-content;
  height: fit-content;
  transform-origin: 0 0;
  transition: none;
}

/* Grid cell styling */
.zoomable-canvas > * {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Disable pointer events during dragging to prevent interference */
.zoomable-canvas-container.dragging * {
  pointer-events: none;
}
</style>