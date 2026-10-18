import { createContext, useContext } from 'react'

// "Home" returns to the closed game box. Provided by App, used by the header and the content panel.
export const HomeContext = createContext(() => {})
export const useGoHome = () => useContext(HomeContext)
