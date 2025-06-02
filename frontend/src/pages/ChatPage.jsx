import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../Components/ChatLoader";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import CallButton from "../Components/CallButton";

function ChatPage() {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });
  // console.log(authUser);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullname,
            image: authUser.profilePic,
          },
          tokenData.token
        );
        const channelId = [authUser._id, targetUserId].sort().join("--");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel); // 🟢 FIX: should be currChannel, not "channel"
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Failed to connect to chat. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    initChat(); // 🟢 Call it here
  }, [tokenData, authUser, targetUserId]); // 🟢 Dependencies

  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  const handleVideoCall = () => {
    if (channel){
      const callUrl = `${window.location.origin}/call/${channel.id}`
      channel.sendMessage({
        text: ` Let's have a video call! Click here to join: ${callUrl}`,
      })
      toast.success("Video call link sent!");
    }
  }
  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall = {handleVideoCall}/>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}

export default ChatPage;
