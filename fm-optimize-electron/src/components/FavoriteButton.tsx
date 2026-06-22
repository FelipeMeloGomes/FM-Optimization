import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface FavoriteButtonProps {
  isFavorite: boolean
  onClick: () => void
}

export function FavoriteButton({ isFavorite, onClick }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="text-muted-foreground hover:text-yellow-400 transition-colors"
    >
      <Star className={cn('h-4 w-4', isFavorite && 'fill-yellow-400 text-yellow-400')} />
    </button>
  )
}
