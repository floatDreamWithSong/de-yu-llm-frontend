import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
interface PreviewImageProps {
  url: string;
}
const PreviewImage = ({
  url,
  children,
  className,
  ...props
}: PreviewImageProps & ComponentProps<"div">) => {
  return (
    <PhotoView src={url}>
      <div
        className={cn("relative min-w-18 h-18 border-2 rounded-md", className)}
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        {...props}
      >
        {children}
      </div>
    </PhotoView>
  );
};

export default PreviewImage;
