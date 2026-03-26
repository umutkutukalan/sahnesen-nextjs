import { IoClose } from "react-icons/io5";
import FollowingItem from "./FollowingListItem";


const FollowingList = ({ followings, currentUserId, onClose, setFollowingList }) => {

  console.log("FollowingList followings:", followings);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-100"
      onClick={onClose}
    >
      <div
        className="w-120 h-120 bg-white rounded-md overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg">Following</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors cursor-pointer"
          >
            <IoClose className="text-xl text-gray-500" />
          </button>
        </div>
        <ul className="flex flex-col overflow-y-auto max-h-96 p-2">
          {followings.map((following) => (
            <FollowingItem
              key={following.id}
              following={following}
              currentUserId={currentUserId}
              setFollowingList={setFollowingList} 
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowingList;
