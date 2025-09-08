"use client"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Heart } from "lucide-react"
const mockProfiles = [
  { id: 1, name: "Alya, 24", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
  { id: 2, name: "Dimas, 26", img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe" },
]
export default function MoodPage() {
  return (
    <AppShell>
      <div className="space-y-3">
        {mockProfiles.map((p) => (
          <motion.div key={p.id} drag="x" whileTap={{ scale: 0.98 }} className="cursor-grab active:cursor-grabbing">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/5] w-full">
                <Image src={p.img} alt={p.name} fill sizes="(max-width: 768px) 100vw" className="object-cover" />
              </div>
              <CardContent className="p-4"><div className="text-lg font-semibold">{p.name}</div></CardContent>
            </Card>
          </motion.div>
        ))}
        <div className="sticky bottom-24 z-40 mt-2 flex items-center justify-center gap-6">
          <Button className="rounded-2xl"><X className="mr-2 h-5 w-5"/>Skip</Button>
          <Button className="rounded-2xl"><Heart className="mr-2 h-5 w-5"/>Like</Button>
        </div>
      </div>
    </AppShell>
  )
}
