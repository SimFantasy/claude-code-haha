import { useMemo } from 'react'
import { createPatch } from 'diff'
import { CopyButton } from '../shared/CopyButton'

type Props = {
  filePath: string
  oldString: string
  newString: string
}

type DiffLine = {
  oldLineNo: number | null
  newLineNo: number | null
  type: 'added' | 'removed' | 'context'
  content: string
}

export function DiffViewer({ filePath, oldString, newString }: Props) {
  const patch = useMemo(
    () => createPatch(filePath, oldString, newString, 'before', 'after', { context: 3 }),
    [filePath, newString, oldString],
  )
  const lines = useMemo(() => parsePatchLines(patch), [patch])
  const additions = lines.filter((line) => line.type === 'added').length
  const deletions = lines.filter((line) => line.type === 'removed').length

  return (
    <div className="overflow-hidden rounded-lg border border-[#d0d7de] bg-[#f6f8fa] text-[#24292f]">
      <div className="flex items-center justify-between border-b border-[#d0d7de] bg-white px-3 py-1.5">
        <div className="min-w-0">
          <div className="truncate font-[var(--font-mono)] text-[11px] text-[#57606a]">
            {filePath}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
            <span className="rounded-full bg-[#dafbe1] px-2 py-0.5 text-[#1a7f37]">+{additions}</span>
            <span className="rounded-full bg-[#ffebe9] px-2 py-0.5 text-[#cf222e]">-{deletions}</span>
          </div>
        </div>

        <CopyButton
          text={patch}
          label="Copy patch"
          className="rounded-md border border-[#d0d7de] bg-white px-2 py-1 text-[11px] text-[#57606a] transition-colors hover:bg-[#f3f4f6] hover:text-[#24292f]"
        />
      </div>

      <div className="max-h-[360px] overflow-auto">
        <div className="min-w-full">
          {lines.map((line, index) => {
            const rowClass =
              line.type === 'added'
                ? 'bg-[#dafbe1]/60 border-l-2 border-l-[#1a7f37]'
                : line.type === 'removed'
                  ? 'bg-[#ffebe9]/60 border-l-2 border-l-[#cf222e]'
                  : 'bg-white border-l-2 border-l-transparent'
            const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
            const prefixColor =
              line.type === 'added'
                ? 'text-[#1a7f37]'
                : line.type === 'removed'
                  ? 'text-[#cf222e]'
                  : 'text-[#57606a]'

            return (
              <div
                key={`${line.oldLineNo}-${line.newLineNo}-${index}`}
                className={`grid grid-cols-[2.5rem,2.5rem,1.25rem,minmax(0,1fr)] gap-0 font-[var(--font-mono)] text-[12px] leading-[1.3] ${rowClass}`}
              >
                <span className="select-none border-r border-[#eaeef2] px-2 py-px text-right text-[11px] text-[#8b949e]">
                  {line.oldLineNo ?? ''}
                </span>
                <span className="select-none border-r border-[#eaeef2] px-2 py-px text-right text-[11px] text-[#8b949e]">
                  {line.newLineNo ?? ''}
                </span>
                <span className={`border-r border-[#eaeef2] px-1 py-px text-center ${prefixColor}`}>{prefix}</span>
                <span className="whitespace-pre-wrap break-words px-3 py-px text-[#24292f]">{line.content}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function parsePatchLines(patch: string): DiffLine[] {
  const output: DiffLine[] = []
  const patchLines = patch.split('\n')
  let oldLineNo = 0
  let newLineNo = 0

  for (const line of patchLines) {
    if (
      line.startsWith('Index:') ||
      line.startsWith('===') ||
      line.startsWith('---') ||
      line.startsWith('+++')
    ) {
      continue
    }

    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)/)
      if (match?.[1]) oldLineNo = parseInt(match[1], 10) - 1
      if (match?.[2]) newLineNo = parseInt(match[2], 10) - 1
      continue
    }

    if (line.startsWith('\\ No newline')) continue

    if (line.startsWith('+')) {
      newLineNo += 1
      output.push({ oldLineNo: null, newLineNo, type: 'added', content: line.slice(1) })
      continue
    }

    if (line.startsWith('-')) {
      oldLineNo += 1
      output.push({ oldLineNo, newLineNo: null, type: 'removed', content: line.slice(1) })
      continue
    }

    oldLineNo += 1
    newLineNo += 1
    output.push({
      oldLineNo,
      newLineNo,
      type: 'context',
      content: line.startsWith(' ') ? line.slice(1) : line,
    })
  }

  return output
}
