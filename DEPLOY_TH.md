# เล่นกับเพื่อนทางอินเทอร์เน็ต

## ลิงก์เกม (พร้อมใช้แล้ว)

**เปิดเกม:** https://who-am-i-bay-kappa.vercel.app

## วิธีเล่น (ส่งให้เพื่อนได้เลย)

1. เปิดลิงก์ด้านบน
2. ใส่ **ชื่อเล่น** → กด **สร้างห้องใหม่**
3. กด **คัดลอกลิงก์เชิญเพื่อน** ส่งใน LINE / Discord / Messenger
4. เพื่อนเปิดลิงก์ → ใส่ชื่อ → กด **พร้อมเล่น**
5. โฮสต์ (คนสร้างห้อง) กด **เริ่มเกม** เมื่อทุกคนพร้อม (อย่างน้อย 2 คน)
6. ใส่ตัวละครให้กัน → เล่นถาม ใช่/ไม่ใช่ หรือทายชนะ

รองรับ **2–8 คน** ต่อห้อง

---

## ส่วนที่ติดตั้งไว้แล้ว (ไม่ต้องทำซ้ำ)

| ส่วน | ที่อยู่ |
|------|--------|
| เว็บเกม | Vercel — `who-am-i-bay-kappa.vercel.app` |
| เซิร์ฟเวอร์เรียลไทม์ | PartyKit — `who-am-i-party.stargog.partykit.dev` |

---

## เล่นบนเครื่องตัวเอง (ทดสอบ)

```powershell
cd d:\work\who-am-i
npm install
npm run dev
```

เปิด http://localhost:3000

---

## อัปเดตเกมในอนาคต

หลังแก้โค้ด รันคำสั่งเดียว:

```powershell
cd d:\work\who-am-i
npm run ship -- "อธิบายสิ่งที่เปลี่ยน"
```

จะ **commit → push GitHub** แล้ว deploy อัตโนมัติ:

| ส่วน | วิธี deploy |
|------|-------------|
| **Vercel (เว็บ)** | Auto หลัง push ถ้าเชื่อม GitHub ใน Vercel Dashboard แล้ว |
| **PartyKit (เกมเรียลไทม์)** | GitHub Actions หลัง push (ต้องตั้ง secret ครั้งเดียว — ดูด้านล่าง) |

### ตั้ง PartyKit ให้ deploy อัตโนมัติ (ครั้งเดียว)

```powershell
npx partykit token generate
```

เอา `PARTYKIT_LOGIN` และ `PARTYKIT_TOKEN` ไปใส่ใน  
GitHub → repo **who-am-i** → Settings → Secrets and variables → Actions

### Deploy มือ (ถ้า CI ยังไม่พร้อม)

```powershell
npm run party:deploy
.\scripts\deploy-vercel.ps1
```

(ต้อง login Vercel แล้ว — ครั้งแรกใช้ `npx vercel login`)

---

## แก้ปัญหา

**ค้างที่ "กำลังเชื่อมต่อ..."**  
- รีเฟรชหน้า หรือลองเบราว์เซอร์อื่น

**เพื่อนเข้าห้องไม่ได้**  
- ใช้ลิงก์จากปุ่ม "คัดลอกลิงก์" ในห้อง (รหัส 6 ตัวต้องตรงกัน)
