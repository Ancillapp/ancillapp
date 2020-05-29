import { html } from 'lit-element';
import { InfoPage } from './info.component';
import { tau, menu } from '../../icons';

import '../../top-app-bar/top-app-bar.component';

export default function template(this: InfoPage) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${tau} ${this.localeData?.info}
      </div>
    </top-app-bar>

    <section>
      <h2>Fraternità Francescana di Betania</h2>
      <p>
        La <strong>Fraternità Francescana di Betania</strong> è un Istituto di
        Vita Consacrata di diritto diocesano composto da fratelli, sia chierici
        che laici, e da sorelle che si consacrano a Dio mediante i voti pubblici
        di castità, povertà ed obbedienza.<br />Il carisma della Fraternità si
        esplica nella <strong>preghiera</strong> e
        nell'<strong>accoglienza</strong>, elementi caratteristici della Betania
        evangelica, vissuti in un profondo contesto di
        <strong>vita fraterna</strong>. La Beata Vergine Maria, che ha vissuto
        in perfetta armonia la preghiera e l'accoglienza è il modello alla quale
        guardiamo.
      </p>
      <h2>Spiritualità Mariana</h2>
      <p>
        <strong>Maria</strong>, <strong>Ancella del Signore</strong> è il
        modello sublime della vita consacrata ed è anche la porta che ci
        introduce al mistero di Cristo. La spiritualità della nostra Fraternità
        è ispirata dall'incommensurabile mistero dell'Incarnazione, attraverso
        il quale si realizza il progetto salvifico di Dio che è passato per il
        fiat di Maria.<br />Maria di Nazareth ci insegna a conciliare il fare di
        Marta e il silenzio di Maria mostrandoci che non sono due uffici
        dislocati nel tempo o separati ma due uffici che si risolvono nell'unità
        di vita di una persona: accogliere Gesù come Dio nella mia vita. La
        Beata Vergine Maria accogliendo Dio nel suo grembo ha accolto tutti gli
        uomini, anzi, l'accoglienza di Dio in Gesù Cristo è stata la condizione
        per poter accogliere tutti gli altri. Maria di Nazareth ci insegna che
        Betania non è dunque un simbolo di accoglienza generica ma è il mistero
        dell'accoglienza della persona di Gesù Cristo e dentro l'accoglienza di
        Lui si giustifica, si motiva, si sorregge e si alimenta ogni altra forma
        di accoglienza.
      </p>
      <h2>Spiritualità Francescana</h2>
      <p>
        <strong>S. Francesco d'Assisi</strong>, per ispirazione divina, imitando
        la vita di Cristo e dei suoi discepoli, diede origine ad una forma di
        vita evangelica che chiamò fraternità. Per questo egli è per noi maestro
        impareggiabile di comunione fraterna. Francesco ha la concezione del
        fratello come dono di Dio, indipendentemente dalle caratteristiche
        umane. Ogni fratello è un dono da accogliere, una provocazione di Dio a
        crescere nell'amore, nella gratuità che sgorgano soltanto da un cuore
        umile. E per noi è anche modello di semplicità che è la via privilegiata
        per il cammino di unificazione dell'uomo con Dio, la fonte di ogni
        comunione fraterna e la medicina contro ogni divisione. La bellezza
        della vita semplice e la ricchezza della vita fraterna, che si traducono
        in massimo grado nell'attenzione caritativa verso il fratello più
        piccolo, sono la preziosa eredità della tradizione francescana. Da
        Francesco attingiamo anche la gioia evangelica ovvero quella perfetta
        letizia cara compagna del Serafico Padre che diventa la luminosa
        testimonianza dell'adesione al Vangelo.
      </p>
      <h2>Il nostro Fondatore e la fondazione</h2>
      <p>
        <strong>Nicola Gaudioso</strong>, in religione
        <strong>Padre Pancrazio</strong>, nato a Bari il 15 novembre 1926,
        ultimo di sei figli, entra nella famiglia dei frati minori cappuccini di
        Puglia all'età di tredici anni, il 10 dicembre 1939, veste l'abito
        religioso come fratello laico il 13 maggio 1942 e professa i voti
        temporanei il 19 giugno 1943 ad Alessanno (LE). Il 23 novembre 1947
        emette la professione perpetua nella Santa Casa di Loreto dove è
        arrivato l'anno precedente a servizio del Santuario.
      </p>
      <p>
        Dal 1950 diviene figlio spirituale di San Pio da Pietrelcina che, a
        seguito di una sua precisa richiesta, nel 1959 gli scrive di suo pugno
        un programma di vita a tergo di un'immaginetta che illumina la sua vita
        spirituale e diviene profezia del carisma della futura Fraternità
        Francescana di Betania (FFB):
      </p>
      <blockquote>
        Non sii talmente dedito all'attività di Marta da dimenticare il silenzio
        di Maria. La vergine Madre che sì bene concilia l'uno e l'altro ufficio
        ti sia di dolce modello ed ispirazione.
        <footer>- <cite>p. Pio Capp.no</cite></footer>
      </blockquote>
      <p>
        Nell'ultimo incontro con san Pio, nel luglio del 1968, questi gli
        comunica il desiderio del Signore che egli intraprenda il cammino per
        diventare sacerdote. Così, il 18 marzo 1973 fra Pancrazio viene ordinato
        sacerdote a Loreto.
      </p>
      <p>
        La Fraternità Francescana di Betania viene fondata del 1982 da Padre
        Pancrazio. Iniziamente costituitasi come associazione "Casa Betania",
        nel 1987 viene eretta dal servo di Dio Antonio Bello, vescovo della
        Diocesi Molfetta - Giovinazzo - Ruvo - Terlizzi, quale associazione
        pubblica di fedeli. Lo stesso Mons. Bello nel 1992 consulta la Santa
        Sede chiedendone l'erezione in Istituto di Vita Consacrata con il nome
        di Fraternità Francescana di Betania.
      </p>
      <p>
        Con l'autorizzazione della competente Congregazione vaticana, l'8
        dicembre 1998, solennità dell'Immacolata, il nuovo Vescovo della
        Diocesi, Mons Donato Negro, firma il decreto che riconosce la Fraternità
        come Istituto di Vita Consacrata di diritto Diocesano e ne approva le
        Costituzioni ad experimentum.
      </p>
      <p>
        P. Pancrazio è stato Superiore Generale per due mandati: dal 1999 al
        2005, e dal 2005 al 2011. Dal 2011 in poi ha continuato a vivere nella
        fraternità di Terlizzi, trasmettendo a ciascun fratello e sorella lo
        spirito e il carisma della Betania evangelica. P. Pancrazio N. Gaudioso
        è morto il 3 gennaio 2016.
      </p>
      <h2>I tre pilastri del carisma</h2>
      <h3>La preghiera</h3>
      <p>
        È il primo pilastro del nostro carisma perché precede gli altri e in un
        certo senso li genera. La preghiera è invocare la presenza di Cristo tra
        noi, presenza che costruisce la fraternità; è l'intimità di ciascuno con
        Gesù Cristo, è l'alimento indispensabile per mantenere vivo il fuoco
        dell'amore vero che ci rende capaci di un'autentica vita fraterna e una
        vera accoglienza. ll nostro Istituto ha un ampio tempo di preghiera
        comunitaria che comprende un po' tutte le forme di preghiera cristiana.
      </p>
      <ul>
        <li>
          La <strong>Celebrazione Eucaristica</strong>, "Fonte e culmine di
          tutta la via cristiana" (LG 11) è per noi il vertice della preghiera
          comunitaria e il centro di tutto nostro bene spirituale.
        </li>
        <li>
          La <strong>Liturgia delle Ore</strong> scandisce il ritmo della nostra
          giornata santificando tutto il corso del giorno e della notte per
          mezzo della lode divina.
        </li>
        <li>
          La <strong>Preghiera notturna</strong>, sull'esempio di Gesù Cristo e
          della maggior parte dei santi, è fondamentale per la vita del nostro
          Istituto.
        </li>
        <li>
          Il <strong>Santo Rosario</strong> esprime il nostro culto speciale
          alla Vergine Madre di Dio e unisce la meditazione dei misteri della
          vita di Cristo e della Chiesa alla preghiera del cuore.
        </li>
        <li>
          L'<strong>Adorazione Eucaristica</strong>, la meditazione della
          <strong>Parola di Dio</strong> e la
          <strong>lode spontanea</strong> sono altre forme presenti nella nostra
          vita di preghiera.
        </li>
      </ul>
      <h3>L'accoglienza</h3>
      <p>
        Cristo è per eccellenza il testimone di un Dio accogliente, per questo
        l'accoglienza è un modo di essere indispensabile per il cristiano. Gesù
        a Betania è accolto come Signore e Maestro, come un amico e come un
        fratello. in quella casa Egli dona se stesso e allo stesso tempo
        accoglie senza riserva il dono altrui (cfr. Lc 10,38-42; Gv 11,1-44;
        12,1-3). Condividendo i diversi momenti della nostra giornata, chi viene
        nelle nostre Case può trovare nella preghiera, nei sacramenti e nella
        vita fraterna, un incontro vero e vivificante con Gesù.
      </p>
      <p>
        La nostra accoglienza è rivolta: a quanti cercano Dio; a coloro che
        vogliono fare un'esperienza più profonda di Dio; a chi sta percorrendo
        un cammino di discernimento vocazionale; ai
        <strong>sacerdoti</strong> ed ai <strong>consacrati</strong> affaticati
        e talvolta svuotati dagli impegni apostolici che vogliono ritrovare
        l'intimità con il Maestro; alle <strong>famiglie</strong>, comunità di
        vita e di amore fondata sul sacramento del Matrimonio, che intendono
        riscoprire la bellezza e la grandezza di questa vocazione; ai
        <strong>giovani</strong> disorientati; a coloro che sentono la necessità
        di ritirarsi spiritualmente dalla frenesia della quotidianità per
        rimanere un po' nel silenzio, specialmente ai piedi di Gesù.
      </p>
      <h3>La vita fraterna</h3>
      <p>
        Un'attenzione particolare è riservato alla vita fraterna. La Betania
        evangelica era la casa di Marta, Maria e Lazzaro: due sorelle e un
        fratello che godevano della presenza di Gesù di Nazareth e della sua
        amicizia vissuta in un clima di famiglia. La nostra Betania è la casa di
        fratelli e sorelle che condividono la stessa vita invocando ogni giorno
        la presenza di Cristo. La vita fraterna è il primo ambito di accoglienza
        che deve realizzarsi innanzitutto verso il fratello e la sorella che il
        Signore ci ha messo accanto. Essa è il banco di prova per la coerenza
        della vita cristiana, è l'ambito certo per realizzare l'amore di Dio e
        uno specchio per vedere le proprie miserie ed esercitare tutte le virtù.
        Per cui "fratello" e "sorella" non sono semplicemente un titolo, ma ciò
        che siamo realmente e che siamo chiamati a realizzare tra noi, tra la
        gente e per la Chiesa. La testimonianza della vita fraterna diviene il
        nostro primo mezzo di evangelizzazione. É il Cristo stesso che ha detto:
        "da questo tutti sapranno che siete miei discepoli, se avrete amore gli
        uni per gli altri" (Gv 13,35).
      </p>
      <p>
        Per ulteriori informazioni, visita il sito
        <a href="https://www.ffbetania.net/${this.locale}">ffbetania.net</a>
      </p>
    </section>
  `;
}
