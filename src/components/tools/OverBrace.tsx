/** @jsxImportSource react */

import './Braces.css'

import type { BraceProps } from './BraceProps.mjs'

export default function OverBrace(props: BraceProps) {
	const svgWidth = props.numSlots * 33
	const midpoint = svgWidth * 0.5

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${svgWidth} 10`}
			className={`overbrace overbrace-${props.numSlots}`} id={props.id}
			style={props.style}
		>
			<path
				fill="none"
				stroke="#000"
				strokeWidth="0.5"
				strokeLinejoin="round"
				strokeLinecap="round"
				d={`
					M 1,9
					C 1,6 2,5 5,5
					L ${midpoint-2},5
					Q ${midpoint},5 ${midpoint},3
					Q ${midpoint},5 ${midpoint+2},5
					L ${svgWidth-5},5
					C ${svgWidth-2},5 ${svgWidth-1},6 ${svgWidth-1},9
				`}
			/>
		</svg>
	)
}
