import { IoIosArrowForward } from "react-icons/io";
import { useAuth } from "../../context/UserContext";
import { useState } from "react";

const DeleteAccount = () => {
  const { user, setUser } = useAuth(); // setUser'ı d import et
  const [editProfile, setEditProfile] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Değişiklik kontrolü için
  return (
    <>
      <div
        className="w-full h-20 flex items-center justify-between cursor-pointer"
        onClick={() => setEditProfile(true)}
      >
        <div className="flex flex-col">
          <h3 className="text-red-500">Hesabı Sil</h3>
          <p className="text-xs text-gray-500">
            Hesabınızı kalıcı olarak silebilirsiniz.
          </p>
        </div>
        <div className="text-lg text-gray-500">
          <IoIosArrowForward />
        </div>
      </div>
    </>
  );
};

export default DeleteAccount;
