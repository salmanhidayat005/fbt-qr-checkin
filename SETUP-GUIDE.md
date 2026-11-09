# FBT Freshers Party 2026 - QR Check-in Setup (Roman Urdu)

Aap ko 3 kaam karne hain: QR column, Script, Scanner page. Total 15-20 minute.

---

## Step 1: QR Code column bharein (Google Sheet)

1. Cell **I5** mein ye formula paste karein (purane "View QR Code" link ki jagah):

```
=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="&ENCODEURL(A5&"|"&B5&"|"&E5&"|"&F5))
```

2. I5 ko neeche last row tak drag karein (ya fill down).
3. Row height thori bari kar dein (jaise 100) taake QR nazar aaye.

QR ke andar: `PassID|Name|Contact|TicketType`. Scanner sirf Pass ID leta hai aur baqi data sheet se uthata hai.

## Step 2: Apps Script lagayein

1. Sheet mein **Extensions > Apps Script** kholein.
2. Jo purana code hai wo delete karein, `Code.gs` ka poora code paste karein.
3. Upar `KEY = 'FBT2026'` apni marzi ka secret code kar sakte hain.
4. **Save** (Ctrl+S).
5. **Deploy > New deployment** dabayein.
   - Type (gear icon): **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. **Deploy** dabayein, Google permission maangega: **Authorize access** > apna account > Advanced > Go to project (unsafe) > Allow.
7. Jo **Web app URL** milay (`https://script.google.com/macros/s/.../exec`) wo copy kar lein.

Test: us URL ke aakhir mein `?key=FBT2026&action=stats` laga kar browser mein kholein. JSON aaye (total aur checked) to sahi hai.

## Step 3: Scanner page online karein

Phone camera ke liye page ka **HTTPS** link hona zaroori hai. Do asaan tareeqe:

**Netlify Drop (sab se asaan):**
1. `scanner.html` ka naam badal kar `index.html` kar dein.
2. `scanner.html` mein 2 lines badlein:
   - `SCRIPT_URL` mein Step 2 wala URL paste karein
   - `KEY` wahi jo Code.gs mein hai
3. app.netlify.com/drop par folder (jis mein index.html ho) drag-drop karein. Aap ko link mil jayega.

**GitHub Pages:** apne GitHub repo mein upload karke Settings > Pages on karein.

## Step 4: Use karna

1. Volunteers ke phone mein scanner ka link kholen, camera permission allow karein.
2. QR scan karein:
   - **Green** = Checked In (naam, ticket type, time dikhega, sheet mein khud likh jayega)
   - **Orange** = Already checked in (dobara scan)
   - **Red** = Pass ID nahi mila
3. Excel chahiye to Sheet mein **File > Download > Microsoft Excel (.xlsx)**.

## Zaroori baatein

- Sample sheet mein kuch "Not Checked In" rows par pehle se time likha hai (row 9, 10). Event se pehle **Check-in Time (column H)** ke test times saaf kar dein.
- Script header row 4 aur data row 5 se maanti hai. Columns ki tarteeb wahi rakhein jo abhi hai.
- Agar Code.gs mein kuch badlein to dobara **Deploy > Manage deployments > Edit > New version** karna padega.
- Link aur KEY sirf volunteers ke saath share karein.
