import { icons } from './QIconsSVG'

export function iconTXT(icon, clss = '', width = 18, height = 18) {
    if (icons[icon]) {
        return `
            <div class="MatcQIcon" @click="onClick">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                :class="MatcQIconSVG ${clss}"
                width="${width}" 
                height="${height}" 
                viewBox="0 0 24 24" 
                stroke-width="1.25" 
                stroke="currentColor" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                >
                ${icons[icon]}
            </svg>
            </div>
        `
    } else {
        return `<span class="${icon} ${clss}"/>`
    }
}

export function wrapIcon(icon, clss = '', width = 24, height = 24) {
    return `
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            :class="MatcQIconSVG ${clss}"
            width="${width}" 
            height="${height}" 
            viewBox="0 0 24 24" 
            stroke-width="1" 
            stroke="currentColor" 
            fill="none" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            >
            ${icon}
        </svg>
    `
}

export function iconDOM(icon, clss = '', width = 18, height = 18, strokeWidth = 1.25) {
    if (icons[icon]) {
        const div = document.createElement("div")
        div.className = 'MatcQIcon ' + clss
        div.innerHTML = `<svg 
                xmlns="http://www.w3.org/2000/svg" 
                :class="MatcQIconSVG ${clss}"
                width="${width}" 
                height="${height}" 
                viewBox="0 0 24 24" 
                stroke-width="${strokeWidth}" 
                stroke="currentColor" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                >
                ${icons[icon]}
            </svg>`
        return div
    } else {
        const span = document.createElement("span")
        span.className = `${icon} ${clss}`
        return span
    }
}