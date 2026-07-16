import { type ReactNode, type ElementType } from 'react'

interface ProviderProps {
  children: ReactNode
}

export function composeProviders(
  ...providers: Array<ElementType<ProviderProps>>
): React.FC<{ children: ReactNode }> {
  return function ComposedProviders({ children }) {
    return providers.reduceRight(
      (content, Provider) => <Provider>{content}</Provider>,
      children
    )
  }
}