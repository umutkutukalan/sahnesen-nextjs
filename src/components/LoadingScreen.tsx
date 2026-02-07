import { DotLottieReact } from "@lottiefiles/dotlottie-react";
const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <DotLottieReact
        src="https://lottie.host/8ad83bfd-fb11-403e-b8f0-391e85abd0d6/grkA0ufPrD.lottie"
        loop
        autoplay
        style={{ width: "100px", height: "100px" }}
      />
    </div>
  );
};

export default LoadingScreen;
