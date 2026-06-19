'use client'

type Payload = Record<string, unknown>

function McqPreview({ payload }: { payload: Payload }) {
  const options = payload.options as string[]
  const answerIndex = payload.answer_index as number
  return (
    <ul className="space-y-1 mt-2">
      {options.map((opt, i) => (
        <li
          key={i}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            i === answerIndex
              ? 'bg-green-100 text-green-800 font-medium border border-green-300'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border flex-shrink-0 border-current">
            {String.fromCharCode(65 + i)}
          </span>
          {opt}
        </li>
      ))}
    </ul>
  )
}

function FillVersePreview({ payload }: { payload: Payload }) {
  const options = payload.options as string[]
  const answerIndex = payload.answer_index as number
  return (
    <div className="mt-2 space-y-2">
      <p className="text-sm text-gray-800">
        {payload.text_before as string}{' '}
        <span className="inline-block border-b-2 border-blue-500 px-6 mx-1 font-medium text-blue-700">
          {options[answerIndex]}
        </span>{' '}
        {payload.text_after as string}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <span
            key={i}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              i === answerIndex
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {opt}
          </span>
        ))}
      </div>
    </div>
  )
}

function OrderPreview({ payload }: { payload: Payload }) {
  const items = payload.items as string[]
  return (
    <ol className="space-y-1 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  )
}

function MatchPreview({ payload }: { payload: Payload }) {
  const pairs = payload.pairs as { left: string; right: string }[]
  return (
    <ul className="space-y-1 mt-2">
      {pairs.map((pair, i) => (
        <li key={i} className="flex items-center gap-2 text-sm">
          <span className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-center">
            {pair.left}
          </span>
          <span className="text-gray-400">↔</span>
          <span className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg border border-purple-200 text-center">
            {pair.right}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function QuestionPreview({
  type,
  prompt,
  payload,
}: {
  type: string
  prompt: string
  payload: Payload
}) {
  return (
    <div>
      {prompt && <p className="text-sm font-medium text-gray-800">{prompt}</p>}
      {type === 'mcq' && <McqPreview payload={payload} />}
      {type === 'fill_verse' && <FillVersePreview payload={payload} />}
      {type === 'order' && <OrderPreview payload={payload} />}
      {type === 'match' && <MatchPreview payload={payload} />}
    </div>
  )
}
