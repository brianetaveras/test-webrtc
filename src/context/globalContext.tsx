import {createContext, useContext} from "react";

export const GlobalContext: any = createContext({});

export const useGlobalContext = () => {
    const {setGlobalState, state} = useContext(GlobalContext);

    return {
        ...state,
        setGlobalState
    }
}