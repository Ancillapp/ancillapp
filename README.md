English • [Italiano](README.it.md)

# Ancillapp

Ancillapp is a PWA (Progressive Web App) that allows to easily consult journals (Ancilla Domini), songs, daily prayers and breviary of the Franciscan Fraternity of Bethany. The aim of this PWA is to provide an easy access to this content to both consecrated and lay people, providing an application-like offline-first UX. The entire architecture of the app has been designed to run on Google Cloud Platform. In particular, the PWA is ready to be run on App Engine out of the box. The data is stored on a MongoDB instance (currently hosted on mLab, but can be hosted anywhere else), while the files (like the journals and their thumbnails) are stored on a Google Cloud Storage bucket. The thumbnails are automatically generated by a Google Cloud Function when a new journal is uploaded into the bucket.
