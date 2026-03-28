<template>
  <h1 class="header-modulo">Relazione</h1>
  <div id="relazione">
    <header>
      <h1><i>Selfie</i></h1>
      <h4>Progetto del corso di Tecnologie Web del 2024-2025</h4>
    </header>
    <ol class="indice">
      <li><a href="#Componenti">Componenti e divisione</a></li>
      <li><a href="#Account">Account e Home Page</a></li>
      <li><a href="#Calendario">Calendario</a></li>
      <li><a href="#Note">Note</a></li>
      <li><a href="#Pomodoro">Pomodoro</a></li>
    </ol>
    <h2 id="Componenti">Componenti e divisione</h2>
    <p>
      Il gruppo è composto dagli studenti: Riccardo Cianci, Matteo Toccarelli e
      Alice Zamagni.<br />La divisione dei compiti è stata la seguente:
    </p>
    <ul>
      <li>
        Cianci si è occupato del Timer (<a href="#Pomodoro">"Pomodoro"</a>) e
        delle <a href="#Note">Note</a>;
      </li>
      <li>
        Toccarelli si è occupato dell'<a href="#Account">account</a> e della
        Home Page;
      </li>
      <li>
        Zamagni si è occupata del <a href="#Calendario">Calendario</a> e degli
        Eventi.
      </li>
    </ul>
    <p>
      Il gruppo si è comunque aiutato a vicenda, contribuendo anche nelle parti
      degli altri componenti in caso di bisogno.
    </p>
    <h2 id="Account">Account e Home Page</h2>
    <p>
      Questa parte riguarda la gestione di diversi elementi, soprattutto legati
      all'account utente e alla home page. In questa parte della relazione viene
      approfondito il lavoro svolto nella realizzazione delle funzionalità di
      autenticazione e gestione dell’utente, sia lato frontend che backend,
      all’interno del progetto. La mia parte si è concentrata principalmente
      sull’implementazione dei seguenti componenti:
      <ul>
        <li><b>Frontend</b>: sviluppo delle interfacce e della logica per le pagine di Login, Signup, 
          Forgot Password, Reset Password e Profilo Utente. Queste sezioni sono fondamentali per 
          garantire un’esperienza utente fluida, sicura e intuitiva, permettendo agli utenti di registrarsi, 
          autenticarsi, recuperare le credenziali e gestire le proprie informazioni personali. Nell'implementazione 
          ho prestato grande attenzione anche all'aspetto grafico, oltre che alle funzionalità, poichè penso che 
          l'aspetto e l'esperienza utente sia uno dei concetti fondamentali per la completezza del progetto.</li>
        <li><b>Backend</b>: progettazione e realizzazione delle API e della logica server necessarie a supportare 
          tutte le funzionalità sopra elencate. Questo include la gestione sicura delle credenziali, la 
          validazione dei dati, la generazione e verifica dei token per il reset della password, la protezione 
          delle rotte tramite autenticazione, e la gestione delle informazioni del profilo utente.</li>
      </ul>
    </p>
    <h3>LogIn.vue</h3>
    <p>
      Il componente include la logica di autenticazione lato frontend, la gestione degli errori, la persistenza di alcune 
      informazioni nel <code>localStorage</code> e un'interfaccia utente realizzata tramite HTML, CSS (scoped), e l'uso delle icone di 
      FontAwesome. <br>
      Per quanto riguarda la parte <b>javascript</b>: viene inizialmente importato lo stile CSS globale, configurata la libreria 
      di icone da usare nel template, e viene importato axios, libreria HTTP per comunicare con il backend tramite richieste REST.
      Successivamente in data() viene definito lo stato reattivo locale. In particolare:
      <ul>
        <li><b>username</b> e <b>password</b>: legati ai campi input tramite <code>v-model</code>.</li>
        <li><b>email</b>: non utilizzata esplicitamente nel template (non serve nel login, ma è più facile salvarla qui per 
          la successiva gestione di notifiche), serve a salvare la mail nel <code>localStorage</code> dopo il login.</li>
        <li><b>message</b>: contiene eventuali messaggi di errore da mostrare all’utente.</li>
      </ul>
      Il metodo asincrono <code>login</code>, che rappresenta la parte principale del componente, viene invocato tramite 
      l’evento <code>@submit.prevent</code> del form, intercettando così l’invio e gestendo direttamente la procedura 
      di autenticazione. Questo metodo si occupa di eseguire i seguenti passaggi:
      <ul>
        <li><b>Reset del messaggio di errore</b>: Si assicura che ogni nuovo tentativo di login parta senza errori pregressi.</li>
        <li><b>Costruzione dinamica dell’URL backend</b>: Utilizza il nome host della finestra per 
          rendere il codice facilmente portabile tra ambienti (localhost, produzione, ecc.).</li>
        <li><b>Invio della richiesta di login</b>: 
          Viene effettuata una chiamata HTTP <code>POST</code> all’endpoint <code>/api/auth/login</code>, passando come payload un oggetto contenente <code>username</code> e <code>password</code>. 
          In caso di successo, la risposta restituisce almeno un token di autenticazione (JWT) e, se disponibile, anche l’email dell’utente. 
          Questi dati vengono poi salvati nel <code>localStorage</code> per mantenere la sessione attiva e consentire l’accesso alle sezioni protette dell’applicazione. </li>
        <li>
          <b>Gestione degli errori</b>: vengono gestiti diversi tipi di errori che possono verificarsi durante il processo di login, mostrando 
          un messaggio relativo alla causa specifica dell'errore, se viene trovata.
        </li>
      </ul>
    </p>
    <h3>SignUp.vue</h3>
    <p>
      Il file SignUp.vue implementa il componente di registrazione per l'applicazione. Il file gestisce la logica di interazione con 
      il backend per la creazione di nuovi utenti, e fornisce messaggi di feedback dinamici. Per quanto riguarda la struttura <b>HTML</b> e
      <b>CSS</b>: è presente un container principale, che
        incapsula tutto il modulo di registrazione, fornendo sfondo, bordi e shadow. L'Header mostra il titolo con stile particolare ed il
        Form <code>&lt;form class="sign-up-form" @submit.prevent="signup"&gt;&lt;/form&gt;</code> contiene tutti i campi e la 
        logica di validazione/interazione. Poi, la struttura viene divisa in sezioni: informazioni personali, credenziali dell'Utente
        e messaggi di feedback. <br>
        Per quanto riguarda invece la parte <b>javascript</b>, di seguito sono spiegati i metodi principali. <br>
        <ul>
          <li>
            <b>togglePasswordVisibility()</b>: cambia il tipo dell’input password tra "text" e "password" e cambia anche 
            l’icona mostrata accanto al campo password.
          </li>
          <li>
            <b>signup() (Metodo principale)</b>, il cui funzionamento riguarda: la costruzione dinamica dell’URL adattandosi 
            all’ambiente corrente; la chiamata <code>POST</code>, che invia i dati di registrazione 
            (solo i campi gestiti da Vue) all’endpoint /api/auth/signup; la gestione della risposta: in caso di successo
            mostra un alert con il messaggio del backend e reindirizza l’utente alla pagina di login, mentre in caso di 
            errore: aggiorna il messaggio d’errore (message), visualizzato nella UI, e stampa l’errore in console.
            Come già scritto, altri dati presenti nei campi UI (indirizzo, città, stato) non vengono trasmessi al backend, sono solo estetici.
          </li>
          <li>
            <b>showError</b>: mostra un messaggio di errore all'utente in caso di problemi.
          </li>
        </ul>
    </p>
    <h3>ResetPassword.vue</h3>
    <p>
      Il componente ResetPassword.vue rappresenta la schermata di reset password dell'applicazione, 
      fornendo un’interfaccia coerente con gli altri componenti collegati, per la scelta di una nuova password. <br>
      La struttura <b>HTML</b> è divisa in sezioni distinte: container principale, header, info box e form principale, 
      caratterizzato da diversi elementi interattivi e di feedback, come un indicatore di forza della password, 
      una lista dei requisiti della password, ecc. <br>
      La logica <b>JavaScript</b> del componente gestisce l'interazione con l'utente e la comunicazione con il backend:
      <ol>
        <li>
          <b>Gestione dello stato</b>: Il componente mantiene un piccolo stato reattivo con <code>password</code> (la nuova password inserita),
          <code>passwordVisible</code>, per gestire la visibilità (text/password) del campo, <code>successMessage</code> e <code>errorMessage</code> (messaggi di feedback, mostrati dinamicamente)
          ed infine <code>isLoading</code>, che indica se la richiesta di reset è in corso, per evitare click multipli e mostrare lo spinner.
        </li>
        <li>
          <b>Calcolo dei requisiti password (computed)</b>: Le computed properties analizzano in tempo reale la password digitata, che deve 
          rispettare diversi requisitoi. Questi sono: 
          <ul>
            <li>hasMinLength: almeno 8 caratteri.</li>
            <li>hasUpperCase: almeno una lettera maiuscola.</li>
            <li>hasLowerCase: almeno una lettera minuscola.</li>
            <li>hasNumber: almeno una cifra.</li>
            <li>isPasswordValid: true solo se tutti i precedenti sono rispettati (il pulsante si abilita solo in questo caso).</li>
            <li>passwordStrength: calcola una percentuale di “forza” basata su lunghezza e varietà di caratteri, assegnando più peso alla presenza di numeri oltre agli altri criteri.</li>
            <li>strengthColor e strengthText: determinano rispettivamente il colore (rosso, arancione, verde) e la descrizione testuale associata alla forza della password.</li>
          </ul>
          Questo sistema fornisce un feedback immediato e visivo, fondamentale per la sicurezza e la soddisfazione dell’utente.
        </li>
        <li>
          <b>Reset effettivo della password</b>: Il metodo <code>resetPassword</code> contiene la logica principale dell’operazione. Vengono 
          eseguiti i seguenti passaggi: cancellazione dei feedback precedenti, estrazione del token dalla route, 
          chiamata al backend per inviare la nuova password con richiesta POST all’endpoint <code>/api/auth/resetpassword/:token</code>,
          e gestione della risposta (successo o errore).
        </li>
      </ol>
    </p>
    <h3>ForgotPassword.vue</h3>
    <p>
      Il componente ForgotPassword.vue si occupa della gestione della procedura di recupero password. 
      La sua funzione è semplice: permette all’utente di inserire la propria email per ricevere un link che 
      consentirà di reimpostare la password. La pagina è decorata con effetti visivi per migliorare l'esperienza utente.
      La struttura HTML e la grafica CSS sono simili a quelle di ResetPassword.vue, mentre la logica <b>javascript</b>
      riguarda queste funzioni principali: 
      <ul>
        <li>Vengono salvati nello stato reattivo l'email, <code>successMessage</code> (messaggio visualizzato in caso di invio riuscito),
          <code>errorMessage</code> (messaggio visualizzato in caso di errore), <code>isLoading</code> 
          (flag booleano che indica se la richiesta HTTP è in corso, utile per UX).</li>
        <li>
          <b>sendResetEmail()</b>: Parte fondamentale del componente, che si occupa di tutta la logica operativa quando l’utente invia il form.
          All’avvio del metodo, i messaggi precedenti vengono azzerati e viene attivato lo stato di caricamento (isLoading = true).
          Viene poi costruito dinamicamente l’URL del backend (adattandosi all’ambiente corrente), e attraverso una richiesta POST viene 
          inviato l’indirizzo email inserito. Se la richiesta va a buon fine, viene mostrato un messaggio di conferma 
          (usando il messaggio del backend o uno di default) e il campo email viene svuotato per evitare confusione. Se si verifica un 
          errore, viene mostrato un messaggio di errore appropriato, che può derivare dal backend 
          (ad esempio “email non trovata”) oppure essere generico. Viene infine sempre disattivato lo stato di loading, a 
          prescindere dall’esito, per consentire nuovi tentativi o altre azioni.
        </li>
      </ul>
    </p>
    <h3>TimeMachine.vue</h3>
    <p>
      Contiene la funzionalità chiave per poter effettuare test e controlli sul funzionamento dell'app: la possibilità di simulare 
      il tempo all’interno del sistema. Comunica costantemente con il backend per garantire la coerenza tra lo stato reale e quello simulato.
      Mentre la grafica e struttura sono simili a quelle degli altri componenti, la logica <b>javascript</b> riguarda 
      principalmente la gestione del tempo e delle simulazioni in questo modo:
      <ul>
        <li>
          <b>Stato reattivo</b>: <code>currentTime</code>, che rappresenta la data e ora attualmente visualizzata/impostata nell’interfaccia — 
          può essere reale o simulata. <code>systemTime</code>, che contiene sempre la data e ora reale del sistema (quella del browser).
          <code>timer</code>, che serve per gestire l’aggiornamento automatico dell’orario. <code>isVirtual</code>, booleano che indica 
          se il tempo visualizzato è quello reale o se è stato simulato.
        </li>
        <li>
          <b>mounted e beforeUnmount</b>: quando il componente viene montato, avvengono queste operazioni:
        <ul>
          <li>
            Recupero del tempo virtuale dal backend: viene chiamata la funzione asincrona <code>getVirtualTime</code> (da un modulo API esterno presente in api.js). Se il backend restituisce un’ora valida, questa viene usata come base per <code>currentTime</code> e <code>systemTime</code>.
          </li>
          <li>
            Confronto con l’ora reale: se la differenza tra l’ora virtuale e quella reale è superiore a un minuto, il tempo viene considerato “virtuale” e il sistema si comporta di conseguenza.
          </li>
          <li>
            Gestione del timer: viene avviato un intervallo che, ogni minuto:
          <ul>
            <li>Se il tempo è virtuale, lo incrementa di un minuto “finto”, simulando così lo scorrere del tempo anche quando la pagina resta aperta.</li>
            <li>Se il tempo è reale, aggiorna <code>currentTime</code> e <code>systemTime</code> con l’ora corrente del sistema.</li>
          </ul>
          </li>
        </ul>
          Questa logica garantisce un’esperienza coerente: se simulo di essere nel futuro, il tempo continua a scorrere da quel punto in avanti.
          Quando il componente viene distrutto, il timer viene sempre cancellato per evitare memory leak o comportamenti inattesi.
        </li>
        <li>
          <b>updateTime()</b>: Questo metodo viene chiamato ogni volta che l’utente cambia la data/ora nel campo. Si occupa di:
          <ul>
            <li>Comunicare la variazione al componente padre tramite l’evento <code>time-changed</code>.</li>
            <li>Chiamare l’API <code>setVirtualTime</code> per aggiornare il tempo virtuale nel backend.</li>
            <li>Aggiornare lo stato <code>isVirtual</code> in base al confronto tra l’ora impostata e quella reale.</li>
          </ul>
          Gestisce anche eventuali errori di comunicazione con il backend, loggandoli in console.
        </li>
        <li>
          <b>Comunicazione col backend (API)</b>: Il componente si appoggia a due funzioni di API esterne (<code>api.js</code>):
          <ul>
            <li><code>getVirtualTime</code>: recupera dal backend l’ora attualmente impostata (virtuale o reale).</li>
            <li><code>setVirtualTime</code>: imposta l’ora virtuale, oppure la resetta (passando stringa vuota).</li>
          </ul>
          Questo assicura che la simulazione del tempo sia globale per tutto il sistema (o almeno, per tutti i client che 
          rispettano questa logica).
        </li>
      </ul>
    </p>
    <h3>UserProfile.vue</h3>
    <p>
      Componente per la rappresentazione e la gestione del profilo utente dell'applicazoione. Qui l’utente può visualizzare, 
      aggiornare e personalizzare le proprie informazioni personali: nome, cognome, username, email, data di creazione dell’account e 
      soprattutto l’immagine del profilo. La logica JavaScript si occupa di tutte le interazioni, dalla modifica dei dati 
      al caricamento dell’immagine, fino alle animazioni e ai messaggi di feedback.
      <br>
      La logica <b>javascript</b> del componente è così gestita:
      <ul>
        <li>
          <b>Stato</b>: Il componente mantiene uno stato locale dettagliato:
          <ul>
            <li>userData: oggetto che contiene tutti i dati base dell’utente.</li>
            <li>profileImage: l’URL o base64 dell’immagine attuale.</li>
            <li>selectedFile: il file selezionato per il cambio immagine (prima del caricamento).</li>
            <li>editModalOpen, editField, editValue, editError: tutto ciò che serve per gestire la modifica di username/email in modo modale.</li>
            <li>message, messageType: per feedback all’utente (successo, errore).</li>
            <li>immagineAperta: per gestire la lightbox dell’immagine.</li>
          </ul>
          All’avvio (mounted), il componente esegue una chiamata autenticata al backend per recuperare tutti i dati del profilo utente tramite una GET su /api/auth/profile. Se il backend restituisce anche l’immagine, questa viene subito mostrata.
        </li>
        <li>
          <b>Gestione immagine profilo</b>: tramite un input nascosto, l’utente può 
          scegliere una nuova immagine. Il file viene validato per tipo e dimensione, e viene subito mostrata un’anteprima grazie a un FileReader.
          Quando si preme “Salva”, viene inviata una PUT autenticata al backend con l’immagine in formato base64. Se tutto va a 
          buon fine, il feedback è immediato e la nuova immagine è subito disponibile.
          La visualizzazione ingrandita dell’immagine è puramente per esperienza utente: apertura tramite click, chiusura con click 
          fuori o su “×”, oppure con il tasto ESC.
        </li>
        <li>
          <b>Modifica campi (username/email)</b>: clic sulla penna apre il modale, con blocco dello scrolling. Già in fase di input, 
          viene controllato che il campo non sia vuoto e, nel caso dell’email, che abbia un formato corretto. Alla conferma, viene eseguita 
          una PUT al backend sul giusto endpoint, usando il token di autenticazione. Se la modifica va a buon fine, sia lo stato 
          locale che il localStorage vengono aggiornati. In caso di errore, il messaggio viene mostrato in modo chiaro all’utente.
          Infine, il modale si chiude con “Annulla”, con ESC o cliccando fuori dal box.
        </li>
      </ul>
    </p>
    <h2 id="Calendario">Calendario ed Eventi</h2>
    <p>
      Questa parte del progetto consiste nella realizzazione di un'applicazione web che contiene la gestione di eventi tramite calendario.
      L'utente può visualizzare eventi in un'interfaccia grafica, crearli, modificarli, eliminarli e ricevere notifiche via email automatiche in prossimità degli stessi.
      Inoltre, viene supportata la gestione di eventi ricorrenti, e l’uso di una “Time Machine” per testare il comportamento in date simulate.
    </p>

    <h2>Architettura Generale</h2>
    <p>
      Il progetto è strutturato secondo un'architettura client-server. Il frontend, realizzato con <strong>Vue.js</strong>, interagisce con un backend sviluppato in <strong>Node.js</strong> e <strong>Express</strong>,
      che a sua volta si interfaccia con un database <strong>MongoDB</strong>, sfruttando la libreria <strong>Mongoose</strong> per la definizione degli schemi.
    </p>

    <h2>Backend: Gestione degli Eventi</h2>
    <p>
      Nel backend, ho implementato la logica di gestione degli eventi nel file <code>calendar.js</code>, definendo rotte API RESTful per:
    </p>
    <ul>
      <li>la creazione (<code>POST /save</code>),</li>
      <li>il recupero (eventi di un autore o di una data),</li>
      <li>la modifica (<code>PUT /update/:id</code>),</li>
      <li>l’eliminazione (<code>DELETE /delete/:id</code>).</li>
    </ul>
    <p>
      Ogni evento è rappresentato da un documento nel database, definito dallo schema <code>Evento</code> in <code>evento.js</code>. Questo schema contiene campi per:
    </p>
    <ul>
      <li>autore, titolo, descrizione, data e orari,</li>
      <li>parametri per la ricorrenza (repeat, repeatFrequency, repeatDuration, repeatId),</li>
      <li>coordinate geografiche opzionali (latitudine, longitudine, luogo).</li>
    </ul>
    <p>
      Nel caso di eventi ricorrenti, la logica di creazione prevede la generazione di più eventi nel tempo, ognuno con la propria data calcolata in base alla frequenza (weekly, monthly, o yearly) e alla durata specificata.
      Ogni evento della serie viene salvato come istanza separata, con un campo <code>repeatId</code> comune.
      È possibile eliminare o modificare singolarmente un evento, oppure intervenire sull’intera serie, o solo sugli eventi futuri a partire da una certa data.
      Queste opzioni sono rese disponibili all’utente tramite un’interfaccia intuitiva nel componente <code>EventForm.vue</code>.
    </p>

    <h2>Funzionalità Aggiuntive: Notifiche e Tempo Virtuale</h2>
    <p>
      Un’ulteriore funzionalità importante è l’invio di notifiche via email, implementato tramite <strong>Nodemailer</strong>.
      L’utente può ricevere un avviso automatico quando un evento è imminente o in corso, con contenuto dinamico in base alla situazione.
      La configurazione è gestita tramite un account Gmail e un sistema di autenticazione sicura.
    </p>
    <p>
      È stato integrato in questa parte dal collega Toccarelli il sistema di <strong>“Time Machine”</strong>, accessibile tramite l’endpoint <code>/api/time-machine</code>,
      che consente di simulare una data fittizia per test e simulazioni. Questa funzionalità viene utilizzata anche nel frontend per mostrare eventi rispetto a una data virtuale anziché quella reale.
    </p>

    <h2>Frontend: Calendario Interattivo</h2>
    <p>
      Sul lato client, ho sviluppato diversi componenti Vue per costruire l’interfaccia del calendario:
    </p>
    <ul>
      <li><code>CalendarGrid.vue</code>: disegna la griglia mensile e evidenzia i giorni con eventi e quello selezionato.</li>
      <li><code>CalendarPreview.vue</code>: gestisce la logica principale dell’interfaccia, inclusa la selezione dei giorni, il recupero degli eventi da backend e l’interazione con il modulo di creazione.</li>
      <li><code>EventForm.vue</code>: fornisce un modulo per l’inserimento e la modifica degli eventi, con selezione dell’orario personalizzabile, integrazione con Google Maps Autocomplete e opzioni per eventi ricorrenti.</li>
      <li><code>EventList.vue</code>: mostra gli eventi del giorno selezionato, con pulsanti per modifica ed eliminazione.</li>
      <li><code>TodayEvents.vue</code>: presenta un riepilogo degli eventi di oggi.</li>
    </ul>
    <p>
      La comunicazione con il backend avviene tramite <code>fetch</code> e query string basate sullo username memorizzato localmente.
      Le date vengono gestite e formattate per sincronizzare i dati tra calendario e backend.
      Eventuali modifiche agli eventi (compresa l’eliminazione di intere serie ricorrenti) aggiornano lo stato in tempo reale grazie alla reattività offerta da Vue.
    </p>
    <p>
      La modularità dei componenti Vue ha permesso riutilizzabilità e facile estensione del progetto.
      L’interfaccia è stata resa accessibile con uso di <code>aria-label</code> e una buona struttura visiva.
    </p>

    <h2 id="Note">Note</h2>
    <p>
      Le Note sono degli appunti scrivibili dall'utente. Un normalissimo form
      preleva i dati necessari per scrivere una nota, ovvero: titolo, categoria,
      descrizione (o "testo della nota") e data di ultima modifica. Vi sono
      anche altri dati "nascosti" come l'autore, che corrisponde all'utente
      corrente, l'id della nota e la data di creazione, che corrisponde alla
      data di ultima modifica solo la prima volta che si scrive una nota.<br /><br />La
      Nota è perlopiù gestita a lato <i>back-end</i>. Ogni volta che si apre la
      pagina si fa una richiesta al server per ottenere tutte le note scritte
      dal medesimo autore attraverso "/getAll". Il salvataggio di una nuova nota
      o la modifica di una esistente viene gestito dalla stessa funzione
      "/save", ogni volta che viene richiamata infatti controlla anzittutto la
      correttezza dei dati e poi se esiste una nota con quell'autore e quell'id,
      in caso affermativo aggiorna titolo, descrizione, categoria e ultima
      modifica; altrimenti ne crea una nuova. Esiste anche la funzione "/get"
      per ottenere solo l'ultima nota, "/getID" per ottenere il primo ID libero
      e "/delete" per eliminarla dal database.<br /><br />Come richiesto
      dall'estenzione max27 del progetto, è possibile scrivere anche le note in
      markdown, infatti la nota verrà sempre stampata con quello stile grazie
      alla funzione "renderMarkdown(t)". Il salvataggio in stile normale o
      markdown non varia nel database.
    </p>
    <h2 id="Pomodoro">Pomodoro</h2>
    <p>
      Il Pomodoro è un Timer usato per concentrarsi in sessioni di studio o di
      lavoro. Inizialmente avevo provato a svilupparlo totalmente in
      <i>back-end</i> così da farlo continuare anche in caso l'utente uscisse
      dalla pagina, tuttavia tale implementazione dava molti errori, quindi alla
      fine ho optato per svilupparlo solo in <i>front-end</i>, gestendo in
      <i>back-end</i> il salvataggio sul database.<br /><br />Il Pomodoro
      funziona come un normale Timer: è possibile inserire un totale di minuti
      che verrà diviso in cicli di studio e pausa secondo lo standard
      30min/5min/5 cicli, o altrimenti è possibile inserire direttamente i
      minuti e i cicli richiesti. Attenzione i valori dello standard devono essere un multiplo di esso All'inizio del timer vengono prelevati i dati,
      controllando se siano corretti, e viene richiesto al server con una
      richiesta GET di ottenere un ID per il Pomodoro. Ogni Pomodoro è infatti
      associato sia al nome dell'utente che a un ID.<br /><br />Il Timer viene
      gestito da un Interval che ogni secondo aggiorna i minuti di studio o di
      pausa rimanenti, l'animazione CSS e salva il Timer sul database, così nel
      caso di uscita improvvisa è possibile riprendere. Una volta conclusa una
      sessione, invia una notifica sia via alert che via mail, si controlla se
      si tratta di una fase di studio o di pausa e, nel caso di quest'ultimo, si
      diminuisce il numero di cicli. Pulsanti presenti nel form che appaiono
      dopo aver iniziato il ciclo permettono di fermarlo, saltare alla sessione
      successiva, resettare l'intero Timer o concluderlo. Alla conclusione del
      Pomodoro vengono "puliti" tutti i dati e l'intero form.<br /><br />È possibile
      anche programmare il Pomodoro come evento. Ho sfruttato gli eventi programmati
      dalla mia compagna e ho aggiunto alla struttura del timer l'orario dell'evento. 
      Ogni circa 10 secondi nella pagina del Timer, quando non ne è attivo nessuno, 
      il sito controlla che sia giunto il momento dell'evento. Inoltre controlla, nello 
      stesso momento, se esistono salvati nel database dei Pomodori non completati, 
      richiede all'utente, via un alert, se vuole finirli ora o successivamente.
    </p>
    
    <h2>Conclusione</h2>
    <p>
      Il lavoro svolto copre la realizzazione di un modulo eventi ricco di funzionalità, con un’attenzione particolare alla modularità del codice,
      alla separazione tra logica client e server, e alla gestione coerente delle informazioni nel tempo.
      Ogni scelta tecnologica – da Vue a Express, a MongoDB – è stata motivata dalla necessità di fornire un’interfaccia fluida, intuitiva e potente per l’utente finale.
    </p>
  </div>
