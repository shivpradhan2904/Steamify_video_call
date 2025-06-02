import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.error("❌ Error inside getAuthUser:", error);
    return null; // Return null if there's an error
  }
};

export const getUserFriends = async () => {
  try {
    const res = await axiosInstance.get("/user/friends");
    return res.data.friends;
  } catch (error) {
    console.error("❌ Error to getting friends:", error);
    return null; // Return null if there's an error
  }
};

export const getRecommendedUsers = async () => {
  try {
    const res = await axiosInstance.get("/user");
    const users = res.data.recommendedUsers;
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("❌ Error getting Recommended Users:", error);
    return [];
  }
};

export const getOutgoingFriendReqs = async () => {
  try {
    const res = await axiosInstance.get("/user/outgoing-friend-requests");
    return res.data;
  } catch (error) {
    console.error("Unable to fetch:", error);
    return null; // Return null if there's an error
  }
};

export const sendFriendRequest = async (userid) => {
  try {
    const response = await axiosInstance.post(`/user/friend-request/${userid}`);
    return response.data;
  } catch (error) {
    console.error("Unable to send:", error);
  }
};

export const getFriendRequest = async () => {
  try {
    const response = await axiosInstance.get("/user/friend-requests");
    return response.data;
  } catch (error) {
    console.error("Unable to fetch friend requests:", error);
    throw error; // Let React Query handle the error properly
  }
};

export const acceptFriendRequest = async (id) => {
  try {
    const response = await axiosInstance.put(`/user/friend-request/${id}/accept`);
    return response.data;
  } catch (error) {
    console.error("Unable to send:", error);
  }
};

export const CompleteOnboarding = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/onboarding", data);
    return response.data;
  } catch (error) {
    console.error("❌ Error inside CompleteOnboarding:", error);
    throw error;
  }
};

export const getStreamToken = async () => {
  try {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching stream token:", error);
    throw error; // Let React Query handle the error properly
  }
};  
