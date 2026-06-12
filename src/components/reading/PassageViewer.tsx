interface PassageViewerProps {
  passage: string
}

export function PassageViewer({ passage }: PassageViewerProps) {
  return (
    <div className="prose prose-sm max-w-none leading-relaxed text-foreground">
      {passage.split('\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )
}
