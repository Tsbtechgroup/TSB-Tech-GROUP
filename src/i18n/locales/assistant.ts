/* =========================================================
   TSB ASSISTANT TRANSLATIONS — SMART KNOWLEDGE SAFE V2
   10 langues : FR, NL, EN, DE, ES, IT, PT, AR, TR, ZH
   ========================================================= */

type AssistantLocale = {
  assistant: {
    title: string;
    status: string;
    launcher: string;
    launcherShort: string;
    close: string;
    send: string;
    placeholder: string;
    welcome: string;
    footer: string;
    replyServices: string;
    replyQuote: string;
    replyContact: string;
    replyProjects: string;
    replyStore: string;
    replyAcademy: string;
    replyBusiness: string;
    replyAutomotiveLocksmith: string;
    replyAutomotiveDiagnostic: string;
    replySecurity: string;
    replyElectricity: string;
    replyEnergy: string;
    replyWater: string;
    replyAutomation: string;
    replyItElectronics: string;
    replyNetworks: string;
    replyWebsite: string;
    replyMaintenance: string;
    replyGreeting: string;
    replyThanks: string;
    replyFallback: string;
    action: {
      services: string;
      quote: string;
      contact: string;
      projects: string;
      store: string;
      academy: string;
      business: string;
    };
  };
};

