import { useState } from "react";
type Props = {
  onPickFile?: (file: File) => Promise<void> | void;
};
const ExamImage = ({ onPickFile }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const images = [
    "/images/pic1.jpg",
    "/images/pic2.jpg",
    "/images/pic3.jpg",
    "/images/pic4.jpg",
    "/images/pic5.jpg",
    "/images/pic6.jpg",
  ];

  const handleImageClick = async (imgSrc: string) => {
    if (loading) return;

    setSelected(imgSrc);
    setLoading(true);

    try {
      const response = await fetch(imgSrc);
      const blob = await response.blob();

      const file = new File([blob], imgSrc.split("/").pop() || "image.jpg", {
        type: blob.type,
      });

      if (onPickFile) {
        await onPickFile(file);
      }

      setSelected(imgSrc);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-5 flex flex-col border-3 border-dashed border-gray-300 rounded-lg w-fit h-fit p-5 my-5 max-lg:hidden">
      <h1 className="text-xl">Example Image</h1>
      <p className="opacity-50">You can click on the image to see the result</p>
      <div className="p-5 grid grid-cols-2 gap-5 justify-center">
        {images.map((src) => (
          <div key={src} className="w-[150px] h-[150px] cursor-pointer">
            <img
              src={src}
              className={`w-full h-full object-cover rounded-md drop-shadow-md hover:scale-110 duration-300 hover:border-5 ${
                selected === src ? "ring-4 ring-blue-500" : ""
              }`}
              onClick={() => handleImageClick(src)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamImage;
