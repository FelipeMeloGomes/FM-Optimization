import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from './ui'

interface FavoriteButtonProps {
  isFavorite: boolean
  onClick: () => void
}

export function FavoriteButton({ isFavorite, onClick }: FavoriteButtonProps) {
  const [animating, setAnimating] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    setAnimating(true)
    onClick()
    setTimeout(() => setAnimating(false), 300)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Star
        className={`size-4 transition-all duration-300 ${
          isFavorite
            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
            : 'text-muted-foreground hover:text-yellow-400'
        } ${animating ? 'scale-125' : 'scale-100'}`}
      />
    </Button>
  )
}