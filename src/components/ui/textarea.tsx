import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "border-input overflow-auto custom-scroll placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm !whitespace-pre-wrap !break-words !box-border",
                className
            )}
            style={{
                overflowWrap: "break-word",
                wordBreak: "break-word",
                maxWidth: "100%",
                boxSizing: "border-box",
                maxHeight: "300px",
            }}
            {...props}
        />
    );
}

export { Textarea };