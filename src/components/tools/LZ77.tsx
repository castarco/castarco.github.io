/** @jsxImportSource react */

import { useState } from 'react'
import './LZ77.css'
import SegmentedText from "./SegmentedText.js"
import { partialKMPSearch } from './stringtools.mjs'

type LZ77Props = {
	text: string
	searchBufferSize: number
	lookAheadBufferSize: number
}

export default function LZ77(props: LZ77Props) {
	const [currentPos, setCurrentPos] = useState(0)
	const [searchBuffer, setSearchBuffer] = useState('')
	const [lookAheadBuffer, setLookAheadBuffer] = useState(
		props.text.slice(0, props.lookAheadBufferSize)
	)
	const [window, setWindow] = useState(lookAheadBuffer)
	const [encoded, setEncoded] = useState<string[]>([])

	const playNextStep = () => {
		if (lookAheadBuffer.length === 0) {
			return
		}

		const [jumpIdx, jumpLength] = currentPos === 0
			? [0, 0]
			:partialKMPSearch(
				window,
				lookAheadBuffer.slice(0, -1),
				window.length - lookAheadBuffer.length
			)
		setEncoded(encoded.concat([
			`<${jumpLength}:${Math.max(jumpIdx, 0)}:${lookAheadBuffer[jumpLength]}>`
		]))
		const nextJump = jumpLength + 1

		const _currentPos = currentPos + nextJump
		setCurrentPos(_currentPos)
		setLookAheadBuffer(props.text.slice(
			_currentPos,
			_currentPos + props.lookAheadBufferSize
		))
		setSearchBuffer(props.text.slice(
			Math.max(0, _currentPos - props.searchBufferSize),
			_currentPos
		))
		setWindow(props.text.slice(
			Math.max(0, _currentPos - props.searchBufferSize),
			_currentPos + props.lookAheadBufferSize
		))
	}

	const restart = () => {
		setCurrentPos(0)
		setSearchBuffer('')
		setLookAheadBuffer(props.text.slice(0, props.lookAheadBufferSize))
		setWindow(props.text.slice(0, props.lookAheadBufferSize))
		setEncoded([])
	}

	const overbraces = [
		...(currentPos === 0 ? [] : [{
			start: Math.max(0, currentPos - props.searchBufferSize),
			end: currentPos - 1,
			braceColor: 'var(--color-cream-orange)'
		}]),
		{
			start: currentPos,
			end: Math.min(
				currentPos + props.lookAheadBufferSize - 1,
				props.text.length - 1
			)
		}
	]

	const [jumpIdx, jumpLength] = currentPos === 0
			? [0, 0]
			:partialKMPSearch(
				window,
				lookAheadBuffer.slice(0, -1),
				window.length - lookAheadBuffer.length
			)

	const underbraceStart = jumpLength > 0
		? Math.max(0, currentPos - searchBuffer.length + Math.max(jumpIdx, 0))
		: currentPos
	const underbraces = jumpLength === 0
		? [{
				start: underbraceStart,
				end: underbraceStart + Math.max(jumpLength - 1, 0),
				braceColor: 'var(--color-pine-green)'
			}]
		: [
				{
					start: underbraceStart,
					end: underbraceStart + Math.max(jumpLength - 1, 0),
					braceColor: 'var(--color-pine-green)',
					dashPattern: '2,2'
				},
				{
					start: currentPos,
					end: currentPos + Math.max(jumpLength, 0),
					braceColor: 'var(--color-pine-green)'
				}
			]

	return (
		<div className="lz77-example">
			<div className="lz77-buttons">
				{lookAheadBuffer.length === 0
					? <button className="lz77-restart" onClick={restart}>♻</button>
					: <button className="lz77-next" onClick={playNextStep}>▶</button>
				}
			</div>
			<SegmentedText
				text={props.text}
				overbraces={overbraces}
				underbraces={underbraces}
			/>
			<div className="lz77-output">
				<table className="lz77-state-table">
					<tbody>
						<tr>
							<td>Coding Position</td>
							<td><code>{currentPos}</code></td>
						</tr>
						<tr>
							<td>Window</td>
							<td><code>{window}</code></td>
						</tr>
						<tr>
							<td style={{ color: 'var(--color-cream-orange)'}}>Search Buffer</td>
							<td><code>{searchBuffer}</code></td>
						</tr>
						<tr>
							<td style={{ color: 'var(--color-solarized-red)' }}>Look-ahead Buffer</td>
							<td><code>{lookAheadBuffer}</code></td>
						</tr>
						<tr>
							<td style={{ paddingBottom: '16px', color: 'var(--color-pine-green)' }}>Next to encode</td>
							<td style={{ paddingBottom: '16px' }}><code>{lookAheadBuffer.slice(0, jumpLength + 1)}</code></td>
						</tr>
						<tr>
							<td className="lz77-result" colSpan={2}><code>{encoded.join(', ')}</code></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}
