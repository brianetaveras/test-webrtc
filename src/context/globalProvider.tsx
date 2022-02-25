import React, { useReducer } from "react"
import { globalReducer } from "./globalReducer"
import { GlobalContext } from "./globalContext"
import {defaultAppState} from "../constants"

export const GlobalProvider = ({ children }: {children: React.ReactNode}) => {

    const [state, dispatch] = useReducer(globalReducer, defaultAppState);
    const setGlobalState = (newContextData: Record<string, any>) => {
        dispatch({type: "SET_GLOBAL_CONTEXT", payload: newContextData});
    }

    return (
        <GlobalContext.Provider value={{state, setGlobalState}}>
            {children}
        </GlobalContext.Provider>
    )

}

