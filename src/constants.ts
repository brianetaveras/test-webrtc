export type Message = {
  type: string;
  data: any;
};

export type Offer = {
  offer: any;
  from: string;
};

export type Answer = {
  answer: any;
  from: string;
};

export type Candidate = {
  candidate: any;
};

export enum MessageTypes {
  SET_USER_ID = "setUserId",
  OFFER = "offer",
  ANSWER = "answer",
  CANDIDATE = "candidate",
}

export type DefaultStateType = {
  userId: string | null;
  myConnection: RTCPeerConnection | null;
  socketConnection: WebSocket | null;
  userList: string[];
};

export const defaultAppState: DefaultStateType = {
  userId: null,
  myConnection: null,
  socketConnection: null,
  userList: []
};


export type GlobalUseContextType = {
  setGlobalState: (newState: Record<string, any>) => void; 
} & DefaultStateType;
