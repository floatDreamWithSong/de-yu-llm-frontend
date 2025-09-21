import type { SseSearchCite } from "@/apis/requests/conversation/schema";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CiteBar = ({
  onClose,
  uiCites,
  ...props
}: React.ComponentProps<"div"> & {
  uiCites: SseSearchCite[];
  onClose: () => unknown;
}) => {
  return (
    <div {...props}>
      <div className="flex items-center justify-between">
        <div>引用来源 （{uiCites.length}）</div>
        <Button onClick={onClose} variant={"ghost"} size={"icon"}>
          <X />
        </Button>
      </div>
      <div className="overflow-auto flex-1 gap-1">
        {uiCites.map((cite) => (
          <div
            onMouseUp={() => window.open(cite.url)}
            key={cite.index}
            className="hover:bg-secondary p-2 rounded-xl text-[0.85rem] cursor-pointer transition-colors duration-300"
          >
            <div className="flex items-center">
              <div className="p-1">
                <img
                  className="size-5"
                  src={cite.siteIcon}
                  alt={cite.siteName}
                />
              </div>
              <div>{cite.siteName}</div>
              <div className="pl-1 text-black/70">
                {new Date(cite.datePublished).toLocaleDateString()}
              </div>
            </div>
            <h4 className="text-[0.9rem]">{cite.name}</h4>
            <p className="line-clamp-2 overflow-hidden text-gray-800 w-full">
              {cite.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CiteBar;