export const assistantTranslations: Record<string, AssistantLocale> = {
  fr: {
    assistant: {
      title: "TSB Assistant",
      status: "Assistant intelligent",
      launcher: "Ouvrir TSB Assistant",
      launcherShort: "Assistant",
      close: "Fermer l’assistant",
      send: "Envoyer",
      placeholder: "Comment pouvons-nous vous aider ?",
      welcome: "Bonjour 👋 Décrivez-moi votre besoin. Je peux identifier le service TSB adapté et vous orienter vers la bonne solution.",
      footer: "Orientation instantanée • Un conseiller TSB peut ensuite prendre le relais.",
      replyServices: "TSB Tech Group intervient dans l’automobile, la sécurité, l’électricité, l’énergie, l’eau et le forage, l’automatisation, l’informatique, les réseaux, le développement web et la maintenance. Décrivez votre besoin pour que je vous oriente précisément.",
      replyQuote: "Vous pouvez transmettre votre besoin depuis notre formulaire de devis. Indiquez le service, vos coordonnées et le maximum de détails afin que l’équipe TSB puisse vous répondre précisément.",
      replyContact: "Vous pouvez joindre TSB Tech Group depuis la page Contact. Un conseiller pourra reprendre votre demande si elle nécessite une analyse humaine.",
      replyProjects: "Découvrez les projets et interventions déjà réalisés par TSB Tech Group dans notre espace Réalisations.",
      replyStore: "TSB Store regroupe les produits et solutions proposés par TSB Tech Group. Vous pourrez consulter le catalogue et envoyer une demande pour un produit disponible.",
      replyAcademy: "TSB Academy est l’espace consacré aux formations, à l’apprentissage technique et au développement des compétences.",
      replyBusiness: "TSB Business est destiné aux entreprises, investisseurs et partenaires souhaitant collaborer avec TSB Tech Group.",
      replyAutomotiveLocksmith: "TSB peut vous orienter pour une clé automobile perdue, un double, une télécommande, un transpondeur ou une programmation antidémarrage. Pour une réponse précise, indiquez la marque, le modèle, l’année et si vous possédez encore une clé fonctionnelle.",
      replyAutomotiveDiagnostic: "TSB propose le diagnostic automobile, la lecture et l’effacement des défauts ainsi que l’analyse de systèmes moteur, boîte de vitesses et hybride. Indiquez la marque, le modèle, l’année et les symptômes ou voyants affichés.",
      replySecurity: "TSB propose des solutions de sécurité : vidéosurveillance, alarmes, contrôle d’accès et interphonie. Précisez le lieu, le nombre de zones à surveiller et si l’installation concerne une habitation ou une entreprise.",
      replyElectricity: "TSB intervient sur les installations électriques, tableaux, câblages et dépannages. Décrivez le problème, le type de bâtiment et le lieu de l’intervention.",
      replyEnergy: "TSB étudie les solutions d’énergie, notamment le solaire, les batteries, les onduleurs et l’autonomie énergétique. Indiquez les appareils à alimenter et la durée d’autonomie souhaitée.",
      replyWater: "TSB peut vous orienter sur les solutions d’eau, pompage et forage. Précisez le lieu, l’usage prévu et les informations déjà connues sur le terrain ou le point d’eau.",
      replyAutomation: "TSB développe des solutions d’automatisation, d’automates programmables et de domotique. Décrivez l’équipement ou le processus que vous souhaitez automatiser.",
      replyItElectronics: "TSB intervient en informatique et électronique : diagnostic, réparation et assistance sur ordinateurs, téléphones et équipements électroniques. Indiquez l’appareil et la panne constatée.",
      replyNetworks: "TSB propose des solutions réseaux et télécommunications : Wi-Fi, réseau local, fibre, antennes et connectivité. Précisez le bâtiment, la surface et le problème rencontré.",
      replyWebsite: "TSB peut concevoir un site web, une application ou une solution numérique. Indiquez votre activité, les fonctionnalités souhaitées et le public visé.",
      replyMaintenance: "TSB assure la maintenance, l’entretien, la réparation et le dépannage d’équipements techniques. Indiquez l’équipement concerné, la panne et le niveau d’urgence.",
      replyGreeting: "Bonjour 👋 Je suis TSB Assistant. Décrivez simplement votre besoin et je vous guiderai vers le bon service.",
      replyThanks: "Avec plaisir. Je reste disponible si vous avez une autre question ou si vous souhaitez être orienté vers un service TSB.",
      replyFallback: "Je n’ai pas encore identifié précisément votre besoin. Vous pouvez indiquer l’équipement concerné, le problème rencontré, le lieu et le résultat attendu, ou choisir l’une des rubriques proposées.",
      action: { services: "Services", quote: "Demander un devis", contact: "Contact", projects: "Réalisations", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  nl: {
    assistant: {
      title: "TSB Assistant",
      status: "Slimme assistent",
      launcher: "TSB Assistant openen",
      launcherShort: "Assistent",
      close: "Assistent sluiten",
      send: "Verzenden",
      placeholder: "Hoe kunnen we u helpen?",
      welcome: "Hallo 👋 Beschrijf uw behoefte. Ik kan de juiste TSB-dienst herkennen en u naar de passende oplossing begeleiden.",
      footer: "Directe begeleiding • Daarna kan een TSB-adviseur het overnemen.",
      replyServices: "TSB Tech Group is actief in automotive, beveiliging, elektriciteit, energie, water en boringen, automatisering, IT, netwerken, webontwikkeling en onderhoud. Beschrijf uw behoefte voor gerichte begeleiding.",
      replyQuote: "U kunt uw aanvraag versturen via ons offerteformulier. Vermeld de dienst, uw contactgegevens en zoveel mogelijk details.",
      replyContact: "U kunt TSB Tech Group bereiken via de contactpagina. Een adviseur kan uw aanvraag verder behandelen.",
      replyProjects: "Bekijk de projecten en interventies van TSB Tech Group in onze rubriek Realisaties.",
      replyStore: "TSB Store bevat de producten en oplossingen van TSB Tech Group. U kunt de catalogus bekijken en een productaanvraag versturen.",
      replyAcademy: "TSB Academy is onze ruimte voor opleidingen, technisch leren en competentieontwikkeling.",
      replyBusiness: "TSB Business is bestemd voor bedrijven, investeerders en partners die met TSB Tech Group willen samenwerken.",
      replyAutomotiveLocksmith: "TSB kan helpen bij een verloren autosleutel, duplicaat, afstandsbediening, transponder of startonderbrekerprogrammering. Vermeld merk, model, jaar en of er nog een werkende sleutel is.",
      replyAutomotiveDiagnostic: "TSB biedt voertuigdiagnose, foutcodelezing en -wissen en analyse van motor-, transmissie- en hybridesystemen. Vermeld merk, model, jaar en symptomen.",
      replySecurity: "TSB biedt camerabewaking, alarmen, toegangscontrole en intercom. Vermeld de locatie, het aantal zones en het type gebouw.",
      replyElectricity: "TSB werkt aan elektrische installaties, verdeelborden, bekabeling en storingen. Beschrijf het probleem, gebouwtype en de locatie.",
      replyEnergy: "TSB onderzoekt energieoplossingen zoals zonnepanelen, batterijen, omvormers en autonomie. Vermeld de te voeden apparaten en gewenste autonomie.",
      replyWater: "TSB kan begeleiden bij water-, pomp- en booroplossingen. Vermeld de locatie, het gebruik en bekende terreininformatie.",
      replyAutomation: "TSB ontwikkelt automatisering, PLC- en domoticaoplossingen. Beschrijf de apparatuur of het proces dat u wilt automatiseren.",
      replyItElectronics: "TSB biedt diagnose, reparatie en ondersteuning voor computers, telefoons en elektronische apparatuur. Vermeld het apparaat en de storing.",
      replyNetworks: "TSB biedt Wi-Fi, lokale netwerken, glasvezel, antennes en connectiviteit. Vermeld gebouw, oppervlakte en probleem.",
      replyWebsite: "TSB kan een website, applicatie of digitale oplossing ontwikkelen. Vermeld uw activiteit, gewenste functies en doelgroep.",
      replyMaintenance: "TSB verzorgt onderhoud, reparatie en technische storingsdienst. Vermeld de apparatuur, storing en urgentie.",
      replyGreeting: "Hallo 👋 Ik ben TSB Assistant. Beschrijf uw behoefte en ik begeleid u naar de juiste dienst.",
      replyThanks: "Graag gedaan. Ik blijf beschikbaar voor een andere vraag of begeleiding naar een TSB-dienst.",
      replyFallback: "Ik heb uw behoefte nog niet precies herkend. Vermeld het apparaat, het probleem, de locatie en het gewenste resultaat, of kies een rubriek.",
      action: { services: "Diensten", quote: "Offerte aanvragen", contact: "Contact", projects: "Realisaties", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  en: {
    assistant: {
      title: "TSB Assistant",
      status: "Smart assistant",
      launcher: "Open TSB Assistant",
      launcherShort: "Assistant",
      close: "Close assistant",
      send: "Send",
      placeholder: "How can we help you?",
      welcome: "Hello 👋 Describe what you need. I can identify the right TSB service and guide you to the appropriate solution.",
      footer: "Instant guidance • A TSB advisor can then take over.",
      replyServices: "TSB Tech Group covers automotive, security, electricity, energy, water and drilling, automation, IT, networks, web development and maintenance. Describe your need for precise guidance.",
      replyQuote: "You can submit your request through our quote form. Include the service, your contact details and as much information as possible.",
      replyContact: "You can reach TSB Tech Group through the Contact page. An advisor can take over requests requiring human review.",
      replyProjects: "Explore projects and interventions completed by TSB Tech Group in our Projects section.",
      replyStore: "TSB Store contains products and solutions offered by TSB Tech Group. You can browse the catalogue and submit a product request.",
      replyAcademy: "TSB Academy is dedicated to training, technical learning and skills development.",
      replyBusiness: "TSB Business is for companies, investors and partners wishing to work with TSB Tech Group.",
      replyAutomotiveLocksmith: "TSB can guide you for a lost car key, duplicate, remote, transponder or immobilizer programming. Please provide the make, model, year and whether a working key remains.",
      replyAutomotiveDiagnostic: "TSB provides vehicle diagnostics, fault-code reading and clearing, and analysis of engine, transmission and hybrid systems. Provide the make, model, year and symptoms.",
      replySecurity: "TSB offers CCTV, alarms, access control and intercom solutions. Specify the location, number of areas and type of property.",
      replyElectricity: "TSB works on electrical installations, panels, wiring and troubleshooting. Describe the issue, property type and location.",
      replyEnergy: "TSB studies solar, battery, inverter and energy-autonomy solutions. Specify the appliances to power and desired backup time.",
      replyWater: "TSB can guide you on water, pumping and drilling solutions. Specify the location, intended use and known site information.",
      replyAutomation: "TSB develops automation, PLC and smart-building solutions. Describe the equipment or process you want to automate.",
      replyItElectronics: "TSB provides diagnostics, repair and support for computers, phones and electronic equipment. Specify the device and fault.",
      replyNetworks: "TSB offers Wi-Fi, local networks, fibre, antennas and connectivity solutions. Specify the building, area and issue.",
      replyWebsite: "TSB can build a website, application or digital solution. Specify your activity, desired features and target users.",
      replyMaintenance: "TSB provides maintenance, servicing, repair and technical troubleshooting. Specify the equipment, fault and urgency.",
      replyGreeting: "Hello 👋 I am TSB Assistant. Simply describe your need and I will guide you to the right service.",
      replyThanks: "You’re welcome. I remain available for another question or to guide you to a TSB service.",
      replyFallback: "I have not identified your need precisely yet. State the equipment, problem, location and expected result, or choose one of the suggested sections.",
      action: { services: "Services", quote: "Request a quote", contact: "Contact", projects: "Projects", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  de: {
    assistant: {
      title: "TSB Assistant", status: "Intelligenter Assistent", launcher: "TSB Assistant öffnen", launcherShort: "Assistent", close: "Assistent schließen", send: "Senden", placeholder: "Wie können wir Ihnen helfen?",
      welcome: "Hallo 👋 Beschreiben Sie Ihren Bedarf. Ich erkenne den passenden TSB-Service und führe Sie zur richtigen Lösung.",
      footer: "Sofortige Orientierung • Anschließend kann ein TSB-Berater übernehmen.",
      replyServices: "TSB Tech Group bietet Lösungen in Fahrzeugtechnik, Sicherheit, Elektrik, Energie, Wasser und Bohrung, Automatisierung, IT, Netzwerken, Webentwicklung und Wartung.",
      replyQuote: "Senden Sie Ihre Anfrage über unser Angebotsformular und geben Sie Service, Kontaktdaten und möglichst viele Details an.",
      replyContact: "Sie erreichen TSB Tech Group über die Kontaktseite. Ein Berater kann Ihre Anfrage persönlich übernehmen.",
      replyProjects: "Entdecken Sie die Projekte und Einsätze von TSB Tech Group im Bereich Projekte.",
      replyStore: "Im TSB Store finden Sie Produkte und Lösungen von TSB Tech Group sowie die Möglichkeit, eine Produktanfrage zu senden.",
      replyAcademy: "Die TSB Academy widmet sich Schulungen, technischem Lernen und Kompetenzentwicklung.",
      replyBusiness: "TSB Business richtet sich an Unternehmen, Investoren und Partner, die mit TSB Tech Group zusammenarbeiten möchten.",
      replyAutomotiveLocksmith: "TSB hilft bei verlorenen Fahrzeugschlüsseln, Duplikaten, Fernbedienungen, Transpondern und Wegfahrsperren. Nennen Sie Marke, Modell, Baujahr und vorhandene Schlüssel.",
      replyAutomotiveDiagnostic: "TSB bietet Fahrzeugdiagnose, Fehlerauslesen und -löschen sowie Analysen von Motor, Getriebe und Hybridsystem. Nennen Sie Fahrzeugdaten und Symptome.",
      replySecurity: "TSB bietet Videoüberwachung, Alarm, Zugangskontrolle und Sprechanlagen. Nennen Sie Ort, Bereiche und Gebäudetyp.",
      replyElectricity: "TSB arbeitet an Elektroinstallationen, Verteilern, Verkabelung und Störungen. Beschreiben Sie Problem, Gebäude und Ort.",
      replyEnergy: "TSB plant Solar-, Batterie-, Wechselrichter- und Autarkielösungen. Nennen Sie Geräte und gewünschte Autonomie.",
      replyWater: "TSB berät zu Wasser-, Pump- und Bohrlösungen. Nennen Sie Standort, Nutzung und bekannte Geländedaten.",
      replyAutomation: "TSB entwickelt Automatisierungs-, SPS- und Smart-Home-Lösungen. Beschreiben Sie Anlage oder Prozess.",
      replyItElectronics: "TSB diagnostiziert und repariert Computer, Telefone und Elektronik. Nennen Sie Gerät und Fehler.",
      replyNetworks: "TSB bietet WLAN, lokale Netzwerke, Glasfaser, Antennen und Konnektivität. Nennen Sie Gebäude, Fläche und Problem.",
      replyWebsite: "TSB entwickelt Websites, Anwendungen und digitale Lösungen. Nennen Sie Tätigkeit, Funktionen und Zielgruppe.",
      replyMaintenance: "TSB übernimmt Wartung, Reparatur und technische Fehlerbehebung. Nennen Sie Gerät, Fehler und Dringlichkeit.",
      replyGreeting: "Hallo 👋 Ich bin TSB Assistant. Beschreiben Sie Ihren Bedarf und ich führe Sie zum richtigen Service.",
      replyThanks: "Gern geschehen. Ich helfe Ihnen bei weiteren Fragen oder bei der Auswahl eines TSB-Service.",
      replyFallback: "Ich konnte Ihren Bedarf noch nicht genau erkennen. Nennen Sie Gerät, Problem, Ort und gewünschtes Ergebnis oder wählen Sie eine Rubrik.",
      action: { services: "Services", quote: "Angebot anfordern", contact: "Kontakt", projects: "Projekte", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  es: {
    assistant: {
      title: "TSB Assistant", status: "Asistente inteligente", launcher: "Abrir TSB Assistant", launcherShort: "Asistente", close: "Cerrar asistente", send: "Enviar", placeholder: "¿Cómo podemos ayudarle?",
      welcome: "Hola 👋 Describa su necesidad. Identificaré el servicio TSB adecuado y le guiaré hacia la solución correcta.",
      footer: "Orientación inmediata • Después puede intervenir un asesor de TSB.",
      replyServices: "TSB Tech Group ofrece automoción, seguridad, electricidad, energía, agua y perforación, automatización, informática, redes, desarrollo web y mantenimiento.",
      replyQuote: "Envíe su solicitud mediante nuestro formulario de presupuesto con el servicio, sus datos y todos los detalles posibles.",
      replyContact: "Puede contactar con TSB Tech Group desde la página Contacto. Un asesor podrá continuar su solicitud.",
      replyProjects: "Descubra los proyectos e intervenciones realizados por TSB Tech Group en nuestra sección Proyectos.",
      replyStore: "TSB Store reúne los productos y soluciones de TSB Tech Group. Puede consultar el catálogo y enviar una solicitud.",
      replyAcademy: "TSB Academy está dedicada a la formación, el aprendizaje técnico y el desarrollo de competencias.",
      replyBusiness: "TSB Business está destinado a empresas, inversores y socios que desean colaborar con TSB Tech Group.",
      replyAutomotiveLocksmith: "TSB puede ayudar con llaves perdidas, duplicados, mandos, transpondedores e inmovilizadores. Indique marca, modelo, año y si conserva una llave funcional.",
      replyAutomotiveDiagnostic: "TSB ofrece diagnóstico, lectura y borrado de fallos y análisis de motor, transmisión y sistemas híbridos. Indique vehículo y síntomas.",
      replySecurity: "TSB ofrece videovigilancia, alarmas, control de acceso e intercomunicación. Indique lugar, zonas y tipo de edificio.",
      replyElectricity: "TSB trabaja en instalaciones eléctricas, cuadros, cableado y averías. Describa problema, edificio y lugar.",
      replyEnergy: "TSB estudia soluciones solares, baterías, inversores y autonomía energética. Indique aparatos y autonomía deseada.",
      replyWater: "TSB orienta sobre agua, bombeo y perforación. Indique lugar, uso e información conocida del terreno.",
      replyAutomation: "TSB desarrolla automatización, PLC y domótica. Describa el equipo o proceso que desea automatizar.",
      replyItElectronics: "TSB diagnostica y repara ordenadores, teléfonos y equipos electrónicos. Indique dispositivo y avería.",
      replyNetworks: "TSB ofrece Wi-Fi, redes locales, fibra, antenas y conectividad. Indique edificio, superficie y problema.",
      replyWebsite: "TSB puede crear una web, aplicación o solución digital. Indique actividad, funciones y público objetivo.",
      replyMaintenance: "TSB realiza mantenimiento, reparación y asistencia técnica. Indique equipo, avería y urgencia.",
      replyGreeting: "Hola 👋 Soy TSB Assistant. Describa su necesidad y le guiaré al servicio adecuado.",
      replyThanks: "Con mucho gusto. Sigo disponible para otra pregunta o para orientarle a un servicio TSB.",
      replyFallback: "Aún no he identificado su necesidad con precisión. Indique equipo, problema, lugar y resultado esperado, o elija una sección.",
      action: { services: "Servicios", quote: "Solicitar presupuesto", contact: "Contacto", projects: "Proyectos", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  it: {
    assistant: {
      title: "TSB Assistant", status: "Assistente intelligente", launcher: "Apri TSB Assistant", launcherShort: "Assistente", close: "Chiudi assistente", send: "Invia", placeholder: "Come possiamo aiutarti?",
      welcome: "Ciao 👋 Descrivi la tua esigenza. Individuerò il servizio TSB adatto e ti guiderò verso la soluzione corretta.",
      footer: "Orientamento immediato • In seguito può intervenire un consulente TSB.",
      replyServices: "TSB Tech Group opera in automotive, sicurezza, elettricità, energia, acqua e perforazione, automazione, informatica, reti, sviluppo web e manutenzione.",
      replyQuote: "Invia la richiesta tramite il modulo preventivo indicando servizio, contatti e tutti i dettagli possibili.",
      replyContact: "Puoi contattare TSB Tech Group dalla pagina Contatti. Un consulente potrà proseguire la richiesta.",
      replyProjects: "Scopri i progetti e gli interventi realizzati da TSB Tech Group nella sezione Progetti.",
      replyStore: "TSB Store raccoglie prodotti e soluzioni TSB Tech Group. Puoi consultare il catalogo e inviare una richiesta.",
      replyAcademy: "TSB Academy è dedicata alla formazione, all’apprendimento tecnico e allo sviluppo delle competenze.",
      replyBusiness: "TSB Business è dedicato ad aziende, investitori e partner che desiderano collaborare con TSB Tech Group.",
      replyAutomotiveLocksmith: "TSB può aiutarti con chiavi auto perse, duplicati, telecomandi, transponder e immobilizer. Indica marca, modello, anno e chiavi disponibili.",
      replyAutomotiveDiagnostic: "TSB offre diagnosi, lettura e cancellazione guasti e analisi di motore, cambio e sistemi ibridi. Indica veicolo e sintomi.",
      replySecurity: "TSB offre videosorveglianza, allarmi, controllo accessi e citofonia. Indica luogo, aree e tipo di edificio.",
      replyElectricity: "TSB interviene su impianti elettrici, quadri, cablaggi e guasti. Descrivi problema, edificio e luogo.",
      replyEnergy: "TSB studia solare, batterie, inverter e autonomia energetica. Indica apparecchi e autonomia desiderata.",
      replyWater: "TSB offre orientamento per acqua, pompaggio e perforazione. Indica luogo, uso e dati noti sul terreno.",
      replyAutomation: "TSB sviluppa automazione, PLC e domotica. Descrivi l’apparecchiatura o il processo da automatizzare.",
      replyItElectronics: "TSB diagnostica e ripara computer, telefoni e apparecchi elettronici. Indica dispositivo e guasto.",
      replyNetworks: "TSB offre Wi-Fi, reti locali, fibra, antenne e connettività. Indica edificio, superficie e problema.",
      replyWebsite: "TSB può creare un sito, un’applicazione o una soluzione digitale. Indica attività, funzioni e pubblico.",
      replyMaintenance: "TSB offre manutenzione, riparazione e assistenza tecnica. Indica apparecchiatura, guasto e urgenza.",
      replyGreeting: "Ciao 👋 Sono TSB Assistant. Descrivi la tua esigenza e ti guiderò al servizio adatto.",
      replyThanks: "Con piacere. Rimango disponibile per un’altra domanda o per guidarti a un servizio TSB.",
      replyFallback: "Non ho ancora identificato con precisione la richiesta. Indica apparecchiatura, problema, luogo e risultato atteso, oppure scegli una sezione.",
      action: { services: "Servizi", quote: "Richiedi preventivo", contact: "Contatti", projects: "Progetti", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  pt: {
    assistant: {
      title: "TSB Assistant", status: "Assistente inteligente", launcher: "Abrir TSB Assistant", launcherShort: "Assistente", close: "Fechar assistente", send: "Enviar", placeholder: "Como podemos ajudar?",
      welcome: "Olá 👋 Descreva a sua necessidade. Identificarei o serviço TSB adequado e orientarei para a solução certa.",
      footer: "Orientação imediata • Depois um consultor TSB pode assumir.",
      replyServices: "A TSB Tech Group atua em automóvel, segurança, eletricidade, energia, água e perfuração, automação, informática, redes, desenvolvimento web e manutenção.",
      replyQuote: "Envie o pedido pelo formulário de orçamento com o serviço, os seus contactos e todos os detalhes possíveis.",
      replyContact: "Pode contactar a TSB Tech Group através da página Contacto. Um consultor poderá continuar o pedido.",
      replyProjects: "Conheça os projetos e intervenções realizados pela TSB Tech Group na secção Projetos.",
      replyStore: "A TSB Store reúne produtos e soluções da TSB Tech Group. Consulte o catálogo e envie um pedido de produto.",
      replyAcademy: "A TSB Academy dedica-se à formação, aprendizagem técnica e desenvolvimento de competências.",
      replyBusiness: "A TSB Business destina-se a empresas, investidores e parceiros que desejam colaborar com a TSB Tech Group.",
      replyAutomotiveLocksmith: "A TSB pode ajudar com chaves auto perdidas, duplicados, comandos, transponders e imobilizadores. Indique marca, modelo, ano e chaves existentes.",
      replyAutomotiveDiagnostic: "A TSB oferece diagnóstico, leitura e limpeza de avarias e análise de motor, transmissão e sistemas híbridos. Indique veículo e sintomas.",
      replySecurity: "A TSB oferece videovigilância, alarmes, controlo de acesso e intercomunicadores. Indique local, zonas e tipo de edifício.",
      replyElectricity: "A TSB intervém em instalações elétricas, quadros, cablagens e avarias. Descreva problema, edifício e local.",
      replyEnergy: "A TSB estuda soluções solares, baterias, inversores e autonomia energética. Indique aparelhos e autonomia desejada.",
      replyWater: "A TSB orienta sobre água, bombagem e perfuração. Indique local, utilização e dados conhecidos do terreno.",
      replyAutomation: "A TSB desenvolve automação, PLC e domótica. Descreva o equipamento ou processo a automatizar.",
      replyItElectronics: "A TSB diagnostica e repara computadores, telefones e equipamentos eletrónicos. Indique aparelho e avaria.",
      replyNetworks: "A TSB oferece Wi-Fi, redes locais, fibra, antenas e conectividade. Indique edifício, área e problema.",
      replyWebsite: "A TSB pode criar um site, aplicação ou solução digital. Indique atividade, funções e público-alvo.",
      replyMaintenance: "A TSB oferece manutenção, reparação e assistência técnica. Indique equipamento, avaria e urgência.",
      replyGreeting: "Olá 👋 Sou o TSB Assistant. Descreva a sua necessidade e orientarei para o serviço certo.",
      replyThanks: "Com prazer. Continuo disponível para outra pergunta ou para o orientar a um serviço TSB.",
      replyFallback: "Ainda não identifiquei a necessidade com precisão. Indique equipamento, problema, local e resultado esperado, ou escolha uma secção.",
      action: { services: "Serviços", quote: "Pedir orçamento", contact: "Contacto", projects: "Projetos", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  ar: {
    assistant: {
      title: "مساعد TSB", status: "مساعد ذكي", launcher: "فتح مساعد TSB", launcherShort: "المساعد", close: "إغلاق المساعد", send: "إرسال", placeholder: "كيف يمكننا مساعدتك؟",
      welcome: "مرحبًا 👋 اشرح حاجتك وسأحدد خدمة TSB المناسبة وأوجهك إلى الحل الصحيح.",
      footer: "توجيه فوري • ويمكن لمستشار TSB متابعة طلبك بعد ذلك.",
      replyServices: "تقدم TSB Tech Group خدمات السيارات والأمن والكهرباء والطاقة والمياه والحفر والأتمتة والمعلوماتية والشبكات وتطوير المواقع والصيانة.",
      replyQuote: "يمكنك إرسال طلبك عبر نموذج عرض السعر مع تحديد الخدمة وبيانات الاتصال وجميع التفاصيل الممكنة.",
      replyContact: "يمكنك التواصل مع TSB Tech Group عبر صفحة الاتصال، ويمكن لمستشار متابعة طلبك.",
      replyProjects: "اكتشف المشاريع والتدخلات التي أنجزتها TSB Tech Group في قسم المشاريع.",
      replyStore: "يجمع TSB Store منتجات وحلول TSB Tech Group، ويمكنك تصفح الكتالوج وإرسال طلب منتج.",
      replyAcademy: "TSB Academy مخصصة للتدريب والتعلم التقني وتطوير المهارات.",
      replyBusiness: "TSB Business مخصصة للشركات والمستثمرين والشركاء الراغبين في التعاون مع TSB Tech Group.",
      replyAutomotiveLocksmith: "يمكن لـ TSB مساعدتك في مفاتيح السيارات المفقودة والنسخ وأجهزة التحكم والترانسبوندر وبرمجة مانع التشغيل. اذكر الماركة والطراز والسنة والمفاتيح المتوفرة.",
      replyAutomotiveDiagnostic: "تقدم TSB تشخيص السيارات وقراءة ومسح الأعطال وتحليل المحرك وناقل الحركة والأنظمة الهجينة. اذكر بيانات السيارة والأعراض.",
      replySecurity: "تقدم TSB المراقبة بالكاميرات والإنذار والتحكم في الدخول والاتصال الداخلي. اذكر الموقع وعدد المناطق ونوع المبنى.",
      replyElectricity: "تعمل TSB على التركيبات واللوحات والأسلاك والأعطال الكهربائية. اشرح المشكلة ونوع المبنى والموقع.",
      replyEnergy: "تدرس TSB حلول الطاقة الشمسية والبطاريات والمحولات والاستقلال الطاقي. اذكر الأجهزة ومدة التشغيل المطلوبة.",
      replyWater: "تقدم TSB التوجيه في حلول المياه والضخ والحفر. اذكر الموقع والاستخدام ومعلومات الأرض المتوفرة.",
      replyAutomation: "تطور TSB حلول الأتمتة ووحدات PLC والمباني الذكية. اشرح المعدات أو العملية المطلوب أتمتتها.",
      replyItElectronics: "تشخص TSB وتصلح الحواسيب والهواتف والمعدات الإلكترونية. اذكر الجهاز والعطل.",
      replyNetworks: "تقدم TSB حلول Wi-Fi والشبكات والألياف والهوائيات والاتصال. اذكر المبنى والمساحة والمشكلة.",
      replyWebsite: "يمكن لـ TSB إنشاء موقع أو تطبيق أو حل رقمي. اذكر النشاط والوظائف المطلوبة والجمهور المستهدف.",
      replyMaintenance: "تقدم TSB الصيانة والإصلاح والدعم التقني. اذكر المعدات والعطل ودرجة الاستعجال.",
      replyGreeting: "مرحبًا 👋 أنا مساعد TSB. اشرح حاجتك وسأوجهك إلى الخدمة المناسبة.",
      replyThanks: "بكل سرور. أنا متاح لسؤال آخر أو لتوجيهك إلى إحدى خدمات TSB.",
      replyFallback: "لم أحدد حاجتك بدقة بعد. اذكر الجهاز والمشكلة والموقع والنتيجة المطلوبة، أو اختر أحد الأقسام.",
      action: { services: "الخدمات", quote: "طلب عرض سعر", contact: "اتصل بنا", projects: "المشاريع", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  tr: {
    assistant: {
      title: "TSB Assistant", status: "Akıllı asistan", launcher: "TSB Assistant'ı aç", launcherShort: "Asistan", close: "Asistanı kapat", send: "Gönder", placeholder: "Size nasıl yardımcı olabiliriz?",
      welcome: "Merhaba 👋 İhtiyacınızı açıklayın; uygun TSB hizmetini belirleyip sizi doğru çözüme yönlendireyim.",
      footer: "Anında yönlendirme • Ardından bir TSB danışmanı devralabilir.",
      replyServices: "TSB Tech Group otomotiv, güvenlik, elektrik, enerji, su ve sondaj, otomasyon, bilişim, ağlar, web geliştirme ve bakım alanlarında hizmet verir.",
      replyQuote: "Hizmeti, iletişim bilgilerinizi ve mümkün olduğunca çok ayrıntıyı belirterek teklif formumuzu gönderin.",
      replyContact: "İletişim sayfasından TSB Tech Group'a ulaşabilirsiniz. Bir danışman talebinizi devralabilir.",
      replyProjects: "TSB Tech Group'un tamamladığı proje ve müdahaleleri Projeler bölümünde inceleyin.",
      replyStore: "TSB Store, TSB Tech Group ürün ve çözümlerini içerir. Kataloğu inceleyip ürün talebi gönderebilirsiniz.",
      replyAcademy: "TSB Academy eğitim, teknik öğrenme ve beceri geliştirmeye ayrılmıştır.",
      replyBusiness: "TSB Business, TSB Tech Group ile çalışmak isteyen şirketler, yatırımcılar ve ortaklara yöneliktir.",
      replyAutomotiveLocksmith: "TSB kayıp araç anahtarı, yedek anahtar, kumanda, transponder ve immobilizer programlama için yardımcı olabilir. Marka, model, yıl ve mevcut anahtarı belirtin.",
      replyAutomotiveDiagnostic: "TSB araç teşhisi, arıza okuma-silme ve motor, şanzıman, hibrit sistem analizi sunar. Araç bilgilerini ve belirtileri yazın.",
      replySecurity: "TSB kamera, alarm, erişim kontrolü ve interkom çözümleri sunar. Konum, alan sayısı ve bina türünü belirtin.",
      replyElectricity: "TSB elektrik tesisatı, pano, kablolama ve arızalara müdahale eder. Sorunu, bina türünü ve konumu açıklayın.",
      replyEnergy: "TSB güneş, batarya, inverter ve enerji bağımsızlığı çözümleri planlar. Cihazları ve istenen süreyi belirtin.",
      replyWater: "TSB su, pompalama ve sondaj çözümlerinde yönlendirme sağlar. Konum, kullanım ve arazi bilgilerini belirtin.",
      replyAutomation: "TSB otomasyon, PLC ve akıllı bina çözümleri geliştirir. Otomatikleştirilecek ekipman veya süreci açıklayın.",
      replyItElectronics: "TSB bilgisayar, telefon ve elektronik cihazlarda teşhis ve onarım yapar. Cihazı ve arızayı belirtin.",
      replyNetworks: "TSB Wi-Fi, yerel ağ, fiber, anten ve bağlantı çözümleri sunar. Bina, alan ve sorunu belirtin.",
      replyWebsite: "TSB web sitesi, uygulama veya dijital çözüm geliştirebilir. Faaliyeti, özellikleri ve hedef kitleyi belirtin.",
      replyMaintenance: "TSB bakım, onarım ve teknik arıza hizmeti sunar. Ekipmanı, arızayı ve aciliyeti belirtin.",
      replyGreeting: "Merhaba 👋 Ben TSB Assistant. İhtiyacınızı yazın; sizi doğru hizmete yönlendireyim.",
      replyThanks: "Rica ederim. Başka bir soru veya TSB hizmetine yönlendirme için buradayım.",
      replyFallback: "İhtiyacınızı henüz tam belirleyemedim. Ekipmanı, sorunu, konumu ve beklenen sonucu yazın veya bir bölüm seçin.",
      action: { services: "Hizmetler", quote: "Teklif iste", contact: "İletişim", projects: "Projeler", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },

  zh: {
    assistant: {
      title: "TSB 智能助手", status: "智能助手", launcher: "打开 TSB 智能助手", launcherShort: "助手", close: "关闭助手", send: "发送", placeholder: "我们可以如何帮助您？",
      welcome: "您好 👋 请描述您的需求，我会识别合适的 TSB 服务并引导您找到正确的解决方案。",
      footer: "即时引导 • 之后可由 TSB 顾问继续协助。",
      replyServices: "TSB Tech Group 提供汽车、安全、电气、能源、水务与钻井、自动化、信息技术、网络、网站开发和维护服务。",
      replyQuote: "请通过报价表提交需求，并填写服务类型、联系方式和尽可能详细的信息。",
      replyContact: "您可以通过联系页面联系 TSB Tech Group，顾问可继续处理您的需求。",
      replyProjects: "请在项目案例区查看 TSB Tech Group 已完成的项目和服务。",
      replyStore: "TSB Store 汇集 TSB Tech Group 的产品和解决方案，您可以浏览目录并提交产品申请。",
      replyAcademy: "TSB Academy 专注于培训、技术学习和技能发展。",
      replyBusiness: "TSB Business 面向希望与 TSB Tech Group 合作的企业、投资者和合作伙伴。",
      replyAutomotiveLocksmith: "TSB 可协助处理汽车钥匙丢失、复制、遥控器、芯片和防盗系统编程。请提供品牌、车型、年份及现有钥匙情况。",
      replyAutomotiveDiagnostic: "TSB 提供汽车诊断、故障读取与清除，以及发动机、变速箱和混合动力系统分析。请提供车辆信息和症状。",
      replySecurity: "TSB 提供视频监控、报警、门禁和对讲系统。请说明地点、区域数量和建筑类型。",
      replyElectricity: "TSB 提供电气安装、配电箱、布线和故障处理。请描述问题、建筑类型和地点。",
      replyEnergy: "TSB 规划太阳能、电池、逆变器和能源自主方案。请说明用电设备和所需续航时间。",
      replyWater: "TSB 可提供供水、泵送和钻井方案指导。请说明地点、用途和已有场地信息。",
      replyAutomation: "TSB 开发自动化、PLC 和智能建筑解决方案。请描述需要自动化的设备或流程。",
      replyItElectronics: "TSB 提供电脑、手机和电子设备的诊断与维修。请说明设备和故障。",
      replyNetworks: "TSB 提供 Wi-Fi、局域网、光纤、天线和连接方案。请说明建筑、面积和问题。",
      replyWebsite: "TSB 可开发网站、应用程序或数字解决方案。请说明业务、功能和目标用户。",
      replyMaintenance: "TSB 提供维护、维修和技术故障处理。请说明设备、故障和紧急程度。",
      replyGreeting: "您好 👋 我是 TSB 智能助手。请描述您的需求，我会引导您找到正确服务。",
      replyThanks: "不客气。如有其他问题或需要 TSB 服务引导，我随时可以帮助您。",
      replyFallback: "我还无法准确识别您的需求。请说明设备、问题、地点和期望结果，或选择一个栏目。",
      action: { services: "服务", quote: "申请报价", contact: "联系", projects: "项目案例", store: "TSB Store", academy: "TSB Academy", business: "TSB Business" },
    },
  },
};