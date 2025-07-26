import React from 'react';

interface UserProfileProps {
  name: string;
  email: string;
  profilePicture?: string; // Optional profile picture URL
}

const UserProfile: React.FC<UserProfileProps> = ({ name, email, profilePicture }) => {
  return (
    <div className="user-profile">
      <img src={profilePicture || 'default-profile-image.jpg'} alt="Profile" />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
};

// Fixed parameter ordering - required parameters must come before optional ones
const someFunction = (requiredParam: string, optionalParam?: string) => {
  // Function implementation
  console.log("Required Param:", requiredParam);
  if (optionalParam) {
    console.log("Optional Param:", optionalParam);
  }
};

export default UserProfile;
