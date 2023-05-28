/** @jsxImportSource react */

import React from 'react'
import useElementSize from 'usehooks-ts/useElementSize'

import './SegmentedText.css'
import type { BraceProps } from './BraceProps.mjs'
import OverBrace from './OverBrace.js'
import UnderBrace from './UnderBrace.js'

type EmbeddedBraceProps = {
	start: number
	end: number
	comment?: string
	braceColor?: string
	commentColor?: string
}

type SegmentedTextProps = {
	text: string
	overbraces?: EmbeddedBraceProps[]
	underbraces?: EmbeddedBraceProps[]
}

const prepareBraceElems = (
	tds: {
		element: JSX.Element;
		bounds: { width: number; height: number } | undefined;
	}[],
	braces: EmbeddedBraceProps[] | undefined,
	componentId: string,
	middleTag: string,
	Brace: (props: BraceProps) => JSX.Element,
): JSX.Element[] => {
	const braceElems: JSX.Element[] = []

	let accMargin = 0
	let accWidth = 0

	console.log('Painting shit')
	for (const prop of braces ?? []) {
		const requiredShift = tds
			.slice(0, prop.start)
			.map(tdMeta => tdMeta.bounds?.width ?? 0)
			.reduce((a, b) => a + b, 0)
		const requiredWidth = tds
			.slice(prop.start, prop.end+1)
			.map(tdMeta => tdMeta.bounds?.width ?? 1)
			.reduce((a, b) => a + b, 0)
		const requiredMargin = requiredShift - accMargin - accWidth

		const style: React.CSSProperties = {
			height: '11px',
			width: `${requiredWidth}px`,
			marginLeft: `${requiredMargin}px`
		}

		const ub = <Brace
				id={`${componentId}-${middleTag}-${prop.start}`}
				numSlots={prop.end-prop.start+1}
				style={style}
			/>

		braceElems.push(ub)
		accMargin += requiredMargin
		accWidth += requiredWidth
	}

	return braceElems
}

export default function SegmentedText(props: SegmentedTextProps) {
	const componentId = crypto.randomUUID()

	const tds = Array.from(props.text).map(char => {
		const [tdRef, tdBounds] = useElementSize()
		return {
			element: <td
				className="segmendted-text-td"
				ref={tdRef}>{char}</td>,
			bounds: tdBounds
		}
	})

	const [tableRef, tableBounds] = useElementSize()
	const table = <table className="segmendted-text-table" ref={tableRef}>
		<tbody>
			<tr className="segmendted-text-tr">
				{tds.map(td => td.element)}
			</tr>
		</tbody>
	</table>

	const overbraceElems = prepareBraceElems(tds,props.overbraces, componentId, 'overbrace', OverBrace)
	const underbraceElems = prepareBraceElems(tds, props.underbraces, componentId, 'underbrace', UnderBrace)

	const overbraceDiv = <div
		className="segmendted-text-overbraces"
		style={{
			width: `${tableBounds.width}px`,
			height: `${overbraceElems.length > 0 ? '11' : '0'}px`,
			margin: '0 auto'
		}}
	>
		{overbraceElems}
	</div>
	const underbraceDiv = <div
		className="segmendted-text-underbraces"
		style={{
			width: `${tableBounds.width}px`,
			height: `${underbraceElems.length > 0 ? '11' : '0'}px`,
			margin: '0 auto'
		}}
	>
		{underbraceElems}
	</div>


	return (<div id={componentId} className="segmented-text-div">
		{overbraceDiv}
		{table}
		{underbraceDiv}
	</div>)
}
