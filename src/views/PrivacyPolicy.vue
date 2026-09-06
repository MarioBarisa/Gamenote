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
        <span v-if="lang === 'hr'">Pravila privatnosti – Gamenote</span>
        <span v-else>Privacy Policy – Gamenote</span>
      </h1>

      <!-- Date -->
      <p class="text-center text-base-content/50 text-sm mb-8">{{ effectiveDate[lang] }}</p>

      <!-- Content card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body p-6 sm:p-8 space-y-6 text-base sm:text-lg leading-relaxed">

          <template v-if="lang === 'hr'">

            <p>Gamenote vjeruje u privatnost. Tvoji podaci su tvoji — ovdje je transparentno objašnjeno što prikupljamo i, još važnije, što ne radimo s tim.</p>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">1. Voditelj obrade podataka</h2>
              <p>Gamenote je osobni projekt kojeg vodi Mario Bariša, bez registrirane tvrtke. Za sva pitanja vezana za privatnost i tvoje podatke, javi se na <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a>.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">2. Koje podatke prikupljamo</h2>
              <ul class="list-disc list-inside">
                <li><strong>E-mail adresa</strong> – za registraciju i prijavu.</li>
                <li><strong>Lozinka</strong> – pohranjena u enkriptiranom (hashed) obliku putem Supabase Auth; ja nikad ne vidim tvoju stvarnu lozinku.</li>
                <li><strong>Sadržaj koji uneseš u aplikaciju</strong> – popisi igara, bilješke, ocjene, status igranja i sl. ("korisnički sadržaj").</li>
                <li><strong>ID korisničkog računa</strong> – tehnički identifikator koji generira Supabase radi povezivanja tvojih podataka s tvojim računom.</li>
              </ul>
              <p>Ne prikupljamo: analitiku korištenja, podatke o lokaciji, kontakte s uređaja, podatke za oglašavanje, niti bilo što izvan navedenog popisa.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">3. Zašto prikupljamo te podatke</h2>
              <p>Isključivo radi pružanja Usluge koju si zatražio/la otvaranjem računa — odnosno radi izvršenja ugovora s tobom (čl. 6(1)(b) GDPR-a).</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">4. Gdje se podaci pohranjuju</h2>
              <p>Svi podaci pohranjuju se putem <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase</a> — infrastrukturnog partnera za autentifikaciju i bazu podataka. Supabase može pohranjivati podatke i izvan EU/EGP-a, uz zaštitne mjere koje propisuje GDPR (npr. standardne ugovorne klauzule). Korištenjem Gamenotea pristaješ i na <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase Privacy Policy</a>.</p>
              <p>Osim te infrastrukture, <strong>ne koristimo nikakve druge treće strane</strong> — nema vanjskih alata za analitiku, oglašavanje, praćenje ili AI obradu.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">5. Što nikad ne radimo s tvojim podacima</h2>
              <ul class="list-disc list-inside">
                <li>Ne prodajemo ih.</li>
                <li>Ne dijelimo ih s trećim stranama u marketinške ili bilo koje druge svrhe.</li>
                <li>Ne koristimo ih za treniranje AI modela.</li>
                <li>Ne analiziramo i ne čitamo tvoj korisnički sadržaj (tvoje bilješke o igrama su isključivo tvoje).</li>
                <li>Ne prikazujemo oglase niti koristimo alate za praćenje.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">6. Kolačići i lokalna pohrana</h2>
              <p>Web verzija Gamenotea koristi samo tehnički neophodne kolačiće / lokalnu pohranu (local storage), potrebne za održavanje tvoje prijavljene sjednice putem Supabase Auth. Ne koristimo kolačiće za analitiku ili oglašavanje, pa ne treba ni banner za pristanak na takve kolačiće.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">7. Koliko dugo čuvamo podatke</h2>
              <p>Podaci se čuvaju dok imaš aktivan račun. Brisanjem računa unutar aplikacije, svi povezani podaci (e-mail, korisnički sadržaj) trajno se i odmah brišu iz naših sustava, uz mogući kratki period zadržavanja u sigurnosnim kopijama (backup) koje Supabase rutinski rotira i briše.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">8. Tvoja prava</h2>
              <p>Sukladno GDPR-u, imaš pravo:</p>
              <ul class="list-disc list-inside">
                <li>pristupiti svojim podacima,</li>
                <li>ispraviti netočne podatke,</li>
                <li>zatražiti brisanje podataka ("pravo na zaborav") – također dostupno samostalno, unutar aplikacije,</li>
                <li>ograničiti obradu ili uložiti prigovor na nju,</li>
                <li>zatražiti prijenosivost podataka,</li>
                <li>podnijeti prigovor Agenciji za zaštitu osobnih podataka (AZOP) ili nadležnom nadzornom tijelu u tvojoj zemlji.</li>
              </ul>
              <p>Za ostvarivanje ovih prava, javi se na <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a>.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">9. Djeca</h2>
              <p>Gamenote nije posebno namijenjen djeci i ne prikuplja svjesno podatke djece mlađe od 16 godina bez pristanka roditelja. Ako smatraš da je dijete koristilo Uslugu bez odgovarajućeg pristanka, javi se i podaci će biti uklonjeni.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">10. Sigurnost</h2>
              <p>Podaci se prenose i pohranjuju putem Supabase infrastrukture, koja koristi enkripciju prilikom prijenosa (TLS) i standardne sigurnosne mjere. Iako se trudim održavati visoku razinu sigurnosti, nijedan online sustav nije 100% siguran.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">11. Izmjene ovih Pravila</h2>
              <p>Ova Pravila mogu se povremeno ažurirati. Datum na vrhu dokumenta uvijek odražava posljednju izmjenu. Za veće promjene, trudit ću se obavijestiti korisnike unaprijed (npr. putem e-maila ili obavijesti u aplikaciji).</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">12. Kontakt</h2>
              <p>Mario Bariša – <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a></p>
            </div>

          </template>

          <template v-else>

            <p>Gamenote believes in privacy. Your data is yours — here's a transparent breakdown of what we collect, and more importantly, what we don't do with it.</p>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">1. Data controller</h2>
              <p>Gamenote is a personal project run by Mario Bariša, with no registered company behind it. For any questions about privacy or your data, reach out at <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a>.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">2. What data we collect</h2>
              <ul class="list-disc list-inside">
                <li><strong>Email address</strong> – for account registration and login.</li>
                <li><strong>Password</strong> – stored in encrypted (hashed) form via Supabase Auth; I never see your actual password.</li>
                <li><strong>Content you enter in the app</strong> – game lists, notes, ratings, play status, etc. ("user content").</li>
                <li><strong>User account ID</strong> – a technical identifier generated by Supabase to link your data to your account.</li>
              </ul>
              <p>We do <strong>not</strong> collect: usage analytics, location data, device contacts, advertising data, or anything outside the list above.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">3. Why we collect this data</h2>
              <p>Solely to provide the Service you requested by creating an account — i.e., to perform our contract with you (GDPR Art. 6(1)(b)).</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">4. Where data is stored</h2>
              <p>All data is stored via <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase</a>, our infrastructure partner for authentication and database storage. Supabase may store data outside the EU/EEA, with safeguards required under GDPR (e.g. standard contractual clauses). By using Gamenote, you also agree to <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase's Privacy Policy</a>.</p>
              <p>Beyond this infrastructure, <strong>we don't use any other third parties</strong> — no external analytics, advertising, tracking, or AI-processing tools.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">5. What we never do with your data</h2>
              <ul class="list-disc list-inside">
                <li>We don't sell it.</li>
                <li>We don't share it with third parties for marketing or any other purpose.</li>
                <li>We don't use it to train AI models.</li>
                <li>We don't analyze or read your user content (your notes about games are yours alone).</li>
                <li>We don't show ads or use tracking tools.</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">6. Cookies and local storage</h2>
              <p>The web version of Gamenote uses only strictly necessary cookies / local storage, needed to maintain your logged-in session via Supabase Auth. We don't use cookies for analytics or advertising, so no cookie-consent banner is needed.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">7. How long we keep your data</h2>
              <p>Data is kept for as long as you have an active account. Deleting your account in-app permanently and immediately removes all associated data (email, user content) from our systems, aside from a possible short retention period in backups that Supabase routinely rotates and deletes.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">8. Your rights</h2>
              <p>Under GDPR, you have the right to:</p>
              <ul class="list-disc list-inside">
                <li>access your data,</li>
                <li>correct inaccurate data,</li>
                <li>request deletion ("right to be forgotten") – also available directly within the app,</li>
                <li>restrict or object to processing,</li>
                <li>request data portability,</li>
                <li>lodge a complaint with your local data protection authority (in Croatia: AZOP), or the relevant authority in your country.</li>
              </ul>
              <p>To exercise these rights, contact <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a>.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">9. Children</h2>
              <p>Gamenote isn't specifically directed at children and doesn't knowingly collect data from children under 16 without parental consent. If you believe a child has used the Service without appropriate consent, please get in touch and the data will be removed.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">10. Security</h2>
              <p>Data is transmitted and stored via Supabase's infrastructure, which uses encryption in transit (TLS) and standard security measures. While I work to maintain a high level of security, no online system is 100% secure.</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">11. Changes to this policy</h2>
              <p>This policy may be updated from time to time. The date at the top always reflects the latest revision. I'll try to give advance notice of any major changes (e.g. via email or an in-app notice).</p>
            </div>

            <div class="space-y-2">
              <h2 class="text-xl font-bold">12. Contact</h2>
              <p>Mario Bariša – <a href="mailto:mario@barisa.me" class="link link-primary">mario@barisa.me</a></p>
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
