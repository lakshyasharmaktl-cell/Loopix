import {} from '../models/user_models.js'



export const friends = async (req, res) => {
try {
const { requestId, action } = req.body;


const currentUserId = req.user.id;

const currentUser = await User.findById(currentUserId);
const senderUser = await User.findById(requestId);

if (!currentUser || !senderUser) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

const requestExists = currentUser.friendRequests.includes(requestId);

if (!requestExists) {
  return res.status(400).json({
    success: false,
    message: "Friend request not found",
  });
}

// ACCEPT REQUEST
if (action === "accept") {

  currentUser.friendRequests =
    currentUser.friendRequests.filter(
      (id) => id.toString() !== requestId
    );

  currentUser.friends.push(requestId);

  senderUser.friends.push(currentUserId);

  await currentUser.save();
  await senderUser.save();

  return res.status(200).json({
    success: true,
    message: "Friend request accepted",
  });
}

// REJECT REQUEST
if (action === "reject") {

  currentUser.friendRequests =
    currentUser.friendRequests.filter(
      (id) => id.toString() !== requestId
    );

  await currentUser.save();

  return res.status(200).json({
    success: true,
    message: "Friend request rejected",
  });
}

return res.status(400).json({
  success: false,
  message: "Invalid action",
});


} catch (err) {
console.log(err.message);


return res.status(500).json({
  success: false,
  message: "Server Error",
});


}
};

export const sendFriendRequest = async (req, res) => {
try {
const senderId = req.user.id;
const receiverId = req.params.id;


if (senderId === receiverId) {
  return res.status(400).json({
    status: false,
    msg: "You cannot send request to yourself"
  });
}

const sender = await user_models.findById(senderId);
const receiver = await user_models.findById(receiverId);

if (!receiver) {
  return res.status(404).json({
    status: false,
    msg: "User not found"
  });
}

const alreadyFriend =
  receiver.friends?.includes(senderId);

if (alreadyFriend) {
  return res.status(400).json({
    status: false,
    msg: "Already friends"
  });
}

const alreadyRequested =
  receiver.friendRequests?.includes(senderId);

if (alreadyRequested) {
  return res.status(400).json({
    status: false,
    msg: "Friend request already sent"
  });
}

receiver.friendRequests.push(senderId);

await receiver.save();

return res.status(200).json({
  status: true,
  msg: "Friend request sent"
});


} catch (err) {
console.log(err.message);


return res.status(500).json({
  status: false,
  msg: "Server Error"
});


}
};

export const getFriendRequests = async (req, res) => {
try {


const user = await user_models
  .findById(req.user.id)
  .populate(
    "friendRequests",
    "name email profilePic"
  );

return res.status(200).json({
  status: true,
  requests: user.friendRequests
});


} catch (err) {
console.log(err.message);
}
};

export const removeFriend = async (req, res) => {
try {


const currentUserId = req.user.id;
const friendId = req.params.id;

await user_models.findByIdAndUpdate(
  currentUserId,
  {
    $pull: {
      friends: friendId
    }
  }
);

await user_models.findByIdAndUpdate(
  friendId,
  {
    $pull: {
      friends: currentUserId
    }
  }
);

return res.status(200).json({
  status: true,
  msg: "Friend removed successfully"
});


} catch (err) {
console.log(err.message);
}
};


