/** @jsxImportSource react */

import { useState } from 'react'

import SegmentedText from "./SegmentedText.js";
import './LZ77.css'

type LZ77dProps = {
	input: { length: number; offset: number; char: string }[]
	searchBufferSize: number
}

export default function LZ77d(props: LZ77dProps) {
	const [input, setInput] = useState(props.input)
	const [output, setOutput] = useState('')
	const [currentPointer, setCurrentPointer] = useState<
		{ length: number; offset: number; char: string } | undefined
	>(undefined)

	const [compressedInput, setCompressedInput] = useState(props.input
		.map(p => `<${p.length}:${p.offset}:${p.char}>`)
		.join(', ')
	)

	const decompressRestart = () => {
		setInput(props.input)
		setOutput('')
		setCurrentPointer(undefined)
		setCompressedInput(props.input
			.map(p => `<${p.length}:${p.offset}:${p.char}>`)
			.join(', ')
		)
	}

	const decompressNext = () => {
		if (input.length === 0) {
			return
		}

		const _input = input.slice()

		const _currentPointer = (currentPointer === undefined)
			? { ...(_input[0]!) }
			: { ...currentPointer }

		let _output: string
		if (_currentPointer.length === 0) {
			_output = output.concat(_currentPointer.char)
			_input.shift()
		} else {
			_output = output.concat(output.slice(
				-Math.min(output.length, props.searchBufferSize) + _currentPointer.offset + output.length,
				-Math.min(output.length, props.searchBufferSize) + _currentPointer.offset + output.length + 1
			))
		}

		_currentPointer.length -= 1

		setCurrentPointer(_currentPointer.length < 0 ? undefined : _currentPointer)
		setInput(_input)
		setOutput(_output)
		setCompressedInput(_input
			.map(p => `<${p.length}:${p.offset}:${p.char}>`)
			.join(', ')
		)
	}

	return (<div className="lz77-example">
		<div className="lz77-buttons">
			{input.length > 0
			 ? <button className="lz77-decompress-next" onClick={decompressNext}>▶</button>
			 : <button className="lz77-decompress-restart" onClick={decompressRestart}>♻</button>
			}
		</div>
		<div className="lz77-compressed-data">
			{currentPointer !== undefined
				? (<><code>processing: {compressedInput.split(',')[0]}</code>&nbsp;</>)
				: null
			}
			<code>{compressedInput.length > 0
				? (currentPointer === undefined ? compressedInput : compressedInput.split(', ').slice(1).join(', '))
				: '_'
			}</code>
		</div>
		<SegmentedText
			text={output}
		/>
	</div>)
}
