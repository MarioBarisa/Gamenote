<template>
  <div class="min-h-screen bg-base-100">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      <!-- Language toggle -->
      <div class="flex justify-end mb-8">
        <div class="join">
          <button
            class="join-item btn btn-sm"
            :class="lang === 'hr' ? 'btn-primary' : 'btn-ghost'"
            @click="lang = 'hr'"
          >HR</button>
          <button
            class="join-item btn btn-sm"
            :class="lang === 'en' ? 'btn-primary' : 'btn-ghost'"
            @click="lang = 'en'"
          >EN</button>
        </div>
      </div>

      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <GamenoteBanner class="h-12 sm:h-14 w-auto max-w-full object-contain" />
      </div>

      <!-- Headline -->
      <h1 class="text-3xl sm:text-4xl font-black text-center mb-2">
        <span v-if="lang === 'hr'">Uvjeti korištenja – Gamenote</span>
        <span v-else>Terms of Service – Gamenote</span>
      </h1>

      <!-- Date -->
      <p class="text-center text-base-content/50 text-sm mb-8">{{ effectiveDate[lang] }}</p>

      <!-- Content card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body p-6 sm:p-8 space-y-6 text-base sm:text-lg leading-relaxed">

          <template v-if="lang === 'hr'">

            <div class="space-y-2">
              <h2 class="text-xl font-bold">1. Tko stoji iza Gamenotea</h2>
              <p>Gamenote razvija Mario Bariša, kao osobni projekt koji nastaje u slobodno vrijeme, iz ljubavi prema videoigrama — ne kao registrirana tvrtka ili obrt. Trudim se da sve radi kako treba, ali sam jedna osoba, a ne firma s timom za podršku 😊</p>
              <p>Kontakt: <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a></p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">2. Prihvaćanje uvjeta</h2>
              <p>Korištenjem web ili iOS aplikacije Gamenote ("Usluga") prihvaćaš ove Uvjete korištenja i <a href="https://gamenote.barisa.me/privacy" target="_blank" rel="noopener noreferrer" class="link link-primary">Pravila privatnosti</a>. Ako se ne slažeš s njima, nemoj koristiti Uslugu.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">3. Opis usluge</h2>
              <p>Gamenote je alat za osobno praćenje videoigara — popisi, bilješke, ocjene i napredak. Namijenjen je osobnoj, nekomercijalnoj upotrebi.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">4. Korisnički računi</h2>
              <ul class="list-disc list-inside">
                <li>Registracija i prijava odvijaju se putem e-mail adrese i lozinke, preko platforme <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase</a>.</li>
                <li>Odgovoran/na si za točnost podataka koje uneseš i za čuvanje lozinke u tajnosti.</li>
                <li>Aplikacija nudi mogućnost <strong>trajnog brisanja računa unutar same aplikacije</strong> — brisanjem se trajno uklanjaju svi povezani podaci.</li>
                <li>Usluga je namijenjena općoj publici. Ako si mlađi/a od 16 godina, provjeri imaš li dopuštenje roditelja ili staratelja prije korištenja, sukladno propisima o zaštiti podataka.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">5. Usluga se pruža "takva kakva je"</h2>
              <p>Aplikacija se pruža u trenutnom stanju, bez ikakvih jamstava da će biti dostupna, bez grešaka ili prilagođena svrsi koju imaš na umu. Ne preuzimam odgovornost za štetu, gubitak podataka ili probleme nastale korištenjem Gamenotea, osim u mjeri u kojoj se odgovornost ne može zakonski isključiti (npr. namjera, gruba nepažnja, ili prava koja imaš kao potrošač sukladno važećim propisima o zaštiti potrošača). Koristiš Uslugu na vlastitu odgovornost.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">6. Dostupnost i izmjene usluge</h2>
              <p>Gamenote može biti izmijenjen, privremeno ugašen ili trajno uklonjen bez prethodne najave. Trudit ću se unaprijed najaviti veće promjene (putem aplikacije ili e-maila), ali ne jamčim da će uvijek biti vremena za to.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">7. Plaćanja i kupnje unutar aplikacije (budućnost)</h2>
              <p>Ako u budućnosti uvedem opcionalne kupnje (donacije, premium značajke):</p>
              <ul class="list-disc list-inside">
                <li>Cijene i uvjeti bit će jasno prikazani prije svake transakcije.</li>
                <li>Na iOS-u će se plaćanja obrađivati putem Appleovog sustava kupnji unutar aplikacije (In-App Purchase) i podliježu i Appleovim uvjetima korištenja.</li>
                <li>Kupnje su u pravilu nepovratne, osim kada zakon (npr. propisi o zaštiti potrošača EU) propisuje drugačije. Potvrdom kupnje digitalnog sadržaja koji se isporučuje odmah, pristaješ da time gubiš pravo na jednostrani raskid ugovora u zakonskom roku, sukladno propisima o zaštiti potrošača.</li>
                <li>Zahtjevi za povrat sredstava za kupnje putem Applea rješavaju se direktno s Appleom, ne sa mnom.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">8. Prihvatljivo korištenje</h2>
              <p>Slažeš se da nećeš:</p>
              <ul class="list-disc list-inside">
                <li>koristiti Uslugu za nezakonite ili zlonamjerne svrhe,</li>
                <li>pokušavati neovlašteno pristupiti sustavu ili podacima drugih korisnika,</li>
                <li>reverse engineer-irati, dekompilirati ili zaobilaziti sigurnosne mjere aplikacije.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">9. Intelektualno vlasništvo</h2>
              <p>Gamenote (kod, dizajn, naziv i logotip) vlasništvo je Marija Bariše. Sadržaj koji sam uneseš (npr. tvoje bilješke o igrama) ostaje tvoje vlasništvo — Gamenoteu daješ samo ograničenu dozvolu pohrane i prikaza tog sadržaja, isključivo radi pružanja Usluge tebi.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">10. Prekid pristupa</h2>
              <p>Pristup Usluzi mogu ograničiti ili ukinuti u slučaju kršenja ovih Uvjeta, uz prethodno upozorenje gdje je to razumno moguće.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">11. Tvoji podaci</h2>
              <p>Ne prodajem, ne dijelim niti ne analiziram tvoje podatke. Detalji su u <router-link to="/privacy" class="link link-primary">Pravilima privatnosti</router-link>.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">12. Mjerodavno pravo</h2>
              <p>Na ove Uvjete primjenjuje se hrvatsko pravo, uz zadržavanje obvezujućih prava koja imaš kao potrošač prema propisima Europske unije, ako se primjenjuju na tebe.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">13. Izmjene ovih Uvjeta</h2>
              <p>Ove Uvjete mogu povremeno ažurirati. Datum na vrhu dokumenta uvijek odražava posljednju izmjenu. Za veće promjene, trudit ću se obavijestiti korisnike unaprijed.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">14. Kontakt</h2>
              <p>Pitanje ili nedoumica? Slobodno se javi — tu sam da pomognem 🙌 <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a></p>
            </div>

          </template>

          <template v-else>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">1. Who's behind Gamenote</h2>
              <p>Gamenote is developed by Mario Bariša as a personal, free-time project born out of a love for video games — not as a registered company. I do my best to keep things running smoothly, but I'm one person, not a support team 😊</p>
              <p>Contact: <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a></p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">2. Acceptance of terms</h2>
              <p>By using the Gamenote web or iOS app (the "Service"), you accept these Terms of Service and the <a href="https://gamenote.barisa.me/privacy" target="_blank" rel="noopener noreferrer" class="link link-primary">Privacy Policy</a>. If you don't agree, please don't use the Service.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">3. Description of the service</h2>
              <p>Gamenote is a personal video game tracking tool — lists, notes, ratings, and progress tracking. It's intended for personal, non-commercial use.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">4. User accounts</h2>
              <ul class="list-disc list-inside">
                <li>Sign-up and login happen via email and password, through the <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase</a> platform.</li>
                <li>You're responsible for the accuracy of the information you provide and for keeping your password confidential.</li>
                <li>The app offers <strong>permanent in-app account deletion</strong> — deleting your account permanently removes all associated data.</li>
                <li>The Service is intended for a general audience. If you're under 16, please make sure you have permission from a parent or guardian before using it, in line with applicable data protection rules.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">5. The service is provided "as is"</h2>
              <p>The app is provided as-is, without warranties of any kind regarding availability, error-free operation, or fitness for a particular purpose. I'm not liable for damages, data loss, or issues arising from using Gamenote, except where liability cannot be legally excluded (e.g. intent, gross negligence, or statutory consumer rights that apply to you). You use the Service at your own risk.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">6. Availability and changes</h2>
              <p>Gamenote may be modified, temporarily suspended, or permanently discontinued without prior notice. I'll try to give advance notice of major changes (via the app or email), but I can't guarantee there will always be time to do so.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">7. Payments and in-app purchases (future)</h2>
              <p>If optional purchases (donations, premium features) are introduced in the future:</p>
              <ul class="list-disc list-inside">
                <li>Pricing and terms will be clearly shown before any transaction.</li>
                <li>On iOS, payments will be processed through Apple's In-App Purchase system and are also subject to Apple's own terms.</li>
                <li>Purchases are generally non-refundable, except where required by law (e.g. EU consumer protection rules). By confirming a purchase of digital content delivered immediately, you agree to waive your statutory right of withdrawal, in accordance with applicable consumer protection law.</li>
                <li>Refund requests for Apple purchases are handled directly with Apple, not with me.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">8. Acceptable use</h2>
              <p>You agree not to:</p>
              <ul class="list-disc list-inside">
                <li>use the Service for unlawful or malicious purposes,</li>
                <li>attempt unauthorized access to the system or other users' data,</li>
                <li>reverse-engineer, decompile, or bypass the app's security measures.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">9. Intellectual property</h2>
              <p>Gamenote (the code, design, name, and logo) belongs to Mario Bariša. Content you create (e.g. your notes about games) remains yours — you grant Gamenote only a limited license to store and display that content, solely to provide the Service to you.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">10. Termination</h2>
              <p>I may restrict or terminate access to the Service in case of a violation of these Terms, with prior warning where reasonably possible.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">11. Your data</h2>
              <p>I don't sell, share, or analyze your data. Details are in the <router-link to="/privacy" class="link link-primary">Privacy Policy</router-link>.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">12. Governing law</h2>
              <p>These Terms are governed by Croatian law, without prejudice to any mandatory consumer protection rights you may have under EU law, where applicable.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">13. Changes to these Terms</h2>
              <p>These Terms may be updated from time to time. The date at the top always reflects the latest revision. I'll try to give advance notice of any major changes.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">14. Contact</h2>
              <p>Got a question or concern? Feel free to reach out — happy to help 🙌 <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a></p>
            </div>

          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GamenoteBanner from '../components/GamenoteBanner.vue'

const lang = ref('hr')

const effectiveDate = {
  hr: '19. lipnja 2026.',
  en: 'June 19, 2026'
}
</script>