</template>
<style scoped>
body {
  font-family: "Poppins", Arial, sans-serif;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  margin: 0;
  padding: 0;
}

.header-modulo {
  margin-bottom: 0;
  font-weight: 600;
  border-radius: 1em 1em 0 0;
  width: 40%;
}

#relazione {
  background: rgba(255,255,255,0.98);
  border-radius: 1.5em;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  padding: 2.5em 2em 2em 2em;
  width: 90%;
  margin: 0 1em 2em 1em;
  border: 1.5px solid #e3e6f3;
  transition: box-shadow 0.3s;
}

.indice {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-right: 6em;
  justify-content: center;
  align-items: center;
  list-style: none;
  counter-reset: none;
}
.indice > li {
  list-style: none;
}

#relazione header {
  text-align: center;
  margin-bottom: 2em;
}

#relazione h1, #relazione h2, #relazione h3, #relazione h4 {
  color: #2a5298;
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

#relazione h1 {
  font-size: 2.5em;
  margin-top: 0.5em;
}

#relazione h2 {
  font-size: 1.5em;
  border-bottom: 2px solid #b6c6e6;
  padding-bottom: 0.2em;
}

#relazione h3 {
  font-size: 1.2em;
  color: #3b5998;
}

#relazione h4 {
  font-size: 1em;
  color: #4e5d6c;
}

