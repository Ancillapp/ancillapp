[English](README.md) • Italiano

# Ancillapp

Ancillapp è una PWA (Progressive Web App) che permette di consultare i giornali (Ancilla Domini), i canti, le preghiere giornaliere, e il breviario della Fraternità Francescana di Betania. Lo scopo di questa PWA è di consentire sia ai consacrati che ai laici di accedere a questi contenuti con semplicità, grazie ad un'interfaccia progettata per somigliare il più possibile ad un'applicazione nativa e per funzionare anche offline. L'intera architettura dell'applicazione è stata progettata in modo tale da essere rilasciata su Firebase. La PWA si trova su Firebase Hosting, i dati sono salvati su Cloud Firestore, e gli asset (come ad esempio i giornali e le loro miniature) sono salvati su un bucket di Firebase Storage. Le miniature sono generate in automatico da una Firebase Function quando un nuovo giornale viene caricato all'interno del bucket.

## Licenza
MIT. Puoi leggere l'intero testo della licenza [qui](LICENSE).
