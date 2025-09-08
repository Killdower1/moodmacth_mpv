type Profile = { id: string; name: string; age: number; gender: "male"|"female"; mood: "happy"|"chill"|"sporty"; img: string }
type Pref = { mood?: Profile["mood"][]; ageMin?: number; ageMax?: number; gender?: Profile["gender"][] }
type Store = { prefs: Record<string, Pref>; likes: Record<string, Set<string>>; blocks: Record<string, Set<string>> }

const g = globalThis as any
const store: Store = g.__mockData ?? { prefs: {}, likes: {}, blocks: {} }
if (!g.__mockData) g.__mockData = store

export const PROFILES: Profile[] = [
  { id: "1", name: "Alya, 24",   age: 24, gender: "female", mood: "happy",  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
  { id: "2", name: "Dimas, 26",  age: 26, gender: "male",   mood: "sporty", img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe" },
  { id: "3", name: "Rani, 23",   age: 23, gender: "female", mood: "chill",  img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2" },
  { id: "4", name: "Bima, 27",   age: 27, gender: "male",   mood: "happy",  img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c" },
  { id: "5", name: "Salsa, 25",  age: 25, gender: "female", mood: "sporty", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9" },
  { id: "6", name: "Raka, 28",   age: 28, gender: "male",   mood: "chill",  img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12" }
]

export function getPrefs(email: string): Pref {
  return store.prefs[email] ?? {}
}
export function setPrefs(email: string, pref: Pref) {
  store.prefs[email] = { ...store.prefs[email], ...pref }
}
export function addLike(email: string, id: string) {
  if (!store.likes[email]) store.likes[email] = new Set()
  store.likes[email].add(id)
}
export function addBlock(email: string, id: string) {
  if (!store.blocks[email]) store.blocks[email] = new Set()
  store.blocks[email].add(id)
}

export function candidatesFor(email: string): Profile[] {
  const p = getPrefs(email)
  return PROFILES.filter((x) => {
    if (p.mood && p.mood.length && !p.mood.includes(x.mood)) return false
    if (p.gender && p.gender.length && !p.gender.includes(x.gender)) return false
    if (p.ageMin && x.age < p.ageMin) return false
    if (p.ageMax && x.age > p.ageMax) return false
    if (store.blocks[email]?.has(x.id)) return false
    return true
  })
}