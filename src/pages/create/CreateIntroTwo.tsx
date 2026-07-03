"use client";

import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import { camasir, card1, fineday, sahne, tire } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

const cards = [
  {
    id: "monolog",
    label: "Monolog",
    bg: "#f2c103",
    image: fineday,
    side: "left",
    bottomOffset: "sm:-bottom-13 sm:left-0 w-80 h-80",
  },
  {
    id: "sahne",
    label: "Sahne",
    bg: "#faf8f5",
    image: sahne,
    side: "right",
    bottomOffset: "sm:-bottom-20 sm:-right-4 w-80 h-80",
  },
  {
    id: "yanyana",
    label: "Yan Yana",
    bg: "#fa9ec1",
    image: card1,
    side: "left",
    bottomOffset: "-bottom-2 left-0 sm:-bottom-2 sm:left-0 w-60 h-60",
  },
  {
    id: "tersyuz",
    label: "Tersyüz",
    bg: "#93c5fd",
    image: camasir,
    side: "right",
    bottomOffset: "sm:-bottom-10 sm:-left-10 w-90 h-90",
  },
];

const CreateIntroTwo = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedCardData = cards.find((card) => card.id === selected);

  const handleClick = (card: (typeof cards)[0]) => {
    // 1. Durum: Eğer zaten bu seçili karta tıklandıysa animasyonu GERİ AL (Kapat)
    if (selected === card.id) {
      setSelected(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Sayfa geçişini iptal et
        timeoutRef.current = null;
      }
      return;
    }

    // 2. Durum: Başka bir kart seçiliyken tıklamaları engelle
    if (selected !== null) return;

    // 3. Durum: İlk defa bir karta tıklanıyorsa ORTAYA TOPLA
    setSelected(card.id);

    // Eğer kartın bir rotası varsa 1 saniye sonra oraya yönlendir
    if (card.route) {
      timeoutRef.current = setTimeout(() => {
        router.push(card.route);
      }, 1000);
    }
  };

  return (
    <>
      <EditorNavbar
        transparent={true}
        contentStatus="IDLE"
        activePostId={null}
        handleSave={() => {}}
      />
      <div
        className="w-full h-[100vh] relative flex items-center justify-center overflow-hidden group"
        style={{ backgroundColor: selected ? selectedCardData?.bg : "#ffffff" }}
      >
        <div className="flex flex-wrap content-center justify-center gap-10 w-full max-w-xl mx-auto">
          {cards.map((card, i) => {
            const isSelected = selected === card.id;
            const isOther = selected !== null && !isSelected;

            // Ortaya toplanma offset'leri
            const offsetX =
              i % 2 === 0 ? "calc(50% + 1.25rem)" : "calc(-50% - 1.25rem)";
            const offsetY =
              i < 2 ? "calc(50% + 1.25rem)" : "calc(-50% - 1.25rem)";

            const getDelay = () => {
              if (selected !== null) {
                //kartları ortaya toplarken
                return isSelected ? 0.15 : i * 0.04;
              } else {
                //kartları geri açarken
                return isSelected ? 0.15 : i * 0.05;
              }
            };

            return (
              <motion.div
                key={card.id}
                // group sınıfını buraya ekledik ki ileride hover yapmak isterseniz tetiklensin
                className={`relative w-44 h-44 sm:w-60 sm:h-60 cursor-pointer ${selected ? `group:${card.bg}` : ""}`}
                onClick={() => handleClick(card)}
                animate={
                  isSelected
                    ? {
                        x: offsetX,
                        y: offsetY,
                        scale: 1.1,
                        zIndex: 50,
                        opacity: 1,
                      }
                    : isOther
                      ? {
                          x: offsetX,
                          y: offsetY,
                          scale: 0.9,
                          opacity: 0,
                          zIndex: 1,
                        }
                      : { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 1 }
                }
                transition={{
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                  delay: getDelay(),
                }}
                style={{ zIndex: isSelected ? 50 : 1 }}
              >
                {/* KARTIN ASIL GÖVDESİ VE TAŞAN UNSURLAR 
                  Bu kapsayıcı tam olarak w-full h-full olduğu için ortalama 
                  hesabını asla bozmaz, dışındaki süsler alanı genişletmez.
                */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Label - Sadece görsel olarak dışarı itildi */}
                  <div
                    className={`absolute w-1/2 h-8 border border-black flex items-center justify-center                      ${
                      card.side === "left"
                        ? "-left-18 bottom-14 -rotate-90 bg-gray-200 text-black"
                        : "-right-18 bottom-14 rotate-90 bg-gray-600 text-white"
                    }`}
                  >
                    <span className="text-sm">{card.label}</span>
                  </div>

                  {/* Tire - Sadece görsel olarak dışarı itildi */}
                  <div
                    className={`absolute z-50 h-30 w-30 sm:h-40 sm:w-40
                      ${
                        card.side === "left"
                          ? "-left-14 -top-14 sm:-left-18 sm:-top-18 -rotate-30"
                          : "-right-14 -top-14 sm:-right-18 sm:-top-18 rotate-30"
                      }`}
                  >
                    <Image
                      src={tire}
                      fill
                      alt="Tire"
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Maskelenmiş Gerçek Kutu (İçerik) */}
                <div className="relative w-full h-full rounded-md border border-black overflow-hidden pointer-events-auto">
                  <div
                    className="w-full h-full"
                    style={{ background: card.bg }}
                  />
                  <div className={`absolute ${card.bottomOffset}`}>
                    <Image
                      src={card.image}
                      fill
                      alt={card.label}
                      className="object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CreateIntroTwo;
