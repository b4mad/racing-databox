import { createContext, useContext, ReactNode } from 'react'
import { useUrlState } from '../hooks/useUrlState'
import { ZoomState } from '../components/types'

interface UIStateContextType {
  selectedCar: number | null
  setSelectedCar: (id: number | null) => void
  selectedDriver: number | null
  setSelectedDriver: (id: number | null) => void
  selectedTrack: number | null
  setSelectedTrack: (id: number | null) => void
  zoomState: ZoomState
  setZoomState: (state: ZoomState) => void
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined)

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [selectedCar, setSelectedCar] = useUrlState<number | null>('car', null)
  const [selectedDriver, setSelectedDriver] = useUrlState<number | null>('driver', null)
  const [selectedTrack, setSelectedTrack] = useUrlState<number | null>('track', null)
  const [zoomState, setZoomState] = useUrlState<ZoomState>('zoom', {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  })

  return (
    <UIStateContext.Provider
      value={{
        selectedCar,
        setSelectedCar,
        selectedDriver,
        setSelectedDriver,
        selectedTrack,
        setSelectedTrack,
        zoomState,
        setZoomState,
      }}
    >
      {children}
    </UIStateContext.Provider>
  )
}

export function useUIState() {
  const context = useContext(UIStateContext)
  if (!context) {
    throw new Error('useUIState must be used within UIStateProvider')
  }
  return context
}
