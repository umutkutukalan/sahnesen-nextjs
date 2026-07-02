"use client";

import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import { cat1, cat2, cat3, tire } from "@/utils";
import Image from "next/image";

const CreateIntroTwo = () => {
  return (
    <>
      <EditorNavbar
        transparent={true}
        contentStatus="IDLE"
        activePostId={null}
        handleSave={() => {}}
      />
      <div className="w-full h-[100vh] relative">
        <div className="flex flex-wrap content-center justify-center gap-10 w-full h-full max-w-xl mx-auto">
          {" "}
          <div className="relative w-44 h-44 sm:w-60 sm:h-60">
            <div className="absolute -left-14 -top-14 sm:-left-18 sm:-top-18 z-50 h-30 w-30 sm:h-40 sm:w-40 -rotate-30">
              <Image src={tire} fill alt="Tire" className="object-contain" />
            </div>
            <div className="relative w-full h-full rounded-md border border-black overflow-hidden">
              <div className="absolute w-full h-full">
                <Image src={cat1} fill alt="Kedi" className="object-cover" />
              </div>
            </div>
          </div>
          <div className="relative w-44 h-44 sm:w-60 sm:h-60">
            <div className="absolute -right-14 -top-14 sm:-right-18 sm:-top-18 z-50 h-30 w-30 sm:h-40 sm:w-40 rotate-30">
              <Image src={tire} fill alt="Tire" className="object-contain" />
            </div>
            <div className="relative w-full h-full rounded-md border border-black overflow-hidden">
              <div className="absolute w-full h-full">
                <Image src={cat2} fill alt="Kedi" className="object-cover" />
              </div>
            </div>
          </div>
          <div className="relative w-44 h-44 sm:w-60 sm:h-60">
            <div className="absolute -left-14 -top-14 sm:-left-18 sm:-top-18 z-50 h-30 w-30 sm:h-40 sm:w-40 -rotate-30">
              <Image src={tire} fill alt="Tire" className="object-contain" />
            </div>
            <div className="relative w-full h-full rounded-md border border-black overflow-hidden">
              <div className="absolute w-full h-full">
                <Image src={cat3} fill alt="Kedi" className="object-cover" />
              </div>
            </div>
          </div>
          <div className="relative w-44 h-44 sm:w-60 sm:h-60">
            <div className="absolute -right-14 -top-14 sm:-right-18 sm:-top-18 z-50 h-30 w-30 sm:h-40 sm:w-40 rotate-30">
              <Image src={tire} fill alt="Tire" className="object-contain" />
            </div>
            <div className="relative w-full h-full rounded-md border border-black overflow-hidden">
              <div className="absolute w-full h-full">
                <Image src={cat1} fill alt="Kedi" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateIntroTwo;
