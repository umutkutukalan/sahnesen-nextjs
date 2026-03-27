import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { IoIosArrowForward } from "react-icons/io";

const DeactivateAccount = () => {
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
          <h3 className="text-red-500">Hesabı Devre Dışı Bırak</h3>
          <p className="text-xs text-gray-500">
            Hesabınızı geçici olarak devre dışı bırakabilirsiniz.
          </p>
        </div>
        <div className="text-lg text-gray-500">
          <IoIosArrowForward />
        </div>
      </div>
    </>
  );
};

export default DeactivateAccount;
