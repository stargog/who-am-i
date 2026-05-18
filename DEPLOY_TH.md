# วิธีให้เพื่อนเล่นเกมทางอินเทอร์เน็ต

## สถานะตอนนี้

| ส่วน | สถานะ |
|------|--------|
| เซิร์ฟเวอร์เกม (PartyKit) | **ขึ้นแล้ว** — `who-am-i-party.stargog.partykit.dev` |
| เว็บเกม (Vercel) | **ต้อง deploy อีกครั้ง** (ทำตามขั้นตอนด้านล่าง) |

เมื่อเว็บขึ้นแล้ว แชร์ลิงก์แบบ `https://xxxx.vercel.app` ให้เพื่อนได้เลย

---

## วิธีที่ง่ายที่สุด — Deploy บน Vercel (ฟรี)

### ขั้นที่ 1: สมัคร / เข้าสู่ระบบ Vercel

1. เปิด https://vercel.com/signup  
2. กด **Continue with GitHub** (หรืออีเมล)  
3. สมัครฟรีให้เรียบร้อย  

### ขั้นที่ 2: อัปโหลดโปรเจกต์ (ถ้ายังไม่มี GitHub)

**ทางเลือก A — ใช้เทอร์มินัลใน Cursor (แนะนำหลัง login)**

1. เปิดเทอร์มินัลในโฟลเดอร์ `d:\work\who-am-i`  
2. รันคำสั่ง login (ครั้งแรกเท่านั้น):

   ```powershell
   npx vercel login
   ```

   เปิดลิงก์ที่ขึ้นมาในเบราว์เซอร์ แล้วกดยืนยัน  

3. รันสคริปต์ deploy:

   ```powershell
   .\scripts\deploy-vercel.ps1
   ```

4. รอจนเสร็จ จะได้ URL เช่น `https://who-am-i-xxx.vercel.app`  

**ทางเลือก B — ใช้เว็บ Vercel + GitHub**

1. สร้าง repo บน GitHub แล้ว push โค้ดจากโฟลเดอร์นี้  
2. ที่ https://vercel.com/new → **Import** repo  
3. ตั้งค่า:
   - **Root Directory:** `apps/web`  
   - **Install Command:** `cd ../.. && npm install`  
   - **Build Command:** `cd ../.. && npm run build -w @who-am-i/web`  
4. เพิ่ม Environment Variable:

   | ชื่อ | ค่า |
   |------|-----|
   | `NEXT_PUBLIC_PARTYKIT_HOST` | `who-am-i-party.stargog.partykit.dev` |

5. กด **Deploy**

### ขั้นที่ 3: เล่นกับเพื่อน

1. เปิด URL ของ Vercel  
2. กด **สร้างห้องใหม่**  
3. **คัดลอกลิงก์** ส่งใน LINE / Discord  
4. เพื่อนเปิดลิงก์ → ใส่ชื่อ → กดพร้อม → โฮสต์กดเริ่มเกม  

---

## เล่นบนเครื่องตัวเอง (ไม่ต้อง deploy)

```powershell
cd d:\work\who-am-i
npm install
npm run dev
```

เปิด http://localhost:3000 (เล่น 2 แท็บทดสอบได้ แต่เพื่อนคนละบ้านยังเข้าไม่ได้)

---

## แก้ปัญหา

**ขึ้น "กำลังเชื่อมต่อ..." ตลอด**  
- ตรวจว่า deploy Vercel แล้ว และตั้ง `NEXT_PUBLIC_PARTYKIT_HOST` ถูกต้อง  

**เพื่อนเข้าห้องไม่เจอ**  
- ใช้ลิงก์เต็มจากโฮสต์ (รหัสห้อง 6 ตัวต้องตรงกัน)  
