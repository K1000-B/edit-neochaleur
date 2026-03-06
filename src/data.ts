import type {
  FaqItem,
  NavItem,
  PageMetaEntry,
  ProjectItem,
  ServiceDetail,
  ServiceFaqGroup,
  ServiceSummary,
  SiteData
} from './types';

export const initialServiceDetails: ServiceDetail[] = [
  {
    id: 'chauffage',
    name: 'Chauffage',
    path: '/chauffage',
    summary: 'Installation, réglage et maintenance des systèmes de chauffage pour un confort stable.',
    heroIntro:
      'Chaudières gaz, réseaux hydrauliques, planchers chauffants : chaque intervention est documentée, des réglages jusqu’aux rapports d’entretien.',
    highlights: [
      'Régulations vérifiées et réglées pour limiter les surconsommations',
      'Entretien annuel avec attestation et recommandations ciblées',
      'Dépannage prioritaire sur Nantes et périphérie'
    ],
    prestations: [
      {
        title: 'Installation & remplacement',
        description:
          'Chaudières gaz à condensation, planchers chauffants, radiateurs, robinets thermostatiques et équilibrage des réseaux.'
      },
      {
        title: 'Entretien documenté',
        description:
          'Nettoyage, contrôle combustion, sécurité, rapport photo + réglages sauvegardés pour la visite suivante.'
      },
      {
        title: 'Optimisation énergétique',
        description:
          'Analyse des courbes de chauffe, vérification des circulateurs, purge et équilibrage pour un confort homogène.'
      }
    ],
    cases: [
      {
        title: 'Chaudière qui coupe régulièrement',
        description:
          'Diagnostic des sécurités, contrôle pressostat et sonde, reprise des connexions et test complet de redémarrage.'
      },
      {
        title: 'Radiateurs froids sur un étage',
        description:
          'Purge, contrôle de la pression, équilibrage des débits et vérification du circulateur pour retrouver la circulation.'
      },
      {
        title: 'Remplacement programmée',
        description:
          'Préparation des arrivées, protection du site, pose, mise en eau, réglages et formation utilisateur.'
      }
    ],
    engagements: [
      {
        title: 'Transparence',
        description:
          'Chaque visite inclut un relevé des actions menées, des pièces remplacées et des points de vigilance.'
      },
      {
        title: 'Sécurité',
        description:
          'Conformité des ventilations, contrôles de combustion et essais de redémarrage systématiques.'
      },
      {
        title: 'Suivi',
        description: 'Historique conservé pour faciliter la maintenance préventive et les futures optimisations.'
      }
    ],
    steps: [
      { title: 'Diagnostic clair', description: 'État des lieux rapide, photos et plan d’action partagé.' },
      { title: 'Intervention sécurisée', description: 'Protection des zones, respect des procédures fabricants.' },
      {
        title: 'Réglages documentés',
        description: 'Courbes, températures et pressions consignées dans le rapport.'
      },
      { title: 'Suivi', description: 'Conseils et rappel d’entretien si nécessaire.' }
    ],
    faqIds: ['entretien-chaudiere', 'optimisation']
  },
  {
    id: 'pompe-a-chaleur',
    name: 'Pompe à chaleur',
    path: '/pompe-a-chaleur',
    summary: 'Conseil, pose et maintenance préventive des pompes à chaleur pour un rendement durable.',
    heroIntro:
      'Dimensionnement, compatibilité électrique, mise en service et suivi : tout est vérifié pour préserver le COP et la durée de vie de l’installation.',
    highlights: [
      'Calcul et validation du dimensionnement',
      'Mise en service avec relevé des paramètres',
      'Contrats de maintenance préventive adaptés'
    ],
    prestations: [
      {
        title: 'Étude & choix matériel',
        description:
          'Analyse des déperditions, choix de la puissance, vérification de l’alimentation électrique et des évacuations.'
      },
      {
        title: 'Installation soignée',
        description:
          'Mise en place des unités, isolation des liaisons frigorifiques, réglages initiaux et formation utilisateur.'
      },
      {
        title: 'Maintenance préventive',
        description:
          'Nettoyage échangeurs, contrôle d’étanchéité, mise à jour des paramètres saisonniers et test des sécurités.'
      }
    ],
    cases: [
      {
        title: 'Baisse de performance',
        description:
          'Contrôle des pressions, nettoyage, mise à jour des consignes et vérification des débits pour récupérer le rendement.'
      },
      {
        title: 'Projet rénovation',
        description:
          'Étude sur installation existante, adaptation des émetteurs, coordination avec l’alimentation électrique.'
      },
      {
        title: 'Suivi annuel',
        description: 'Planification des visites, rapport avec valeurs clés et recommandations avant l’hiver.'
      }
    ],
    engagements: [
      {
        title: 'Écoute',
        description: 'Solutions adaptées à l’usage réel du logement ou du local, sans surdimensionnement.'
      },
      { title: 'Performance', description: 'Réglages fins pour préserver le COP et limiter la consommation.' },
      { title: 'Traçabilité', description: 'Paramètres de mise en service et évolutions archivés.' }
    ],
    steps: [
      { title: 'Audit rapide', description: 'Déperditions, compatibilités électriques et hydrauliques vérifiées.' },
      {
        title: 'Mise en service',
        description: 'Tests complets, équilibrage des circuits et réglage des consignes.'
      },
      { title: 'Contrôle', description: 'Lecture des historiques, ajustements saisonniers.' },
      { title: 'Maintenance', description: 'Programmation des visites préventives avec rappel.' }
    ],
    faqIds: ['dimensionnement', 'maintenance']
  },
  {
    id: 'plomberie',
    name: 'Plomberie',
    path: '/plomberie',
    summary: 'Dépannages rapides et installations sanitaires avec communication claire.',
    heroIntro:
      'Arrêt de fuite, remplacement de robinetterie, évacuations, chauffe-eau : interventions propres et sécurisées, avec conseils pour éviter une récidive.',
    highlights: [
      'Dépannage prioritaire sur fuites',
      'Installations sanitaires soignées',
      'Coordination légère pour petites rénovations'
    ],
    prestations: [
      {
        title: 'Dépannages urgents',
        description: 'Arrêt de fuite, remplacement de flexible, reprise d’étanchéité, remise en service sécurisée.'
      },
      {
        title: 'Installations',
        description: 'Pose ou remplacement de chauffe-eau, adoucisseur, receveur de douche, WC, mitigeurs thermostatiques.'
      },
      {
        title: 'Rénovations ciblées',
        description:
          'Création ou déplacement de points d’eau, optimisation des évacuations, coordination avec l’électricité.'
      }
    ],
    cases: [
      {
        title: 'Fuite non localisée',
        description: 'Recherche visuelle, mise en pression, réparation durable et contrôle après intervention.'
      },
      {
        title: 'Salle de bain à moderniser',
        description:
          'Remplacement des mitigeurs, receveur, optimisation des hauteurs et sécurisation des alimentations.'
      },
      {
        title: 'Chauffe-eau en fin de vie',
        description: 'Remplacement planifié, vidange sécurisée, raccordements neufs et mise en service.'
      }
    ],
    engagements: [
      { title: 'Propreté', description: 'Protection des zones de passage, nettoyage en fin d’intervention.' },
      { title: 'Clarté', description: 'Explications simples des travaux réalisés et des points de surveillance.' },
      { title: 'Réactivité', description: 'Créneau prioritaire pour les fuites sur Nantes et périphérie proche.' }
    ],
    steps: [
      {
        title: 'Qualification rapide',
        description: 'Échange pour cerner l’urgence et préparer les pièces nécessaires.'
      },
      { title: 'Intervention', description: 'Sécurisation, réparation, remplacement ou remise en pression.' },
      { title: 'Contrôles', description: 'Tests d’étanchéité et vérification des évacuations.' },
      { title: 'Conseils', description: 'Prévention et planning de remplacement si nécessaire.' }
    ],
    faqIds: ['urgence-fuite', 'salle-bain']
  },
  {
    id: 'electricite',
    name: 'Électricité',
    path: '/electricite',
    summary: 'Diagnostics, mise aux normes et dépannages électriques en toute sécurité.',
    heroIntro:
      'Tableaux, différentiels, lignes dédiées : une approche pédagogique avec contrôle des sécurités et documentation des mesures.',
    highlights: [
      'Mises aux normes partielles ou complètes',
      'Dépannage et diagnostic récurrence',
      'Ajout de points lumineux ou prises sécurisées'
    ],
    prestations: [
      {
        title: 'Sécurisation',
        description: 'Ajout de protections différentielles, remises à niveau des tableaux, repérage clair des circuits.'
      },
      {
        title: 'Rénovation',
        description: 'Reprises de lignes, ajout de prises, mise aux normes de pièces d’eau, mise à la terre.'
      },
      {
        title: 'Diagnostic',
        description: 'Recherche d’échauffement, tests de continuité, serrage et remplacement des éléments défaillants.'
      }
    ],
    cases: [
      {
        title: 'Disjonctions régulières',
        description: 'Tests par différentiel, contrôle des intensités et isolation pour trouver l’origine et sécuriser.'
      },
      {
        title: 'Tableau à moderniser',
        description: 'Remplacement des protections, réorganisation, ajout de réserves et repérage clair.'
      },
      {
        title: 'Création de ligne dédiée',
        description: 'Pose de ligne sécurisée pour électroménager ou IRVE légère, avec protections adaptées.'
      }
    ],
    engagements: [
      { title: 'Sécurité', description: 'Respect des normes en vigueur, mesures et tests systématiques.' },
      { title: 'Pédagogie', description: 'Explications simples sur les risques et les solutions proposées.' },
      { title: 'Traçabilité', description: 'Compte-rendu avec photos et valeurs relevées.' }
    ],
    steps: [
      { title: 'Diagnostic', description: 'Mesures, contrôle visuel et priorisation des corrections.' },
      { title: 'Mise en conformité', description: 'Remplacement ou ajout des protections nécessaires.' },
      { title: 'Tests finaux', description: 'Vérifications fonctionnelles et documentation.' },
      { title: 'Conseils', description: 'Plan de modernisation si besoin.' }
    ],
    faqIds: ['mise-aux-normes', 'diagnostic']
  },
  {
    id: 'climatisation',
    name: 'Climatisation',
    path: '/climatisation',
    summary: 'Pose et maintenance de climatisations réversibles, silencieuses et adaptées aux volumes traités.',
    heroIntro:
      'Étude, installation et suivi des splits ou gainables. Le confort d’été comme d’hiver repose sur des réglages fins et une maintenance sérieuse.',
    highlights: [
      'Choix des emplacements pour limiter le bruit et les pertes',
      'Recharges et tests d’étanchéité documentés',
      'Contrat annuel possible pour maintenir la performance'
    ],
    prestations: [
      {
        title: 'Étude & conseil',
        description:
          'Détermination des puissances, orientation des unités, préconisations d’implantation et d’évacuation des condensats.'
      },
      {
        title: 'Installation',
        description: 'Pose soignée, isolation des liaisons, test sous pression, mise en service et briefing utilisateur.'
      },
      {
        title: 'Maintenance',
        description:
          'Nettoyage filtres et échangeurs, test condensats, contrôle des pressions et mise à jour des paramètres.'
      }
    ],
    cases: [
      {
        title: 'Mauvaise répartition de l’air',
        description: 'Réglage des volets, vérification des débits, repositionnement si besoin pour un confort homogène.'
      },
      {
        title: 'Suspicion de fuite',
        description: 'Test pression, détection, réparation, recharge et contrôle de performance.'
      },
      {
        title: 'Bruit d’unité extérieure',
        description:
          'Contrôle silent-blocs, nettoyage et équilibrage ventilateur, recommandations d’implantation.'
      }
    ],
    engagements: [
      { title: 'Discrétion', description: 'Recherche du meilleur emplacement pour limiter bruit et gêne.' },
      { title: 'Durabilité', description: 'Montages propres, évacuations sécurisées, documentation des réglages.' },
      { title: 'Suivi', description: 'Rappels de maintenance et optimisation saisonnière.' }
    ],
    steps: [
      { title: 'Visite', description: 'Validation des volumes, contraintes et attentes.' },
      { title: 'Pose', description: 'Installation soignée et tests d’étanchéité.' },
      { title: 'Réglages', description: 'Mise en service, consignes adaptées et vérification acoustique.' },
      { title: 'Maintenance', description: 'Nettoyage, contrôles et mise à jour annuelle.' }
    ],
    faqIds: ['reversible', 'contrat']
  }
];

