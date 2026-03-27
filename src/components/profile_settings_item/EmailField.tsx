import { IoIosArrowForward } from "react-icons/io";
import { useUser } from "../../context/UserContext";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

const EmailField = () => {
  const { user, setUser } = useUser(); // setUser'ı d import et
  const [editProfile, setEditProfile] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Değişiklik kontrolü için

  return (
    <>
      <div
        className="w-full h-20 flex items-center justify-between cursor-pointer"
        onClick={() => setEditProfile(true)}
      >
        <div className="flex flex-col">
          <h3>Email Adresi</h3>
          <p className="text-xs text-gray-500">
            {user?.mail}
          </p>
        </div>
        <div className="text-lg text-gray-500">
          <IoIosArrowForward />
        </div>
      </div>
      {/* Modal */}
      {editProfile && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-100"
          onClick={() => setEditProfile(false)}
        >
          <div
            className="w-120 h-150 bg-white rounded-lg overflow-hidden shadow-lg flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg">Email Adresi</h3>
                <button
                  onClick={() => setEditProfile(false)}
                  className="p-1 rounded-full transition-colors cursor-pointer"
                >
                  <IoClose className="text-xl text-gray-500" />
                </button>
              </div>
              <div className="h-full w-full flex flex-col gap-5 px-10 py-5">
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    className="focus:outline-none border border-gray-200 focus:border-gray-600 rounded-sm p-2 w-full h-10"
                  />
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-end gap-2 px-10 py-5">
              <button
                onClick={() => setEditProfile(false)}
                className="border border-gray-500 text-black rounded-md px-4 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button className={`rounded-md px-4 py-2 text-xs`}>b</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailField;
