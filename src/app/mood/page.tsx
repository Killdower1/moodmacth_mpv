"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { X, Heart, SlidersHorizontal } from "lucide-react"

type Profile = { id: number; name: string; img: string }
const profiles: Profile[] = [
  { id: 1, name: "Alya, 24",  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
  { id: 2, name: "Dimas, 26", img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe" },
  { id: 3, name: "Risa, 25",  img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1" },
]

type Prefs = { mood: string; min: number; max: number; gender: "any" | "male" | "female" }

export default function MoodPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("prefs") : null
    if (raw) setPrefs(JSON.parse(raw) as Prefs); else setFilterOpen(true)
  }, [])
  const savePrefs = (p: Prefs) => { setPrefs(p); localStorage.setItem("prefs", JSON.stringify(p)); setFilterOpen(false) }

  const [index, setIndex] = useState(0)
  const onSwiped = () => setIndex(i => Math.min(i + 1, profiles.length))
  const current = profiles.slice(index, index + 2)

  const topApi = useRef<null | ((dir: 1 | -1) => void)>(null)
  const like = () => topApi.current?.(1)
  const skip = () => topApi.current?.(-1)

  return (
    <AppShell>
      <div className="container mx-auto max-w-md px-4">
        <button onClick={() => setFilterOpen(true)} className="ml-auto mt-2 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Deck center */}
      <div className="w-full flex justify-center mt-6 px-4">
        <div className="relative aspect-[3/4] w-[min(92vw,420px)]">
          {current.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Habis. <button className="ml-1 underline" onClick={() => setIndex(0)}>Reset</button>
            </div>
          ) : (
            current.map((p, i) => (
              <SwipeCard key={p.id} profile={p} isTop={i === 0} onSwiped={onSwiped} exposeTopApi={fn => { if (i === 0) topApi.current = fn }} />
            ))
          )}
        </div>
      </div>

      <div className="sticky bottom-24 z-40 mt-3 flex items-center justify-center gap-6">
        <Button className="rounded-2xl" onClick={skip}><X className="mr-2 h-5 w-5" /> Skip</Button>
        <Button className="rounded-2xl" onClick={like}><Heart className="mr-2 h-5 w-5" /> Like</Button>
      </div>

      {filterOpen && (
        <FilterModal
          initial={prefs ?? { mood: "", min: 18, max: 35, gender: "any" }}
          onClose={() => setFilterOpen(false)}
          onSave={savePrefs}
        />
      )}
    </AppShell>
  )
}

function SwipeCard({
  profile, isTop, onSwiped, exposeTopApi
}: {
  profile: Profile
  isTop: boolean
  onSwiped: (dir: 1 | -1) => void
  exposeTopApi: (fn: (dir: 1 | -1) => void) => void
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const dragging = useRef(false)
  const [dx, setDx] = useState(0)
  const [rot, setRot] = useState(0)
  const [anim, setAnim] = useState<"none" | "reset" | "fly">("none")
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (!isTop) return
    exposeTopApi((dir: 1 | -1) => {
      const el = elRef.current; if (!el) return
      setAnim("fly")
      setOpacity(0)
      const dist = (typeof window !== "undefined" ? window.innerWidth : 400) * 1.2 * dir
      setDx(dist); setRot(dir > 0 ? 20 : -20)
      const handler = () => { el.removeEventListener("transitionend", handler); onSwiped(dir) }
      el.addEventListener("transitionend", handler)
    })
  }, [isTop])

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop) return
    dragging.current = true
    startX.current = e.clientX
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setAnim("none")
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop || !dragging.current) return
    const delta = e.clientX - startX.current
    setDx(delta)
    setRot(Math.max(-20, Math.min(20, delta / 10)))
  }
  const onUp = () => {
    if (!isTop || !dragging.current) return
    dragging.current = false
    const threshold = 120
    if (Math.abs(dx) > threshold) {
      const dir: 1 | -1 = dx > 0 ? 1 : -1
      const el = elRef.current; if (!el) return
      setAnim("fly"); setOpacity(0)
      const dist = (typeof window !== "undefined" ? window.innerWidth : 400) * 1.2 * dir
      setDx(dist); setRot(dir > 0 ? 20 : -20)
      const handler = () => { el.removeEventListener("transitionend", handler); onSwiped(dir) }
      el.addEventListener("transitionend", handler)
    } else {
      setAnim("reset"); setDx(0); setRot(0)
    }
  }

  const style: React.CSSProperties = {
    transform: `translateX(${dx}px) rotate(${rot}deg)`,
    transition: anim === "none" ? "none" :
                anim === "reset" ? "transform .25s ease" :
                "transform .25s ease, opacity .25s ease",
    opacity,
    touchAction: "pan-y",
  }

  return (
    <div
      ref={elRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      className={`absolute inset-0 ${isTop ? "z-20" : "z-10"} select-none cursor-grab active:cursor-grabbing`}
      style={style}
    >
      <Card className="h-full overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src={profile.img}
            alt={profile.name}
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-cover object-center"
            draggable={false}
            priority
          />
          <CardContent className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="text-lg font-semibold text-white drop-shadow">{profile.name}</div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

function FilterModal({
  initial, onClose, onSave
}: { initial: Prefs; onClose: () => void; onSave: (p: Prefs) => void }) {
  const [mood, setMood] = useState(initial.mood)
  const [min, setMin] = useState(initial.min)
  const [max, setMax] = useState(initial.max)
  const [gender, setGender] = useState<Prefs["gender"]>(initial.gender)
  useEffect(() => { if (min > max) setMin(max) }, [min, max])
  const save = () => onSave({ mood, min, max, gender })
  const moodOptions = ["Happy", "Chill", "Adventurous", "Serious"]

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-4 shadow-xl">
        <div className="mb-3 text-base font-semibold">Filter</div>
        <div className="mb-4">
          <div className="mb-2 text-sm text-muted-foreground">Mood</div>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((m) => (
              <button key={m} onClick={() => setMood(m)} className={`rounded-xl border px-3 py-1 text-sm ${mood === m ? "bg-primary text-primary-foreground" : ""}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-2 text-sm text-muted-foreground">Rentang Umur: {min} – {max}</div>
          <div className="flex items-center gap-3">
            <input type="range" min={18} max={60} value={min} onChange={(e) => setMin(parseInt(e.target.value))} className="w-full" />
            <input type="range" min={18} max={60} value={max} onChange={(e) => setMax(parseInt(e.target.value))} className="w-full" />
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-2 text-sm text-muted-foreground">Gender</div>
          <div className="flex gap-2">
            {(["any","male","female"] as const).map(g => (
              <button key={g} onClick={() => setGender(g)} className={`rounded-xl border px-3 py-1 text-sm capitalize ${gender === g ? "bg-primary text-primary-foreground" : ""}`}>{g}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={save}>Simpan</Button>
        </div>
      </div>
    </div>
  )
}