export const initialProjects: ProjectItem[] = [
  {
    id: 'pac-renovation',
    title: 'Remplacement par PAC air/eau',
    area: 'Orvault',
    service: 'Pompe à chaleur',
    badge: 'Optimisation énergétique',
    description:
      'Étude des déperditions, pose d’une PAC air/eau, équilibrage des radiateurs existants et mise en service documentée.'
  },
  {
    id: 'chaudiere-condensation',
    title: 'Chaudière gaz à condensation',
    area: 'Nantes Est',
    service: 'Chauffage',
    badge: 'Rénovation',
    description:
      'Remplacement d’une chaudière atmosphérique, réglage des températures de départ et attestation d’entretien fournie.'
  },
  {
    id: 'salle-bain',
    title: 'Modernisation salle de bain',
    area: 'Rezé',
    service: 'Plomberie',
    badge: 'Sanitaire',
    description:
      'Déplacement des alimentations, pose d’un receveur extra-plat, robinetterie thermostatique et nouvelle évacuation.'
  },
  {
    id: 'tableau-electrique',
    title: 'Tableau refait et repéré',
    area: 'Saint-Herblain',
    service: 'Électricité',
    badge: 'Sécurisation',
    description:
      'Remplacement du tableau, ajout de différentiels, repérage clair des circuits et test de continuité.'
  },
  {
    id: 'climatisation-split',
    title: 'Installation split réversible',
    area: 'Carquefou',
    service: 'Climatisation',
    badge: 'Confort été/hiver',
    description: 'Dimensionnement, pose discrète des unités, test condensats et briefing utilisateur.'
  },
  {
    id: 'reseau-plancher',
    title: 'Réseau plancher chauffant',
    area: 'Vertou',
    service: 'Chauffage',
    badge: 'Équilibrage',
    description:
      'Vérification des collecteurs, purge, équilibrage et réglage des consignes pour un confort homogène.'
  }
];

