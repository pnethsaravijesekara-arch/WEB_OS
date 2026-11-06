# Privacy and data handling

Velora is a browser-based desktop experience, maintained by this repository's owner. This notice describes the project code; deployment providers and external services have their own policies.

## Local work

Imported files, notes, desktop preferences and virtual filesystem content are processed and stored in the browser profile. The project does not provide a cloud file-upload service or built-in user accounts. Browser storage is not a secure vault. Export backups before clearing site data; browser cleanup or storage limits can remove data. Removing site data in your browser clears locally stored project data.

## Network features

- Opening a hosted copy contacts the host, which may process IP addresses, request metadata and access logs under its own policy.
- Applying a weather city and refreshing weather sends the city query and selected coordinates to Open-Meteo. Geolocation permission is not requested. See https://open-meteo.com/en/terms and https://open-meteo.com/en/features#privacy.
- Web searches, embedded websites and links contact their destination services. Those services may collect data under their own policies. Check the address and sign in only through a regular browser tab.
- The service worker caches application files for offline use. Third-party browsing and fresh weather still require a network connection.

The project code does not include an analytics SDK. This does not mean a deployment or external website collects no data. A deployment operator adding analytics, accounts or cloud storage must update this notice to match its actual behavior.

Avoid importing confidential files or entering credentials into untrusted pages. For security reports, follow SECURITY.md. For general privacy questions, contact the repository maintainer through GitHub without posting personal information publicly.
