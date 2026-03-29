# Configuration & Personnalisation de Extra-Lead

Ce document regroupe les petits ajustements techniques que vous pouvez réaliser vous-même dans le code pour configurer l'outil lors de vos sessions de prospection.

## 1. Mots-clés BTP (Déclenchement de l'argumentaire OPLead)

L'application s'adapte automatiquement au secteur d'activité saisi dans le bloc "Scanner un site". 
SI ce champ contient un mot lié au BTP, l'argumentaire commercial final mettra en avant le logiciel **OPLead**. 
SINON, il utilisera un discours générique sur l'importance de s'équiper d'un **CRM**.

**Comment modifier la liste des mots-clés pris en compte ?**

1. Ouvrez ce fichier dans votre éditeur : `src/lib/audit/oplead.ts`
2. Montez tout en haut du fichier, vous trouverez la liste nommée **`BTP_KEYWORDS`**.
3. Ajoutez vos nouveaux mots (en minuscules) entre guillemets, séparés par des virgules. 
   *(Note : la recherche ignore les majuscules, mais les accents sont pris en compte).*

**Exemple d'ajout :**
```typescript
const BTP_KEYWORDS = [
  "plombier", "maçon", "électricien", "menuisier", "menuiserie", "peintre", 
  "chauffagiste", "toiture", "couvreur", "charpentier", "btp", 
  "rénovation", "construction", "artisan", "isolation", "énergétique",
  "votre_nouveau_mot" 
];
```

*Note : La mise à jour de ce fichier est immédiate, il n'est pas nécessaire de relancer le serveur de développement.*
