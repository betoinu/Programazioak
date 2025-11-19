export class PromptBuilder {
    static buildCurriculumPrompt(formData) {
        const {
            specialtyName,
            courseName, 
            subjectName,
            area,
            credits,
            optional,
            prerequisitesRAs,
            draftRAs
        } = formData;

        return `
ZURE ROLA: Curriculum diseinu aditua zara Euskal Unibertsitate sisteman.

TESTUINGURU ZEHATZA:
- IRAKASGAIA: ${subjectName || 'Ez zehaztuta'}
- GRADUA: ${specialtyName || 'Ez zehaztuta'}
- KURTSOA: ${courseName || 'Ez zehaztuta'} 
- ARLOA: ${area || 'Ez zehaztuta'}
- KREDITUAK: ${credits || '0'} ECTS
- MOTA: ${optional === "on" ? 'Hautazkoa' : 'Derrigorrezkoa'}

AURREKARIAK (beste irakasgaietatik):
${prerequisitesRAs || 'Ez daude aurrekaririk zehaztuta'}

HOBETU BEHARREKO IEak:
${draftRAs || 'Ez dago zirriborrorik'}

---

ESKATZEN DIREN 6 ATALA (zehatz-mehatz):

1. IKASKUNTZA EMAITZA (IE) BERRIDATZIAK (ANECA/AUDIT estandarra)
   - Kopurua: ${Math.max(4, Math.round(credits / 1.5))}-${Math.round(credits * 1.2)} IE
   - Formulazioa: Ekintza-aditzekin, neurgarriak, ikaslearen ikaskuntzan zentratuta
   - Maila: Gradu mailako zailtasun-maila egokia
   - Adibidez: "Diseinu proiektu baten oinarrizko alderdi funtzionalak eta formalak identifikatzen ditu"

2. GARAPEN JASANGARRIRAKO HELBUURUEN (GJH) INTEGRAZIOA (Zehatz-mehatz)
   - 2-3 Garapen Jasangarriren Helburu ESPEZIFIKO
   - Identifikatu zein GJH (adib: GJH 4: Hezkuntza kalitatea, GJH 9: Industria, berrikuntza eta azpiegitura...)
   - Azaldu NOLA integratuko diren irakasgaian
   - Eman adibide praktikoak

3. EBAZLUAZIO IRIZPIDEAK (Neurgarriak)
   - IE bakoitzarentzako 2-3 irizpide objektibo
   - Ebaluazio-metodoak: proiektuak, praktikak, azterketak, portfolioa...
   - Kalifikazio-eskalak: %-tan edo puntuazio-sistemarekin
   - Adibidez: "Proiektuaren kalitatea: %60, Parte-hartzea: %20, Azterketa: %20"

4. EDUKI BLOKEAK (Sakontasunez)
   - 3-4 eduki-bloke logiko
   - Bloke bakoitzean 3-5 azpitalde
   - Sekuentzia didaktikoa: oinarrietatik konplexura
   - Lotu edukiak IEekin

5. PRAKTIKA PROPOSAMENAK (Aplikagarriak)
   - 2-3 jarduera praktiko zehatz
   - Deskribapena: helburua, prozesua, materialak, ebaluazioa
   - Denbora-esleipena: ordu edo asteetan
   - Lotura argia IEekin
   - Lotura Habic clusterra, EIDE, Euskadi, Nafarroa eta Iparraldeko sektore ekonomiko estrategikoen barne diren enpresekin eta erakunderekin.
   - Lotura zaintzaren eta gizarte zerbitzu arloan lan egiten duten erakundeekin (Matia Fundazioa, Adinberri, Alokabide, etb)

6. BALIABIDEAK (Erabilgarriak)
   - Bibliografia: 3-5 liburu/artikulu eguneratu
   - Softwarea: programa espezifikoak irakasgaiarentzat
   - Baliabide digitalak: plataformak, tutorialak, webguneak
   - Lotura Unibertsitateetako ikerkuntza taldeekin.
   - Beste baliabideak: laborategiak, materialak, bisitak...

7. EGRESATUAREN KONPETENTZIAK (Eremu honetakoak)
    - Analizatu eremu honetan txertatzen diren irakasgaien Ikaskuntza Emaitzak
    - Aurreko IE hoiek kontuan izanik proposatu zein izan daitezkeen egresatu ondoren eremu honetan lor daitezkeen konpetentziak, jakinik, IEak direla konpetentzia hoien eskaloi moduko bat.

---

GIDATZAILE KRITIKOAK:
- Lotura egin eremu edo arlo berdineko irakasgaietan lortuko diren Ikaskuntza emaitzekin
- Erabili EUSKARA FORMALA eta zehatza
- Eman emaitza PRAGMATIKOAK eta ERABILGARriak
- Saiatu orokortasunak eta leloak
- Zentratu irakasgai honetan ESPEZIFIKOKI
- Eman ADIBIDDE zehatzak eta aplikagarriak
- Erabili MARKDOWN formaturik GABE (testu laua)
- Kopurua: 400-600 hitz atal bakoitzean

OHARRA: Emaitza hauek curriculum ofizialean sartuko dira. Izan profesional eta zehatza.
`;
    }
}