export const initialGeneralFaqs: FaqItem[] = [
  {
    id: 'intervention-delai',
    question: 'Quels sont les délais moyens pour une intervention ?',
    answer:
      'Sur Nantes et la première couronne, un créneau est proposé sous 24h ouvrées pour les dépannages prioritaires. Pour les projets planifiés (pose, rénovation), un point téléphonique permet de définir une date réaliste et de sécuriser les approvisionnements.'
  },
  {
    id: 'devis',
    question: 'Comment se passe le devis ?',
    answer:
      'Après un échange par téléphone ou visioconférence, un descriptif simple est envoyé par e-mail. Les options et dépendances (électricité, évacuation, ventilation) sont listées pour éviter les mauvaises surprises.'
  },
  {
    id: 'garantie',
    question: 'Proposez-vous des garanties ou contrats ?',
    answer:
      'Oui : mise en service documentée, garantie fabricant appliquée, et possibilité de contrat de maintenance pour les équipements sensibles (pompes à chaleur, climatisations, tableaux électriques).'
  }
];

export const initialServiceFaqs: ServiceFaqGroup[] = [
  {
    key: 'chauffage',
    items: [
      {
        id: 'entretien-chaudiere',
        question: 'Faites-vous l’entretien annuel des chaudières gaz ?',
        answer:
          'Oui, avec contrôle des sécurités, nettoyage des organes principaux, réglage combustion si nécessaire et attestation remise le jour même.'
      },
      {
        id: 'optimisation',
        question: 'Pouvez-vous optimiser une installation existante ?',
        answer:
          'Nous analysons les régulations, équilibres hydrauliques et températures de consigne. Un rapport propose des ajustements simples avant d’envisager un remplacement.'
      }
    ]
  },
  {
    key: 'pompe-a-chaleur',
    items: [
      {
        id: 'dimensionnement',
        question: 'Comment vérifier le bon dimensionnement ?',
        answer:
          'Un relevé des déperditions, de l’isolation et du régime d’eau permet de valider la puissance nécessaire. Nous vérifions aussi les protections électriques et l’évacuation des condensats.'
      },
      {
        id: 'maintenance',
        question: 'La maintenance préventive est-elle obligatoire ?',
        answer:
          'Recommandée pour maintenir le COP : nettoyage échangeurs, contrôle étanchéité, mise à jour des paramètres. Nous planifions un passage annuel ou biannuel selon l’usage.'
      }
    ]
  },
  {
    key: 'plomberie',
    items: [
      {
        id: 'urgence-fuite',
        question: 'Intervenez-vous en urgence pour les fuites ?',
        answer:
          'Oui sur la zone Nantes/périphérie. La priorité est d’arrêter la fuite, sécuriser et proposer une réparation durable (brasure, remplacement de flexible, reprise d’étanchéité).'
      },
      {
        id: 'salle-bain',
        question: 'Pouvez-vous gérer une rénovation de salle de bain ?',
        answer:
          'Oui pour la partie plomberie et coordination légère : alimentation, évacuation, robinetterie, mitigeurs thermostatiques, receveurs et évacuations.'
      }
    ]
  },
  {
    key: 'electricite',
    items: [
      {
        id: 'mise-aux-normes',
        question: 'Effectuez-vous des mises aux normes partielles ?',
        answer:
          'Oui : sécurisation du tableau, ajout de différentiel, remplacement de lignes et prises. Un contrôle visuel et des tests permettent de documenter les points restants.'
      },
      {
        id: 'diagnostic',
        question: 'Pouvez-vous diagnostiquer une panne récurrente ?',
        answer:
          'Recherche d’échauffements, mesures, contrôle de section et serrage. Un rapport photo/texte accompagne les recommandations pour éviter la récidive.'
      }
    ]
  },
  {
    key: 'climatisation',
    items: [
      {
        id: 'reversible',
        question: 'Intervenez-vous sur les climatisations réversibles ?',
        answer:
          'Oui : pose, mise en service, recherche de fuite et entretien. Le dimensionnement et l’orientation des unités sont vérifiés pour limiter les nuisances.'
      },
      {
        id: 'contrat',
        question: 'Proposez-vous un contrat de maintenance ?',
        answer:
          'Contrat annuel avec nettoyage, contrôle pression, test condensats et mise à jour des paramètres de confort pour la saison.'
      }
    ]
  }
];