#relazione p, #relazione ul, #relazione ol {
  text-align: left;
  color: #222c3c;
  line-height: 1.7;
  margin-bottom: 1.2em;
}

#relazione ul, #relazione ol {
  margin-left: 2em;
  margin-bottom: 1.5em;
}

#relazione li {
  margin-bottom: 0.5em;
  padding-left: 0.2em;
}

#relazione code {
  background: #f3f6fa;
  color: #2a5298;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Poppins', 'Consolas', monospace;
}

#relazione a {
  color: #2a5298;
  text-decoration: underline;
  transition: color 0.2s;
}
#relazione a:hover {
  color: #1e3c72;
}

#relazione ol {
  list-style: decimal inside;
}
#relazione ul {
  list-style: disc inside;
}

#relazione::-webkit-scrollbar {
  width: 8px;
  background: #e3e6f3;
  border-radius: 8px;
}
#relazione::-webkit-scrollbar-thumb {
  background: #b6c6e6;
  border-radius: 8px;
}

@media (max-width: 700px) {
  #relazione {
    padding: 1em 0.5em 1.5em 0.5em;
  }
  .logo {
    font-size: 1.5em;
    margin-top: 1em;
  }
  #relazione h1 {
    font-size: 1.3em;
  }
  #relazione h2 {
    font-size: 1.1em;
  }
  #relazione h3 {
    font-size: 1em;
  }
}
</style>
