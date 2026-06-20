# Building the "Venta" and "Gasto" Shortcuts on your iPhone

We build **two** hands-free shortcuts so there is never a screen to tap:

- **Venta**: say "Oye Siri, venta", then say the amount. Done.
- **Gasto**: say "Oye Siri, gasto", then say the amount. Done.

Each shortcut is shared once as a signed iCloud link. You paste those two links
into the app's environment, and from then on every Operator installs them from
the same links. While adding a shortcut, it asks each person for their own token
(the "Import Question"), so the links are shared but the tokens are personal. See
the rationale in [the plan](./siri-shortcut-entries-plan.md) and
[ADR-0004](./adr/0004-siri-entry-via-shortcut-api.md).

This is the one manual step Apple does not let the app automate, because only
Apple can sign a shortcut. Time: about 15 minutes, once.

> The Shortcuts app is translated, so menu labels depend on your phone's
> language. Each step lists the Spanish label first and the English label in
> parentheses, e.g. **Texto** (Text). Action names are what you type into the
> search box when adding an action.

---

## Before you start

- Know your app's domain. The endpoint is `https://TU-DOMINIO/api/shortcut/entries`
  (replace `TU-DOMINIO` with your real domain, e.g. `carrito.vercel.app`).
- Have a real token ready to test with at the end: open the app, go to
  **Conectar con Siri**, generate one, and copy it.

---

# Part 1: Build the "Venta" shortcut

## Step 1: Create and name it

1. Open the **Atajos** (Shortcuts) app.
2. Tap **+** in the top right to create a new shortcut.
3. Tap the name **"Atajo nuevo"** (New Shortcut) at the top and rename it to
   **Venta**. This name is the Siri phrase: "Oye Siri, venta".

## Step 2: Add the token holder (a Text action)

This empty Text action is where the person's token lands at install time.

1. Tap **Agregar acción** (Add Action), or use the search bar.
2. Search **Texto** (Text) and tap the **Texto** action.
3. Leave its text field **empty**. Do not type anything. The Import Question in
   Step 5 fills it.

> Tip: tap the variable this action produces (it appears when you use it in
> Step 4) and rename it to **Token** so it is easy to find. Optional.

## Step 3: Ask the amount (the only spoken question)

1. Add action, search **Pedir entrada** (Ask for Input), tap it.
2. Leave the input type as **Texto** (Text). Do **not** use Número: with Número,
   Siri mishears spoken amounts that have thousands separators (saying
   "161.000" fails). As Text it captures the dictation verbatim, and the server
   cleans it up.
3. In the prompt field type **¿Cuánto?**.

This produces a variable called **Entrada proporcionada** (Provided Input): the
amount, as text (for example `161.000`, or even `161.000 pesos`). The server
strips the thousands dots, currency words, and `$`, so any of those work. To
stay fully hands-free we do not ask for a concept; the server labels the entry
"Venta" automatically.

## Step 4: Build the request (Get Contents of URL)

1. Add action, search **Obtener contenido de URL** (Get Contents of URL).
2. In the **URL** field type your endpoint exactly:
   `https://TU-DOMINIO/api/shortcut/entries`
3. Tap **Mostrar más** (Show More) to reveal the request options.
4. **Método** (Method): change from GET to **POST**.
5. **Encabezados** (Headers): tap **Agregar encabezado** (Add header) and set:
   - Key: `Authorization`
   - Value: type `Bearer` then a space, then insert the **Texto** (Token)
     variable. To insert it, tap the value field, tap **Seleccionar variable**
     (Select Variable) on the bar above the keyboard, and pick the output of the
     Text action from Step 2. The value reads `Bearer ` followed by the blue
     Token chip.
   - Add a second header: Key `Content-Type`, Value `application/json`.
6. **Cuerpo de la solicitud** (Request Body): set it to **JSON**.
7. Add these JSON fields with the **+** button:
   - Key `kind`, type **Texto** (Text), value `sale`.
   - Key `amount`, type **Texto** (Text), value = the **Entrada proporcionada**
     (amount) variable from Step 3. Keep this as Text, not Número: the variable
     is the raw dictation and the server parses it.

> You do not need to send `payment`, `date`, or `label`. The server defaults
> payment to cash, the date to today in Buenos Aires, and the label to "Venta".

## Step 5: Add the Import Question (asks for the token on install)

This is what lets one link work for everyone: when a person adds the shortcut,
they are asked once for their token, which is written into the Step 2 Text
action.

1. Open the shortcut's settings. Tap the **(i)** info button in the bottom
   toolbar of the editor (on newer iOS, tap the chevron next to the shortcut
   name at the top, then **Detalles** / Details).
2. Find **Preguntas de importación** (Import Questions).
3. Tap **Agregar pregunta** (Add Question).
4. Shortcuts asks you to pick the value to ask about. Select the **empty text
   field of the Texto action** from Step 2 (the token holder).
5. For the question text type: **Pegá tu token de Carrito**.
6. Confirm.

## Step 6 (optional but recommended for hands-free): speak the confirmation

So the person hears it worked without looking at the screen.

1. Add action **Obtener valor del diccionario** (Get Dictionary Value): get
   **Valor** (Value) for **Clave** (Key) `message`, from **Contenido de URL**
   (Contents of URL).
2. Add action **Decir** (Speak Text) and put the **Valor del diccionario**
   (Dictionary Value) into it. Siri reads back "Venta de $5.000 registrada".

## Step 6b (optional): let the user say the date

By default every entry is dated **today** in Buenos Aires. If you want to allow
backdating by voice ("¿es de hoy?" ... "no" ... "ayer"), add these actions
**after the ¿Cuánto? question (Step 3) and before Get Contents of URL (Step 4)**.
The order matters: the date variable must exist before the request is sent.

