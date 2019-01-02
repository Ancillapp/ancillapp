[English](README.md) • Italiano

# Ancillapp

Ancillapp è una PWA (Progressive Web App) che permette di consultare i giornali 
(Ancilla Domini), i canti, le preghiere giornaliere e il breviario della 
Fraternità Francescana di Betania. Lo scopo di questa PWA è di consentire sia 
ai consacrati che ai laici di accedere a questi contenuti con semplicità, 
grazie ad un'interfaccia progettata per somigliare il più possibile ad 
un'applicazione nativa e per funzionare anche offline. L'intera architettura 
dell'applicazione è stata progettata in modo tale da essere utilizzata su 
Google Cloud Platform. In particolare, la PWA è pronta per essere eseguita su 
App Engine. I dati sono salvati su Firestore, mentre i file (come ad esempio i 
giornali e le loro thumbnail) sono salvati su un bucket di Cloud Storage. Le 
thumbnail sono generate in automatico da una Cloud Function quando un nuovo 
giornale viene caricato all'interno del bucket.
