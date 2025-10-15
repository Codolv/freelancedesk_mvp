# 💼 FreelanceDesk

> Ein modernes Kundenportal für Freelancer – verwalte Projekte, Rechnungen, Dateien und Kundenkommunikation an einem Ort.

FreelanceDesk ist eine SaaS-Anwendung, die Freelancern und Agenturen ein professionelles Dashboard bietet, um Projekte mit Kunden effizient zu managen.  
Kunden können sich einloggen, Projektfortschritte sehen, Rechnungen bezahlen, Dateien herunterladen und Nachrichten empfangen – alles in einem zentralen Portal.

---

## 🚀 Features (MVP)

### 👤 Freelancer
- Dashboard mit Umsatz, Projekten & Deadlines  
- Projekte anlegen, bearbeiten und verwalten  
- Rechnungen erstellen, exportieren & mit Stripe-Zahlung  
- Dateien hochladen, freigeben & verwalten  
- Nachrichten & Projekt-Updates mit Markdown  
- Kunden per E-Mail einladen  
- Eigene Profilverwaltung inkl. Avatar & Social Links  

### 🧾 Kunden
- Login mit Einladung  
- Zugriff auf Projektfortschritte, Dateien & Rechnungen  
- Kommentieren und Rückmeldungen geben  

---

## 🧠 Tech Stack

| Komponente | Technologie |
|-------------|-------------|
| **Frontend** | [Next.js 14](https://nextjs.org/) mit App Router |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) |
| **Animationen** | [Framer Motion](https://www.framer.com/motion/) |
| **Backend & Auth** | [Supabase](https://supabase.io/) |
| **Dateien** | Supabase Storage |
| **Zahlungen** | [Stripe](https://stripe.com/de) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **E-Mails** | [Resend](https://resend.com/) oder [EmailJS](https://www.emailjs.com/) |

---

## ⚙️ Installation & Setup

### 1️⃣ Repository klonen

```bash
git clone https://github.com/dein-benutzername/freelancedesk.git
cd freelancedesk
