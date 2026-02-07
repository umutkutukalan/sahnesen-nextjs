import { useState } from "react";

const PageAbout = ({ pageTitle, contentType }) => {
  const [selectedButton, setSelectedButton] = useState(null);

  const selectButton = (button) => {
    setSelectedButton((prev) => (prev === button ? null : button));
  };

  return (
    <>
      {contentType === "Projects" && (
        <div className="w-full flex items-center justify-between sticky top-[64px] z-30 border-b border-gray-200 p-5 bg-white">
          <div className="flex items-center gap-2">
            {pageTitle.icon && (
              <span className="text-xl">{pageTitle.icon}</span>
            )}
            <h2 className="text-xl ">{pageTitle.text}</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs">
              {["React", "Spring Boot", "Java", "Python"].map((tech) => (
                <button
                  key={tech}
                  onClick={() => selectButton(tech)}
                  className={`px-3 py-1 border border-gray-200 rounded-lg cursor-pointer ${
                    selectedButton === tech ? "bg-green-500 text-white" : ""
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 cursor-pointer">Tümünü Gör</p>
          </div>
        </div>
      )}
      {contentType === "Blogs" && (
        <div className="w-full flex items-center justify-between sticky top-[64px] z-30 border-b border-gray-200 p-5 bg-white">
          <div className="flex items-center gap-2">
            {pageTitle.icon && (
              <span className="text-xl">{pageTitle.icon}</span>
            )}
            <h2 className="text-xl ">{pageTitle.text}</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs">
              {["Yazılım", "Spor", "Gezi", "Kitap", "Haber"].map((tech) => (
                <button
                  key={tech}
                  onClick={() => selectButton(tech)}
                  className={`px-3 py-1 border border-gray-200 rounded-lg cursor-pointer ${
                    selectedButton === tech ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 cursor-pointer">Tümünü Gör</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PageAbout;
