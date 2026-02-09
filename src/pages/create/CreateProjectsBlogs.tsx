import { useEffect, useRef, useState } from "react";
import { GoCheck, GoPlus } from "react-icons/go";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { useUser } from "../../context/UserContext";

import { FaPencil } from "react-icons/fa6";
import { IoIosMove } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import Image from "next/image";
import { useCreateContent } from "@/hooks/create/useCreateProject";

const CreateProjectsBlogs = ({ resourceType }) => {
  const titleRef = useRef(null);
  const [content, setContent] = useState([{ type: "paragraph", value: "" }]);
  const { user } = useUser();
  const [userId, setUserId] = useState(user?.id || null); // userId'yi UserContext'ten al
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const textAreaRefs = useRef([]);

  const { createContent } = useCreateContent();

  // userId debug için console.log
  console.log("Current userId:", userId);
  console.log("Current user:", user);

  // User değiştiğinde userId'yi güncelle
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  // ✓✓✓
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" && !e.altKey) {
      // Normal Enter tuşu, alt satıra geç
      e.preventDefault();
      setContent((prevContent) => [
        ...prevContent.slice(0, index + 1),
        { type: "paragraph", value: "" },
        ...prevContent.slice(index + 1),
      ]);
      setTimeout(() => {
        textAreaRefs.current[index + 1]?.focus();
      }, 0);
    } else if (e.key === "Enter" && e.altKey) {
      // Alt + Enter tuşu, alt satıra geçmeden içerik ekle
      e.preventDefault();
      setContent((prevContent) => {
        const updatedContent = [...prevContent];
        updatedContent[index].value = `${updatedContent[index].value}\n`; // Alt satıra geç
        return updatedContent;
      });
    } else if (
      e.key === "Backspace" &&
      content[index].value === "" &&
      index > 0 &&
      content.length > 1
    ) {
      // Backspace ile paragraf silme
      e.preventDefault();
      setContent((prevContent) => [
        ...prevContent.slice(0, index),
        ...prevContent.slice(index + 1),
      ]);
      setTimeout(() => {
        textAreaRefs.current[index - 1]?.focus();
      }, 0);
    } else if (e.key === "Delete" && content[index].type === "image") {
      // Delete ile görsel silme
      e.preventDefault();
      setContent((prevContent) => [
        ...prevContent.slice(0, index),
        ...prevContent.slice(index + 1),
      ]);
      setTimeout(() => {
        textAreaRefs.current[index]?.focus();
      }, 0);
    }
  };
  // ✓✓✓
  const handleInputChange = (e, index) => {
    const updatedContent = [...content];
    updatedContent[index].value = e.target.value;
    setContent(updatedContent);
  };
  // ✓✓✓
  const handleAddImage = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const updatedContent = [...content];
          updatedContent[index] = { type: "image", value: reader.result };
          updatedContent.splice(index + 1, 0, { type: "paragraph", value: "" }); // Altına yeni textarea ekleniyor
          setContent(updatedContent);

          // Yeni textarea'ya odaklan
          setTimeout(() => {
            textAreaRefs.current[index + 1]?.focus();
          }, 0);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setMenuOpenIndex(null);
  };
  // ✓✓✓
  const handlePageClick = (e) => {
    // Eğer tıklanan alan bir textarea veya görsel değilse ve boş bir textarea yoksa yeni bir textarea ekle
    const hasEmptyParagraph = content.some(
      (item) => item.type === "paragraph" && item.value.trim() === "",
    );
    if (
      !e.target.closest("textarea") &&
      !e.target.closest("div.relative") &&
      !hasEmptyParagraph
    ) {
      setContent((prevContent) => [
        ...prevContent,
        { type: "paragraph", value: "" },
      ]);
      setTimeout(() => {
        textAreaRefs.current[content.length]?.focus(); // Yeni textarea'ya odaklan
      }, 0);
    }
  };
  // ✓✓✓
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index); // Sürüklenen öğenin indeksini sakla
  };
  // ✓✓✓
  const handleDragOver = (e) => {
    e.preventDefault(); // Varsayılan davranışı engelle
  };
  // ✓✓✓
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (dragIndex !== dropIndex) {
      const updatedContent = [...content];
      const [draggedItem] = updatedContent.splice(dragIndex, 1); // Sürüklenen öğeyi kaldır
      updatedContent.splice(dropIndex, 0, draggedItem); // Yeni konuma ekle
      setContent(updatedContent);
    }
  };
  // ✓✓✓
  // useEffect ile textarea'ların boyutlarını güncelle
  useEffect(() => {
    // Textarea'ların yüksekliğini güncelle
    textAreaRefs.current.forEach((ref) => {
      if (ref) {
        ref.style.height = "auto";
        ref.style.height = `${ref.scrollHeight}px`;
      }
    });
  }, [content]); // content değiştikçe bu effect çalışacak

  // Toast ile onay fonksiyonu
  const confirmToast = (message) =>
    new Promise((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>{message}</span>
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  toast.success("Başarıyla oluşturuldu");
                  resolve(true);
                }}
              >
                Evet
              </button>
              <button
                className="bg-gray-300 px-3 py-1 rounded cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Hayır
              </button>
            </div>
          </div>
        ),
        { duration: 10000 },
      );
    });

  // ✓✓✓
  const handleCreateProject = async () => {
    const isConfirmed = await confirmToast(
      "Oluşturmak istediğinize emin misiniz?",
    );
    if (!isConfirmed) return; // Kullanıcı onaylamazsa işlemi iptal et

    const payload = {
      userId,
      title: titleRef.current?.value || "",
      content,
      image: content.find((item) => item.type === "image")?.value || null,
    };

    if (!userId) {
      alert("Lütfen bir userId girin.");
      return;
    }

    createContent(payload, resourceType); // resourceType dropdown'dan alınır

    // Sayfayı temizle veya yenile
    setContent([{ type: "paragraph", value: "" }]); // İçeriği sıfırla
    titleRef.current.value = ""; // Başlığı sıfırla
  };

  return (
    <div className={`page pt-5`}>
      <div className="page-padding flex justify-center">
        <div
          className={`h-[calc(100vh-64px)] w-full overflow-y-auto flex items-center justify-center`}
        >
          <div className="h-full w-200 flex flex-col gap-5">
            <textarea
              ref={titleRef}
              placeholder="Title"
              className="w-full text-4xl focus:outline-none focus:border-none resize-none overflow-hidden leading-tight placeholder-gray-400 text-gray-800"
              rows={1}
              onInput={(e) => {
                const el = e.target;
                const currentScroll = window.scrollY; // mevcut scroll konumu
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
                window.scrollTo(0, currentScroll); // scroll'u aynı yerde tut
              }}
            />

            {content.map((item, index) => (
              <div
                key={index}
                className="relative"
                draggable // Sürüklenebilirlik özelliği
                onDragStart={(e) => handleDragStart(e, index)} // Sürükleme başlangıcı
                onDragOver={handleDragOver} // Sürükleme sırasında
                onDrop={(e) => handleDrop(e, index)} // Bırakma işlemi
              >
                {/* BiPlus ve Menü */}
                {focusedIndex === index &&
                  item.type === "paragraph" &&
                  item.value.trim() === "" && (
                    <div className="absolute -left-12">
                      <div
                        onClick={() =>
                          setMenuOpenIndex(
                            menuOpenIndex === index ? null : index,
                          )
                        }
                        className="w-8 h-8 rounded-full border border-black flex items-center justify-center cursor-pointer "
                      >
                        <GoPlus
                          className={`text-2xl ${
                            menuOpenIndex === index
                              ? "rotate-45 transition-all duration-200"
                              : "rotate-0 transition-all duration-200"
                          }`}
                        />
                      </div>
                      {menuOpenIndex === index && (
                        <div
                          className="absolute transform left-10 top-0 bg-white shadow-md text-lg h-8 w-8 rounded-full cursor-pointer flex items-center justify-center border border-green-600 z-100"
                          onClick={() => handleAddImage(index)}
                        >
                          <MdOutlineAddPhotoAlternate className="text-green-600" />
                        </div>
                      )}
                    </div>
                  )}

                {/* Paragraf Alanı */}
                {item.type === "paragraph" && (
                  <div className="relative w-full">
                    <textarea
                      ref={(el) => (textAreaRefs.current[index] = el)}
                      value={item.value}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Paragraf yazın..."
                      className="w-full text-lg focus:outline-none focus:border-none resize-none overflow-hidden leading-relaxed placeholder-gray-400"
                      rows={1}
                      onFocus={() => setFocusedIndex(index)}
                      onInput={(e) => {
                        const el = e.target;
                        const currentScroll = window.scrollY; // mevcut scroll konumu
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                        window.scrollTo(0, currentScroll); // scroll'u aynı yerde tut
                      }}
                    />
                    <div className="absolute top-0 -right-15 w-8 h-8 overflow-hidden text-lg bg-blue-800 rounded-full text-white flex items-center justify-center cursor-pointer ">
                      <IoIosMove />
                    </div>
                  </div>
                )}

                {/* Görsel Alanı */}
                {item.type === "image" && (
                  <div className="w-full max-h-[700px] border border-gray-200 shadow-md rounded-lg relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full h-full flex items-center justify-center cursor-pointer opacity-0 absolute top-0 left-0"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const updatedContent = [...content];
                            updatedContent[index].value = reader.result;
                            setContent(updatedContent);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setContent((prevContent) => [
                          ...prevContent.slice(0, index),
                          ...prevContent.slice(index + 1),
                        ]);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-red-600 transition-all"
                    >
                      Sil
                    </button>
                    {item.value ? (
                      <Image
                        src={item.value}
                        alt="Uploaded"
                        layout="fill"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Görsel Ekle
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className={`fixed bottom-5 left-5 transform flex items-center gap-2`}
      >
        <button className="cursor-pointer bg-green-600 hover:bg-green-700 rounded-full w-10 h-10 text-white flex items-center justify-center transition-all duration-200">
          <GoCheck className="text-xl" onClick={handleCreateProject} />
        </button>
        <button
          onClick={handlePageClick} // Boş alana tıklama işlemi
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 text-white flex items-center justify-center transition-all duration-200"
        >
          <FaPencil />
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateProjectsBlogs;
