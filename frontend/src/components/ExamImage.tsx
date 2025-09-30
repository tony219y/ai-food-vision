import { useState } from "react";

const ExamImage = () => {
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

      const file = new File([blob], imgSrc.split("/").pop() || "image.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("image", file);

      await fetch("/api/save-image", {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-3 border-dashed border-[rgb(192,192,192)] rounded-lg w-fit p-5">
      <div className="text-xl ml-2 mb-4">Example Image</div>

      <div className="p-5 grid grid-cols-3 gap-5 justify-center">
        {images.map((src) => (
          <div key={src} className="w-[200px] h-[200px] cursor-pointer">
            <img
              src={src}
              className={`w-full h-full object-cover rounded-md ${
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
