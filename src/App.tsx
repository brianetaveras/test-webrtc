import { useEffect, useState, useRef } from "react";
import "./App.css";
import {
  Offer,
  Answer,
  Message,
  Candidate,
  MessageTypes,
  GlobalUseContextType,
} from "./constants";
import { useGlobalContext } from "./context/globalContext";

function App() {
  const [toConnect, setToConnect] = useState("");
  const [errors, setErrors]: [string[], any] = useState([]);
  const {
    myConnection,
    userId,
    socketConnection,
    userList,
    setGlobalState,
  }: GlobalUseContextType = useGlobalContext();
  const iceConfiguration = {
    iceServers: [{ urls: ["stun:stun2.google.com:19302"] }],
  };
  const myConnectionRef: React.MutableRefObject<any> = useRef(null);
  const socketConnectionRef = useRef(null) as React.MutableRefObject<any>;
  const audioStreamRef = useRef(null) as React.MutableRefObject<HTMLAudioElement|null>
  const userIdRef = useRef(null) as React.MutableRefObject<string|null>;
  const toConnectRef = useRef(null) as React.MutableRefObject<string|null>
  useEffect(() => {
    initializeSocketConnection();
    initializePeerConnection();
  }, []);

  useEffect(() => {
    if (!myConnectionRef.current) {
      myConnectionRef.current = myConnection;
    }
    if (!socketConnectionRef.current) {
      socketConnectionRef.current = socketConnection;
    }
    if (!userIdRef.current) {
      userIdRef.current = userId;
    }

  }, [myConnection, userId, socketConnection]);

  const handleSetUserId = (userId: string) => {
    setGlobalState({
      userId: userId,
    });
  };

  const handleReceiveUsers = (userList: string[]) => {
    console.log(userList)
    setGlobalState({
      userList
    })
  }

  const initializePeerConnection = async () => {
    if (!window.RTCPeerConnection)
      return console.error("RTCPeerConnection not supported!");

    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    const [track] = stream.getAudioTracks();
    const connection = new RTCPeerConnection(iceConfiguration);
    connection.addTrack(track, stream);

    connection.ontrack = function (event: any) {

      const audioElement = audioStreamRef.current as HTMLAudioElement;

      audioElement.srcObject = event.streams[0];
    };

    setGlobalState({ myConnection: connection });

    connection.addEventListener("icecandidate", function (candidate) {
      
      if (candidate) {
        console.log(candidate)
        socketConnectionRef.current?.send(
          JSON.stringify({
            type: "candidate",
            data: {
              candidate,
              to: toConnectRef.current,
            },
          })
        );
      }
    })
    return connection;
  };

  const initializeSocketConnection = () => {
    const conn = new WebSocket("wss://b59f-72-89-123-184.ngrok.io");

    conn.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      handleMessageTypes(message);
    };

    setGlobalState({ socketConnection: conn });
    return conn;
  };

  const handleOfferReceive = async ({ offer, from }: Offer) => {
    await myConnectionRef?.current.setRemoteDescription(offer);
    createAnswer(from);
  };

  const handleAnswerReceive = ({ answer }: Answer) => {
    myConnectionRef?.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleCandidateReceived = ({ candidate }: Candidate) => {
    console.log(candidate);
    myConnectionRef?.current.addIceCandidate(candidate);
  };

  const createOffer = async () => {
    try {
      const offer = await myConnectionRef?.current.createOffer();
      myConnectionRef?.current.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("There was an error while creating your offer. Boo :(");
      return null;
    }
  };

  const createAnswer = async (to: string) => {
    try {

      const answer = await myConnectionRef.current.createAnswer();

      socketConnectionRef?.current?.send(JSON.stringify({
        type: "answer",
        data: {
          to,
          answer,
          from: userIdRef.current
        }
      }))

    } catch (error) {
      return null;
    }
  };

  const connectToPlayer = async (id: string) => {
    const offer = await createOffer();
    if (!offer) return setErrors(["Could not make a call", ...errors]);
    socketConnection?.send(
      JSON.stringify({
        type: "offer",
        data: {
          offer,
          to: id,
          from: userId,
        },
      })
    );
  };

  const handleMessageTypes = (message: Message) => {
    switch (message.type) {
      case MessageTypes.SET_USER_ID:
        handleSetUserId(message.data);
        break;
      case MessageTypes.OFFER:
        handleOfferReceive(message.data);
        break;
      case MessageTypes.CANDIDATE:
        handleCandidateReceived(message.data);
        break;
      case MessageTypes.ANSWER:
        handleAnswerReceive(message.data);
        break;
      case "userList":
        handleReceiveUsers(message.data.userList);
        break;
      default:
        console.log(message);
        console.error("Unknown message type!");
    }
  };

  return (
    <div className="App">
      <audio controls autoPlay ref={audioStreamRef}>
      </audio>
      <div>My Id: {userId}</div>
     
      {userList.map(id => {
        return (
        <div key={id}>
            <button onClick={() => {toConnectRef.current = id; connectToPlayer(id)}} style={{width: "200px", height: "50px", margin: "10px 0"}}>Call</button>
        </div>
        )
      })}
      {/* <input
        type="text"
        value={toConnect}
        onChange={(event) => setToConnect(event.target.value)}
      />
      <button onClick={connectToPlayer}>Connect</button> */}

      {errors.map((error, index) => {
        return <div key={index}>{error}</div>;
      })}
    </div>
  );
}

export default App;