import { DefaultStateType } from "../constants"
export const globalReducer = (state: DefaultStateType, action: {type: string, payload: Record<string, any>}) => {
    switch(action.type) {
        case "SET_GLOBAL_CONTEXT":
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    }
}



