import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// export const getUsers = async (req, res) => {
//   try {
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// READ
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
export const getUserFriends = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  const friends = await Promise.all(
    user.friends.map((id) => User.findById(id))
  );

  const formatedFriends = friends.map(
    ({ _id, fristName, lastName, email, occupation, location, imagePath }) => {
      return {
        _id,
        fristName,
        lastName,
        email,
        occupation,
        location,
        imagePath,
      };
    }
  );

  res.status(200).json(formatedFriends);

  try {
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
// UPDATE AND DELETE
export const addRemoveFriends = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formatedFriends = friends.map(
      ({ _id, fristName, lastName, occupation, location, picturePath }) => {
        return {
          _id,
          fristName,
          lastName,
          occupation,
          location,
          picturePath,
        };
      }
    );

    res.status(200).json(formatedFriends);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
