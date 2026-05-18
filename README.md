# Who Am I — ฉันคือใคร?

เกมทายตัวตนออนไลน์แบบห้องเรียลไทม์

## วิธีรัน (พัฒนา)

```bash
npm install
npm run dev
```

- เว็บ: http://localhost:3000
- PartyKit: http://127.0.0.1:1999

ตั้งค่า `apps/web/.env.local`:

```
NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:1999
```

## Deploy (เล่นกับเพื่อนทางอินเทอร์เน็ต)

**เซิร์ฟเวอร์เกม (PartyKit) ขึ้นแล้ว:** `who-am-i-party.stargog.partykit.dev`

**เว็บ (Vercel):** ดูคู่มือภาษาไทยทีละขั้น → **[DEPLOY_TH.md](./DEPLOY_TH.md)**

สรุปเร็ว:
```powershell
npx vercel login
.\scripts\deploy-vercel.ps1
```

## เล่นอย่างไร

1. สร้างห้องหรือใส่รหัส 6 ตัว
2. แชร์ลิงก์ให้เพื่อน (2–8 คน)
3. ทุกคนกดพร้อม → โฮสต์เริ่มเกม
4. ใส่ตัวละครให้คนถัดไปในวง
5. สลับเทิร์นถามใช่/ไม่ใช่ หรือทายตัวตน
