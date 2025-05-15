import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          backgroundColor: "#000000",
          color: "#ffffff",
          border: "none",
          pointerEvents: "all",
          opacity: 0.85,
        },
      }}
      style={
        {
          "--normal-bg": "black",
          "--normal-text": "white",
          "--normal-border": "#333333",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