const initialNavItems: NavItem[] = [
  { label: 'Accueil', path: '/' },
  { label: 'Chauffage', path: '/chauffage' },
  { label: 'Pompe à chaleur', path: '/pompe-a-chaleur' },
  { label: 'Plomberie', path: '/plomberie' },
  { label: 'Électricité', path: '/electricite' },
  { label: 'Climatisation', path: '/climatisation' },
  { label: 'Réalisations', path: '/realisations' },
  { label: 'À propos', path: '/a-propos' },
  { label: 'Contact', path: '/contact' }
];

const initialSiteServices: ServiceSummary[] = [
  {
    id: 'chauffage',
    name: 'Chauffage',
    path: '/chauffage',
    summary: 'Installation, entretien et dépannage des systèmes de chauffage pour un confort stable.',
    keywords: ['chaudière', 'entretien annuel', 'optimisation énergétique']
  },
  {
    id: 'pompe-a-chaleur',
    name: 'Pompe à chaleur',
    path: '/pompe-a-chaleur',
    summary: 'Conseil et pose de pompes à chaleur adaptées aux besoins des logements neufs ou rénovés.',
    keywords: ['COP', 'dimensionnement', 'maintenance préventive']
  },
  {
    id: 'plomberie',
    name: 'Plomberie',
    path: '/plomberie',
    summary: 'Dépannage et installation sanitaire avec suivi clair et interventions rapides.',
    keywords: ['fuite', 'salle de bain', 'robinetterie']
  },
  {
    id: 'electricite',
    name: 'Électricité',
    path: '/electricite',
    summary: 'Mise aux normes, rénovation partielle et dépannage électrique en toute sécurité.',
    keywords: ['tableau', 'diagnostic', 'sécurité']
  },
  {
    id: 'climatisation',
    name: 'Climatisation',
    path: '/climatisation',
    summary: 'Solutions de climatisation réversibles pour un confort été comme hiver.',
    keywords: ['recharge', 'détection de fuite', 'contrat de maintenance']
  }
];

