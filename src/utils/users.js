const users = [];

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate data
  if (!username || !room) {
    return {
      error: "Username and room required",
    };
  }

  //check fot existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const userIndex = users.findIndex((user) => {
    return user.id === id;
  });

  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });

  if (!user) {
    return {
      error: "User not available",
    };
  }

  return { user };
};

const getUsersInRoom = (room) => {
  //Clean the data
  room = room.trim().toLowerCase();

  const usersinRoom = users.filter((user) => {
    return user.room === room;
  });

  if (usersinRoom.length === 0) {
    return {
      error: "No users found",
    };
  }

  return usersinRoom;
};

module.exports = {
    getUser,
    getUsersInRoom,
    removeUser,
    addUser
}