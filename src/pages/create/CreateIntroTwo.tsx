"use client";

import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import {
  arkaplan,
  bird,
  camasir,
  fineday,
  sahne,
  tire,
  yanyana,
} from "@/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { motion, Variants } from "framer-motion";
import { IoIosArrowForward } from "react-icons/io";

const cards = [
  {
    id: "sahne",
    label: "Sahne",
    bg: "#faf8f5",
    image: sahne,
    side: "left",
    route: "/olustur",
    bottomOffset: "sm:-bottom-20 sm:-right-4 w-80 h-80",
    options: ["Editöre Git"],
    sentence: "",
    description: "Projelerin, çalışmaların, süreçlerin. Sahne senin.",
  },
  {
    id: "monolog",
    label: "Monolog",
    bg: "#f2c103",
    image: fineday,
    side: "right",
    bottomOffset: "sm:-bottom-13 sm:left-5 w-60 h-60",
    options: ["Editöre Git"],
    sentence: "",
    description: "İç sesin, fikirlerin, tecrübelerin. Kendinle baş başa.",
  },
  {
    id: "yanyana",
    label: "Yan Yana",
    bg: "#52e699ff",
    image: yanyana,
    side: "left",
    bottomOffset: "-bottom-2 left-0 sm:-bottom-2 sm:left-0 w-60 h-60",
    options: ["Editöre Git"],
    sentence: "Bak dün ne oldu biliyor musun?",
    description: "Anıların, rutinlerin, sohbetlerin. Okurla kahve eşliğinde.",
  },
  {
    id: "tersyuz",
    label: "Tersyüz",
    bg: "#93c5fd",
    image: camasir,
    side: "right",
    bottomOffset: "sm:-bottom-10 sm:-left-10 w-90 h-90",
    options: ["Editöre Git"],
    sentence: "Herkesin hayran olduğu, bana delilik.",
    description: "Mizahın, ironilerin, ters köşelerin. Kuralları baştan yaz.",
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const CreateIntroTwo = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCardData = cards.find((card) => card.id === selected);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [offsets, setOffsets] = useState<{ x: string; y: string }[]>([]);

  const handleClick = (card: (typeof cards)[0]) => {
    if (selected === card.id) {
      setIsExpanded(false);
      setSelected(null);
      setOffsets([]);
      return;
    }
    if (selected !== null) return;

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;

      const newOffsets = cardRefs.current.map((ref) => {
        if (!ref) return { x: "0px", y: "0px" };
        const rect = ref.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        return {
          x: `${centerX - cardCenterX}px`,
          y: `${centerY - cardCenterY}px`,
        };
      });

      setOffsets(newOffsets);
    }

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
        style={{ backgroundColor: selected ? selectedCardData?.bg : "#fff" }}
      >
        <div className="absolute right-0 -bottom-20 w-80 h-180 z-0 pointer-events-none user-none">
          <Image src={arkaplan} fill alt="Background" />
        </div>

        <div className="absolute left-20 top-20 w-50 h-50 z-0 pointer-events-none user-none">
          <Image src={bird} fill alt="Bird" />
        </div>

        <div
          ref={containerRef}
          className="flex flex-wrap content-center justify-center gap-10 w-full max-w-3xl mx-auto"
        >
          {cards.map((card, i) => {
            const isSelected = selected === card.id;
            const isOther = selected !== null && !isSelected;

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
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`relative w-44 h-44 sm:w-60 sm:h-60 cursor-pointer group`}
                onClick={() => handleClick(card)}
                animate={
                  isSelected
                    ? {
                        x: offsets[i]?.x ?? 0,
                        y: offsets[i]?.y ?? 0,
                        scale: 1.1,
                        zIndex: 50,
                        opacity: 1,
                      }
                    : isOther
                      ? {
                          x: offsets[i]?.x ?? 0,
                          y: offsets[i]?.y ?? 0,
                          scale: 0.85,
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
                <motion.div className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Label */}
                  <div
                    className={`absolute w-1/2 h-8 flex items-center justify-center bg-gray-600 text-white ${
                      card.side === "left"
                        ? "-left-19 bottom-14 -rotate-90"
                        : card.side === "right"
                          ? "-right-19 bottom-14 rotate-90"
                          : "top-0 left-1/2 -translate-x-1/2" // top
                    }`}
                  >
                    <span className="text-sm">{card.label}</span>
                  </div>

                  {/* Tire */}
                  <div
                    className={`absolute z-150 h-30 w-30 sm:h-40 sm:w-40
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
                <div
                  className={`relative w-full h-full rounded-md border border-black overflow-hidden pointer-events-auto z-100`}
                >
                  <div className="w-full h-full" />
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
                  <>
                    <div className="flex flex-col w-full items-center justify-center">
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="absolute -bottom-15 right-0 flex flex-col items-end justify-center gap-2 pointer-events-auto"
                      >
                        {card.options?.map((option, idx) => (
                          <motion.button
                            key={idx}
                            variants={itemVariants}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/olustur?type=${encodeURIComponent(
                                  card.label === "Tersyüz"
                                    ? "TERSYUZ"
                                    : card.label === "Etüt"
                                      ? "ETUT"
                                      : card.label === "Yan Yana"
                                        ? "YANYANA"
                                        : card.label.toUpperCase().trim(),
                                )}`,
                              );
                            }}
                            className="w-fit text-black flex items-center justify-end gap-1 transition-colors cursor-pointer"
                          >
                            <span>{option}</span>
                            <IoIosArrowForward />
                          </motion.button>
                        ))}
                      </motion.div>
                      <div className="absolute -top-14 w-max pointer-events-none flex flex-col gap-1 items-center justify-center">
                        <span className="text-[10px] flex items-center justify-end italic">
                          {`'${card.sentence}'`}
                        </span>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="flex items-center justify-center"
                        >
                          <span className="text-xs">{card.description}</span>
                        </motion.div>
                      </div>
                    </div>
                  </>
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
