import { IoClose } from "react-icons/io5";
import FollowersListItem from "./FollowersListItem";

const FollowersList = ({ followers, currentUserId, onClose, setFollowersList }) => {
    console.log("FollowersList followers:", followers);
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
                    <h3 className="text-lg">Followers</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full transition-colors cursor-pointer"
                    >
                        <IoClose className="text-xl text-gray-500" />
                    </button>
                </div>
                <ul className="flex flex-col overflow-y-auto max-h-96 p-2">
                    {followers.map((follower) => (
                        <FollowersListItem
                            key={follower.id}
                            follower={follower}
                            currentUserId={currentUserId}
                            setFollowersList={setFollowersList}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FollowersList;
