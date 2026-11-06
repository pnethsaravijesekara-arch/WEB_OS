# Security policy

Velora is an experimental browser desktop. It has not received an independent security audit. The current main branch is the maintenance target; older snapshots do not receive separate security backports. There is no guaranteed response or fix timeline.

## Reporting a vulnerability

Use the repository Security tab's **Report a vulnerability** option if GitHub makes it available. Private vulnerability reporting availability has not been verified. If that option is absent, open an issue requesting a private contact channel, without exploit details, credentials, personal information or sensitive attachments. Wait for the maintainer to provide a private channel before sharing those details.

In a private report, include the affected commit, browser/version, reproduction steps using synthetic data, expected behavior and impact. Test only your own data and environments.

## Known boundaries

- The desktop lock is visual and provides no authentication or encryption.
- Imported files, notes and preferences use browser storage. Other people with access to that browser profile may access them. Clearing site data can delete saved work. Keep backups.
- Do not store secrets, passwords, financial records or other sensitive material here.
- Hosted access, weather requests and external browsing involve third-party services. See PRIVACY.md.
- Offline caching does not guarantee that external sites or weather work offline.

These documents describe current limitations; they do not certify security or replace technical review.
