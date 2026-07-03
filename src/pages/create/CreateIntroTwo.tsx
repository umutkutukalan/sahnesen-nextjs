"use client";

import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import { camasir, card1, fineday, sahne, tire } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

const cards = [
  {
    id: "monolog",
    label: "Monolog",
    bg: "#f2c103",
    image: fineday,
    side: "left",
    bottomOffset: "sm:-bottom-13 sm:left-0 w-80 h-80",
    options: ["Yeni Monolog Yaz", "Monolog Arşivi", "Örneklere Göz At"],
  },
  {
    id: "sahne",
    label: "Sahne",
    bg: "#faf8f5",
    image: sahne,
    side: "right",
    route: "/olustur",
    bottomOffset: "sm:-bottom-20 sm:-right-4 w-80 h-80",
    options: ["Sahne Oluştur", "Karakter Tasarla", "Şablonlar"],
  },
  {
    id: "yanyana",
    label: "Yan Yana",
    bg: "#fa9ec1",
    image: card1,
    side: "left",
    bottomOffset: "-bottom-2 left-0 sm:-bottom-2 sm:left-0 w-60 h-60",
    options: ["İkili Sahne Başlat", "Metin Karşılaştır"],
  },
  {
    id: "tersyuz",
    label: "Tersyüz",
    bg: "#93c5fd",
    image: camasir,
    side: "right",
    bottomOffset: "sm:-bottom-10 sm:-left-10 w-90 h-90",
    options: ["Rolleri Değiş", "Tersyüz Hikayeleri"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const CreateIntroTwo = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedCardData = cards.find((card) => card.id === selected);

  const handleClick = (card: (typeof cards)[0]) => {
    if (selected === card.id) {
      setIsExpanded(false);
      setSelected(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    if (selected !== null) return;
    setSelected(card.id);
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
        className="w-full h-[100vh] relative flex items-center justify-center overflow-hidden transition-colors duration-500 ease-in-out"
        style={{ backgroundColor: selected ? selectedCardData?.bg : "#ffffff" }}
      >
        <div className="flex flex-wrap content-center justify-center gap-10 w-full max-w-xl mx-auto">
          {cards.map((card, i) => {
            const isSelected = selected === card.id;
            const isOther = selected !== null && !isSelected;

            const offsetX =
              i % 2 === 0 ? "calc(50% + 1.25rem)" : "calc(-50% - 1.25rem)";
            const offsetY =
              i < 2 ? "calc(50% + 1.25rem)" : "calc(-50% - 1.25rem)";

            const getDelay = () => {
              if (selected !== null) {
                return isSelected ? 0.15 : i * 0.04;
              } else {
                return isSelected ? 0 : 0.15 + i * 0.05;
              }
            };

            return (
              <motion.div
                key={card.id}
                className="relative w-44 h-44 sm:w-60 sm:h-60 cursor-pointer group"
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
                onAnimationComplete={() => {
                  if (isSelected) {
                    setIsExpanded(true);
                  }
                }}
                style={{ zIndex: isSelected ? 50 : 1 }}
              >
                {/* Süsleme Katmanı (Label & Tire) */}
                <motion.div
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  animate={{ opacity: isSelected && isExpanded ? 0 : 1 }}
                >
                  {/* Label */}
                  <div
                    className={`absolute w-1/2 h-8 border border-black flex items-center justify-center ${
                      card.side === "left"
                        ? "-left-18 bottom-14 -rotate-90 bg-gray-200 text-black"
                        : "-right-18 bottom-14 rotate-90 bg-gray-600 text-white"
                    }`}
                  >
                    <span className="text-sm font-bold">{card.label}</span>
                  </div>

                  {/* Tire */}
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
                </motion.div>

                {/* 1. Maskelenmiş Gerçek Kutu (İçerik) - overflow-hidden BURADA kalıyor */}
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

                {/* 2. SİHİRLİ DOKUNUŞ: KARTIN DIŞINDA (ALTINDA) BELİREN SEÇENEKLER 
                    overflow-hidden olan üstteki div'in dışına çıkarttık. 
                    absolute top-full vererek kutunun alt hizasından dışarıya taşmasını sağladık.
                */}
                {isSelected && isExpanded && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="absolute top-full left-0 w-full flex flex-col items-center justify-center pt-4 gap-2 z-50 pointer-events-auto"
                  >
                    {card.options?.map((option, idx) => (
                      <motion.button
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation(); // Kartın geriye doğru kapanmasını önlemek için
                          alert(`${option} seçildi!`);
                        }}
                        className="w-full py-2 px-4 border-2 border-black bg-white text-black font-bold text-xs rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-colors"
                      >
                        {option}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CreateIntroTwo;
