// components/ui/animated-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

type AnimatedButtonProps = {
    title: string;
    onClick: () => void;
    isClicked: boolean;
    setIsClicked: (value: boolean) => void;
    className?: string;
    topLeftHover?: { left: number; top: number };
    topRightHover?: { right: number; top: number };
    bottomLeftHover?: { left: number; bottom: number };
    bottomRightHover?: { right: number; bottom: number };
    centerPadding?: { left: number; top: number; right: number; bottom: number };
};

export default function AnimatedButton({
                                           title,
                                           onClick,
                                           isClicked,
                                           setIsClicked,
                                           className,
                                           topLeftHover = { left: 3.75, top: 1.25 },
                                           topRightHover = { right: 3.75, top: 1.25 },
                                           bottomLeftHover = { left: 3.75, bottom: 1.25 },
                                           bottomRightHover = { right: 3.75, bottom: 1.25 },
                                           centerPadding = { left: 3.75, top: 1.25, right: 3.75, bottom: 1.25 },
                                       }: AnimatedButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Button
            variant="ghost"
            className={cn(
                "cursor-default size-full flex items-center justify-center gap-2 bg-transparent hover:bg-transparent text-foreground relative",
                className
            )}
        >
            {/* Top left corner */}
            <span
                className={cn(
                    "z-10 absolute w-8 h-8 flex flex-col transition-all duration-300 pointer-events-none"
                )}
                style={{
                    left: isClicked ? "0rem" : isHovered ? `${topLeftHover.left}rem` : "0rem",
                    top: isClicked ? "0rem" : isHovered ? `${topLeftHover.top}rem` : "0rem",
                }}
            >
                <span className="w-8 h-3 bg-foreground/50 rounded-r-md rounded-tl-2xl" />
                <span className="w-2 h-8 bg-foreground/50 rounded-b-md" />
            </span>

            {/* Top right corner */}
            <span
                className={cn(
                    "z-10 absolute w-8 h-8 flex flex-col items-end transition-all duration-300 pointer-events-none"
                )}
                style={{
                    right: isClicked ? "0rem" : isHovered ? `${topRightHover.right}rem` : "0rem",
                    top: isClicked ? "0rem" : isHovered ? `${topRightHover.top}rem` : "0rem",
                }}
            >
                <span className="w-8 h-3 bg-foreground/50 rounded-l-md rounded-tr-2xl" />
                <span className="w-2 h-8 bg-foreground/50 rounded-b-md" />
            </span>

            {/* Bottom left corner */}
            <span
                className={cn(
                    "z-10 absolute w-8 h-8 flex flex-col justify-end transition-all duration-300 pointer-events-none"
                )}
                style={{
                    left: isClicked ? "0rem" : isHovered ? `${bottomLeftHover.left}rem` : "0rem",
                    bottom: isClicked ? "0rem" : isHovered ? `${bottomLeftHover.bottom}rem` : "0rem",
                }}
            >
                <span className="w-2 h-8 bg-foreground/50 rounded-t-md" />
                <span className="w-8 h-3 bg-foreground/50 rounded-r-md rounded-bl-2xl" />
            </span>

            {/* Bottom right corner */}
            <span
                className={cn(
                    "z-10 absolute w-8 h-8 flex flex-col items-end justify-end transition-all duration-300 pointer-events-none"
                )}
                style={{
                    right: isClicked ? "0rem" : isHovered ? `${bottomRightHover.right}rem` : "0rem",
                    bottom: isClicked ? "0rem" : isHovered ? `${bottomRightHover.bottom}rem` : "0rem",
                }}
            >
                <span className="w-2 h-8 bg-foreground/50 rounded-t-md" />
                <span className="w-8 h-3 bg-foreground/50 rounded-l-md rounded-br-2xl" />
            </span>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="cursor-pointer absolute rounded-md z-0 overflow-hidden transition-colors duration-300 pointer-events-auto"
                    style={{
                        left: `${centerPadding.left}rem`,
                        top: `${centerPadding.top}rem`,
                        right: `${centerPadding.right}rem`,
                        bottom: `${centerPadding.bottom}rem`,
                        backgroundColor: isHovered ? "rgba(229, 231, 235, 0.5)" : "transparent",
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={(e) => {
                        onClick();
                        setIsClicked(true);
                        const ripple = document.createElement("span");
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        ripple.style.position = "absolute";
                        ripple.style.left = `${x}px`;
                        ripple.style.top = `${y}px`;
                        ripple.style.transform = "translate(-50%, -50%)";
                        ripple.style.width = "0px";
                        ripple.style.height = "0px";
                        ripple.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
                        ripple.style.borderRadius = "50%";
                        ripple.style.pointerEvents = "none";
                        ripple.style.animation = "ripple 600ms linear";
                        e.currentTarget.appendChild(ripple);
                        ripple.addEventListener("animationend", () => ripple.remove());
                    }}
                >
                    <style>
                        {`
              @keyframes ripple {
                0% {
                  width: 0;
                  height: 0;
                  opacity: 0.5;
                }
                100% {
                  width: 200px;
                  height: 200px;
                  opacity: 0;
                }
              }
            `}
                    </style>
                </div>
                <div className="text-[25px] flex items-center gap-2 z-10 pointer-events-none">
                    <Plus className="!h-8 !w-8" />
                    {title}
                </div>
            </div>
        </Button>
    );
}