const initialPageMeta: PageMetaEntry[] = [
  {
    key: 'home',
    value: {
      title: 'Neochaleur | Chauffage, climatisation, plomberie et électricité à Nantes',
      description:
        'Solutions techniques sobres et fiables pour le confort thermique et électrique des particuliers et petites entreprises à Nantes.',
      path: '/'
    }
  },
  {
    key: 'chauffage',
    value: {
      title: 'Chauffage | Neochaleur',
      description:
        'Installation et entretien de chauffage à Nantes : chaudières gaz, optimisation énergétique, dépannages rapides.',
      path: '/chauffage'
    }
  },
  {
    key: 'pompe',
    value: {
      title: 'Pompe à chaleur | Neochaleur',
      description: 'Accompagnement complet pour les pompes à chaleur : choix, pose, mise en service et maintenance.',
      path: '/pompe-a-chaleur'
    }
  },
  {
    key: 'plomberie',
    value: {
      title: 'Plomberie | Neochaleur',
      description: 'Interventions plomberie à Nantes : dépannages, installations sanitaires et rénovations ciblées.',
      path: '/plomberie'
    }
  },
  {
    key: 'electricite',
    value: {
      title: 'Électricité | Neochaleur',
      description: 'Mise aux normes, diagnostics et réparations électriques en toute sécurité dans la région nantaise.',
      path: '/electricite'
    }
  },
  {
    key: 'climatisation',
    value: {
      title: 'Climatisation | Neochaleur',
      description: 'Climatisations réversibles et maintenance préventive pour un confort maîtrisé toute l’année.',
      path: '/climatisation'
    }
  },
  {
    key: 'realisations',
    value: {
      title: 'Réalisations | Neochaleur',
      description:
        'Sélection de chantiers représentatifs : chauffage, pompe à chaleur, climatisation, plomberie et électricité.',
      path: '/realisations'
    }
  },
  {
    key: 'apropos',
    value: {
      title: 'À propos | Neochaleur',
      description: 'Entreprise locale, rigoureuse et accessible : organisation, garanties et engagements qualité.',
      path: '/a-propos'
    }
  },
  {
    key: 'contact',
    value: {
      title: 'Contact | Neochaleur',
      description: 'Coordonnées pour planifier un échange ou une visite technique à Nantes.',
      path: '/contact'
    }
  },
  {
    key: 'mentions',
    value: {
      title: 'Mentions légales | Neochaleur',
      description: 'Mentions légales du site Neochaleur.',
      path: '/mentions-legales'
    }
  },
  {
    key: 'confidentialite',
    value: {
      title: 'Confidentialité | Neochaleur',
      description: 'Politique de confidentialité et gestion des données du site vitrine.',
      path: '/confidentialite'
    }
  },
  {
    key: 'notFound',
    value: {
      title: 'Page non trouvée | Neochaleur',
      description: 'La page demandée est introuvable ou a été déplacée.',
      path: '/404',
      robots: 'noindex,nofollow'
    }
  }
];