1. Add **Texto** (Text), leave it empty. Then add **Definir variable** (Set
   Variable), name it **Fecha**, value = that empty Text. This initializes the
   date as blank, so "today" stays the default.
2. Add **Elegir del menú** (Choose from Menu), prompt **¿Es de hoy?**, with two
   items named **Sí** and **No**.
   - Under **Sí**: leave it empty. The blank **Fecha** tells the server to use
     today.
   - Under **No**:
     1. **Pedir entrada** (Ask for Input), type **Fecha** (Date), prompt
        **¿Cuándo?**. Siri understands "ayer", "15 de junio", "el lunes", etc.
     2. **Formato de fecha** (Format Date): format that date with a **Custom**
        (Personalizado) format of exactly `yyyy-MM-dd`. Make sure its input is
        the **¿Cuándo?** date, not the amount.
     3. **Definir variable** (Set Variable) **Fecha** = the formatted date.
3. In **Get Contents of URL** (Step 4), add one more JSON field:
   - Key `date`, type **Texto** (Text), value = the **Fecha** variable.

How it behaves:

- "Sí" sends a blank date, and the server stamps today in Buenos Aires.
- "No" sends `yyyy-MM-dd`, which the server stores as that day.

Notes:

- When the shortcut runs by voice, the "¿Es de hoy?" menu is read out and you
  answer by saying **Sí** or **No**, no tap needed. On some iOS versions it can
  appear on screen instead, where you tap.
- The date is formatted on the phone in its local timezone, so "ayer" resolves
  to the correct Argentine day.
- Build this into "Venta" **before** you duplicate it, so "Gasto" inherits it.

## Step 7: Share it as a signed iCloud link

1. Go back to **Mis atajos** (My Shortcuts).
2. Press and hold the **Venta** shortcut, tap **Compartir** (Share).
3. Choose **Copiar enlace de iCloud** (Copy iCloud Link). Apple signs the
   shortcut and gives you a link like `https://www.icloud.com/shortcuts/...`.
   This is your **Venta link**. Keep it for Part 3.

---

# Part 2: Build the "Gasto" shortcut

The Gasto shortcut is identical except `kind` is `expense` and the name is
"Gasto". The fastest way is to duplicate Venta.

1. In **Mis atajos**, press and hold **Venta**, tap **Duplicar** (Duplicate).
   The copy keeps the Import Question and every action.
2. Open the copy. Rename it to **Gasto** (this becomes "Oye Siri, gasto").
3. In the **Obtener contenido de URL** action, change the `kind` JSON field from
   `sale` to `expense`.
4. If you added Step 6, the spoken confirmation already comes from the server,
   so it will correctly say "Gasto de ... registrado". Nothing to change.
5. Go back, press and hold **Gasto**, **Compartir** (Share), **Copiar enlace de
   iCloud** (Copy iCloud Link). This is your **Gasto link**.

---

# Part 3: Wire the two links into the app

1. Put the links in your environment:
   - `NEXT_PUBLIC_SIRI_VENTA_URL` = the Venta link.
   - `NEXT_PUBLIC_SIRI_GASTO_URL` = the Gasto link.
   - Local: add both to `.env.local`.
   - Production: add both in your host's environment variables (e.g. Vercel
     Project Settings, Environment Variables), then redeploy.
2. Open **Conectar con Siri** in the app. The **Agregar "Venta"** and
   **Agregar "Gasto"** buttons now point to your links.

---

# Part 4: Test end to end (hands-free)

1. On a phone, open the app, go to **Conectar con Siri**, generate a token, and
   copy it.
2. Tap **Agregar "Venta"**. The import flow asks "Pegá tu token de Carrito".
   Paste the token, tap **Agregar atajo** (Add Shortcut).
3. Tap **Agregar "Gasto"** and paste the same token.
4. The first time you run each shortcut, iOS may ask once to allow it to contact
   your domain. Tap **Permitir** (Allow). After that it never asks again.
5. Say "Oye Siri, venta". Siri asks "¿Cuánto?"; say a number; it confirms out
   loud.
6. Open the app's Balance for **today** and check the entry appears with the
   right amount and type. Repeat with "Oye Siri, gasto".

Hand the app link to mom or your aunt: each generates their own token and adds
both shortcuts from the same buttons.

---

## Troubleshooting

- **Siri does not recognize the phrase.** The trigger phrase is exactly the
  shortcut's name. "Venta" and "Gasto" are short and clear; if Siri struggles,
  rename to "Nueva venta" / "Nuevo gasto" and re-share (the link changes, so
  update the env var).
- **It says the token is invalid (401).** The token was mistyped or revoked.
  Generate a new one in **Conectar con Siri**, then re-add the shortcut from the
  button to enter the new token.
- **It says the amount is invalid (400).** The server reads es-AR amounts,
  where "." is the thousands separator and "," is the decimal: "161.000",
  "$161.000 pesos", and "1.500,50" all work. If you want cents, say them with
  "coma" (for example "ciento cincuenta coma cinco"). Make sure the **Pedir
  entrada** type is **Texto** and the JSON `amount` field is also **Texto**;
  with Número, Siri drops the thousands separators before you ever reach the
  server.
- **The entry lands on the wrong day.** The server uses today's date in
  `America/Argentina/Buenos_Aires`, so a late-night sale stays on the correct
  Argentine day. Edit it in the app if you ever need a past date.
- **Changing a token later.** A token entered at import is stored inside that
  person's copy of the shortcut. To change it, re-add the shortcut from the
  button and paste the new token.
