const kmpPreprocessPattern = (pattern: string): number[] => {
	const m = pattern.length
	const table = new Array(m).fill(0)

	let i = 0
	let j = 1

	while (j < m) {
		if (pattern[i] === pattern[j]) {
			i += 1
			table[j] = i
			j += 1
		} else if (i === 0) {
			table[j] = 0
			j += 1
		} else {
			i = table[i - 1]
		}
	}

	return table
}

/**
 * Custom version of Knuth-Morris-Pratt algorithm that also returns the longest
 * partial match if no full match is found. It also introduces stopAfter
 * parameter to stop searching after a certain point.
 */
export const partialKMPSearch = (
	searchString: string,
	pattern: string,
	stopAfter: number = +Infinity
): [number, number] => {
	const n = searchString.length
	const m = pattern.length

	const table = kmpPreprocessPattern(pattern)

	let i = 0
	let j = 0

	let longestMatchLength = 0
	let longestMatchIndex = -1

	while (j < n) {
		if (j - i >= stopAfter) {
			break
		}
		if (pattern[i] === searchString[j]) {
			j += 1
			i += 1
			if (i === m) {
				return [j - i, i]
			}
		} else {
			if (i === 0) {
				j += 1
			} else {
				if (i > longestMatchLength) {
					longestMatchLength = i
					longestMatchIndex = j - i
				}

				i = table[i - 1]
			}
		}
	}

	return [longestMatchIndex, longestMatchLength]
}
