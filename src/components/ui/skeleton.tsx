import { cn } from "@/lib/utils";

function Skeleton({
                      className,
                      baseColor = "bg-gray-200",
                      animationColor = "bg-[#BFC5CC]",
                      animationSpeed = "0.5s",
                      stripWidth = "8px",
                      ...props
                  }: React.ComponentProps<"div"> & {
    baseColor?: string;
    animationColor?: string;
    animationSpeed?: string;
    stripWidth?: string;
}) {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                "relative overflow-hidden bg-opacity-80",
                baseColor,
                "rounded-md",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "absolute top-0 left-0 h-full",
                    animationColor,
                    "opacity-50"
                )}
                style={{
                    width: stripWidth,
                    animation: `moveStrip ${animationSpeed} infinite linear`,
                    filter: "blur(8px)",
                }}
            />
            <style>
                {`
                    @keyframes moveStrip {
                        0% {
                            left: -10px; /* Смещение за пределы слева */
                        }
                        100% {
                            left: 100%; /* Движение до конца элемента */
                        }
                    }
                `}
            </style>
        </div>
    );
}

export { Skeleton };