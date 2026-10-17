import type { Metadata } from "next"
import { Fraunces, Outfit, Zen_Old_Mincho } from "next/font/google"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const mincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mincho-face",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: "Temple Path",
    template: "%s · Temple Path",
  },
  description:
    "A taste-grounded walk through the shrines, temples, and meals of Izumo and Matsue. Every Qloo stop says why it is there.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} ${mincho.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
