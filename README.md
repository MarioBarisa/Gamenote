# Specijalizirana Web Aplikacija za Praćenje osobne biblioteke videoigara korisnika

- Mario Bariša

[Fakultet informatike u Puli](https://www.fip.unipu.hr)

[Kolegij Programsko inženjerstvo](https://ntankovic.unipu.hr/pi)

mag. inf. Alesandro Žužić i [doc. dr. sc. Nikola Tanković](https://ntankovic.unipu.hr)

## Link na javni prototip

[FIGMA](https://www.figma.com/proto/5m6XMsznSpRlDz2y5LX8BH/Gamenote?node-id=0-1&t=2tFCUSzA41azXTAf-1)

## LINK NA SVE DIAGRAME 

[Diagrami](https://mariobarisa.craft.me/gamenotediagrams)

## Dokumentacija

[GamenoteDokumentacija.pdf](https://mariobarisa.craft.me/gamenotedokumentacija)

## Kratki opis funkcionalnosti

Aplikacija omogućava korisnicima praćenje odigranih videoigara kroz sljedeće značajke:

- **Unos igara:** Korisnici mogu dodati sve odigrane videoigre ( te one koje igraju ).
- **Strukturirana lista:** Omogućuje pregled odigrani i onih koje se trenutno igraju + organizaciju igara na jednom mjestu.
- **Osnovne informacije:** Pri unosu ili odabiru igre, korisnici unose/odabiru:
  - Naslov videoigre
  - Platformu na kojoj je igrana
  - Vrijeme provedeno u igri
  - Žanr videoigre
  - Izdavača
  - Ocjenu (primjerice zvjezdice - 1/5, ocjena 1/5 ili 1/10)
  - Postotak riješenih achivmenta
  - Osobne bilješke
  - Razdoblje igranja (od kada do kada, te da li igraju igru stalno/trenutno)
- **Analitički prikazi:** Korisnici dobivaju vizualne prikaze, uključujući:
  - Pie chart žanrova videoigara ili drugi oblik statističkog prikaza
  - Statistiku najzastupljenijih platformi
  - Kronološki prikaz (timeline) aktivnosti na osobnom home feedu
  - Pregled profila igrača s analizama o preferencijama
- **Dodatne značajke (ako bude vremena):**
  - Implementacija login sustava (vrlo visok prioritet)
  - Mogućnost praćenja drugih korisnika (funkcionalnost "follow")
  - Timeline aktivnosti pratitelja (pregled onoga što igraju korisnici koje pratiš)
  - Osnovna stranica profila (biografija, profilna slika, linkovi na druge mreže - vrlo visok prioritet)
  - fora stranice povezane sa igrom (wiki/mape...)
  - metacritic score 




## Jezici sučelja

Gamenote koristi Vue I18n. Pri prvom otvaranju hrvatski se odabire za jezik preglednika `hr` ili njegovu regionalnu varijantu. Za ostale jezike zadani je engleski. Izbornik u podnožju i u **Postavkama UI-ja** odmah mijenja jezik, oznaku `lang` dokumenta i format datuma i brojeva. Ručni odabir sprema se u preglednik pod ključem `gamenote.locale` i vrijedi i za javne stranice. Prethodno generirani javni HTML i slike za dijeljenje koriste hrvatski.

Za dodavanje jezika kopiraj strukturu datoteke `src/i18n/locales/en.json`, prevedi vrijednosti i registriraj katalog u popisu `languages` u `src/i18n/index.js`. Polje `label` sadrži naziv jezika na tom jeziku, a `format` je lokalitet za datume i brojeve. Izbornik se puni iz istog popisa. Nedostajući prijevodi prikazuju se na engleskom. Puni tekst pravnih dokumenata održava se u `PrivacyPolicy.vue` i `TermsOfService.vue`, s engleskim tekstom kao rezervom za dodatne jezike.

Novi tekst dodaj pod istim ključem u oba kataloga. U predlošcima koristi `$t()`, a u JavaScriptu `t()` iz `src/i18n/index.js`. Za tekst koji se mora osvježiti pri promjeni jezika pozovi `t()` unutar `computed()` ili pri prikazu. U dinamičkim porukama prednost daj imenovanim parametrima, primjerice `{name}`.

Nazivi platformi i statusi igranja **Backlog, Playing, Completed, Paused, Dropped, Wishlist** koriste se izravno u svim jezicima. Naslovi igara, bilješke i sadržaj vanjskih kataloga prikazuju se kako su spremljeni ili dohvaćeni.

`npm run test:i18n` provjerava odabir jezika, ključeve u kodu, podudaranje kataloga i interpolaciju u svim registriranim jezicima. GitHub Actions ga pokreće u koraku **Provjera i18n lokalizacije**. Postojeće Chromium regresije provjeravaju promjenu jezika u podnožju i postavkama te pamćenje odabira nakon ponovnog učitavanja.
