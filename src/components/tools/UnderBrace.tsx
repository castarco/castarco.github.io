/** @jsxImportSource react */

import './Braces.css'

import type { BraceProps } from './BraceProps.mjs'

export default function UnderBrace(props: BraceProps) {
	const svgWidth = props.numSlots * 33
	const midpoint = svgWidth * 0.5

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${svgWidth} 10`}
			className={`underbrace underbrace-${props.numSlots}`} id={props.id}
			style={props.style}
		>
			<path
				fill="none"
				stroke={props.braceColor ?? "var(--color-solarized-red)"}
				strokeWidth="1"
				strokeLinejoin="round"
				strokeLinecap="round"
				strokeDasharray={props.dashPattern ?? "1,0"}
				d={`
					M 1,1
					C 1,4 2,5 5,5
					L ${midpoint-2},5
					Q ${midpoint},5 ${midpoint},7
					Q ${midpoint},5 ${midpoint+2},5
					L ${svgWidth-5},5
					C ${svgWidth-2},5 ${svgWidth-1},4 ${svgWidth-1},1
				`}
			/>
		</svg>
	)
}