export const initialSiteData: SiteData = {
  navItems: initialNavItems,
  services: initialSiteServices,
  zoneConfig: {
    center: { lat: 47.221338, lng: -1.928585 },
    radiusKm: 50,
    communes: [
      'Nantes',
      'Rezé',
      'Saint-Herblain',
      'Orvault',
      'Carquefou',
      'Vertou',
      'Sainte-Luce-sur-Loire',
      'Bouguenais',
      'Guérande',
      'Piriac-sur-mer',
      'La Baule-Escoublac',
      'Saint-Nazaire',
      'Pornic',
      'Clisson'
    ]
  },
  siteConfig: {
    siteUrl: 'https://neochaleur.fr',
    trailingSlash: false,
    companyName: 'NEOCHALEUR',
    baseline: 'Confort thermique et technique à Nantes',
    phone: '+33 6 95 70 95 65',
    email: 'contact@neochaleur.fr',
    address: "Nantes - Presqu'île Guérandaise - La Baule",
    zone: 'Interventions à Nantes et périphérie proche',
    legal: {
      mentionsPath: '/mentions-legales',
      privacyPath: '/confidentialite'
    },
    defaultSeo: {
      title: 'Neochaleur | Chauffage, climatisation, plomberie et électricité à Nantes',
      description:
        'Entreprise multi-technique à Nantes : chauffage, pompe à chaleur, climatisation, plomberie, électricité.'
    }
  },
  pageMeta: initialPageMeta
};
