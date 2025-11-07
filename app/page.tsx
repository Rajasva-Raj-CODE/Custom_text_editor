import { TextEditor } from "@/components/text-editor";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Home() {
  return (
    <TooltipProvider>
      <div
        className="overflow-y-auto overflow-x-auto p-10 h-screen"
        style={{
          background: "linear-gradient(135deg, #F3E9D2 0%, #EFE3C8 100%)",
        }}
      >
        <TextEditor />
      </div>
    </TooltipProvider>
  );
}
