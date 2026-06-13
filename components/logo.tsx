import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  width = 160,
  height = 38,
  priority = false,
}: {
  className?: string
  width?: number
  height?: number
  priority?: boolean
}) {
  return (
    <Image
      src="/leoncast-logo.png"
      alt="leonCAST"
      width={width}
      height={height}
      priority={priority}
      className={cn('h-auto w-auto select-none', className)}
    />
  )
}
