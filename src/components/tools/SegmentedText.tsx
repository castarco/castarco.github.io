/** @jsxImportSource react */

import type { CSSProperties } from 'react'
import { useEffect, useId, useState } from 'react'
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
	dashPattern?: string
	commentColor?: string
}

type SegmentedTextProps = {
	text: string
	overbraces?: EmbeddedBraceProps[]
	underbraces?: EmbeddedBraceProps[]
}

const prepareBraceElems = (
	tdSizes: ({
		width: number
		height: number
	} | undefined)[],
	braces: EmbeddedBraceProps[] | undefined,
	componentId: string,
	middleTag: string,
	Brace: (props: BraceProps) => JSX.Element,
): JSX.Element[] => {
	const braceElems: JSX.Element[] = []

	for (const { start, end, braceColor, dashPattern } of braces ?? []) {
		let accMargin = 0
		let accWidth = 0

		const requiredShift = tdSizes
			.slice(0, start)
			.map(tdSize => tdSize?.width ?? 0)
			.reduce((a, b) => a + b, 0)
		const requiredWidth = tdSizes
			.slice(start, end + 1)
			.map(tdSize => tdSize?.width ?? 1)
			.reduce((a, b) => a + b, 0)
		const requiredMargin = requiredShift - accMargin - accWidth

		const style: CSSProperties = {
			height: '11px',
			width: `${requiredWidth}px`,
			marginLeft: `${requiredMargin}px`
		}

		const ub = <Brace
			id={`${componentId}-${middleTag}-${start}-${end}`}
			key={`${componentId}-${middleTag}-${start}-${end}`}
			numSlots={end-start+1}
			braceColor={braceColor}
			dashPattern={dashPattern}
			style={style}
		/>

		braceElems.push(ub)
		accMargin += requiredMargin
		accWidth += requiredWidth
	}

	return braceElems
}

type TdElementProps = {
	char: string
	idx: number
	componentId: string
	updateSize: (idx: number, bounds: { width: number; height: number }) => void
}

const TdElement = ({ char, idx, updateSize }: TdElementProps) => {
  const [tdRef, tdBounds] = useElementSize()
  useEffect(() => updateSize(idx, tdBounds), [char, idx, tdBounds])

  return (
    <td
      className="segmendted-text-td"
      ref={tdRef}
    >{char}</td>
  );
};

export default function SegmentedText(
	{ overbraces, underbraces, text }: SegmentedTextProps
) {
	const componentId = useId()

	const [tdSizes, setTdSizes] = useState<{ width: number; height: number }[]>(
		new Array(text.length)
	);

	const updateSize = (idx: number, bounds: { width: number; height: number }) => {
		tdSizes[idx] = bounds
		setTdSizes([ ...tdSizes])
	}

	const tds = Array.from(text || '_', (char, idx) => {
		return <TdElement
			idx={idx}
			key={`${componentId}-td-${idx}`}
			char={char}
			updateSize={updateSize}
		/>
	})

	const [tableRef, tableBounds] = useElementSize()
	const table = <table className="segmendted-text-table" ref={tableRef}>
		<tbody>
			<tr className="segmendted-text-tr">
				{tds}
			</tr>
		</tbody>
	</table>

	const [overbraceElems, setOverbraceElems] = useState(prepareBraceElems(
		tdSizes,
		overbraces,
		componentId,
		'overbrace',
		OverBrace
	))
	const [underbraceElems, setUnderbraceElems] = useState(prepareBraceElems(
		tdSizes,
		underbraces,
		componentId,
		'underbrace',
		UnderBrace
	))

	useEffect(() => {
		setOverbraceElems(prepareBraceElems(
			tdSizes,
			overbraces,
			componentId,
			'overbrace',
			OverBrace
		))
		setUnderbraceElems(prepareBraceElems(
			tdSizes,
			underbraces,
			componentId,
			'underbrace',
			UnderBrace
		))
	}, [tdSizes, overbraces, underbraces, text])

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
			margin: '-16px auto 8px auto'
		}}
	>
		{underbraceElems}
	</div>

	return <div id={componentId} className="segmented-text-div">
		{overbraceDiv}
		{table}
		{underbraceDiv}
	</div>
}
