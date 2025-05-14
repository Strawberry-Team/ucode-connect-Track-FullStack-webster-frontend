import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

function CustomTooltipProvider({
                           delayDuration = 200,
                           ...props
                         }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
      <TooltipPrimitive.Provider
          data-slot="custom-tooltip-provider"
          delayDuration={delayDuration}
          {...props}
      />
  );
}

function CustomTooltip({
                   ...props
                 }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
      <CustomTooltipProvider>
        <TooltipPrimitive.Root data-slot="custom-tooltip" {...props} />
      </CustomTooltipProvider>
  );
}

function CustomTooltipTrigger({
                          ...props
                        }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="custom-tooltip-trigger" {...props} />;
}

interface CustomTooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  imageUrl?: string;
  title?: string;
  description?: string;
}

function CustomTooltipContent({
                          className,
                          sideOffset = 12,
                          imageUrl,
                          title,
                          description,
                          children,
                          ...props
                        }: CustomTooltipContentProps) {
  return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
            data-slot="custom-tooltip-content"
            sideOffset={sideOffset}
            className={cn(
                "!w-[240px] bg-primary pb-2 text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit max-w-xs rounded-md  text-xs shadow-md",
                className
            )}
            style={{ opacity: 0.95 }}
            {...props}
        >
          {imageUrl && (
            <img src={imageUrl} alt={title || 'Tooltip image'} className="w-[240px] h-auto rounded-t-md mb-2 max-h-32 object-contain" />
          )}
          {title && (
            <h4 className="px-2 font-semibold text-[15px] mb-1 text-primary-foreground">{title}</h4>
          )}
          {description && (
            <p className="px-2 mb-2 text-[13px] text-muted-foreground">{description}</p>
          )}
          {children && <div className="mt-1">{children}</div>}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
  );
}

export { CustomTooltip, CustomTooltipTrigger, CustomTooltipContent, CustomTooltipProvider }; 