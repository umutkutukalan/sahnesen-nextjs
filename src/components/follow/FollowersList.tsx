import { FollowDTO } from "@/services/client/follow/follow.service";
import { IoClose } from "react-icons/io5";
import FollowersListItem from "./FollowersListItem";

interface FollowersListProps {
  followers: FollowDTO[];
  onClose: () => void;
  setFollowersList: (isOpen: boolean) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const FollowersList = ({
  followers,
  onClose,
  setFollowersList,
  onLoadMore,
  hasMore,
  isLoading,
}: FollowersListProps) => {
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 30 &&
      hasMore &&
      !isLoading
    ) {
      onLoadMore();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-xs z-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-90 bg-white rounded-md overflow-hidden shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-medium">Takipçiler</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors cursor-pointer hover:bg-gray-100"
          >
            <IoClose className="text-xl text-gray-500" />
          </button>
        </div>
        <ul
          onScroll={handleScroll}
          className="flex flex-col overflow-y-auto flex-1 min-h-0 p-2 divide-y divide-gray-50"
        >
          {followers.map((follower, index) => (
            <FollowersListItem
              key={`${follower.id}-${index}`}
              follower={follower}
              setFollowersList={setFollowersList}
            />
          ))}
          {followers.length === 0 && !isLoading && (
            <p className="text-center text-gray-400 text-xs py-10">
              Henüz takipçi yok.
            </p>
          )}
          {isLoading && (
            <div className="py-4 text-center text-xs text-gray-400">
              Yükleniyor...
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FollowersList;
